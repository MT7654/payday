# Payday app

See ../README.md for the user journey, setup and limitations.

This application uses the Sites Vinext starter, React, TypeScript and Cloudflare D1. Routes under app/api execute on the server. Secrets are accessed only through the Worker environment. D1 queries bind the authenticated ChatGPT user ID and use optimistic revisions for saves. Browser state never receives the API key.

Server prompts live in lib/ai.ts and app/api/discover/route.ts. The model extracts a structured shortlist from web research; the application enforces item budget, explicit exclusions and retrieved source URL membership. Community summaries expose original source links, positive and negative evidence and coverage. They are not statistical confidence scores.

Commands: npm run dev, npm run build, npx tsc --noEmit, node --experimental-strip-types --test tests/rewards.test.mjs.

Deployment uses the Sites plugin's site-workflow helper, with a pushed source commit and matching built archive. Preserve .openai/hosting.json and drizzle migrations. Never track .dev.vars, .env, .wrangler or .sites-runtime.
