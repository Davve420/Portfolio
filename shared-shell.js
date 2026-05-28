(function () {
    const body = document.body;
    const activePage = body.dataset.page;
    const isHomePage = activePage === 'index';

    // Force a single dark theme mode across the site.
    localStorage.removeItem('portfolioTheme');
    document.documentElement.dataset.theme = 'dark';
    body.dataset.theme = 'dark';

    const navTarget = document.getElementById('site-nav');
    const footerTarget = document.getElementById('site-footer');

    if (navTarget) {
        navTarget.remove();
    }

    if (!isHomePage) {
        body.classList.add('subpage-shell');

        const shell = document.createElement('div');
        shell.className = 'mini-shell';

        const homeBtn = document.createElement('a');
        homeBtn.href = 'index.html';
        homeBtn.className = 'mini-btn mini-btn-home mini-btn-icon-only';
        homeBtn.setAttribute('aria-label', 'Back to start page');
        homeBtn.innerHTML = '<img class="mini-btn-image" src="icons/portal%20(1).png" alt="" aria-hidden="true">';

        shell.appendChild(homeBtn);
        body.appendChild(shell);
    }

    if (footerTarget) {
        footerTarget.innerHTML = [
            '<div class="footer-copy">',
            '<p class="footer-kicker"><a class="footer-brand-link" href="index.html">DaviN3t</a></p>',
            '<p class="footer-text">Building digital spaces with curiosity, creativity, and intention.</p>',
            '</div>',
            '<div class="footer-links" aria-label="Social links and contact">',
            '<a href="https://www.instagram.com/dav1den/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><img class="footericon" src="pictures/instagram-logo.png" alt="Instagram logo"></a>',
            '<a href="https://www.tiktok.com/@davin3t" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><img class="footericon" src="pictures/tiktoklogo.png" alt="TikTok link"></a>',
            '<a href="mailto:davidbrolin04@gmail.com" aria-label="Email David"><img class="footericon" src="pictures/mail.png" alt="Email icon"></a>',
            '</div>'
        ].join('');

        if (!isHomePage) {
            footerTarget.style.display = '';
        }
    }

    requestAnimationFrame(() => {
        body.classList.add('scene-ready');
    });
})();
