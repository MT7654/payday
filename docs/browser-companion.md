# Payday companion — presentation edition
Version 2 replaces the browsing collector with a prepared four-interest experience. The main UI uses normal product language: Your interests, For me, Share, and Explore in Payday. About discloses that this presentation uses sample interests and does not collect browsing activity.

## Architecture
Only storage and sidePanel permissions remain. No history, tabs, activeTab, scripting, host permissions, alarms or notifications. The sole static content script is the exact-origin app bridge. Capture code is removed, and the worker rejects capture/save/history messages. It only allows updates to entries in the bundled catalogue. Version migration clears legacy extension storage. Old installations should be removed before loading the new package so old permissions and scripts cannot remain active.

Items carry kind=prepared through app validation, storage and AI context. The app presents them as interests, never recorded browsing or purchases. Prepared placeholder URLs are not clickable and are excluded from merchant candidate research. Actual AI discovery and web research remain live. No-context discovery remains available.

## Handoff
Open the extension, mark one or two items For me and Share, open Payday, Bring in my shortlist, review, then Explore these interests. A gift item starts excluded. Sharing is off by default. Restore starting interests is under About. Extension and app copies are managed separately.

## Packaging
public/downloads/payday-extension.zip contains version 2 at its root. An additional payday-extension-v2.zip link avoids browser download caches. The workspace outputs folder also contains the ZIP. No secrets or browsing observations are packaged.

## Verification
Unit tests cover permission absence, refusal of capture messages, local-data migration, shared-item filtering, gift exclusion, exact-origin bridge restrictions, import schema and cold-start behavior. Actual installation in Chrome cannot be exercised in the in-app preview browser.
