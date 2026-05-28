(function () {
    const gate = document.getElementById('welcome-gate');
    const startButton = document.getElementById('begin-journey');
    const valuesStep = document.getElementById('home-values');
    const heroStep = document.querySelector('.hero-shell');
    const slides = Array.from(document.querySelectorAll('.intro-slide'));

    if (!gate || !valuesStep || slides.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const body = document.body;
    const root = document.documentElement;
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    const isReloadNavigation = navigationEntry && navigationEntry.type === 'reload';
    let isTweening = false;
    let currentSlideIndex = 0;
    let touchStartY = null;

    if ('scrollRestoration' in history) {
        history.scrollRestoration = isReloadNavigation ? 'manual' : 'auto';
    }

    if (isReloadNavigation && !window.location.hash) {
        window.scrollTo(0, 0);
    }

    if (prefersReducedMotion) {
        body.classList.add('intro-unlocked');
        return;
    }

    body.classList.add('intro-locked');
    body.classList.add('intro-slides-active');

    function clamp(num, min, max) {
        return Math.max(min, Math.min(num, max));
    }

    function easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function setActiveSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('is-active', i === index);
        });
    }

    function getClosestSlideIndex() {
        const currentY = window.scrollY;
        let bestIndex = 0;
        let bestDistance = Number.POSITIVE_INFINITY;

        slides.forEach((slide, i) => {
            const y = slide.offsetTop;
            const distance = Math.abs(currentY - y);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestIndex = i;
            }
        });

        return bestIndex;
    }

    function tweenToY(targetY, duration = 760) {
        const startY = window.scrollY;
        const change = targetY - startY;
        const startTime = performance.now();

        if (Math.abs(change) < 2) {
            window.scrollTo(0, targetY);
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            function step(now) {
                const elapsed = now - startTime;
                const t = clamp(elapsed / duration, 0, 1);
                const eased = easeInOutCubic(t);

                window.scrollTo(0, startY + change * eased);

                if (t < 1) {
                    requestAnimationFrame(step);
                } else {
                    resolve();
                }
            }

            requestAnimationFrame(step);
        });
    }

    async function goToSlide(index) {
        if (isTweening) return;

        const targetIndex = clamp(index, 0, slides.length - 1);
        const targetY = slides[targetIndex].offsetTop;

        isTweening = true;
        currentSlideIndex = targetIndex;
        setActiveSlide(currentSlideIndex);

        await tweenToY(targetY);
        isTweening = false;
    }

    function unlockIntro() {
        if (body.classList.contains('intro-unlocked')) return;

        body.classList.remove('intro-locked');
        body.classList.add('intro-unlocked');
    }

    function dismissGate() {
        body.classList.add('intro-gate-dismissed');
        body.classList.add('intro-post-layout');
    }

    function disableIntroSlides() {
        body.classList.remove('intro-slides-active');
    }

    const hasExternalHash = window.location.hash && window.location.hash !== '#welcome-gate';
    const isLoadedBelowGate = window.scrollY > Math.max(window.innerHeight * 0.25, 180);

    if (hasExternalHash || isLoadedBelowGate) {
        unlockIntro();
        disableIntroSlides();
        dismissGate();
        currentSlideIndex = getClosestSlideIndex();
        setActiveSlide(currentSlideIndex);
    } else {
        setActiveSlide(0);
    }

    if (startButton) {
        startButton.addEventListener('click', async (event) => {
            event.preventDefault();
            unlockIntro();
            disableIntroSlides();
            dismissGate();

            if (heroStep) {
                await tweenToY(heroStep.offsetTop, 700);
            }
        });
    }

    function tryStepSlides(direction) {
        if (!body.classList.contains('intro-slides-active')) return;

        if (body.classList.contains('intro-locked')) {
            unlockIntro();
        }

        const nextIndex = clamp(currentSlideIndex + direction, 0, slides.length - 1);

        if (nextIndex === currentSlideIndex) {
            if (currentSlideIndex === slides.length - 1 && direction > 0) {
                disableIntroSlides();
                dismissGate();
            }
            return;
        }

        goToSlide(nextIndex);
    }

    window.addEventListener('wheel', (event) => {
        if (!body.classList.contains('intro-slides-active')) return;
        if (isTweening) {
            event.preventDefault();
            return;
        }

        const delta = event.deltaY;
        if (Math.abs(delta) < 6) return;

        event.preventDefault();
        tryStepSlides(delta > 0 ? 1 : -1);
    }, { passive: false });

    window.addEventListener('touchstart', (event) => {
        touchStartY = event.changedTouches && event.changedTouches[0]
            ? event.changedTouches[0].clientY
            : null;
    }, { passive: true });

    window.addEventListener('touchmove', (event) => {
        if (touchStartY == null || !body.classList.contains('intro-slides-active')) return;
        if (isTweening) return;

        const currentY = event.changedTouches && event.changedTouches[0]
            ? event.changedTouches[0].clientY
            : touchStartY;

        const delta = touchStartY - currentY;
        if (Math.abs(delta) > 12) {
            tryStepSlides(delta > 0 ? 1 : -1);
            touchStartY = currentY;
        }
    }, { passive: true });

    window.addEventListener('keydown', (event) => {
        if (!body.classList.contains('intro-slides-active')) return;
        if (isTweening) return;

        const key = event.key;
        if (key === 'ArrowDown' || key === 'PageDown' || key === ' ' || key === 'Enter') {
            event.preventDefault();
            tryStepSlides(1);
        }

        if (key === 'ArrowUp' || key === 'PageUp') {
            event.preventDefault();
            tryStepSlides(-1);
        }
    });

    window.addEventListener('scroll', () => {
        if (isTweening || !body.classList.contains('intro-slides-active')) return;

        currentSlideIndex = getClosestSlideIndex();
        setActiveSlide(currentSlideIndex);

        const lastSlideBottom = slides[slides.length - 1].offsetTop + slides[slides.length - 1].offsetHeight;
        if (window.scrollY > lastSlideBottom - Math.max(window.innerHeight * 0.7, 320)) {
            disableIntroSlides();
            dismissGate();
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        root.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    });

    root.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
})();

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

    function clamp(num, min, max) {
        return Math.max(min, Math.min(num, max));
    }

    function onScroll() {
        const heroRect = heroShell.getBoundingClientRect();
        const heroH = heroShell.offsetHeight;
        const distancePastTop = Math.max(0, -heroRect.top);
        const t = clamp(distancePastTop / (heroH * 0.6), 0, 1);
        heroContent.style.opacity   = String(1 - t * 0.88);
        heroContent.style.transform = `translateY(${t * -22}px)`;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();
