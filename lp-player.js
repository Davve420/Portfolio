/**
 * lp-player.js
 * Vinyl LP record player for vibedeck.html
 * Inspired by the turntable aesthetic — built from scratch.
 *
 * Reads from owner-top-tracks.json.
 * No audio preview expected (preview_url is currently null for all tracks).
 * Plays visual animation (spin + needle drop) and links to Spotify.
 */

(function () {
    'use strict';

    const TRACKS_URL     = './owner-top-tracks.json';
    const FALLBACK_IMG   = './pictures/VibeSystem.jpg';
    const SWAP_OUT_MS    = 350;   // vinyl fade-out duration
    const SWAP_IN_MS     = 400;   // vinyl fade-in duration
    const NEEDLE_DROP_MS = 1400;  // matches CSS transition on tonearm

    // Vinyl tint per track (cycles through 3 options)
    const VINYL_TINTS = ['#1a1025', '#0f1a14', '#121525'];

    let tracks      = [];
    let currentIndex = 0;
    let isPlaying   = false;
    let isSwapping  = false;
    let audio       = null;

    // ── DOM helpers ──────────────────────────────────────────────────────────
    const $ = (id) => document.getElementById(id);

    // ── Init ─────────────────────────────────────────────────────────────────
    async function init() {
        try {
            const res = await fetch(TRACKS_URL, { cache: 'no-store' });
            if (!res.ok) throw new Error('fetch failed');
            const data = await res.json();
            if (!Array.isArray(data) || !data.length) throw new Error('empty');
            tracks = data.map(normalizeTrack);
        } catch {
            showPlayerError();
            return;
        }

        renderTracklist();
        loadTrack(0, false);

        $('lp-play')?.addEventListener('click', togglePlay);
        $('lp-prev')?.addEventListener('click', () => changeTrack(currentIndex - 1));
        $('lp-next')?.addEventListener('click', () => changeTrack(currentIndex + 1));
    }

    function showPlayerError() {
        const tracklist = $('lp-tracklist');
        if (tracklist) {
            const li = document.createElement('li');
            li.className = 'lp-track-item lp-track-item--empty';
            li.textContent = 'Could not load tracks.';
            tracklist.replaceChildren(li);
        }
    }

    // ── Data normalization ────────────────────────────────────────────────────
    function normalizeTrack(t) {
        const artistName = (t.artists && t.artists[0] && t.artists[0].name)
            ? t.artists[0].name
            : (t.artist || 'Unknown artist');
        const spotifyUrl = (t.external_urls && t.external_urls.spotify)
            ? t.external_urls.spotify
            : (t.spotify_url || '#');
        const imageUrl = (t.album && t.album.images && t.album.images[0] && t.album.images[0].url)
            ? t.album.images[0].url
            : (t.image || FALLBACK_IMG);
        return {
            name:       t.name || 'Untitled',
            artist:     artistName,
            spotifyUrl: spotifyUrl,
            imageUrl:   imageUrl,
            previewUrl: t.preview_url || null,
        };
    }

    // ── Tracklist rendering ───────────────────────────────────────────────────
    function renderTracklist() {
        const list = $('lp-tracklist');
        if (!list) return;

        list.replaceChildren();
        tracks.forEach((track, i) => {
            const li = document.createElement('li');
            li.className = 'lp-track-item';
            li.dataset.index = String(i);

            const num = document.createElement('span');
            num.className     = 'lp-track-num';
            num.textContent   = String(i + 1).padStart(2, '0');
            num.setAttribute('aria-hidden', 'true');

            const art = document.createElement('img');
            art.className = 'lp-track-thumb';
            art.src       = track.imageUrl;
            art.alt       = '';
            art.loading   = 'lazy';

            const info = document.createElement('span');
            info.className = 'lp-track-info';

            const name = document.createElement('span');
            name.className   = 'lp-track-name';
            name.textContent = track.name;

            const artist = document.createElement('span');
            artist.className   = 'lp-track-artist';
            artist.textContent = track.artist;

            info.appendChild(name);
            info.appendChild(artist);

            const link = document.createElement('a');
            link.className = 'lp-track-link';
            link.href      = track.spotifyUrl;
            link.target    = '_blank';
            link.rel       = 'noopener noreferrer';
            link.setAttribute('aria-label', 'Open on Spotify');
            link.tabIndex  = -1; // navigate via list item click; link is secondary
            link.innerHTML = spotifyIconSvg();

            li.appendChild(num);
            li.appendChild(art);
            li.appendChild(info);
            li.appendChild(link);

            li.addEventListener('click', (e) => {
                // Let the Spotify link handle itself; everything else = cue track
                if (!e.target.closest('.lp-track-link')) {
                    e.preventDefault();
                    changeTrack(i);
                }
            });

            list.appendChild(li);
        });
    }

    // ── Track loading with swap animation ────────────────────────────────────
    function loadTrack(index, shouldPlay) {
        if (!tracks.length) return;
        if (isSwapping) return;

        const safeIndex = ((index % tracks.length) + tracks.length) % tracks.length;

        isSwapping = true;

        const wasPlaying = isPlaying;
        pause({ skipNeedleRaise: false });

        const vinyl = $('lp-vinyl');

        // Raise the needle before swap
        setTonearm(false);

        // Kick off the fade-out
        if (vinyl) vinyl.classList.add('is-swapping');

        setTimeout(() => {
            currentIndex = safeIndex;
            updateTrackDisplay();

            if (vinyl) {
                vinyl.classList.remove('is-swapping');
                vinyl.classList.add('is-entering');
            }

            setTimeout(() => {
                if (vinyl) vinyl.classList.remove('is-entering');
                isSwapping = false;

                if (shouldPlay || wasPlaying) {
                    // Short delay for needle-drop animation to feel deliberate
                    setTimeout(play, 200);
                }
            }, SWAP_IN_MS);
        }, SWAP_OUT_MS);
    }

    function updateTrackDisplay() {
        if (!tracks.length) return;
        const track = tracks[currentIndex];

        // Album art on vinyl label
        const artEl = $('lp-art');
        if (artEl) {
            artEl.src = track.imageUrl;
            artEl.alt = track.name + ' album art';
        }

        // Vinyl tint (changes label background color to give variety)
        const vinyl = $('lp-vinyl');
        if (vinyl) {
            vinyl.style.setProperty('--label-tint', VINYL_TINTS[currentIndex % VINYL_TINTS.length]);
        }

        // Text info
        const titleEl  = $('lp-title');
        const artistEl = $('lp-artist');
        if (titleEl)  titleEl.textContent  = track.name;
        if (artistEl) artistEl.textContent = track.artist;

        // Spotify link
        const spotifyBtn = $('lp-spotify');
        if (spotifyBtn) spotifyBtn.href = track.spotifyUrl;

        // Preview indicator
        const previewNote = $('lp-preview-note');
        if (previewNote) {
            previewNote.textContent = track.previewUrl
                ? ''
                : 'No audio preview · open on Spotify to listen';
        }

        // Tracklist active state
        document.querySelectorAll('.lp-track-item').forEach((item, i) => {
            item.classList.toggle('is-active', i === currentIndex);
        });
    }

    function changeTrack(index) {
        if (isSwapping) return;
        loadTrack(index, isPlaying);
    }

    // ── Playback ──────────────────────────────────────────────────────────────
    function play() {
        if (!tracks.length || isSwapping) return;
        const track = tracks[currentIndex];

        stopAudio();

        if (track.previewUrl) {
            audio = new Audio(track.previewUrl);
            audio.volume = 0.6;
            audio.play().catch(() => {
                // Browser blocked autoplay — visual-only mode is still fine
            });
            audio.addEventListener('ended', () => {
                changeTrack(currentIndex + 1);
            });
        }

        isPlaying = true;
        updatePlayButton();
        setTonearm(true);

        const vinyl = $('lp-vinyl');
        if (vinyl) vinyl.classList.add('is-playing');
    }

    function pause({ skipNeedleRaise } = {}) {
        stopAudio();
        isPlaying = false;
        updatePlayButton();

        if (!skipNeedleRaise) setTonearm(false);

        const vinyl = $('lp-vinyl');
        if (vinyl) vinyl.classList.remove('is-playing');
    }

    function togglePlay() {
        if (isPlaying) pause();
        else play();
    }

    function stopAudio() {
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            audio = null;
        }
    }

    // ── UI updates ────────────────────────────────────────────────────────────
    function updatePlayButton() {
        const btn = $('lp-play');
        if (!btn) return;
        const iconPlay  = btn.querySelector('.icon-play');
        const iconPause = btn.querySelector('.icon-pause');
        if (iconPlay)  iconPlay.style.display  = isPlaying ? 'none' : '';
        if (iconPause) iconPause.style.display = isPlaying ? '' : 'none';
        btn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
    }

    function setTonearm(playing) {
        const arm = $('lp-tonearm');
        if (arm) arm.classList.toggle('is-playing', playing);
    }

    // ── SVG helpers ───────────────────────────────────────────────────────────
    function spotifyIconSvg() {
        return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">'
            + '<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0z'
            + 'm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141'
            + '-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6'
            + ' 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3'
            + '-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12'
            + '-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2z'
            + 'm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721'
            + '-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719'
            + ' 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>';
    }

    // ── Boot ──────────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
