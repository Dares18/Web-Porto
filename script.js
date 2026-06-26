// ========== INTRO SPLASH ANIMATION ORCHESTRATOR ==========
// Force scroll to top on every page load / refresh / reopen
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

(function runSplashAnimation() {
    const splash = document.getElementById('intro-splash');
    if (!splash) return;

    const logo = splash.querySelector('.splash-logo');
    const textLines = splash.querySelectorAll('.splash-text');
    const marqueeLines = splash.querySelectorAll('.splash-marquee');

    // Utility: wait ms
    const wait = ms => new Promise(r => setTimeout(r, ms));

    // Utility: show a line with clip-path reveal
    function showLine(el) {
        el.classList.remove('fade-out');
        el.style.display = '';
        // Force reflow so transition fires
        void el.offsetWidth;
        el.classList.add('visible');
    }

    // Utility: fade out a line
    function hideLine(el) {
        el.classList.remove('visible');
        el.classList.add('fade-out');
    }

    async function animate() {
        // Hide all lines initially
        splash.querySelectorAll('.splash-line').forEach(l => {
            l.style.display = 'none';
        });

        // Phase 1: Logo appears (0s)
        await wait(300);
        logo.style.display = '';
        showLine(logo);

        // Phase 2: Spotlight text from About Me (cycle one at a time)
        await wait(800);

        for (let i = 0; i < textLines.length; i++) {
            // Hide previous text line
            if (i > 0) hideLine(textLines[i - 1]);
            await wait(i > 0 ? 300 : 0);
            showLine(textLines[i]);
            await wait(600);
        }

        // Phase 3: Marquee text (cycle one at a time, replacing spotlight)
        hideLine(textLines[textLines.length - 1]);
        await wait(300);

        for (let i = 0; i < marqueeLines.length; i++) {
            if (i > 0) hideLine(marqueeLines[i - 1]);
            await wait(i > 0 ? 300 : 0);
            showLine(marqueeLines[i]);
            await wait(550);
        }

        // Phase 4: Exit - fade everything, then curtain split
        await wait(300);
        splash.classList.add('exit');

        // Wait for curtain animation to complete
        await wait(900);

        // Cleanup
        splash.classList.add('done');
        document.body.classList.remove('splash-active');
    }

    // Start animation once fonts + icons are somewhat ready
    if (document.readyState === 'complete') {
        animate();
    } else {
        window.addEventListener('load', () => {
            // Small extra delay so Phosphor Icons have rendered
            setTimeout(animate, 150);
        });
    }
})();
// ========== END INTRO SPLASH ==========

// Live Clock functionality
function updateClock() {
    const clockElement = document.getElementById('live-clock');
    if (!clockElement) return;
    
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateClock, 1000);
updateClock(); // Initial call

// Theme Toggle functionality
const themeBtn = document.getElementById('theme-toggle');
const themeIcon = themeBtn.querySelector('i');

// Check local storage for theme preference
const currentTheme = localStorage.getItem('theme') || 'dark';

if (currentTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    themeIcon.classList.replace('ph-moon', 'ph-sun');
    if (themeBtn && themeBtn.parentElement) themeBtn.parentElement.setAttribute('data-tooltip', 'Dark Mode');
} else {
    if (themeBtn && themeBtn.parentElement) themeBtn.parentElement.setAttribute('data-tooltip', 'Light Mode');
}

themeBtn.addEventListener('click', () => {
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        themeIcon.classList.replace('ph-moon', 'ph-sun');
        localStorage.setItem('theme', 'light');
        if (themeBtn.parentElement) themeBtn.parentElement.setAttribute('data-tooltip', 'Dark Mode');
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        themeIcon.classList.replace('ph-sun', 'ph-moon');
        localStorage.setItem('theme', 'dark');
        if (themeBtn.parentElement) themeBtn.parentElement.setAttribute('data-tooltip', 'Light Mode');
    }
    themeBtn.blur();
});

// Force blur on any clicked dock item so tooltip disappears immediately after click
document.querySelectorAll('.dock-link').forEach(link => {
    link.addEventListener('click', () => link.blur());
});

// Header Scroll Animation (Glides logo to top-left when scrolling)
const header = document.querySelector('.header');
if (header) {
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 40) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// Scroll animation for elements (Optimized for Mobile/High Refresh Rate GPUs)
const observerOptions = {
    root: null,
    rootMargin: '0px 0px 60px 0px',
    threshold: 0.01
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translate3d(0, 0, 0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.section-title, .about-text, .about-image-card, .education-card, .timeline-item, .project-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translate3d(0, 24px, 0)';
    el.style.willChange = 'opacity, transform';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
});

