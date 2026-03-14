(function () {
    const body = document.body;
    const activePage = body.dataset.page;

    // Force a single dark theme mode across the site.
    localStorage.removeItem('portfolioTheme');
    document.documentElement.dataset.theme = 'dark';
    body.dataset.theme = 'dark';

    const navTarget = document.getElementById('site-nav');
    const footerTarget = document.getElementById('site-footer');

    if (navTarget) {
        const links = [
            { href: 'index.html', label: 'Start', key: 'index' },
            { href: 'funstuff.html', label: 'Funstuff', key: 'funstuff' },
        ];

        const nav = document.createElement('nav');
        links.forEach((link) => {
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.label;
            if (link.key === activePage) {
                a.classList.add('is-active');
                a.setAttribute('aria-current', 'page');
            }
            nav.appendChild(a);
        });

        navTarget.replaceWith(nav);
    }

    if (footerTarget) {
        footerTarget.innerHTML = [
            '<a href="https://www.instagram.com/dav1den/"><img class="footericon" src="pictures/instagram-logo.png" alt="Instagram logo"></a>',
                '<a href="https://www.tiktok.com/@davin3t" target="_blank" rel="noopener noreferrer"><img class="footericon" src="pictures/tiktoklogo.png" alt="TikTok link"></a>',
                '<a href="mailto:davidbrolin04@gmail.com"><img class="footericon" src="pictures/mail.png" alt="Email icon"></a>'
        ].join('');
    }

    requestAnimationFrame(() => {
        body.classList.add('scene-ready');
    });
})();
