# Payday companion

1. Extract the ZIP into a permanent folder.
2. In Chrome, open `chrome://extensions`, turn on Developer mode, choose **Load unpacked**, and select this folder (the one containing manifest.json).
3. Pin Payday. On a public product page, click its toolbar icon and **Save this product**.
4. Optionally approve a shopping site for automatic product capture. Only individual pages exposing Product metadata are captured; some retailers do not expose it.
5. Mark wanted items **For me**, then **Share with Payday**. Open Payday in the same Chrome profile, reload if it was open before installation, and select **Bring in my shortlist**. Review and import.
6. Set your budget and choose **Explore these interests**. Or start from scratch with **Something completely different**.

This is a locally installed Chrome extension, not a Chrome Web Store listing. It requires Chrome 116+. It works with https://payday-reward-discovery.maltoh12345.chatgpt.site only. No API key or Gmail connection is needed.

## Data and permissions

Product names, query-free URLs, source domains, timestamps, and your labels are stored locally (up to 100 items). Browsing alone is not treated as buying intent. No cookies, passwords, full page text, or inbox contents are collected. Private/cart/payment paths and incognito tabs are excluded. Do not enable automatic capture on sensitive shopping sites; the URL filter cannot identify every sensitive subject.

`activeTab` and `scripting` read the product you explicitly save. Optional site permissions remember products on approved sites only. Optional history permission scans at most 200 entries from the last 7 days and presents up to 30 likely product links from approved sites; it is revoked after scanning. History does not contain historic page contents. Optional notifications provide a monthly reminder when Chrome is running. `alarms` schedules the reminder, `sidePanel` provides the interface, and `storage` retains local choices.

Sharing makes selected For me items available only to the published Payday origin. The app asks you to review an import. When you start AI discovery in the app, imported interests may be included in the request to its AI provider. Nothing is uploaded by the extension itself. No advertising or resale of browsing data.

Remove items in the extension to stop future sharing; remove imported copies separately in Payday's Your context page. Stop a site to revoke access. Forget all removes extension items. Uninstall removes extension storage. No cross-device sync. Metadata can be incomplete or wrong; prices and availability are researched separately in the app.
