(function () {
    function initCarousel() {
        const root = document.querySelector('[data-carousel]');
        if (!root) return;

        // Only initialize carousel if it's visible (skip on mobile where grid is shown)
        if (root.className.includes('gallery-carousel-fallback')) {
            const computed = window.getComputedStyle(root);
            if (computed.display === 'none') return;
        }

        const viewport = root.querySelector('.carousel-viewport');
        const track = root.querySelector('.carousel-track');
        const slides = Array.from(root.querySelectorAll('.carousel-slide'));
        const prevBtn = root.querySelector('[data-prev]');
        const nextBtn = root.querySelector('[data-next]');
        const status = root.querySelector('[data-status]');
        const thumbsHost = document.querySelector('[data-thumbs]');

        if (!viewport || !track || !slides.length) return;

        let index = 0;
        let timer = null;
        let touchStartX = 0;
        let touchDeltaX = 0;

        const thumbs = thumbsHost ? slides.map((slide, i) => {
            const source = slide.querySelector('img');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'thumb-btn';
            btn.setAttribute('aria-label', `Show image ${i + 1}`);
            btn.style.setProperty('--thumb-delay', `${i * 0.18}s`);

            const img = document.createElement('img');
            img.src = source.currentSrc || source.src;
            img.alt = source.alt || `Thumbnail ${i + 1}`;
            img.loading = 'lazy';

            btn.appendChild(img);
            btn.addEventListener('click', () => {
                goTo(i);
                restartAuto();
            });
            thumbsHost.appendChild(btn);
            return btn;
        }) : [];

        function paint() {
            track.style.transform = `translateX(-${index * 100}%)`;
            if (status) status.textContent = `${index + 1} / ${slides.length}`;
            if (thumbs.length) {
                thumbs.forEach((thumb, i) => thumb.classList.toggle('is-active', i === index));
            }
        }

        function goTo(next) {
            index = (next + slides.length) % slides.length;
            paint();
        }

        function next() {
            goTo(index + 1);
        }

        function prev() {
            goTo(index - 1);
        }

        function stopAuto() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        function startAuto() {
            stopAuto();
            timer = setInterval(next, 5200);
        }

        function restartAuto() {
            startAuto();
        }

        prevBtn?.addEventListener('click', () => {
            prev();
            restartAuto();
        });

        nextBtn?.addEventListener('click', () => {
            next();
            restartAuto();
        });

        viewport.addEventListener('mouseenter', stopAuto);
        viewport.addEventListener('mouseleave', startAuto);
        viewport.addEventListener('focusin', stopAuto);
        viewport.addEventListener('focusout', startAuto);

        viewport.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                prev();
                restartAuto();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                next();
                restartAuto();
            }
        });

        viewport.addEventListener('touchstart', (event) => {
            touchStartX = event.changedTouches[0].clientX;
            touchDeltaX = 0;
        }, { passive: true });

        viewport.addEventListener('touchmove', (event) => {
            touchDeltaX = event.changedTouches[0].clientX - touchStartX;
        }, { passive: true });

        viewport.addEventListener('touchend', () => {
            if (Math.abs(touchDeltaX) > 45) {
                if (touchDeltaX < 0) next();
                else prev();
                restartAuto();
            }
            touchStartX = 0;
            touchDeltaX = 0;
        });

        paint();
        startAuto();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCarousel);
    } else {
        initCarousel();
    }
})();
