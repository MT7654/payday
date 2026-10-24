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

Do not replay that migration on a database where it has already been applied.

```sh
npm run dev -- --port 3003 --hostname 127.0.0.1
```

Visit http://127.0.0.1:3003. Local loopback preview provides simulated ChatGPT sign-in; hosted Sites uses real ChatGPT identity. The public catalogue does not require sign-in. Personal plans and live AI requests do.

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

The OpenAI key is a server-side secret. `.env`, `.dev.vars`, database state, dependencies and build archives are ignored. Hosted secrets are configured separately from local settings. Private records are keyed by the authenticated user ID, with optimistic revisions to detect conflicting saves.

Browser alerts require the app to stay open; imported calendar reminders handle closed-app alerts. No email/SMS or background push service is included. Live research has a per-user daily request cap and depends on available public sources; community evidence is anecdotal, not a statistical confidence score.

## Design references

Mobbin references informed the earlier browsing layout; the current design replaces the full grid with a bounded context-first journey:

- [Shop category browsing](https://mobbin.com/screens/b58686eb-e5e0-4f84-89e9-2a91d8f45711)
- [Etsy themed discovery](https://mobbin.com/screens/26fe7c4f-4751-422f-a2a7-379b83e1e10e)
- [Faire product grid](https://mobbin.com/screens/24288f35-d083-44da-b4c1-eac44c89150b)

Mobbin screenshots are not bundled in this repository. Product concept images were generated with the built-in image generation tool.

## Verification and limits

The release was checked with TypeScript, 15 domain tests, local browser journeys, and live OpenAI idea/product/evidence/recheck requests. Live stock research can be inconsistent: an initial listing was later found sold out, so the shortlist now receives a separate availability check and purchase handoff requires another recheck. Search-based checks are not a merchant inventory guarantee.

Guest mode uses authored sample matching, not live AI. Live discovery requires sign-in. The approximately two-minute journey is a design target, not a measured user-study result. No controlled conversion or satisfaction study has been run. Prices with unknown mandatory costs are visibly marked; merchant checkout is the final source of truth.

No new database migration is required: the versioned journey journal is stored inside the existing per-user JSON state record. Existing plans and saved records are preserved. The activity view is personal event counts, not a cross-user analytics dashboard or an implemented A/B experiment.

## Preference-construction demo

The homepage now provides one guided flow: budget → three benefit-led moments → reaction → explicit trade-off → realistic use occasion → constructed reward brief → recommendations → saved reward.

Suggested two-minute demo: S$80 → Make something, just for yourself → Less effort, please → Keep it simple and ready to use → This Saturday afternoon → Build my reward brief → Find options for this moment → Watercolour pocket studio → Save for payday. This shows a vague reward intention becoming an actionable product preference.

Demo mode uses authored concepts and illustrative prices, without fabricated merchant links or community endorsement. Signed-in users can select live AI research at the brief stage. Practical free-text notes are passed to live AI; deterministic sample recommendations filter budget, direction, and reward format rather than interpreting arbitrary notes. Very small budgets may return no matches. The existing reward shelf supports self-reported purchase and later satisfaction feedback.

Back preserves choices; changing a direction resets dependent preferences. Start over resets the guided session. The session resumes in the same browser tab. This research-informed interaction has not been validated with users.
