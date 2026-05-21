import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {
    collection,
    doc,
    getCountFromServer,
    getDoc,
    getFirestore,
    serverTimestamp,
    setDoc,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Solar Punk Page - Interactivity & Animations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const LOCAL_COUNTER_KEY = 'solarpunk-joins-local';
const LOCAL_JOINED_HASH_KEY = 'solarpunk-joined-hash-v1';

const firebaseConfig = {
    apiKey: 'AIzaSyA88L7kP_pbqnufLHlmErHf7UVyhHRIB8Y',
    authDomain: 'davinetdb.firebaseapp.com',
    projectId: 'davinetdb',
    storageBucket: 'davinetdb.firebasestorage.app',
    messagingSenderId: '11016090500',
    appId: '1:11016090500:web:0e687a5ef41d135ca7e3d1'
};

let commitmentsCollection = null;
let usesFirebase = false;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCROLL REVEAL - Cards fade in as you scroll
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function initScrollReveal() {
    const revealCards = document.querySelectorAll('.reveal-card');

    if (!revealCards.length) return;

    // IntersectionObserver for efficient scroll detection
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Set CSS variable for staggered animation
                entry.target.style.setProperty('--reveal-index', index % 4);
                
                // Add visible class to trigger animation
                entry.target.classList.add('is-visible');
                
                // Stop observing this element (animation already done)
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before fully visible
    });

    revealCards.forEach((card) => observer.observe(card));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GLOBAL COUNTER - Track commitments
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get local counter from browser storage
 */
function getLocalCounter() {
    try {
        const stored = localStorage.getItem(LOCAL_COUNTER_KEY);
        return stored ? parseInt(stored, 10) : 0;
    } catch {
        return 0;
    }
}

/**
 * Save local counter to browser storage
 */
function setLocalCounter(value) {
    try {
        localStorage.setItem(LOCAL_COUNTER_KEY, String(value));
    } catch {
        console.warn('Could not save counter to localStorage');
    }
}

function hasJoinedHash() {
    try {
        return Boolean(localStorage.getItem(LOCAL_JOINED_HASH_KEY));
    } catch {
        return false;
    }
}

function markJoinedHash(hashValue) {
    try {
        localStorage.setItem(LOCAL_JOINED_HASH_KEY, hashValue);
    } catch {
        console.warn('Could not save joined state to localStorage');
    }
}

/**
 * Increment counter and update display
 */
function incrementCounter() {
    if (hasJoinedHash()) {
        return getLocalCounter();
    }

    const current = getLocalCounter();
    const updated = current + 1;
    setLocalCounter(updated);
    updateCounterDisplay(updated);
    return updated;
}

/**
 * Update counter display with animation
 */
function updateCounterDisplay(count) {
    const counterElement = document.getElementById('global-counter');
    if (!counterElement) return;

    // Animate the number change
    counterElement.textContent = count;
    counterElement.style.animation = 'none';
    
    // Trigger reflow to restart animation
    void counterElement.offsetWidth;
    
    counterElement.style.animation = 'pulse 0.4s ease-out';
}

/**
 * Setup join button
 */
async function setupFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        commitmentsCollection = collection(db, 'solarpunk_commitments');
        usesFirebase = true;
    } catch (error) {
        usesFirebase = false;
        console.warn('Firebase unavailable, using local fallback counter.', error);
    }
}

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

async function sha256Hex(value) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const digestArray = Array.from(new Uint8Array(digest));
    return digestArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function getGlobalCommitCount() {
    if (!usesFirebase || !commitmentsCollection) {
        return getLocalCounter();
    }

    try {
        const countSnap = await getCountFromServer(commitmentsCollection);
        return countSnap.data().count || 0;
    } catch (error) {
        console.warn('Could not load Firestore count, falling back to local.', error);
        return getLocalCounter();
    }
}

function setupJoinButton() {
    const joinForm = document.getElementById('join-form');
    const joinEmail = document.getElementById('join-email');
    const joinButton = document.getElementById('join-button');
    const joinFeedback = document.getElementById('join-feedback');
    if (!joinButton || !joinForm || !joinEmail) return;

    const applyJoinedState = () => {
        joinButton.disabled = true;
        joinEmail.disabled = true;
        joinButton.textContent = '✓ Already registered';
        if (joinFeedback) {
            joinFeedback.className = 'join-feedback is-info';
            joinFeedback.textContent = 'Din registrering finns redan i denna browser.';
        }
    };

    if (hasJoinedHash()) {
        applyJoinedState();
    }

    joinForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (hasJoinedHash()) {
            applyJoinedState();
            return;
        }

        const email = normalizeEmail(joinEmail.value);
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            joinFeedback.className = 'join-feedback is-error';
            joinFeedback.textContent = 'Skriv en giltig e-postadress.';
            return;
        }

        joinButton.disabled = true;
        joinButton.textContent = 'Saving...';

        try {
            if (usesFirebase && commitmentsCollection) {
                const emailHash = await sha256Hex(email);
                const commitmentRef = doc(commitmentsCollection, emailHash);
                const existing = await getDoc(commitmentRef);

                if (existing.exists()) {
                    markJoinedHash(emailHash);
                    applyJoinedState();
                    return;
                }

                await setDoc(commitmentRef, {
                    emailHash,
                    source: 'website',
                    createdAt: serverTimestamp()
                });

                markJoinedHash(emailHash);
                const total = await getGlobalCommitCount();
                updateCounterDisplay(total);

                joinButton.textContent = '✓ You\'re in!';
                joinEmail.disabled = true;
                if (joinFeedback) {
                    joinFeedback.className = 'join-feedback is-success';
                    joinFeedback.textContent = 'Tack! Du ar nu registrerad i Solar Punk-raknaren.';
                }
                return;
            }

            const count = incrementCounter();
            markJoinedHash('local-only');
            updateCounterDisplay(count);
            joinButton.textContent = '✓ You\'re in!';
            joinEmail.disabled = true;
            if (joinFeedback) {
                joinFeedback.className = 'join-feedback is-success';
                joinFeedback.textContent = 'Sparad lokalt (Firebase ej tillgangligt just nu).';
            }
        } catch (error) {
            joinButton.disabled = false;
            joinButton.textContent = 'Sign up ✨';
            if (joinFeedback) {
                joinFeedback.className = 'join-feedback is-error';
                joinFeedback.textContent = 'Kunde inte spara just nu, prova igen.';
            }
            console.error('Solar Punk sign-up failed:', error);
        }
    });
}

/**
 * Initialize counter display on page load
 */
async function initializeCounter() {
    const count = await getGlobalCommitCount();
    updateCounterDisplay(count);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAGE INIT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌱 Solar Punk page loaded');

    initScrollReveal();

    setupFirebase()
        .then(initializeCounter)
        .then(setupJoinButton)
        .catch((error) => {
            console.error('Solar Punk init issue:', error);
            updateCounterDisplay(getLocalCounter());
            setupJoinButton();
        });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEBUG MODE - Show counters in console
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (window.location.search.includes('debug')) {
    setTimeout(() => {
        console.log('📊 Solar Punk Debug Info:');
        console.log('  Local joins:', getLocalCounter());
        console.log('  Firebase enabled:', usesFirebase);
        console.log('  All localStorage keys:', Object.keys(localStorage));
    }, 500);
}
