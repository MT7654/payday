# Payday browser companion

## User journey

1. An unsure payday shopper browses normally. They save a product through Payday's Chrome side panel, or opt a particular shopping site into automatic capture.
2. Recognizable product pages become local attention signals, not purchase-intent claims. The shopper can label For me, Gift, or Just browsing.
3. The shopper explicitly shares selected For me items. On payday, an optional Chrome reminder opens the existing app.
4. The app previews those items before import. Existing corrections and removal markers survive repeat imports; explicitly reselecting a removed item restores it.
5. With their budget set, the shopper explores the benefit behind these interests. The AI asks one useful question, builds a correctable brief, and offers a related direction plus an adjacent possibility.
6. The shopper selects a direction and a real use occasion. Existing live research checks suitable listings, including up to six shared candidate URLs when relevant, against fresh alternatives.
7. Existing merchant handoff, saved rewards, payday plans, and later feedback remain available. A merchant visit is not recorded as a confirmed purchase.

## Cold start

The extension is optional. Empty interests lead directly to the existing guided discovery. “Discover from scratch” and “Something completely different” intentionally omit remembered context and browser candidates for that guide session. Browsing makes the first question more relevant; it does not replace discovery with a retargeting feed.

## Architecture

`extension/` is a buildless Manifest V3 extension. Its service worker serializes storage mutations, manages dynamic scripts on individually approved HTTPS origins, and handles optional reminders. Product extraction only reads bounded Product JSON-LD or product Open Graph titles, never full page text. Query strings and fragments are removed. Ambiguous multiple-product metadata is not automatically selected.

The content-script bridge exists only on the published Payday origin and only responds in the top frame. The worker checks sender origin and exposes only shared For me items, not all extension storage. App requests use a nonce and a timeout, validate imported data with Zod, and require review before local storage. There is no remote extension backend, embedded API credential, arbitrary fetch proxy, or Gmail dependency.

The app stores interests under `payday-browser-interests-v1`. Explicit app corrections take precedence over repeated extension imports. Gift and just-browsing entries never enter AI context. Imported URLs remain unverified research candidates; existing merchant verification and budget checks still apply.

## Permissions and lifecycle

Required: activeTab, scripting, storage, sidePanel, alarms. Optional: specific shopping origins, history, notifications. History is requested only on a user click, scans at most 200 visits from seven days, keeps only likely product paths from approved origins for review, and revokes history permission in a finally block. History metadata cannot reconstruct old product pages.

Collection is opt-in per site, local, capped at 100 items, and excluded in incognito. Sharing is off for new observations. Stopping a site revokes that origin permission. Sensitive/private URL filtering is conservative but cannot classify every sensitive product, so the extension explains that users should not enable sensitive sites.

Extension and app storage are separate. Unsharing prevents future transfers; it does not erase an earlier app copy. Both interfaces provide removal controls. Exported app context includes imported interests. Saved reward briefs can contain candidate URLs and are managed through the reward shelf. Uninstalling clears extension storage. No cross-device synchronization.

## Packaging and validation

ZIP: `public/downloads/payday-extension.zip`, containing extension files at its root. Extract and Load unpacked in Chrome 116+. It is not a Chrome Web Store release. The bridge intentionally targets the production origin, not localhost or arbitrary sites.

Validated with TypeScript, the full automated test suite (including URL filtering, correction precedence, excluded intent, bridge nonce/origin handling, worker sender authorization and incognito exclusion), and a local visual check of the companion screen and no-history path. Actual installation in a Chrome profile and permission dialogs require a browser supporting extensions; the app preview browser does not.

The release incorporates the latest GitHub backend/security changes and their research-lease migration. Sites applies pending Drizzle migrations before publishing. React type definitions are aligned at 19.3 to resolve the upstream dependency mismatch.
