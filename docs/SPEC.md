# Payday — Discover My Reward

## 1. Product definition

An occasion-led shopping app that helps people turn “I want to treat myself” into a specific, relevant choice. Users set their payday, comfortable reward budget, and broad intention. On the chosen date, a reminder opens a short discovery journey. AI translates reactions into a shortlist and explains independent community evidence before users visit a retailer.

Working name: Payday. Currency: SGD. Default timezone: Asia/Singapore. Initial delivery: responsive local web app, mobile-first. This is Challenge 3 and is independent of the earlier challenges.

The product addresses absent product intent, not necessarily absent shopping motivation. Users voluntarily plan a reward. It does not need to infer income, emotional vulnerability, or financial capacity.

## 2. Initial audience and hypothesis

Primary audience: first-paycheck earners who want to mark a milestone but have not selected a product. Secondary audience for later testing: people celebrating bonuses, promotions, or recurring paydays.

Job to be done: “Help me find a reward that feels like me, fits my budget, and is worth choosing.”

Primary hypothesis: starting from the meaning of a reward helps this audience discover a relevant option faster than category browsing.

Secondary hypotheses, tested independently:
- A user-chosen reminder increases return visits.
- Three contrasting possibilities help users express preferences through reactions.
- Transparent external evidence increases decision confidence.
- Guided discovery increases qualified retailer visits and, where measurable, completed orders.

Do not assume recurring monthly demand, superior conversion, or willingness to pay from Reddit anecdotes alone.

## 3. MVP scope

Included:
- Single-user local profile and persistent plans.
- One-time and monthly payday reminders with explicit timezone.
- Reward intention, optional interests, exclusions, and hard budget.
- On-date in-app reminder and optional browser notification while runtime conditions permit.
- A clearly marked “Preview payday” demo action.
- Three-way scenario discovery with reaction chips and optional free text.
- AI-generated shortlist grounded in retrieved product information.
- Reddit/forum evidence cards with sources, caveats, freshness, and evidence coverage.
- Save, compare, replace, and retailer handoff actions.
- Optional post-decision feedback and an inspectable local activity history.
- Fully labelled demo mode without an API key, plus live mode with server-side API access.

Not included in MVP:
- Banking access, income inference, automatic budget calculation, BNPL, or direct payment collection.
- Automatic purchasing or claims that a retailer visit is a completed purchase.
- Reliable closed-browser push, email/SMS delivery, cloud accounts, multi-device sync, or production deployment.
- A general crawl of all Reddit, fabricated review counts, or a universal “best product” score.
- Pressure-based selling or a Jordan Belfort character. Voice is confident, warm, concise, and transparent.

## 4. Main journey

Scenario: “My first paycheck is on the 28th. I want to celebrate with something under S$150, but I don’t know what.”

1. User creates a reward plan: date, time, timezone, budget, and intention.
2. App confirms the plan and explains reminder availability.
3. Reminder appears on the chosen date; clicking it opens the correct plan.
4. AI asks whether they want a keepsake, everyday upgrade, or new experience.
5. App shows three contrasting lifestyle scenarios, not three near-identical products.
6. User reacts: “Better commute sounds good, but I already have headphones.”
7. AI preserves budget/exclusions, asks at most one needed follow-up per turn, and narrows the direction.
8. App presents up to three grounded product options with reasons and practical trade-offs.
9. User opens community evidence, compares or replaces an option, and chooses one.
10. User saves it, skips, or visits the retailer. The app asks separately whether they bought it.
11. Optional later feedback records whether the choice was used, worthwhile, or regretted.

Alternate entry: “I already know the item.” Skip broad discovery and go directly to fit checks, evidence, and retailer handoff.

## 5. Screens and interactions

### Home / My rewards
- Upcoming reward card: date, intention, remaining days, and budget.
- Primary action: “Plan my reward”; due-plan action: “Discover my reward”.
- Saved shortlist and previous reward decisions.
- Persistent Demo/Live label and a settings link.
- Empty, upcoming, due, snoozed, completed, and missed-reminder states.

