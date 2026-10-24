# Production verification — 25 October 2026

Read-only checks against the supplied production site used GET /api/state without cookies, first without identity headers and then with a randomly generated synthetic oai-authenticated-user-id plus an example.invalid email. Both returned HTTP 401 with application/json and Cache-Control: no-store. Response bodies were not inspected. Neither response carried X-Request-Id. No research or mutation endpoint was called.

This confirms rejection of those two requests only. It does not establish which deployment served them, that every ingress path strips client identity headers, or that client IP headers and configured quotas are enforced in production.

The Sites connector returned NOT_FOUND for the project in .openai/hosting.json. The owning Sites account/workspace is needed to inspect the deployed revision, public/private settings, Worker route exposure and gateway header handling. After deploying the PR, an operator with that access should verify:

- Only the intended gateway can reach the Worker; workers.dev and preview routes remain disabled.
- Client-supplied oai-authenticated-user-* and cf-connecting-ip values cannot override gateway identity.
- A signed-in user can read only their own state, while guests cannot read state.
- Public guide/discovery requests share burst, daily, global and concurrency limits; missing trusted identity fails closed.
- Request IDs and privacy-safe logs appear for application-handled requests.

Local automated tests cover isolation, shared quota admission, lease release, evidence grounding, exact-listing rechecks and the current journal history. They do not substitute for deployed gateway verification. No production deployment was performed for this change.
