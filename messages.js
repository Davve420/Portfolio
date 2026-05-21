// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// messages.js — Star Note Board
//
// Requires two things to go fully live:
//  1. Firebase Firestore (free tier)
//     → console.firebase.google.com → create project
//     → paste your config below
//  2. Giphy API key (free) for GIF search
//     → developers.giphy.com → Create an App
//     → replace 'YOUR_GIPHY_API_KEY' below
//
// Without Firebase, notes work locally only
// (great for testing, not shared between users)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, onSnapshot, query, orderBy, limit, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ── CONFIG ─────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyB3alvPDXcZswkuRPsoSyC1ANE9yrStPAc",
    authDomain: "davin3t.firebaseapp.com",
    projectId: "davin3t",
    storageBucket: "davin3t.firebasestorage.app",
    messagingSenderId: "658896745127",
    appId: "1:658896745127:web:29f1082849c034c1b86182"
};

const GIPHY_KEY = 'RHhtjkTyAhj23zDDN4N8ndWMLbTCfCy6';
// ───────────────────────────────────────────

// State
let db            = null;
let firebaseReady = false;
let notesCollection = null;
let pendingPos    = null;   // { x, y } as percentages of the starfield
let selectedGif   = '';
const LOCAL_NOTES_KEY = 'davi_star_notes_local';
const FIREBASE_WRITE_TIMEOUT_MS = 9000;
let   placementMode   = false; // true while user is picking a spot on the map

function withTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firebase write timed out')), ms)
        ),
    ]);
}

// Firebase setup (safe — only initialises if config is filled)
try {
    if (!firebaseConfig.apiKey.startsWith('YOUR')) {
        const app = initializeApp(firebaseConfig);
        db            = getFirestore(app);
        notesCollection = collection(db, 'notes');
        firebaseReady = true;
    }
} catch (e) {
    console.warn('Firebase not configured — running in local-demo mode:', e.message);
}

// ── DOM refs ───────────────────────────────
const starfield      = document.getElementById('starfield');
const notesLayer     = document.getElementById('notes-layer');
const noteOverlay    = document.getElementById('note-overlay');
const closeBtn       = document.getElementById('close-btn');
const plantForm      = document.getElementById('plant-form');
const noteMessage    = document.getElementById('note-message');
const noteAuthor     = document.getElementById('note-author');
const charCount      = document.getElementById('char-count');
const gifQuery       = document.getElementById('gif-query');
const gifSearchBtn   = document.getElementById('gif-search-btn');
const gifResults     = document.getElementById('gif-results');
const gifPreview     = document.getElementById('gif-preview');
const gifSelectedImg = document.getElementById('gif-selected-img');
const gifClear       = document.getElementById('gif-clear');
const counterNumber  = document.getElementById('counter-number');
const fieldHint      = document.getElementById('field-hint');
const plantBtn       = document.getElementById('plant-btn');
const plantBtnLabel  = plantBtn?.querySelector('.plant-btn-label');
const ambientAudio   = document.getElementById('ambient-audio');
const audioToggle    = document.getElementById('audio-toggle');
const audioToggleIcon = document.getElementById('audio-toggle-icon');

const mobileNoteOverlay = document.createElement('div');
mobileNoteOverlay.className = 'mobile-note-overlay';
mobileNoteOverlay.hidden = true;
mobileNoteOverlay.innerHTML = `
    <div class="mobile-note-card" role="dialog" aria-modal="true" aria-label="Star note details">
        <button type="button" class="mobile-note-close" aria-label="Close note">✕</button>
        <p class="mobile-note-author"></p>
        <p class="mobile-note-message"></p>
        <img class="mobile-note-gif" alt="" hidden>
        <small class="mobile-note-time"></small>
    </div>
`;
document.body.appendChild(mobileNoteOverlay);

