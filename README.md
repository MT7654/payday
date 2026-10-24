# Payday

A public reward-discovery app with a finite journey: choose a feeling, set a budget, and explore up to three ideas.

**Live app:** https://payday-reward-discovery.maltoh12345.chatgpt.site

## Features

- Guided discovery from 50 clearly labelled sample recommendations.
- Up to three affordable recommendations per journey, with details and trade-offs.
- Three AI-generated product concept images; other samples use illustrations.
- Browser-local saved inspiration, available without signing in.
- Private payday plans with dates, timezones, budgets, interests and exclusions.
- In-app reminders, optional open-tab browser alerts and calendar export.
- Optional live OpenAI research with merchant links and cited Reddit/forum evidence.
- Comparison, saved finds, purchase self-reporting and satisfaction feedback.

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
node --experimental-strip-types --test tests/rewards.test.mjs tests/catalogue.test.mjs
npm run build
```

## Project structure

- `app/`: React interface and server API routes.
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

Mobbin references informed the earlier browsing layout; the current design replaces the full grid with a three-step journey:

- [Shop category browsing](https://mobbin.com/screens/b58686eb-e5e0-4f84-89e9-2a91d8f45711)
- [Etsy themed discovery](https://mobbin.com/screens/26fe7c4f-4751-422f-a2a7-379b83e1e10e)
- [Faire product grid](https://mobbin.com/screens/24288f35-d083-44da-b4c1-eac44c89150b)

Mobbin screenshots are not bundled in this repository. Product concept images were generated with the built-in image generation tool.
