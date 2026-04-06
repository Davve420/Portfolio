const LANG_COLOR = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Python: '#3572A5',
    'C#': '#178600',
    Java: '#b07219',
    Vue: '#41b883',
    Svelte: '#ff3e00',
    Go: '#00ADD8',
    Rust: '#dea584',
};

const GH_CACHE_KEY = 'projectRepoCache:v1';
const GH_CACHE_TTL_MS = 1000 * 60 * 60;

function readRepoCache() {
    try {
        const raw = sessionStorage.getItem(GH_CACHE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return {};
        return parsed;
    } catch {
        return {};
    }
}

function writeRepoCache(cache) {
    try {
        sessionStorage.setItem(GH_CACHE_KEY, JSON.stringify(cache));
    } catch {
        // Ignore storage write failures.
    }
}

function getOrCreateMeta(infoEl) {
    let meta = infoEl.querySelector('.project-meta');
    if (!meta) {
        meta = document.createElement('div');
        meta.className = 'project-meta';
        infoEl.appendChild(meta);
    }
    return meta;
}

function addOrUpdateGitHubButton(card, repoUrl) {
    const actions = card.querySelector('.project-actions');
    if (!actions || !repoUrl) return;
    const existing = actions.querySelector('.project-btn-subtle');
    if (existing) return;

    const btn = document.createElement('a');
    btn.className = 'project-btn project-btn-subtle';
    btn.href = repoUrl;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.textContent = 'GitHub';
    actions.appendChild(btn);
}

function updateMetaFromRepo(card, repo) {
    const info = card.querySelector('.project-info');
    const thumb = card.querySelector('.project-thumbnail');
    if (!info) return;

    const meta = getOrCreateMeta(info);
    meta.innerHTML = '';

    if (thumb) {
        thumb.querySelectorAll('.project-lang-badge').forEach(el => el.remove());
    }

    if (repo.language) {
        const lang = document.createElement('span');
        lang.className = 'project-tag';
        lang.textContent = repo.language;
        meta.appendChild(lang);

        if (thumb) {
            const dot = document.createElement('span');
            dot.className = 'project-lang-badge';
            dot.style.background = LANG_COLOR[repo.language] || '#666';
            dot.setAttribute('aria-label', repo.language);
            thumb.appendChild(dot);
        }
    }

    if (repo.stargazers_count > 0) {
        const stars = document.createElement('span');
        stars.className = 'project-stars';
        stars.textContent = `★ ${repo.stargazers_count}`;
        meta.appendChild(stars);
    }

    addOrUpdateGitHubButton(card, repo.html_url);
}

async function enrichCuratedProjects() {
    const cards = [...document.querySelectorAll('.project-card[data-github]')];
    if (cards.length === 0) return;

    const cache = readRepoCache();
    const now = Date.now();

    await Promise.all(cards.map(async card => {
        const ghUrl = card.dataset.github?.trim();
        if (!ghUrl) return;

        const match = ghUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/i);
        if (!match) return;

        const owner = match[1];
        const repoName = match[2].replace(/\.git$/i, '');
        const repoKey = `${owner}/${repoName}`.toLowerCase();

        const cached = cache[repoKey];
        if (cached && typeof cached === 'object' && (now - Number(cached.cachedAt) < GH_CACHE_TTL_MS) && cached.repo) {
            updateMetaFromRepo(card, cached.repo);
            return;
        }

        try {
            const res = await fetch(
                `https://api.github.com/repos/${owner}/${repoName}`,
                { headers: { Accept: 'application/vnd.github.v3+json' } }
            );

            if (!res.ok) return;

            const repo = await res.json();
            updateMetaFromRepo(card, repo);
            cache[repoKey] = { cachedAt: now, repo };
        } catch {
            // Keep static content if GitHub fetch fails.
        }
    }));

    writeRepoCache(cache);
}

document.addEventListener('DOMContentLoaded', enrichCuratedProjects);
