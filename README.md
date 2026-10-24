# Payday

A public reward-discovery app with a finite journey: set a treat budget, describe a life situation, choose a reward direction, and compare up to three specific options.

**Live app:** https://payday-reward-discovery.maltoh12345.chatgpt.site

## Features

- Three entry paths: help me discover, choose from my wishlist, and find my fit.
- Context-first discovery: budget → intention → one situational question → three reward ideas → specific options.
- Reason-based idea replacement that preserves the other choices.
- Fifty clearly labelled sample recommendations for no-sign-in exploration.
- Up to three affordable recommendations per journey, with details and trade-offs.
- Three AI-generated product concept images; other samples use illustrations.
- Resumable browser-local guest journeys; private account shelves with explicit guest import.
- Wishlist link inbox, larger-reward savings goals, and usual treat budget.
- Private payday plans with dates, timezones, budgets, interests and exclusions.
- In-app reminders, optional open-tab browser alerts and calendar export, linked to the selected reward.
- Live OpenAI research with location, party size, practical fit, known possessions and exclusions.
- Merchant product-page research with independent availability checking and a final exact-listing price/stock recheck.
- Reddit/forum evidence with benefits, concerns, best-fit audience, dates and exact-product/category relevance.
- Comparison, saved finds, purchase self-reporting, use/satisfaction feedback and experience-date gating.
- Previous satisfaction feedback informs later live research; already purchased rewards are excluded.
- Exportable personal activity events distinguish clicks, self-reported purchases and feedback.

Sample items and prices are illustrative. Generated images are concepts, not photographs of verified merchandise. Sample recommendations do not claim retailer availability, ratings or community endorsements. Live prices, stock, shipping and taxes need a final check at the retailer. Purchases happen on retailer sites.

## Local setup

Requires Node.js 22.13+ and npm. Node.js 24 is recommended for running the TypeScript-backed tests directly.

```sh
npm ci
```

Copy `.dev.vars.example` to `.dev.vars`. The sample discovery flow works without an API key. To use live discovery, set `OPENAI_API_KEY` in `.dev.vars`; never put a key in browser code or commit it.

Build and initialize the local database once:

```sh
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_special_warhawk.sql
```

For a fresh database, then apply `drizzle/0001_lush_jazinda.sql` with the same command. For an existing database, apply only unapplied migrations. Do not replay migrations on a database where they have already been applied. See [operations](docs/operations.md) for this update’s rollout.

```sh
npm run dev -- --port 3003 --host 127.0.0.1
```

Visit http://127.0.0.1:3003. Local loopback preview provides simulated ChatGPT sign-in; hosted Sites uses real ChatGPT identity. The public catalogue does not require sign-in. Plans can be saved in browser storage without sign-in. Live AI guidance and research also work anonymously.

## Checks

```sh
npx tsc --noEmit
node --experimental-strip-types --test tests/*.test.mjs
npm run build
```

## Project structure

- `app/`: React interface and server API routes.
- `app/reward-journey.tsx`: unified discovery, shelf, evidence and feedback interface.
- `lib/journey.ts`: journal model, contextual sample recipes, group budgets and feedback rules.
- `lib/catalogue.ts`: sample concepts and bounded shortlist selection.
- `lib/ai.ts`: server-only OpenAI Responses calls.
- `db/` and `drizzle/`: D1 schema and migration.
- `public/products/`: generated product concept images.
- `tests/`: reminder, constraints and catalogue checks.
- `docs/SPEC.md`: original specification; this README describes the current implementation.
- `docs/reddit-research.md`: discovery research references.
- `docs/image-prompts.txt`: image generation method and prompts.

## Hosting and data

Built with React, TypeScript and the Sites Vinext starter, deployed on Cloudflare Workers through Sites with D1 storage. `.openai/hosting.json` identifies the existing deployment; keep its identity when updating this app. GitHub stores the source; pushing here does not automatically deploy to Sites.

The OpenAI key is a server-side secret. `.env`, `.dev.vars`, database state, dependencies and build archives are ignored. Hosted secrets are configured separately from local settings. Private records are keyed by the authenticated user ID, with optimistic revisions to detect conflicting saves. Deleting personal content retains an empty state row, user identifier, timestamp and increasing revision; this prevents an older tab from restoring deleted plans. No new database migration is required for this behavior.

Browser alerts require the app to stay open; imported calendar reminders handle closed-app alerts. No email/SMS or background push service is included. Live research loads the signed-in user’s saved purchase, rejection and satisfaction history. Removing an item from Saved finds removes that item from future recommendation context. Public research and the guide share daily, burst and concurrency limits and depends on available public sources; community evidence is anecdotal, not a statistical confidence score.

