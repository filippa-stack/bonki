

## Server-Side Meta CAPI + Event Rename

### Changes

| Action | File | Detail |
|--------|------|--------|
| Create | `supabase/functions/meta-capi/index.ts` | Edge function: receives event data, hashes email from JWT, forwards to Meta Graph API. Includes `test_event_code` from `META_CAPI_TEST_CODE` env var when set. |
| Edit | `supabase/config.toml` | Add `[functions.meta-capi]` with `verify_jwt = false` |
| Edit | `src/lib/metaPixel.ts` | After `fbq()`, fire-and-forget POST to meta-capi edge function with `eventID`, event name, params, URL, `fbc`/`fbp` cookies |
| Edit | `src/pages/Install.tsx` | Rename `trackPixelEvent('Lead')` → `trackPixelEvent('InstallCTA')` — keeps Lead exclusive to onboarding |

### Event map after changes

| Event | Where | Signal |
|-------|-------|--------|
| `PageView` | Every route change | Browsing |
| `InstallCTA` | `/install` CTA tap | Install intent (custom event) |
| `Lead` | Onboarding completion only | Real conversion for ad optimization |
| `CompleteRegistration` | Auth sign-in (<60s) | Account created |
| `Purchase` | `?purchase=success` | Payment (249 SEK) |

### Edge function logic (`meta-capi/index.ts`)

- Validate input: `event_name`, `event_id`, optional `custom_data`, `event_source_url`, `fbc`, `fbp`
- Extract hashed email (SHA-256) from JWT if auth header present
- Extract `client_ip_address` and `client_user_agent` from request headers
- POST to `https://graph.facebook.com/v21.0/{META_PIXEL_ID}/events` with:
  - `action_source: "website"`, `event_time`: unix seconds
  - `user_data: { em: [hashed_email], fbc, fbp, client_ip_address, client_user_agent }`
  - `event_id` for dedup matching browser pixel
- **Test mode**: if `META_CAPI_TEST_CODE` env var is set, append `test_event_code` to the payload — events route to Meta Events Manager → Test Events tab without polluting production data. Unset the variable when verified.
- Uses `META_ACCESS_TOKEN` and `META_PIXEL_ID` secrets (both already configured)

### Client changes (`metaPixel.ts`)

- Helper `getCookie(name)` to read `_fbc` and `_fbp` values
- After `fbq('track', ...)`, non-blocking `fetch()` to edge function with event data + cookies + auth token (if logged in)
- Silent catch — CAPI never breaks the UI

### Verification workflow

1. Set `META_CAPI_TEST_CODE` secret to the test code from Events Manager
2. Open `/install`, tap CTA — should see `InstallCTA` in Test Events with both Pixel and Server columns
3. Complete onboarding — should see `Lead` with both columns
4. Unset `META_CAPI_TEST_CODE` when confirmed