const mobileNoteClose = mobileNoteOverlay.querySelector('.mobile-note-close');
const mobileNoteAuthor = mobileNoteOverlay.querySelector('.mobile-note-author');
const mobileNoteMessage = mobileNoteOverlay.querySelector('.mobile-note-message');
const mobileNoteGif = mobileNoteOverlay.querySelector('.mobile-note-gif');
const mobileNoteTime = mobileNoteOverlay.querySelector('.mobile-note-time');

if (!starfield || !notesLayer || !noteOverlay || !closeBtn || !plantBtn || !plantForm || !noteMessage || !noteAuthor || !charCount || !gifQuery || !gifSearchBtn || !gifResults || !gifPreview || !gifSelectedImg || !gifClear || !counterNumber || !fieldHint || !ambientAudio || !audioToggle || !audioToggleIcon) {
    throw new Error('Star Notes markup is incomplete.');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Ambient background music
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const AUDIO_MUTED_KEY = 'davi_star_notes_audio_muted';
let hasAttemptedAmbientResume = false;

function setAudioUiState(isMuted) {
    audioToggle.classList.toggle('is-muted', isMuted);
    audioToggle.setAttribute('aria-pressed', String(isMuted));
    audioToggle.setAttribute('aria-label', isMuted ? 'Unmute background music' : 'Mute background music');
    audioToggle.title = isMuted ? 'Unmute background music' : 'Mute background music';
    audioToggleIcon.style.opacity = isMuted ? '0.35' : '0.85';
}

function persistAudioState(isMuted) {
    localStorage.setItem(AUDIO_MUTED_KEY, isMuted ? '1' : '0');
}

function getStoredMutedPreference() {
    return localStorage.getItem(AUDIO_MUTED_KEY) === '1';
}

async function tryPlayAmbient() {
    if (ambientAudio.muted) return;
    try {
        await ambientAudio.play();
        hasAttemptedAmbientResume = true;
    } catch {
        // Browser blocked autoplay until user interaction.
    }
}

function applyAudioMutedState(isMuted) {
    ambientAudio.muted = isMuted;
    setAudioUiState(isMuted);
    persistAudioState(isMuted);
    if (isMuted) {
        ambientAudio.pause();
        ambientAudio.currentTime = 0;
        return;
    }
    void tryPlayAmbient();
}

function initAmbientAudio() {
    const initialMuted = getStoredMutedPreference();
    ambientAudio.volume = 0.17;
    ambientAudio.muted = initialMuted;
    setAudioUiState(initialMuted);

    audioToggle.addEventListener('click', () => {
        applyAudioMutedState(!ambientAudio.muted);
    });

    void tryPlayAmbient();

    const tryResumeOnInteraction = () => {
        if (ambientAudio.muted || hasAttemptedAmbientResume) return;
        void tryPlayAmbient();
    };
    document.addEventListener('pointerdown', tryResumeOnInteraction, { passive: true });
    document.addEventListener('keydown', tryResumeOnInteraction, { passive: true });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Background decorative stars
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function generateBgStars() {
    const container = document.getElementById('bg-stars');
    if (!container) return;

    const count = Math.min(180, Math.floor((window.innerWidth * window.innerHeight) / 5000));
    const frag  = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
        const s    = document.createElement('div');
        s.className = 'bg-star';
        const size = (Math.random() * 1.8 + 0.4).toFixed(1);
        s.style.left              = `${Math.random() * 100}%`;
        s.style.top               = `${Math.random() * 100}%`;
        s.style.width             = `${size}px`;
        s.style.height            = `${size}px`;
        s.style.animationDelay    = `${(Math.random() * 5).toFixed(2)}s`;
        s.style.animationDuration = `${(2 + Math.random() * 5).toFixed(2)}s`;
        frag.appendChild(s);
    }
    container.appendChild(frag);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#039;');
}

function relativeTime(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60_000);
    const h = Math.floor(diff / 3_600_000);
    const d = Math.floor(diff / 86_400_000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
}

function getLocalNotes() {
    try {
        const parsed = JSON.parse(localStorage.getItem(LOCAL_NOTES_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveLocalNote(noteData) {
    const notes = getLocalNotes();
    const note = { id: `local-${Date.now()}`, ...noteData };
    notes.push(note);
    localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(notes.slice(-200)));
    return note;
}

function renderNotesCollection(notes) {
    notesLayer.replaceChildren();
    notes.forEach((note) => renderNote(note.id, note));
    counterNumber.textContent = notes.length;
    fieldHint.classList.toggle('hint-hide', notes.length > 0);
}

function renderLocalNotes() {
    const notes = getLocalNotes();
    renderNotesCollection(notes);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Render note as a star on the map
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function renderNote(id, data) {
    if (notesLayer.querySelector(`[data-note-id="${CSS.escape(id)}"]`)) return;

    const star       = document.createElement('div');
    star.className   = 'note-star';
    star.dataset.noteId = id;
    star.style.left  = `${data.x}%`;
    star.style.top   = `${data.y}%`;
    star.setAttribute('tabindex', '0');
    star.setAttribute('role', 'button');
    star.setAttribute('aria-label', `Note from ${data.author || 'Anonymous'}: ${data.message}`);

    // Stars near the top show popup below instead of above
    if (data.y < 22) star.classList.add('popup-below');
    if (data.x > 84) star.classList.add('popup-left');
    if (data.x < 16) star.classList.add('popup-right');

    star.innerHTML = `
        <div class="star-pulse" aria-hidden="true"></div>
        <div class="star-dot"   aria-hidden="true"></div>
        <div class="star-popup" role="note">
            <p class="popup-author">${escapeHtml(data.author || 'Anonymous')}</p>
            <p class="popup-msg">${escapeHtml(data.message)}</p>
            ${data.gifUrl ? `<img class="popup-gif" src="${escapeHtml(data.gifUrl)}" alt="" loading="lazy">` : ''}
            <small class="popup-time">${relativeTime(data.timestamp)}</small>
        </div>
    `;

    const popup = star.querySelector('.star-popup');

    function clampPopupToViewport() {
        if (!popup) return;

        popup.style.setProperty('--popup-shift-x', '0px');
        popup.style.setProperty('--popup-shift-y', '0px');

        const margin = 10;
        const rect = popup.getBoundingClientRect();
        let shiftX = 0;
        let shiftY = 0;

        if (rect.left < margin) {
            shiftX += margin - rect.left;
        }
        if (rect.right > window.innerWidth - margin) {
            shiftX -= rect.right - (window.innerWidth - margin);
        }
        if (rect.top < margin) {
            shiftY += margin - rect.top;
        }
        if (rect.bottom > window.innerHeight - margin) {
            shiftY -= rect.bottom - (window.innerHeight - margin);
        }

        popup.style.setProperty('--popup-shift-x', `${Math.round(shiftX)}px`);
        popup.style.setProperty('--popup-shift-y', `${Math.round(shiftY)}px`);
    }

    const toggle = () => {
        const wasOpen = star.classList.contains('is-open');
        if (window.matchMedia('(max-width: 899px)').matches) {
            openMobileNote(data);
            return;
        }
        // Close all other open notes
        notesLayer.querySelectorAll('.note-star.is-open').forEach(s => s.classList.remove('is-open'));
        if (!wasOpen) {
            star.classList.add('is-open');
            requestAnimationFrame(clampPopupToViewport);
        }
    };

    star.addEventListener('click',   e => { e.stopPropagation(); toggle(); });
    star.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        if (e.key === 'Escape') star.classList.remove('is-open');
    });

    notesLayer.appendChild(star);

    window.addEventListener('resize', () => {
        if (star.classList.contains('is-open')) {
            clampPopupToViewport();
        }
    });
}

function openMobileNote(data) {
    mobileNoteAuthor.textContent = data.author || 'Anonymous';
    mobileNoteMessage.textContent = data.message || '';
    mobileNoteTime.textContent = relativeTime(data.timestamp);

    if (data.gifUrl) {
        mobileNoteGif.src = data.gifUrl;
        mobileNoteGif.hidden = false;
    } else {
        mobileNoteGif.hidden = true;
        mobileNoteGif.removeAttribute('src');
    }

    mobileNoteOverlay.hidden = false;
}

function closeMobileNote() {
    mobileNoteOverlay.hidden = true;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Firebase: load and listen for notes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function loadNotes() {
    if (!firebaseReady) {
        renderLocalNotes();
        return;
    }

    const notesQuery = query(notesCollection, orderBy('timestamp', 'desc'), limit(200));

    getDocs(notesQuery)
        .then((snapshot) => {
            const notes = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
            renderNotesCollection(notes);
        })
        .catch(() => {
            firebaseReady = false;
            renderLocalNotes();
        });

    onSnapshot(notesQuery, snapshot => {
        const notes = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        renderNotesCollection(notes);
    }, () => {
        firebaseReady = false;
        renderLocalNotes();
    });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Form open / close
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function openForm(x, y) {
    pendingPos = { x, y };
    noteOverlay.hidden = false;
    requestAnimationFrame(() => noteMessage.focus());
    notesLayer.querySelectorAll('.note-star.is-open').forEach(s => s.classList.remove('is-open'));
}

function closeForm() {
    noteOverlay.hidden = true;
    pendingPos         = null;
    plantForm.reset();
    charCount.textContent = '0';
    gifResults.innerHTML  = '';
    gifPreview.hidden     = true;
    selectedGif           = '';
    noteMessage.classList.remove('input-error');
    exitPlacementMode();
}

function enterPlacementMode() {
    placementMode = true;
    starfield.classList.add('is-placing');
    plantBtn.classList.add('is-placing');
    if (plantBtnLabel) plantBtnLabel.textContent = 'Cancel';
    const hintP = fieldHint.querySelector('p');
    if (hintP) hintP.textContent = 'Tap anywhere on the map to create your star';
    fieldHint.classList.remove('hint-hide');
}

function exitPlacementMode() {
    placementMode = false;
    starfield.classList.remove('is-placing');
    plantBtn.classList.remove('is-placing');
    if (plantBtnLabel) plantBtnLabel.textContent = 'Create a star';
    const hintP = fieldHint.querySelector('p');
    if (hintP) hintP.textContent = 'Every star is a message from a visitor';
    if (+counterNumber.textContent > 0) fieldHint.classList.add('hint-hide');
}

// ── Click on starfield to place a note ──
starfield.addEventListener('click', e => {
    if (e.target.closest('.note-star') || !noteOverlay.hidden || !placementMode) return;

    const rect = starfield.getBoundingClientRect();
    const x    = +((e.clientX - rect.left) / rect.width  * 100).toFixed(2);
    const y    = +((e.clientY - rect.top)  / rect.height * 100).toFixed(2);
    openForm(x, y);
});

closeBtn.addEventListener('click', closeForm);
mobileNoteClose?.addEventListener('click', closeMobileNote);
noteOverlay.addEventListener('click', e => { if (e.target === noteOverlay) closeForm(); });
mobileNoteOverlay.addEventListener('click', (e) => {
    if (e.target === mobileNoteOverlay) closeMobileNote();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if (!noteOverlay.hidden) closeForm();
        else if (!mobileNoteOverlay.hidden) closeMobileNote();
        else if (placementMode) exitPlacementMode();
    }
});
plantBtn.addEventListener('click', () => {
    if (placementMode) exitPlacementMode();
    else enterPlacementMode();
});

// Character counter
noteMessage.addEventListener('input', () => {
    charCount.textContent = noteMessage.value.length;
    noteMessage.classList.remove('input-error');
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Rate limiting (1 note per minute)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const RATE_KEY = 'davi_note_ts';
const canPost  = () => Date.now() - +(localStorage.getItem(RATE_KEY) || 0) > 60_000;
const markPost = () => localStorage.setItem(RATE_KEY, String(Date.now()));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Form submit
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
plantForm.addEventListener('submit', async e => {
    e.preventDefault();

    const msg = noteMessage.value.trim();
    if (msg.length < 2) {
        noteMessage.classList.add('input-error');
        noteMessage.focus();
        return;
    }

    if (!canPost()) {
        alert('Please wait a moment before creating another star ✦');
        return;
    }

    const noteData = {
        author:    noteAuthor.value.trim().slice(0, 32) || 'Anonymous',
        message:   msg.slice(0, 280),
        gifUrl:    selectedGif || null,
        x:         pendingPos?.x ?? +(Math.random() * 75 + 10).toFixed(2),
        y:         pendingPos?.y ?? +(Math.random() * 70 + 10).toFixed(2),
        timestamp: Date.now(),
        createdAt: serverTimestamp(),
    };

    const submitBtn = plantForm.querySelector('.btn-plant');
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Creating…';

    if (!firebaseReady) {
        // Local fallback mode — note persists in this browser
        const localNote = saveLocalNote(noteData);
        renderNotesCollection(getLocalNotes());
        markPost();
        closeForm();
        submitBtn.disabled    = false;
        submitBtn.textContent = '✦ Create this star';
        return;
    }

    try {
        await withTimeout(addDoc(notesCollection, noteData), FIREBASE_WRITE_TIMEOUT_MS);
        markPost();
        closeForm();
    } catch (err) {
        console.error('Failed to save note:', err);
        firebaseReady = false;
        const localNote = saveLocalNote(noteData);
        renderNotesCollection(getLocalNotes());
        markPost();
        closeForm();
    } finally {
        submitBtn.disabled    = false;
        submitBtn.textContent = '✦ Create this star';
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GIF search (Giphy)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function searchGiphy(searchQuery) {
    if (GIPHY_KEY === 'YOUR_GIPHY_API_KEY') {
        gifResults.innerHTML = `
            <p class="gif-note">
                Get a free key at <a href="https://developers.giphy.com" target="_blank" rel="noopener noreferrer">developers.giphy.com</a>
                and paste it in <code>messages.js</code>.
            </p>`;
        return;
    }

    gifResults.innerHTML = '<p class="gif-note">Searching…</p>';

    try {
        const url = new URL('https://api.giphy.com/v1/gifs/search');
        url.searchParams.set('api_key', GIPHY_KEY);
        url.searchParams.set('q',       searchQuery);
        url.searchParams.set('limit',   '9');
        url.searchParams.set('rating',  'pg-13');

        const res  = await fetch(url);
        if (!res.ok) {
            throw new Error(`Giphy API error: ${res.status}`);
        }
        const json = await res.json();

        if (!json.data?.length) {
            gifResults.innerHTML = '<p class="gif-note">No GIFs found. Try different words.</p>';
            return;
        }

        gifResults.innerHTML = '';
        json.data.forEach(gif => {
            const img     = document.createElement('img');
            img.className = 'gif-thumb';
            img.src       = gif.images.fixed_width_small.url;
            img.alt       = gif.title || '';
            img.loading   = 'lazy';

            img.addEventListener('click', () => {
                selectedGif           = gif.images.downsized.url;
                gifSelectedImg.src    = selectedGif;
                gifPreview.hidden     = false;
                gifResults.innerHTML  = '';
                gifQuery.value        = '';
            });

            gifResults.appendChild(img);
        });
    } catch {
        gifResults.innerHTML = '<p class="gif-note">GIF search failed. Try again.</p>';
    }
}

gifSearchBtn.addEventListener('click', () => {
    const q = gifQuery.value.trim();
    if (q) searchGiphy(q);
});

gifQuery.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); gifSearchBtn.click(); }
});

gifClear.addEventListener('click', () => {
    selectedGif         = '';
    gifPreview.hidden   = true;
    gifSelectedImg.src  = '';
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Init
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
generateBgStars();
loadNotes();
initAmbientAudio();