## Design references

Mobbin references informed the earlier browsing layout; the current design replaces the full grid with a bounded context-first journey:

- [Shop category browsing](https://mobbin.com/screens/b58686eb-e5e0-4f84-89e9-2a91d8f45711)
- [Etsy themed discovery](https://mobbin.com/screens/26fe7c4f-4751-422f-a2a7-379b83e1e10e)
- [Faire product grid](https://mobbin.com/screens/24288f35-d083-44da-b4c1-eac44c89150b)

Mobbin screenshots are not bundled in this repository. Product concept images were generated with the built-in image generation tool.

## Backend safeguards

- State requests validate nested products, sessions, dates and timezones, and enforce a 400 KB request-body limit while streaming.
- Saves retry temporary failures and reconcile lost responses before retrying writes. Revision conflicts pause saving; users can export unsaved changes before reloading. The interface only reports all changes saved after server acknowledgement.
- Explicit exclusions and common negative phrases are filtered in both sample and live shortlists. This is a bounded phrase parser, not a guarantee that every possible natural-language constraint is understood. AI still interprets broader preferences.
- Purchases, skipped items and regretted items are omitted from future shortlists. Retailer visits preserve purchase status and satisfaction feedback. Live product IDs remain stable across repeated research of the same merchant URL.
- Public live discovery checks source membership, product-page URLs, availability and fit with additional AI passes. These checks do not independently verify merchant inventory or every price excerpt. The older authenticated discovery helper also tests quote-level price evidence; it is not the public route.
- Price evidence is derived from cited AI search summaries, not independently fetched or verified retailer pages. The interface exposes the supporting excerpts and this limitation. Confirm stock, model, shipping and final prices with the merchant.
- Public community research constrains claims to retrieved source URLs and asks the model to distinguish forum evidence. This remains AI interpretation; the quote-level/forum-allowlist utility tests do not establish that the public route independently verifies every claim.
- All AI stages within one request share a single 90-second deadline. Tests use stubbed AI responses and an isolated SQLite database; they never call paid AI APIs or alter hosted data.

`npm test` includes API ownership, quota, schema validation, deletion/save races, save retry/recovery, preference history and evidence-grounding regression cases, as well as the original catalogue and reminder tests. Use Node 24 for the built-in SQLite test adapter.
## Verification and limits

The release was checked with TypeScript, 15 domain tests, local browser journeys, and live OpenAI idea/product/evidence/recheck requests. Live stock research can be inconsistent: an initial listing was later found sold out, so the shortlist now receives a separate availability check and purchase handoff requires another recheck. Search-based checks are not a merchant inventory guarantee.

The main discovery journey uses live AI without sign-in. Legacy sample mode remains clearly labelled. The approximately two-minute journey is a design target, not a measured user-study result. No controlled conversion or satisfaction study has been run. Prices with unknown mandatory costs are visibly marked; merchant checkout is the final source of truth.

No new database migration is required: the versioned journey journal is stored inside the existing per-user JSON state record. Existing plans and saved records are preserved. The activity view is personal event counts, not a cross-user analytics dashboard or an implemented A/B experiment.

## Adaptive shopping guide

The homepage now uses a live AI conversation, not the previous fixed quiz. Buyers share context, react to generated possibilities, correct an editable brief, select a direction and name a real use occasion before merchant research. Mixed reactions preserve benefits while changing the solution. Product objections can be returned to the same guide without starting over.

Demo: S$80, tired of screens → ask for a creative reward → no classes, travel or lasting clutter → an edible activity at home this Saturday in under 30 minutes → select a direction → research sourced listings → inspect tradeoffs and independent evidence → recheck listing → merchant handoff or save. Results are live and can be empty when constraints cannot be verified. No purchase or guaranteed satisfaction is claimed.

Anonymous requests share atomic D1 limits: 40 requests per daily keyed IP digest, 8 per minute, 250 globally per UTC day. Raw IPs are not stored. Requests can involve multiple model/search calls. Shared networks share a limit, and these controls are a prototype rather than comprehensive bot protection. API keys remain server-side. Account storage stays authenticated; guests save in their browser. Conversation lives in session storage and preferences are sent to OpenAI.

Validation: type checking, unit checks, live mixed-objection conversation and browser flow. No controlled user study has been run.

## Persistent payday assistant (October 2026)

The homepage now offers a prepared-discovery entry: set a payday and treat budget, reuse editable preferences, then ask the live guide to prepare two directions. Photo upload is not required. The guide receives bounded context from explicit preferences, previously confirmed briefs, non-demo reward decisions and feedback, and wishes labelled as unpurchased. A one-tap check-in for eligible self-reported purchases updates the existing journal. Future booked experiences are not prompted early. Context is editable, exportable and removable; account-wide data deletion also clears local assistant state.

Assistant memory is browser-local (`payday-assistant-memory-v1`), even for signed-in visitors. It is not synced to D1. The existing reward journal retains its account/guest behavior. Choosing a direction remembers its confirmed brief. Context is sent to the server-side OpenAI guide only when discovery is requested, with length limits and existing request caps. No background inbox scans, push reminders, auto-bookings or automatic purchases are claimed. Existing calendar export and open-tab reminders remain available through payday plans.

### Connection limitation

Live Gmail and calendar connections are **not implemented or enabled**. The Sites integration reference requires `sites_list_plugin_eligibility` before selecting or declaring a connector; that tool is absent from the available toolset. `/api/connections` reports unavailable. No guessed connector IDs, credentials, owner mailbox snapshots or fabricated connection-success states are used. To enable live Gmail, obtain eligibility, declare an allowed read-only connector, implement bounded receipt reads and extraction, and test hosted visitor consent/refresh/disconnect and per-user isolation before enabling the UI. Direct Google OAuth would instead require an approved application, secrets, consent/verification and a compliant user-data design; this release does not bypass the Sites eligibility gate.

### Reproducible sample journey

Choose **Try a sample account** → confirm whether the paints are owned, a gift or returned → select a prepared possibility → save the sample plan → choose an outcome → view the next payday. “Never got around to it” changes the prepared direction to a museum outing; an ownership correction changes the first direction. Sample planning is deterministic, labelled fictional throughout, and isolated in tab session storage. Reload resumes its last step. Sample costs are illustrative and no purchase or booking is made. An explicitly opted-in idea can enter live discovery without copying the fictional receipts into personal memory.

### Mobbin review

- [Monarch connection onboarding](https://mobbin.com/screens/e1adf1d4-aef6-415d-8659-f0994b9f1153): one purpose per step and a clear skip path.
- [Monarch connection status](https://mobbin.com/screens/0cd87fbc-b688-4c88-9672-af0b2e2e2617): explicit status rather than implied connection success.
- [Shop feedback](https://mobbin.com/screens/12d1def8-9dbf-4182-88ac-bfc0896fd8c1): lightweight reactions with visible effect.
- [Literal preference feedback](https://mobbin.com/screens/4effff01-e806-4f1b-94ee-f5064f558ba9): a small, bounded set of choices.

Applied: single primary action per step, two possibilities, progress indication, 45px minimum primary targets, editable context, truthful unavailable states, visible sample status, keyboard focus and mobile scroll reset. Reference screenshots are not shipped. Browser QA covered the mobile-width sample journey through a second payday and a live response using saved preferences. These are functional checks, not a user study or proof of better conversion.


## Editorial imagery and design system

The current interface uses the shared tokens and component rules in app/design-system.css, specified first in docs/design-system.json. Mobbin references include Airbnb experience cards, Headspace task hierarchy and Monarch connection clarity. Warm ivory, forest green, muted terracotta, consistent type/spacing, 44px controls, shared card corners and 3:2 photographic frames are applied across discovery, plans, saved rewards and settings.

52 original assets were generated with built-in image_gen: one for each of the 50 curated ideas, plus a hero and gift image. Optimized WebP files live in public/images/rewards; exact prompts and asset paths are recorded in docs/image-generation.json. Photos are labelled AI concepts and must not be represented as verified merchant photos. Product and activity titles choose relevant imagery; fixed catalogue IDs have individual images.

User-facing demo/hackathon language has been replaced with planning and discovery language. The prepared journey uses an explicitly illustrative profile, separate from personal memory; its forward-looking reactions express anticipated fit rather than claiming a past purchase or elapsed time. Curated costs remain planning figures, and unavailable Gmail remains accurately labelled.

Reviewed the mobile home, plans, settings and recommendation cards visually against the Mobbin patterns. No broken-asset audit was run, as requested.

## Security and observability

See [SECURITY.md](SECURITY.md) for the authentication trust boundary and safeguards, and [operations](docs/operations.md) for deployment, privacy-safe diagnostics and incident response. This update adds a D1 research-lease migration, strict mutation-origin checks, request and AI timing/usage events, and repository security checks. Hosted logging and gateway protections must be verified during deployment.
