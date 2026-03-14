// ─── Spotify PKCE Auth + API ────────────────────────────────────────────────
//
// SETUP (takes ~2 min):
//  1. Go to https://developer.spotify.com/dashboard and create a free app.
//  2. Paste your Client ID into CLIENT_ID below.
//  3. In your app settings → "Redirect URIs", add:
//       http://localhost:<PORT>/favorites.html   ← for npm run dev
//       https://yourdomain.com/favorites.html    ← for production
//     (the exact URL you see in the browser when on the favorites page)
//
// ────────────────────────────────────────────────────────────────────────────

const CLIENT_ID   = '375ff5c05859463cac63366000e2be50';
const REDIRECT_URI = location.href.split('?')[0].split('#')[0];
const SCOPES       = 'user-top-read';

// ── PKCE helpers ─────────────────────────────────────────────────────────────

function base64url(buffer) {
    return btoa(String.fromCharCode(...buffer))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function genVerifier() {
    return base64url(crypto.getRandomValues(new Uint8Array(48)));
}

async function genChallenge(verifier) {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    return base64url(new Uint8Array(hash));
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login() {
    const verifier   = genVerifier();
    const challenge  = await genChallenge(verifier);
    sessionStorage.setItem('sp_cv', verifier);

    const url = new URL('https://accounts.spotify.com/authorize');
    url.searchParams.set('client_id',             CLIENT_ID);
    url.searchParams.set('response_type',         'code');
    url.searchParams.set('redirect_uri',          REDIRECT_URI);
    url.searchParams.set('scope',                 SCOPES);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('code_challenge',        challenge);
    location.href = url;
}

export async function exchangeCode(code) {
    const verifier = sessionStorage.getItem('sp_cv');
    if (!verifier) throw new Error('No PKCE verifier in session');

    const res = await fetch('https://accounts.spotify.com/api/token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type:    'authorization_code',
            code,
            redirect_uri:  REDIRECT_URI,
            client_id:     CLIENT_ID,
            code_verifier: verifier,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error_description ?? 'Token exchange failed');
    }

    const { access_token, expires_in } = await res.json();
    sessionStorage.removeItem('sp_cv');
    localStorage.setItem('sp_token',  access_token);
    localStorage.setItem('sp_expiry', Date.now() + expires_in * 1000);
    history.replaceState({}, '', location.pathname);
    return access_token;
}

export function getToken() {
    const token  = localStorage.getItem('sp_token');
    const expiry = Number(localStorage.getItem('sp_expiry'));
    if (!token || Date.now() > expiry) { clearToken(); return null; }
    return token;
}

export function clearToken() {
    localStorage.removeItem('sp_token');
    localStorage.removeItem('sp_expiry');
}

// ── API ───────────────────────────────────────────────────────────────────────

/**
 * Fetch the user's top tracks.
 * @param {string} token
 * @param {{ timeRange?: 'short_term'|'medium_term'|'long_term', limit?: number, offset?: number }} opts
 * @returns {Promise<SpotifyTrack[]|null>}  null = token expired (already cleared)
 */
export async function getTopTracks(token, { timeRange = 'short_term', limit = 6, offset = 0 } = {}) {
    const res = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}&offset=${offset}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.status === 401) { clearToken(); return null; }
    if (!res.ok) throw new Error(`Top tracks request failed: ${res.status}`);
    return (await res.json()).items;
}
