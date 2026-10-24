# Payday companion 2.1

Extract payday-extension-v2.1.zip. Open chrome://extensions, enable Developer mode and Load unpacked. To update an existing unpacked installation, replace its files and click Reload. Approve changed permissions if prompted, and reload Payday tabs. Pin the extension.

Open a public product page and click the Payday toolbar icon to grant access to that tab. Click Detect & add. A visible-tab screenshot, title hint and cleaned URL are sent through Payday to OpenAI. Check that no private information is visible. One clear product is saved immediately; ambiguous products get a choice/name review. Existing cards also have Add to shortlist, which does not call AI. Stay on the shopping site: no Payday import step is needed.

The API key stays on the server. No history or background browsing collection. Only Payday has persistent host access; activeTab and scripting apply to the user-invoked tab. An inactive temporary Payday tab may briefly open for AI relay and local storage, then closes. Existing tabs are not navigated or closed. No screenshot is retained by Payday or the extension; OpenAI processes submitted API inputs under its data policies (store:false).

Saved interests contain name, cleaned URL, intent and date. Prices, stock and purchases are not inferred. Saves acknowledge completed persistence, preserve app corrections and exclusions, and respect capacity. Removing extension data does not remove app copies. Prepared starting interests remain disclosed in About. Same Chrome profile required. No API key is packaged.

Automated tests cover origin/frame boundaries, deduplication, persistence failure, excluded interests, temporary-tab cleanup, request-size bounds, API errors and quota release. Chrome installation and permission grants require browser testing; a mocked UI preview alone does not establish end-to-end Chrome behavior.