### Create or edit plan
- Occasion: first paycheck, payday, bonus, promotion, other.
- One-time date or monthly day 1–31; local reminder time and timezone.
- Month-end rule: days absent in a month resolve to its last day; explain this in the UI.
- Required comfortable budget; optional budget range capped by the maximum.
- Intention via chips plus optional free text; “Surprise me” is allowed.
- Optional interests, already-owned items, excluded categories, and product/experience preference.
- Notifications default off until user explicitly enables them; save works without permission.
- Confirmation provides edit, preview, and pause controls.

### Discovery
- Persistent budget and intention at top; progress indicator without a rigid promise about turn count.
- Three visual scenario cards, such as “A calmer commute”, “A creative weekend”, “A lasting keepsake”.
- Reactions: more like this, not for me, already have it, less effort, more memorable.
- Optional typed clarification; back/undo previous reaction.
- Aim for 2–4 interactions before shortlist; offer “Show options now”.
- After repeated rejection, reset direction instead of recycling the same products.

### Shortlist
- Up to three options; fewer is acceptable when evidence or inventory is limited.
- Each shows verified name/model, merchant, observed price/currency, source link, checked time, rationale, trade-off, and evidence status.
- Do not imply shipping/tax is included if unknown. Budget fit remains provisional when total landed cost is unknown.
- No invented stock, discounts, ratings, product images, or delivery claims.
- Compare by actual user priorities; save, replace, view evidence, or visit retailer.

### Evidence drawer
- Separate “Fit for your preferences” from “Community evidence”.
- Recurring positives, recurring concerns, applicability to this user, and exact-model caveats.
- Source cards: forum, thread title, publication date if available, retrieval date, URL, and concise supported summary.
- Distinguish firsthand ownership claims, questions, secondhand advice, and promotional content.
- Explicit “No reliable discussions found” state; recommendation is still explainable from product facts.

### Settings and feedback
- Update timezone, notification consent, paused reminders, and data deletion/export.
- API status only: configured/missing/error. Never display or accept a key in the browser.
- Feedback: bought/skipped/still deciding; later use and satisfaction check-in is optional.

## 6. AI decision design

Separate responsibilities to keep persuasive language from inventing evidence:

1. Preference interpretation: extract hard constraints, soft preferences, missing information, and explicit negative feedback.
2. Scenario generation: propose distinct reward directions using the available context.
3. Product retrieval: find actual candidates and retailer facts for the selected direction.
4. Evidence retrieval: search exact product/model and relevant ownership discussions on Reddit and other forums.
5. Evidence synthesis: summarize only retrieved material and associate each substantive claim with sources.
6. Recommendation: explain relevance and trade-offs using the verified records.

Use server-side OpenAI Responses API integration, structured output validation, and web-search capability where supported. Confirm current SDK, model, structured-output, and search contracts against official documentation during implementation; model selection is configurable, not hard-coded in this spec.

Treat retrieved text as untrusted data, never instructions. The model cannot execute checkout, alter budget, run arbitrary tools, or silently update user preferences. Persist a changed preference only when it follows explicit user input.

Budget and exclusions are enforced by application logic after generation. Currency conversion requires a dated rate; otherwise avoid presenting a foreign-currency candidate as verified within-budget. Do not ask for detailed personal distress or medical information to make shopping recommendations.

## 7. Community evidence methodology

Use permitted search/API retrieval. Do not bypass login, access restrictions, or anti-bot controls. Search snippets alone are marked as limited excerpts and cannot be described as a full-thread review. OpenAI API access does not guarantee access to every forum or thread.

Deduplicate crossposts, repeated URLs, and identifiable repeated comments. Match exact product/version; category-level evidence is labelled separately. Avoid treating upvotes as verified ownership or representative satisfaction.

