(function () {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (prefersReducedMotion || !canHover) {
        return;
    }

    const cardLinks = document.querySelectorAll('.destination-card:not(.music-card) .card-link');

    cardLinks.forEach((card) => {
        const maxTilt = 7;

        function onPointerMove(event) {
            const rect = card.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width;
            const py = (event.clientY - rect.top) / rect.height;
            const rotateY = (px - 0.5) * (maxTilt * 2);
            const rotateX = (0.5 - py) * (maxTilt * 1.7);

            card.style.setProperty('--tilt-x', rotateX.toFixed(2) + 'deg');
            card.style.setProperty('--tilt-y', rotateY.toFixed(2) + 'deg');
            card.style.setProperty('--tilt-scale', '1.018');
        }

        function resetTilt() {
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
            card.style.setProperty('--tilt-scale', '1');
        }

        card.addEventListener('pointermove', onPointerMove);
        card.addEventListener('pointerleave', resetTilt);
        card.addEventListener('pointercancel', resetTilt);
        card.addEventListener('blur', resetTilt);
    });
})();

// ── Hero scroll-fade ──────────────────────────────────────────────────────────
(function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const heroShell   = document.querySelector('.hero-shell');
    const heroContent = document.querySelector('.hero-content');
    if (!heroShell || !heroContent) return;

    function onScroll() {
        const scrolled  = window.scrollY;
        const heroH     = heroShell.offsetHeight;
        const t         = Math.max(0, Math.min(scrolled / (heroH * 0.6), 1));
        heroContent.style.opacity   = String(1 - t * 0.88);
        heroContent.style.transform = `translateY(${t * -22}px)`;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
})();
