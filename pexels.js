// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// pexels.js — Cosmic Lens photo search
//
// Get a free API key in ~2 minutes:
//   1. Go to https://www.pexels.com/api/
//   2. Sign up / log in
//   3. Click "Your API Key" → copy it
//   4. Paste it below ↓
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PEXELS_KEY = '6pOyMGqbNYmoOe1rWJKjUnPgbjf6EMENCZuiODL0cpnv2A5Je4MLYmry';
const DEFAULT_QUERY = 'night sky';

const searchInput = document.getElementById('pexels-input');
const searchBtn   = document.getElementById('pexels-btn');
const photoGrid   = document.getElementById('pexels-grid');

function showSetupMessage() {
    if (!photoGrid) return;
    photoGrid.innerHTML = `
        <div class="pexels-placeholder">
            <p>Add your free <a href="https://www.pexels.com/api/" target="_blank" rel="noopener noreferrer">Pexels API key</a> in <code>pexels.js</code> to enable photo search.</p>
            <p class="pexels-hint">It only takes 2 minutes to sign up — completely free.</p>
        </div>`;
}

function showIntroMessage() {
    if (!photoGrid) return;
    photoGrid.innerHTML = `
        <div class="pexels-placeholder">
            <p>Search for a mood, place or aesthetic and pull live photos into the page.</p>
            <p class="pexels-hint">Starter feed loading: ${DEFAULT_QUERY}</p>
        </div>`;
}

async function searchPexels(query) {
    if (PEXELS_KEY === 'YOUR_PEXELS_KEY') {
        showSetupMessage();
        return;
    }

    photoGrid.innerHTML = '<p class="pexels-loading">Searching…</p>';

    try {
        const url = new URL('https://api.pexels.com/v1/search');
        url.searchParams.set('query',       query);
        url.searchParams.set('per_page',    '12');
        url.searchParams.set('orientation', 'square');

        const res = await fetch(url, {
            headers: { Authorization: PEXELS_KEY }
        });

        if (!res.ok) throw new Error(`Pexels API error: ${res.status}`);

        const json = await res.json();

        if (!json.photos?.length) {
            photoGrid.innerHTML = '<p class="pexels-loading">No photos found. Try a different search.</p>';
            return;
        }

        photoGrid.innerHTML = '';

        json.photos.forEach(photo => {
            const a   = document.createElement('a');
            a.href    = photo.url;
            a.target  = '_blank';
            a.rel     = 'noopener noreferrer';
            a.className = 'pexels-photo';
            a.setAttribute('aria-label', `Photo by ${photo.photographer} on Pexels`);

            const img = document.createElement('img');
            img.src     = photo.src.medium;
            img.alt     = photo.alt || `Photo by ${photo.photographer}`;
            img.loading = 'lazy';
            img.decoding = 'async';

            const credit       = document.createElement('span');
            credit.className   = 'photo-credit';
            credit.textContent = photo.photographer;

            a.appendChild(img);
            a.appendChild(credit);
            photoGrid.appendChild(a);
        });

    } catch (err) {
        photoGrid.innerHTML = '<p class="pexels-loading">Search failed. Check your API key and try again.</p>';
        console.error(err);
    }
}

if (searchBtn && searchInput && photoGrid) {
    searchBtn.addEventListener('click', () => {
        const q = searchInput.value.trim();
        if (q) searchPexels(q);
    });

    searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') searchBtn.click();
    });

    if (PEXELS_KEY === 'YOUR_PEXELS_KEY') {
        showSetupMessage();
    } else {
        showIntroMessage();
        searchPexels(DEFAULT_QUERY);
    }
}