MVP uses explanatory evidence labels instead of a 0–100 “confidence score”:
- Insufficient: no usable exact-model ownership discussion.
- Limited: one usable discussion or materially incomplete access.
- Broader coverage: at least three independent usable discussions with exact-model relevance; still anecdotal, not proof.

Sentiment is a separate field: broadly positive, mixed, broadly negative, or unclear. A label must state the number of usable discussions and notable disagreement. Thresholds are product heuristics to test, not validated statistics. Do not manufacture consensus from a small sample.

Record claim-to-source mappings and whether a source is suspected promotional. Product fit does not rise merely because a source has many votes. Show contrary findings as prominently as praise when they affect the user's priorities.

## 8. Reminder behaviour

For MVP, store a plan's local recurrence rule and compute each occurrence using its IANA timezone. Store due timestamps in UTC. Use occurrence IDs to prevent duplicates across restarts and tabs.

- If the app/server is running: check due reminders periodically; show an in-app reminder and request an OS browser notification only with permission and browser support.
- If the browser is closed: do not promise an OS notification. On next visit, surface one overdue reminder with its original date.
- If the local server is stopped: no background delivery; due state is reconciled on restart.
- Editing or pausing a plan invalidates future scheduled occurrences. Snoozing changes only the current occurrence.
- Preview payday creates a labelled preview, not a real occurrence or purchase event.

Production phase requires hosted scheduling, a persistent job queue, push subscriptions/service worker or an email provider, retry/delivery tracking, unsubscribe handling, and multi-user ownership checks. This must be implemented before claiming reliable closed-app reminders.

## 9. Proposed local architecture

- React + TypeScript responsive frontend, Vite development/build tooling.
- Node.js + TypeScript backend, shared schema validation, and a local SQLite database.
- Server-only OpenAI client; frontend accesses same-origin application endpoints.
- Bind to localhost by default; private single-user prototype without authentication.
- Root `.env` loaded only by the backend. No client-exposed key variables, environment echoing, or request-body logging of secrets.
- Store database and caches in ignored `data/`; reproducible fixture data under source control.
- Prompts in `prompts/`, research in `references/`, specifications in `docs/`, output screenshots/build notes in `outputs/`.

Suggested routes: `/`, `/plans/new`, `/plans/:id`, `/discover/:sessionId`, `/saved`, `/settings`.

Suggested API endpoints:
- GET/POST `/api/plans`; PATCH/DELETE `/api/plans/:id`.
- POST `/api/plans/:id/start`; POST `/api/plans/:id/snooze`.
- GET `/api/reminders/due`; POST `/api/reminders/:id/acknowledge`.
- POST `/api/discovery/:id/react`; GET `/api/discovery/:id`.
- POST `/api/discovery/:id/shortlist`.
- GET `/api/products/:id/evidence`; explicit refresh endpoint with rate limiting.
- POST `/api/decisions`; POST `/api/feedback`.
- GET `/api/status` exposes mode and availability, never secrets.

## 10. Core data records

- Profile: id, timezone, currency, optional interests/exclusions, consent settings.
- RewardPlan: id, occasion, intention, maxBudgetMinorUnits, recurrence, localTime, timezone, status, createdAt.
- ReminderOccurrence: id, planId, dueAtUTC, status, acknowledgedAt, snoozedUntil.
- DiscoverySession: id, planId, constraintSnapshot, stage, reactions, candidateIds, timestamps, mode.
- ProductCandidate: id, exactModel, category, merchant, merchantURL, observedPrice, currency, totalCostKnown, sourceURL, checkedAt.
- EvidenceSource: id, canonicalURL, title, forum, publishedAt, fetchedAt, modelMatch, accessDepth, ownershipClaim, promotionalFlag.
- EvidenceClaim: id, candidateId, statement, polarity, sourceIds, limitations.
- Decision: id, sessionId, candidateId, action, timestamp; retailer-click and self-reported purchase are different actions.
- Feedback: decisionId, reportedUse, satisfaction, regret, optional note.