// Direct CV Download handler (handles both live fetch online and local file:// fallback)
const cvDownloadLink = document.querySelector('a[download="CV Daffa ATS.pdf"]');
if (cvDownloadLink) {
    cvDownloadLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const fileName = 'CV Daffa ATS.pdf';
        const fileUrl = cvDownloadLink.getAttribute('href');

        try {
            // Fetch dynamically when hosted on HTTP/HTTPS server
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error('Fetch failed');
            const blob = await response.blob();
            
            // Force application/octet-stream to prevent inline preview in browser
            const forceDownloadBlob = new Blob([blob], { type: 'application/octet-stream' });
            const blobUrl = URL.createObjectURL(forceDownloadBlob);
            
            const tempLink = document.createElement('a');
            tempLink.href = blobUrl;
            tempLink.download = fileName;
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            // Fallback for local file:/// protocol where fetch API is restricted
            if (typeof cvBase64Data !== 'undefined') {
                const tempLink = document.createElement('a');
                tempLink.href = cvBase64Data;
                tempLink.download = fileName;
                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);
            } else {
                window.location.href = fileUrl;
            }
        }
    });
}

// Project Modals Gallery Interaction Handler
const projectCardSdm = document.getElementById('project-sdm-apu');
const modalSdm = document.getElementById('modal-sdm-apu');

const projectCardLpmi = document.getElementById('project-lpmi-apu');
const modalLpmi = document.getElementById('modal-lpmi-apu');

const allGalleryModals = document.querySelectorAll('.gallery-modal');
const allCloseModalBtns = document.querySelectorAll('.close-gallery-modal');

function openGalleryModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAllGalleryModals() {
    allGalleryModals.forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
}

if (projectCardSdm && modalSdm) {
    projectCardSdm.addEventListener('click', () => openGalleryModal(modalSdm));
}

if (projectCardLpmi && modalLpmi) {
    projectCardLpmi.addEventListener('click', () => openGalleryModal(modalLpmi));
}

allCloseModalBtns.forEach(btn => {
    btn.addEventListener('click', closeAllGalleryModals);
});

allGalleryModals.forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeAllGalleryModals();
        }
    });
});

// --- Lightbox Fullscreen Preview System ---
const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCounter = document.getElementById('lightbox-counter');
const lightboxDesc = document.getElementById('lightbox-desc');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');
const allGalleryCells = document.querySelectorAll('.gallery-cell');

let currentActiveCells = [];
let currentGalleryIndex = 0;

function showLightboxImage(index) {
    if (!currentActiveCells.length || !lightboxModal) return;
    currentGalleryIndex = (index + currentActiveCells.length) % currentActiveCells.length;
    const cell = currentActiveCells[currentGalleryIndex];
    const imgEl = cell.querySelector('img');
    const caption = cell.getAttribute('data-caption') || '';

    if (imgEl && lightboxImg) {
        lightboxImg.src = imgEl.src;
    }
    if (lightboxCounter) {
        lightboxCounter.textContent = `${currentGalleryIndex + 1} / ${currentActiveCells.length}`;
    }
    if (lightboxDesc) {
        lightboxDesc.textContent = caption;
    }
}

allGalleryCells.forEach((cell) => {
    cell.addEventListener('click', () => {
        if (!lightboxModal) return;
        const parentModal = cell.closest('.gallery-modal');
        if (!parentModal) return;
        currentActiveCells = Array.from(parentModal.querySelectorAll('.gallery-cell'));
        currentGalleryIndex = currentActiveCells.indexOf(cell);
        showLightboxImage(currentGalleryIndex);
        lightboxModal.classList.add('active');
    });
});

if (lightboxClose && lightboxModal) {
    lightboxClose.addEventListener('click', () => {
        lightboxModal.classList.remove('active');
    });
}

if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        showLightboxImage(currentGalleryIndex - 1);
    });
}

if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        showLightboxImage(currentGalleryIndex + 1);
    });
}

if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            lightboxModal.classList.remove('active');
        }
    });
}

// Unified Keyboard Navigation (Lightbox & Modals)
window.addEventListener('keydown', (e) => {
    if (!lightboxModal) return;

    if (lightboxModal.classList.contains('active')) {
        if (e.key === 'Escape') {
            lightboxModal.classList.remove('active');
        } else if (e.key === 'ArrowLeft') {
            showLightboxImage(currentGalleryIndex - 1);
        } else if (e.key === 'ArrowRight') {
            showLightboxImage(currentGalleryIndex + 1);
        }
    } else {
        const activeModal = document.querySelector('.gallery-modal.active');
        if (activeModal && e.key === 'Escape') {
            closeAllGalleryModals();
        }
    }
});
