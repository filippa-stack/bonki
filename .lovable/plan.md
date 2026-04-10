

## Update Favicon

### What changes
1. **Copy** the uploaded image to `public/favicon.png` (overwrites the current one)
2. **Delete** `public/favicon.ico` if it exists (browsers auto-request `/favicon.ico` which can override the `.png`)
3. No code changes needed — `index.html` already references `/favicon.png`

### Risk
**None.** The favicon is a static asset served by the browser. Existing users will simply see the new icon on their next page load. No data, sessions, authentication, or functionality is touched.

### Note
The uploaded image is square (ideal). Browsers will scale it down automatically. For best crispness, the image should be at least 48×48px — your upload looks well above that.

