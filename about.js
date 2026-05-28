(function () {
    const modal = document.getElementById('thanks-modal');
    const closeButton = document.getElementById('thanks-close');
    const ctaButton = document.getElementById('thanks-cta');
    const contactSection = document.getElementById('contact-section');

    if (!modal) {
        return;
    }

    const currentUrl = new URL(window.location.href);
    const shouldOpenPopup = currentUrl.searchParams.get('submitted') === '1';

    function closePopup() {
        modal.hidden = true;
        document.body.classList.remove('thanks-open');
    }

    function openPopup() {
        modal.hidden = false;
        document.body.classList.add('thanks-open');
    }

    function keepViewAtForm() {
        if (!contactSection) {
            return;
        }

        requestAnimationFrame(() => {
            contactSection.scrollIntoView({ block: 'start' });
        });
    }

    function clearSuccessParam() {
        currentUrl.searchParams.delete('submitted');
        const nextPath = currentUrl.pathname + currentUrl.search + currentUrl.hash;
        window.history.replaceState({}, '', nextPath);
    }

    if (shouldOpenPopup) {
        openPopup();
        keepViewAtForm();
        clearSuccessParam();
    }

    closeButton?.addEventListener('click', closePopup);
    ctaButton?.addEventListener('click', closePopup);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closePopup();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.hidden) {
            closePopup();
        }
    });
})();
