# Launch Checklist - Portfolio (2026-05-28)

## API Health (checked)
- [x] Giphy key responds with HTTP 200 from search endpoint.
- [x] Pexels key responds with HTTP 200 from search endpoint.
- [x] Spotify auth module is not used by the live page flow right now.

## Firestore Rules Review (current)
- [x] `solarpunk_commitments`: create-only, no update/delete, docId hash binding exists.
- [x] `songRecommendations`: strict create shape, no delete, update only allows increasing likes.
- [x] `notes`: strict create shape, no update/delete, coordinate/message limits present.

### Optional hardening after launch (not blockers)
- Restrict `songRecommendations` like increments to a max delta (example: `+1` per write).
- Add max length check for `gifUrl` to reduce payload abuse.
- Add stricter constraints for `source` values in `solarpunk_commitments`.

## External Actions Required Before Launch

### 1) Firebase - Firestore rules + App Check
Link: https://console.firebase.google.com/

Do this:
1. Open project `davin3t`.
2. Go to `Firestore Database` -> `Rules`.
3. Keep current rules published (they are launch-acceptable).
4. Go to `Build` -> `App Check` and enable App Check for Firestore.
5. Budget alerts in Google Cloud Billing are postponed to next iteration.

### 2) Giphy - App status / production compliance
Link: https://developers.giphy.com/dashboard/

Do this:
1. Open your app using the active key in `messages.js`.
2. Check app status (beta/test/prod).
3. If any compliance or production upgrade prompt exists, complete it.
4. Confirm rate limits for your key and expected traffic.

### 3) Pexels - Key usage limits
Link: https://www.pexels.com/api/new/

Do this:
1. Open API dashboard.
2. Verify key is active and not near quota limits.
3. Add usage monitoring reminders before launch week.

### 4) Netlify Forms - Contact delivery
Link: https://app.netlify.com/

Do this:
1. Open deployed site -> `Forms`.
2. Submit one real test from `about.html` contact form.
3. Confirm submission appears in Netlify Forms.
4. Confirm email notifications are enabled for form submissions.

## Runtime UX Failure Cases (now handled in code)
- GIF search failures now show status-specific feedback (timeout/key/rate/server).
- Cosmic Lens now handles offline/timeouts/rate limit/key errors with user messages.
- Star Notes falls back to local storage with visible hint when Firebase sync/write fails.
- Contact form has timeout and fallback instruction to direct email.

## Launch Verdict
- Status: Ready to launch after final Netlify form test.
- Risk level: Low for portfolio traffic.
- Most likely runtime issue under load: API rate limits (Giphy/Pexels), already handled with user-facing fallbacks.

## Next Iteration Plan (post-launch)

### 1) Cloud cost safety (important, not launch-blocking)
- Set budget alerts in Google Cloud Billing:
   - https://console.cloud.google.com/billing
   - Billing account -> Budgets & alerts -> Create budget.
- Add one email alert at low threshold (example: 25%) and one at high threshold (example: 80%).

### 2) Spiritual content pass
- Create a new section or standalone page with curated short quotes/texts from your journal.
- Keep the visual direction calm and intentional (readability first, atmospheric styling second).
- Add a tiny attribution pattern: `You` or named source when applicable.

### 3) Legacy page cleanup (space + maintainability)
- Inventory all older HTML pages and classify each page as:
   - keep (linked in live nav/flow)
   - archive (historic but worth saving)
   - remove (unused and no value)
- Before removing anything, confirm no live links/scripts point to the page.
- For archived pages, move them into a `legacy/` folder and keep one short README with context.

## Nice-to-have (post-launch)
- Move third-party API calls behind a small serverless proxy to avoid exposing API keys in client code.
- Add CSP and security headers at hosting level.
- Add a lightweight status badge/log for API fallback mode in admin/debug view only.
