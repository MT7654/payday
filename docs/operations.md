# Operations and incident diagnosis

## Deploying this update

This PR changes source only; pushing it does not deploy the hosted site. Apply `drizzle/0001_lush_jazinda.sql` to the existing D1 database before deploying code that uses research leases. It adds a table and does not modify saved content. Keep `0000_special_warhawk.sql` for fresh databases only; do not replay it against initialized storage. Follow the hosting platform's normal migration/deploy process and retain a backup. Rolling code back can leave the lease table in place.

For an existing local database after building:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_lush_jazinda.sql
```

After a hosted deployment, verify sign-in, private state reads/writes, strict Origin checks, and one live research request for discovery and the guide. Confirm `cf-connecting-ip` is supplied by the gateway and cannot be replaced by a caller. Confirm gateway identity headers cannot be supplied by an unauthenticated caller and no alternate public Worker route bypasses the gateway. These hosted properties cannot be established by unit tests or local simulated sign-in.

## Logs

`vite.config.ts` enables Workers observability at full sampling and disables automatic invocation logs to avoid collecting full request URLs. Verify the deployed Worker retains those settings; Sites may manage deployment configuration separately. See the [Cloudflare logging configuration](https://developers.cloudflare.com/workers/observability/logs/workers-logs/). Restrict log access to operators and review hosting retention and cost settings. No external telemetry vendor or paid monitoring service is configured here.

Rejections from development middleware or the hosting gateway may occur before the Worker and will use that layer’s diagnostics. Every Worker-handled request receives `X-Request-Id`. Error JSON includes the same `requestId` and a stable `code`; use the ID from the failed response when asking for support. IDs are random per request, not user/session identifiers. Application logs contain:

| Event | Fields and interpretation |
| --- | --- |
| `request.completed` | Allowlisted route, method, response status, milliseconds until response headers; one completion per request. |
| `request.failed` | Safe error category and HTTP status; no raw exception or stack. |
| `ai.completed` | Search enabled/disabled, provider status, latency, input/output tokens when reported. Multi-stage research emits one event per provider call. |
| `ai.failed` | Safe provider failure category, latency and provider status if available. |
| `lease.release_failed` | Storage failed during cleanup; the 120-second expiry recovers the lease. |

All events also carry a timestamp and request ID. Unknown paths are grouped as `other`; query strings and raw paths are never logged. Logs from dependencies or the hosting gateway are outside this field allowlist. Completion timing measures time to headers, not full streamed page delivery; the platform should monitor stream and Worker failures separately. Logging failure cannot fail an otherwise successful save.

In Workers Observability, filter by request ID to follow a failed save or the AI calls. For aggregate dashboards, use `request.completed` only to avoid double-counting requests. Group status by route, chart 5xx/error rate and p95 latency, and sum token fields on `ai.completed` to estimate usage (not cost). Token totals omit provider failures and web-search charges.

Suggested alert starting points, to tune against real traffic: 5xx >5% for five minutes with at least 20 requests; discovery p95 above 60 seconds; any sustained `lease.release_failed`; and unusual growth in `daily_limit` or `research_busy`. These are runbook recommendations, not provisioned alerts.

| Code | Response |
| --- | --- |
| `origin_rejected`, `unsupported_content_type` | Check frontend Origin/JSON headers and gateway forwarding; never relax origin matching as an incident workaround. |
| `revision_conflict` | Expected competing tab edit; export pending changes and reload. |
| `research_busy` | Another request is active; honor Retry-After. A crashed worker recovers within 120 seconds. |
| `daily_limit`, `global_limit` | Client or site UTC-day quota exhausted; Retry-After indicates the next reset. |
| `burst_limit` | Client minute quota exhausted; honor Retry-After. |
| `client_identity_missing` | Verify trusted gateway IP forwarding. Never accept an arbitrary caller-provided address as a fix. |
| `ai_auth`, `ai_not_configured` | Operator checks private provider configuration. Never request a key in a bug report. |
| `ai_rate_limit`, `ai_transport`, `ai_http` | Inspect provider availability/limits and request timings. |
| `ai_invalid_response`, `ai_invalid_schema`, `ai_invalid_json`, `ai_empty`, `ai_incomplete` | Provider output failed validation; inspect safe fixtures/tests before changing validation. |
| `internal_error` | Check D1 binding/migrations and framework health; application logs intentionally omit potentially sensitive exception text. |

## Checks

Use Node 24, `npm ci --ignore-scripts`, `npm test`, `npm run typecheck`, `npm run build`, and `npm audit --audit-level=high`. Tests use isolated SQLite and mocked AI; they do not require secrets or spend provider credits. Regression tests cover concurrent requests, lease expiration/release, request timeouts, unsafe origins, malformed upstream output, safe logging and request isolation.

Public guide and discovery share the 40/day, 8/minute client quotas, 250/day site ceiling and one active request per daily client pseudonym. `RATE_LIMIT_SECRET` is optional private configuration; without it the OpenAI key is used for the HMAC. No key is logged or persisted. Missing IP metadata fails closed in production, so verifying gateway forwarding is a deployment requirement.

## Activating repository CI

`docs/ci/checks.yml` is the prepared workflow. It could not be published under `.github/workflows/` because the current GitHub OAuth credential lacks `workflow` scope. A maintainer with workflow-write access can copy it to `.github/workflows/checks.yml`, then verify the first run and configure required status checks. This PR does not broaden credentials or repository permissions. Weekly Dependabot configuration is included and takes effect after merging to the default branch.