All monetary arithmetic uses minor units. Every generated candidate/claim records demo/live provenance. Avoid storing unnecessary raw forum content or personal identifiers.

## 11. UX and visual direction

Warm, editorial, premium but approachable: cream background, dark ink text, restrained warm orange accent, rounded cards, generous space. Avoid casino-like rewards or flashing urgency. Product/experience imagery is useful when authentic and available; use clear labelled placeholders otherwise.

Mobile-first card journey; desktop adds a persistent summary rail. Keyboard-accessible controls, visible focus, labelled inputs, reduced-motion support, useful empty states, and adequate contrast. No API jargon in the shopping flow.

AI personality: an insightful personal shopper. Example: “You wanted a daily upgrade and mentioned a long commute. These options focus on comfort and portability.” Avoid “Everyone loves this”, “You deserve debt”, “Guaranteed happiness”, or unsupported scarcity.

## 12. Failure and edge states

- Missing API key: labelled demo experience, not fabricated live results.
- Invalid key, timeout, rate limit, or offline: preserve progress; retry or explicitly switch to demo.
- No product fits budget: explain and offer another direction; never silently raise it.
- No accessible evidence: state the limitation; do not create a score.
- Wrong version or conflicting forum experiences: show the mismatch/disagreement.
- Stale price/stock: show checked time and require retailer verification.
- Notification denied: in-app reminders remain usable.
- Reload during generation: resume the saved stage; prevent duplicated operations.
- Retailer visit: do not mark purchased automatically.

## 13. Measurement and validation

Events: plan_created, reminder_due, reminder_opened, discovery_started, scenario_selected, option_rejected, shortlist_viewed, evidence_opened, item_saved, retailer_clicked, purchase_self_reported, feedback_submitted. Demo events are excluded from live metrics.

Primary discovery metrics: proportion finding a wanted option, time/interactions to shortlist, abandonment, and user-rated relevance. Conversion metrics: retailer visits and separately verified or self-reported purchases. Quality metrics: unsupported recommendation claims, constraint violations, cancellations/returns where reported, and later satisfaction.

Run separate comparisons for guided discovery vs category grid, reminders vs no reminders, and evidence cards vs product facts alone. Do not change all three simultaneously and attribute lift to one feature. Initial usability work can use a small group; statistical conversion claims require an appropriately sized experiment.

## 14. Acceptance criteria

1. A user creates a monthly plan, reloads, and sees the same date, budget, and intention.
2. Month-end dates, timezone conversion, snooze, pause, and restart reconciliation behave correctly.
3. Reminder preview works without waiting for payday and is clearly labelled.
4. “Already have headphones” excludes headphones in subsequent candidates unless explicitly undone.
5. Candidate generation cannot silently exceed the budget or invent a verified price.
6. Every displayed community claim links to actual retrieved support; missing evidence remains missing.
7. Live and demo records are visibly distinct and never mixed as if all verified.
8. No API key reaches browser bundles, responses, logs, or version control.
9. Save/replace/compare/retailer actions work on mobile and desktop.
10. No purchase is claimed from a link click, and no closed-app reminder guarantee is made in local mode.

Meaningful implementation checks: recurrence unit tests, schema/constraint tests, evidence attribution checks, API error-path integration tests, production build, and browser walkthrough of the main journey. Test real retrieval with the configured key only when available; otherwise report that limitation.

## 15. Build sequence

Phase 1: local application shell, storage, plan setup, and complete labelled demo journey.
Phase 2: server-side AI, structured preferences, grounded product retrieval, and evidence cards.
Phase 3: reminder handling, optional notifications, saved decisions, and feedback.
Phase 4: usability/accessibility checks, live integration checks where available, and handoff instructions.
Later production phase: accounts, hosted scheduling/push, catalog integrations, and optional retailer conversion reporting.

This document completes the specification-first stage. Folder and environment placeholders are prepared; no API calls, server, deployment, or application implementation are started by this specification.
