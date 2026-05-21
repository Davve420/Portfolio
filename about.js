// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// About Page - Contact Form Handler
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const contactForm = document.getElementById('contact-form');
const contactFeedback = document.getElementById('contact-feedback');

if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
}

/**
 * Handle contact form submission.
 * Uses Netlify Forms when enabled on the form element, with localStorage fallback.
 */
async function handleContactSubmit(event) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(contactForm);
    const data = {
        name: formData.get('name').trim(),
        email: formData.get('email').trim(),
        subject: formData.get('subject'),
        message: formData.get('message').trim(),
        timestamp: new Date().toISOString(),
    };

    // Client-side validation
    if (!data.name || !data.email || !data.subject || !data.message) {
        showFeedback('error', '⚠ Please fill in all fields.');
        return;
    }

    if (!isValidEmail(data.email)) {
        showFeedback('error', '⚠ Please enter a valid email address.');
        return;
    }

    if (data.message.length < 10) {
        showFeedback('error', '⚠ Message must be at least 10 characters long.');
        return;
    }

    // Disable submit button during processing
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
        await submitContact(data);

        // Success feedback
        showFeedback('success', '✓ Message sent! I\'ll get back to you soon.');
        contactForm.reset();

        // Log to console (for debugging)
        console.log('Contact form submitted:', data);
    } catch (error) {
        showFeedback('error', '✗ Something went wrong. Please try again.');
        console.error('Contact form error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function submitContact(data) {
    if (contactForm?.hasAttribute('data-netlify')) {
        return submitContactToNetlify(data);
    }

    return saveContactToLocalStorage(data);
}

function submitContactToNetlify(data) {
    const payload = new URLSearchParams({
        'form-name': contactForm.getAttribute('name') || 'contact',
        'bot-field': '',
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        timestamp: data.timestamp,
    });

    return fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload.toString(),
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`Netlify submit failed: ${response.status}`);
        }
    });
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Save contact to localStorage (demo only)
 * TODO: Replace with actual server-side submission
 */
function saveContactToLocalStorage(data) {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            try {
                const contacts = JSON.parse(localStorage.getItem('contact_messages') || '[]');
                contacts.push(data);
                localStorage.setItem('contact_messages', JSON.stringify(contacts));
                resolve();
            } catch (e) {
                console.error('localStorage error:', e);
                reject(e);
            }
        }, 300);
    });
}

/**
 * Show feedback message
 */
function showFeedback(type, message) {
    contactFeedback.textContent = message;
    contactFeedback.className = `contact-feedback ${type}`;

    // Auto-clear after 6 seconds if success
    if (type === 'success') {
        setTimeout(() => {
            contactFeedback.textContent = '';
            contactFeedback.className = 'contact-feedback';
        }, 6000);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Optional: Log saved messages to console (for debugging)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (window.location.search.includes('debug')) {
    console.log('📧 Saved contact messages:', JSON.parse(localStorage.getItem('contact_messages') || '[]'));
}
