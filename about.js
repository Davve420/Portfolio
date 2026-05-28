// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// About Page - Contact Form Handler
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const contactForm = document.getElementById('contact-form');
const contactFeedback = document.getElementById('contact-feedback');
const thanksModal = document.getElementById('thanks-modal');
const thanksClose = document.getElementById('thanks-close');
const thanksCta = document.getElementById('thanks-cta');
if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
}

thanksClose?.addEventListener('click', closeThanksModal);
thanksCta?.addEventListener('click', closeThanksModal);
thanksModal?.addEventListener('click', (event) => {
    if (event.target === thanksModal) {
        closeThanksModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && thanksModal && !thanksModal.hidden) {
        closeThanksModal();
    }
});

/**
 * Handle contact form submission.
 * Uses Netlify Forms when enabled on the form element, with localStorage fallback.
 */
function handleContactSubmit(event) {
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

    const isNetlifyForm = contactForm?.hasAttribute('data-netlify');

    if (isNetlifyForm) {
        try {
            submitContactToNetlifyNative(data);
            return;
        } catch (error) {
            showFeedback('error', '✗ Could not send right now. Please try again or email davidbrolin04@gmail.com.');
            console.error('Contact form error:', error);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }
    }

    submitContact(data)
        .then(() => {
            // Success feedback
            showFeedback('', '');
            contactForm.reset();
            openThanksModal();
        })
        .catch((error) => {
            showFeedback('error', '✗ Could not send right now. Please try again or email davidbrolin04@gmail.com.');
            console.error('Contact form error:', error);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
}

function submitContact(data) {
    return saveContactToLocalStorage(data);
}

function submitContactToNetlifyNative(data) {
    setOrCreateHiddenField('form-name', contactForm.getAttribute('name') || 'contact');
    setOrCreateHiddenField('timestamp', data.timestamp);
    setOrCreateHiddenField('bot-field', '');
    contactForm.submit();
}

function setOrCreateHiddenField(name, value) {
    let field = contactForm.querySelector(`input[name="${name}"]`);
    if (!field) {
        field = document.createElement('input');
        field.type = 'hidden';
        field.name = name;
        contactForm.appendChild(field);
    }
    field.value = value;
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
 * Used only when Netlify submission is not active.
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
    contactFeedback.className = type ? `contact-feedback ${type}` : 'contact-feedback';

    // Auto-clear after 6 seconds if success
    if (type === 'success') {
        setTimeout(() => {
            contactFeedback.textContent = '';
            contactFeedback.className = 'contact-feedback';
        }, 6000);
    }
}

function openThanksModal() {
    if (!thanksModal) return;
    thanksModal.hidden = false;
    document.body.classList.add('thanks-open');
}

function closeThanksModal() {
    if (!thanksModal) return;
    thanksModal.hidden = true;
    document.body.classList.remove('thanks-open');
}
