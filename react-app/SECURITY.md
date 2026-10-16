# Security notes

## Frontend rules

- Treat every `VITE_*` value as public. Never put Spotify client secrets, refresh tokens, or private API keys there.
- Keep API calls behind a server route when authentication or a secret is required.
- Validate and allow-list external URLs before rendering user-controlled links.
- Keep external links using `target="_blank"` paired with `rel="noreferrer"`.
- Do not add arbitrary HTML injection or render unsanitized markdown without a sanitizer.
- Run `npm audit` before deployment and review dependency updates.

## Spotify backend plan

When live Spotify data is added:

1. Store `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and refresh tokens only in the server environment.
2. Use OAuth Authorization Code with PKCE or a server-side OAuth flow, depending on the deployment.
3. Keep access tokens server-side and refresh them without exposing them to React.
4. Add a small allow-listed API surface such as `/api/spotify/now-playing`.
5. Return only the fields the UI needs: title, artist, album art, and playback state.
6. Add rate limiting and cache short-lived responses.
7. Return generic errors to the browser and keep provider details in server logs.
8. Never commit `.env`, `.env.local`, or production credentials.

## Deployment checklist

- Confirm production uses HTTPS.
- Confirm `public/_headers` is applied by the host.
- Run `npm run lint` and `npm run build`.
- Run `npm audit`.
- Test the deployed app with browser developer tools for console errors and blocked resources.
- Check that no secret appears in built assets or the browser network panel.
