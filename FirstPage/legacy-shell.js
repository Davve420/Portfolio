(function () {
    const body = document.body;
    const activePage = body.dataset.page;

    const navTarget = document.getElementById('legacy-nav');
    const footerTarget = document.getElementById('legacy-footer');

    const links = [
        { href: '../index.html', label: 'Tillbaka', key: 'back' },
        { href: 'index.html', label: 'Om mig', key: 'index' },
        { href: 'Historia.html', label: 'Historia', key: 'historia' },
        { href: 'HTML.html', label: 'HTML', key: 'html' },
        { href: 'Photoshop.html', label: 'Photoshop', key: 'photoshop' },
        { href: 'Artist.html', label: 'Favoritartist', key: 'artist' },
        { href: 'Hobby.html', label: 'Hobby', key: 'hobby' },
    ];

    if (navTarget) {
        const nav = document.createElement('nav');
        nav.className = 'legacy-nav';

        const ul = document.createElement('ul');

        links.forEach((link) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.label;

            if (link.key === activePage) {
                a.classList.add('active');
                a.setAttribute('aria-current', 'page');
            }

            li.appendChild(a);
            ul.appendChild(li);
        });

        nav.appendChild(ul);
        navTarget.replaceWith(nav);
    }

    if (footerTarget) {
        footerTarget.innerHTML = '<p>&copy; Copyright by David</p>';
    }
})();
