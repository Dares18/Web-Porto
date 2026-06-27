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

    // ========== AUDIO ENGINE — CINEMATIC SOUND EFFECTS ==========
    let audioCtx = null;
    let sfxEnabled = false;
    let masterGain = null;

    const sfxUrls = {
        bgm: 'Assets/SoundEffects/cinematic-percussion-kick.mp3',
        whoosh: 'Assets/SoundEffects/whoosh-cinematic.mp3',
        bass: 'Assets/SoundEffects/distortion-bass-brvhrtz.mp3',
        boom: 'Assets/SoundEffects/cinematic-boom.mp3'
    };

    const sfxRawBuffers = {};
    const sfxBuffers = {};
    let bgmSource = null;
    let bgmGainNode = null;

    // Immediately start downloading audio files into memory
    Object.entries(sfxUrls).forEach(([key, url]) => {
        fetch(url)
            .then(res => res.arrayBuffer())
            .then(buf => { sfxRawBuffers[key] = buf; })
            .catch(err => console.error("Error fetching sfx:", key, err));
    });

    function initAudio() {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            masterGain = audioCtx.createGain();
            masterGain.gain.setValueAtTime(0.95, audioCtx.currentTime);
            masterGain.connect(audioCtx.destination);
            sfxEnabled = true;
        } catch (e) {
            sfxEnabled = false;
        }
    }

    function getMaster() {
        return masterGain || (audioCtx ? audioCtx.destination : null);
    }

    async function decodeAudio(key) {
        if (!audioCtx || !sfxEnabled) return null;
        if (sfxBuffers[key]) return sfxBuffers[key];
        try {
            let rawBuf = sfxRawBuffers[key];
            if (!rawBuf) {
                const res = await fetch(sfxUrls[key]);
                rawBuf = await res.arrayBuffer();
            }
            if (rawBuf) {
                sfxBuffers[key] = await audioCtx.decodeAudioData(rawBuf.slice(0));
                return sfxBuffers[key];
            }
        } catch (e) {
            console.error("Failed decoding sfx:", key, e);
        }
        return null;
    }

    function playSfx(key, volume = 1.0) {
        if (!sfxEnabled || !audioCtx) return;
        const buf = sfxBuffers[key];
        if (buf) {
            playBuffer(buf, volume);
        } else {
            decodeAudio(key).then(decoded => {
                if (decoded) playBuffer(decoded, volume);
            });
        }
    }

    function playBuffer(buf, volume = 1.0) {
        if (!audioCtx || audioCtx.state === 'closed') return null;
        try {
            const source = audioCtx.createBufferSource();
            source.buffer = buf;
            const gainNode = audioCtx.createGain();
            gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
            source.connect(gainNode).connect(getMaster());
            source.start(0);
            return source;
        } catch (e) {
            return null;
        }
    }

    function startCinematicBGM() {
        if (!sfxEnabled || !audioCtx) return;
        const buf = sfxBuffers['bgm'];
        if (!buf) {
            decodeAudio('bgm').then(() => startCinematicBGM());
            return;
        }
        try {
            bgmSource = audioCtx.createBufferSource();
            bgmSource.buffer = buf;
            bgmSource.loop = true;
            bgmGainNode = audioCtx.createGain();
            bgmGainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
            bgmGainNode.gain.linearRampToValueAtTime(0.85, audioCtx.currentTime + 1.2);
            bgmSource.connect(bgmGainNode).connect(getMaster());
            bgmSource.start(0);
        } catch (e) {}
    }

    function transitionBGMToPortfolio() {
        if (!audioCtx || !bgmGainNode) return;
        const now = audioCtx.currentTime;
        try {
            bgmGainNode.gain.setValueAtTime(bgmGainNode.gain.value, now);
            bgmGainNode.gain.exponentialRampToValueAtTime(0.05, now + 1.2);
            bgmGainNode.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
            if (bgmSource) {
                setTimeout(() => {
                    try { bgmSource.stop(); } catch (e) {}
                }, 3100);
            }
        } catch (e) {}
    }

    // ═══════════════════════════════════════════════════════════════════
    // KINETIC TIMELINE ORCHESTRATOR — Blockbuster Movie Trailer Sequence
    // ═══════════════════════════════════════════════════════════════════
    async function animate() {
        const words = Array.from(splash.querySelectorAll('.kinetic-word'));
        words.forEach(w => w.classList.remove('k-active', 'k-out'));

        startCinematicBGM();
        await wait(300);

        // Act 1: "IN A DIGITAL WORLD..."
        if (words[0]) {
            words[0].classList.add('k-active');
            playSfx('whoosh', 0.9);
            await wait(650);
            words[0].classList.add('k-out');
            await wait(150);
        }

        // Act 2: "WHERE DETAILS MATTER..."
        if (words[1]) {
            words[1].classList.add('k-active');
            playSfx('whoosh', 0.9);
            await wait(650);
            words[1].classList.add('k-out');
            await wait(150);
        }

        // Act 3: "MEET THE CREATOR."
        if (words[2]) {
            words[2].classList.add('k-active');
            playSfx('bass', 1.0);
            await wait(750);
            words[2].classList.add('k-out');
            await wait(180);
        }

        // Act 4: "DAFFA RESTU FADHILLAH"
        if (words[3]) {
            splash.classList.add('kinetic-inverted');
            words[3].classList.add('k-active');
            playSfx('boom', 1.0);
            playSfx('bass', 0.6);
            await wait(900);
            splash.classList.remove('kinetic-inverted');
            words[3].classList.add('k-out');
            await wait(180);
        }

        // Act 5: "FRONT-END DEVELOPER"
        if (words[4]) {
            words[4].classList.add('k-active');
            playSfx('whoosh', 0.9);
            await wait(600);
            words[4].classList.add('k-out');
            await wait(120);
        }

        // Act 6: "& UI/UX DESIGNER"
        if (words[5]) {
            words[5].classList.add('k-active');
            playSfx('whoosh', 0.9);
            await wait(600);
            words[5].classList.add('k-out');
            await wait(150);
        }

        // Act 7: "UDINUS • GPA 3.45"
        if (words[6]) {
            words[6].classList.add('k-active');
            playSfx('bass', 0.8);
            await wait(650);
            words[6].classList.add('k-out');
            await wait(120);
        }

        // Act 8: "PUPR & APU EXPERIENCED"
        if (words[7]) {
            words[7].classList.add('k-active');
            playSfx('whoosh', 0.9);
            await wait(650);
            words[7].classList.add('k-out');
            await wait(120);
        }

        // Act 9: "HR & QA WEB SYSTEMS"
        if (words[8]) {
            words[8].classList.add('k-active');
            playSfx('bass', 0.9);
            await wait(700);
            words[8].classList.add('k-out');
            await wait(150);
        }

        // Act 10: "SMOOTH. RESPONSIVE."
        if (words[9]) {
            words[9].classList.add('k-active');
            playSfx('whoosh', 1.0);
            await wait(650);
            words[9].classList.add('k-out');
            await wait(200);
        }

        // Act 11: "WELCOME."
        if (words[10]) {
            words[10].classList.add('k-active');
            playSfx('boom', 1.0);
            playSfx('bass', 1.0);
            await wait(750);
            words[10].classList.add('k-out');
        }

        transitionBGMToPortfolio();

        // 💥 MEGA BOOM DROP! Open curtains AND trigger cinematic entrance of web content!
        splash.classList.add('exit');
        document.body.classList.remove('splash-active');

        await wait(1100);
        splash.classList.add('done');

        if (audioCtx && audioCtx.state !== 'closed') {
            setTimeout(() => {
                audioCtx.close().catch(() => { });
            }, 3500);
        }
    }

    // Wait for user click/tap to start animation (guarantees AudioContext unlock)
    function waitForUserGesture() {
        const enterPrompt = document.getElementById('splash-enter');

        async function onUserGesture() {
            // Remove listener to prevent double-fires
            splash.removeEventListener('click', onUserGesture);
            splash.removeEventListener('touchstart', onUserGesture);

            // Force browser into fullscreen mode on initial tap/click
            try {
                const elem = document.documentElement;
                if (elem.requestFullscreen) {
                    elem.requestFullscreen().catch(() => {});
                } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                } else if (elem.msRequestFullscreen) {
                    elem.msRequestFullscreen();
                }
            } catch (e) {}

            // Init audio inside user gesture — browser guarantees it will be "running"
            initAudio();

            // Hide the enter prompt
            if (enterPrompt) enterPrompt.classList.add('hidden');

            // Decode all audio buffers before starting animation
            await Promise.all(Object.keys(sfxUrls).map(k => decodeAudio(k)));

            // Start animation after prompt fully fades out
            setTimeout(animate, 500);
        }

        splash.addEventListener('click', onUserGesture);
        splash.addEventListener('touchstart', onUserGesture, { passive: true });
    }

    // Start waiting for user gesture once fonts + icons are ready
    if (document.readyState === 'complete') {
        waitForUserGesture();
    } else {
        window.addEventListener('load', () => {
            // Small extra delay so Phosphor Icons have rendered
            setTimeout(waitForUserGesture, 150);
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
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    // Icon stays as ph-moon (default in HTML), correct for dark mode
    if (themeBtn && themeBtn.parentElement) themeBtn.parentElement.setAttribute('data-tooltip', 'Light Mode');
} else {
    // Light mode is default — swap icon to ph-sun
    themeIcon.classList.replace('ph-moon', 'ph-sun');
    if (themeBtn && themeBtn.parentElement) themeBtn.parentElement.setAttribute('data-tooltip', 'Dark Mode');
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

// ========== FIDGET SPINNER — Infinity Logo Physics Engine ==========
(function initFidgetSpinner() {
    const logoContainer = document.querySelector('.logo');
    const logoGlass = document.querySelector('.logo-glass');
    if (!logoContainer || !logoGlass) return;
    const iconEl = logoGlass.querySelector('i');
    if (!iconEl) return;

    // Physics state
    let angle = 0;           // Current rotation angle in degrees
    let velocity = 0;        // Angular velocity in degrees/frame (~60fps)
    let isSpinning = false;  // Is the animation loop running?
    const friction = 0.985;  // Deceleration factor per frame (closer to 1 = longer spin)
    const minVelocity = 0.15; // Stop threshold
    const baseSpinForce = 25; // Base degrees/frame impulse per click
    const maxVelocity = 120;  // Cap to prevent insane speeds

    // Particle system for sparks
    function emitSparks(count) {
        const rect = logoGlass.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const radius = Math.max(rect.width, rect.height) / 2;

        for (let i = 0; i < count; i++) {
            const spark = document.createElement('div');
            spark.className = 'fidget-spark';

            // Random angle direction for particle
            const sparkAngle = Math.random() * Math.PI * 2;
            const distance = radius + 10 + Math.random() * 40;
            const x = cx + Math.cos(sparkAngle) * radius;
            const y = cy + Math.sin(sparkAngle) * radius;
            const tx = Math.cos(sparkAngle) * distance;
            const ty = Math.sin(sparkAngle) * distance;
            const size = 2 + Math.random() * 4;

            spark.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 10001;
                background: var(--accent-color, #00e0ff);
                box-shadow: 0 0 6px var(--accent-glow, #00e0ff88);
                opacity: 1;
                transition: all ${0.4 + Math.random() * 0.5}s cubic-bezier(0.16, 1, 0.3, 1);
            `;

            document.body.appendChild(spark);

            // Trigger animation next frame
            requestAnimationFrame(() => {
                spark.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
                spark.style.opacity = '0';
            });

            // Cleanup
            setTimeout(() => spark.remove(), 1000);
        }
    }

    // Sound effect for spin
    function sfxSpin(force) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const now = ctx.currentTime;

            // Whoosh oscillator
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(200 + force * 10, now);
            osc.frequency.exponentialRampToValueAtTime(800 + force * 20, now + 0.1);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(600, now);
            filter.Q.setValueAtTime(3, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

            osc.connect(filter).connect(gain).connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.4);

            // Click/mechanical sound
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(1200, now);
            osc2.frequency.exponentialRampToValueAtTime(300, now + 0.05);
            gain2.gain.setValueAtTime(0.08, now);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc2.connect(gain2).connect(ctx.destination);
            osc2.start(now);
            osc2.stop(now + 0.08);

            setTimeout(() => ctx.close().catch(() => { }), 500);
        } catch (e) { /* Audio not available, silently continue */ }
    }

    // Main animation loop
    function spinLoop() {
        if (!isSpinning) return;

        // Apply friction
        velocity *= friction;

        // Higher friction at very low speeds for natural stop
        if (Math.abs(velocity) < 5) {
            velocity *= 0.97;
        }

        // Update angle
        angle += velocity;
        angle %= 360;

        // Apply rotation transform
        iconEl.style.transform = `rotate(${angle}deg)`;

        // Dynamic glow intensity based on speed
        const speedRatio = Math.min(Math.abs(velocity) / 60, 1);
        const glowSize = 15 + speedRatio * 35;
        logoGlass.style.filter = `drop-shadow(0 0 ${glowSize}px var(--accent-glow))`;

        // Check if we should stop
        if (Math.abs(velocity) < minVelocity) {
            velocity = 0;
            isSpinning = false;
            logoGlass.classList.remove('spinning');
            // Smoothly return glow to default
            logoGlass.style.filter = '';
            return;
        }

        requestAnimationFrame(spinLoop);
    }

    // Click/Touch handler — flick the spinner
    function onFlick(e) {
        e.preventDefault();
        e.stopPropagation();

        // Random direction for fun, but if already spinning, keep direction
        let direction;
        if (Math.abs(velocity) > 1) {
            direction = velocity > 0 ? 1 : -1;
        } else {
            direction = Math.random() > 0.5 ? 1 : -1;
        }

        // Add force — randomized for natural feel
        const force = baseSpinForce + Math.random() * 20;
        velocity += direction * force;

        // Clamp velocity
        if (velocity > maxVelocity) velocity = maxVelocity;
        if (velocity < -maxVelocity) velocity = -maxVelocity;

        // Emit sparks proportional to force
        const sparkCount = Math.floor(6 + Math.abs(velocity) / 8);
        emitSparks(sparkCount);

        // Play sound
        sfxSpin(Math.abs(velocity));

        // Start loop if not already running
        logoGlass.classList.add('spinning');
        if (!isSpinning) {
            isSpinning = true;
            requestAnimationFrame(spinLoop);
        }
    }

    // Bind events to logo container
    logoContainer.addEventListener('click', onFlick);
    logoContainer.addEventListener('touchstart', onFlick, { passive: false });
})();
// ========== END FIDGET SPINNER ==========

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
            setTimeout(() => {
                entry.target.style.willChange = 'auto';
            }, 650);
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

const projectCardDynasty = document.getElementById('project-dynasty-war');
const modalDynasty = document.getElementById('modal-dynasty-war');

const allGalleryModals = document.querySelectorAll('.gallery-modal');
const allCloseModalBtns = document.querySelectorAll('.close-gallery-modal');

function openGalleryModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAllGalleryModals() {
    let wasActive = false;
    allGalleryModals.forEach(m => {
        if (m.classList.contains('active')) {
            m.classList.remove('active');
            wasActive = true;
        }
    });
    if (wasActive) {
        document.body.style.overflow = '';
    }
}

if (projectCardSdm && modalSdm) {
    const attachSdmClick = (el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openGalleryModal(modalSdm);
        });
    };
    attachSdmClick(projectCardSdm);
    projectCardSdm.querySelectorAll('.action-pill, .project-thumb-box, .project-img-overlay, .project-heading').forEach(attachSdmClick);
}

if (projectCardLpmi && modalLpmi) {
    const attachLpmiClick = (el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openGalleryModal(modalLpmi);
        });
    };
    attachLpmiClick(projectCardLpmi);
    projectCardLpmi.querySelectorAll('.action-pill, .project-thumb-box, .project-img-overlay, .project-heading').forEach(attachLpmiClick);
}

if (projectCardDynasty && modalDynasty) {
    const attachDynastyClick = (el) => {
        el.addEventListener('click', (e) => {
            if (e.target.closest('.play-game-launcher')) return;
            e.preventDefault();
            e.stopPropagation();
            openGalleryModal(modalDynasty);
        });
    };
    attachDynastyClick(projectCardDynasty);
    projectCardDynasty.querySelectorAll('.action-pill, .project-thumb-box, .project-img-overlay, .project-heading').forEach(attachDynastyClick);
}

allCloseModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeAllGalleryModals();
    });
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

// Fullscreen Toggle functionality
const fsBtn = document.getElementById('fullscreen-toggle');
if (fsBtn) {
    function updateFullscreenIcon() {
        const icon = fsBtn.querySelector('i');
        if (!icon) return;
        if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            icon.className = 'ph ph-corners-in';
            fsBtn.parentElement.setAttribute('data-tooltip', 'Exit Fullscreen');
        } else {
            icon.className = 'ph ph-corners-out';
            fsBtn.parentElement.setAttribute('data-tooltip', 'Toggle Fullscreen');
        }
    }

    fsBtn.addEventListener('click', () => {
        const elem = document.documentElement;
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(() => {});
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    });

    document.addEventListener('fullscreenchange', updateFullscreenIcon);
    document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);
    document.addEventListener('msfullscreenchange', updateFullscreenIcon);
}

// --- Dynasty of War C++ Engine Web Simulator ---
const modalSimulator = document.getElementById('modal-dynasty-simulator');
const closeGameBtns = document.querySelectorAll('.close-game-modal');

let dynastyGameState = {
    player: { class: 'Knight', hp: 10, maxHp: 10, atk: 3, def: 2 },
    comp: { class: 'Ogre', hp: 10, maxHp: 10, atk: 3, def: 2 },
    isOver: false
};

function showDynastyScreen(screenId) {
    if (!modalSimulator) return;
    modalSimulator.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
}

function dynastyLog(text, type = 'sys') {
    const logBox = document.getElementById('game-terminal-log');
    if (!logBox) return;
    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    line.textContent = text;
    logBox.appendChild(line);
    logBox.scrollTop = logBox.scrollHeight;
}

function updateDynastyHUD() {
    const pName = document.getElementById('hud-player-name');
    const pHpText = document.getElementById('hud-player-hp-text');
    const pAtk = document.getElementById('hud-player-atk');
    const pDef = document.getElementById('hud-player-def');
    const pHpBar = document.getElementById('hud-player-hp-bar');

    if (pName) pName.textContent = `Player (${dynastyGameState.player.class})`;
    if (pHpText) pHpText.textContent = `${Math.max(0, dynastyGameState.player.hp)} / ${dynastyGameState.player.maxHp}`;
    if (pAtk) pAtk.textContent = dynastyGameState.player.atk;
    if (pDef) pDef.textContent = dynastyGameState.player.def;
    if (pHpBar) {
        const pPct = Math.max(0, Math.min(100, (dynastyGameState.player.hp / dynastyGameState.player.maxHp) * 100));
        pHpBar.style.width = `${pPct}%`;
    }

    const cName = document.getElementById('hud-comp-name');
    const cHpText = document.getElementById('hud-comp-hp-text');
    const cAtk = document.getElementById('hud-comp-atk');
    const cDef = document.getElementById('hud-comp-def');
    const cHpBar = document.getElementById('hud-comp-hp-bar');

    if (cName) cName.textContent = `Computer (${dynastyGameState.comp.class})`;
    if (cHpText) cHpText.textContent = `${Math.max(0, dynastyGameState.comp.hp)} / ${dynastyGameState.comp.maxHp}`;
    if (cAtk) cAtk.textContent = dynastyGameState.comp.atk;
    if (cDef) cDef.textContent = dynastyGameState.comp.def;
    if (cHpBar) {
        const cPct = Math.max(0, Math.min(100, (dynastyGameState.comp.hp / dynastyGameState.comp.maxHp) * 100));
        cHpBar.style.width = `${cPct}%`;
    }
}

function resetDynastySimulator() {
    dynastyGameState.isOver = false;
    showDynastyScreen('game-screen-select');
}

// Attach Launcher Buttons
document.querySelectorAll('.play-game-launcher').forEach(launcher => {
    launcher.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof closeAllGalleryModals === 'function') closeAllGalleryModals();
        if (modalSimulator) {
            modalSimulator.classList.add('active');
            document.body.style.overflow = 'hidden';
            resetDynastySimulator();
        }
    });
});

if (modalSimulator) {
    modalSimulator.addEventListener('click', (e) => {
        if (e.target === modalSimulator) {
            modalSimulator.classList.remove('active');
            const modDynasty = document.getElementById('modal-dynasty-war');
            if (modDynasty && typeof openGalleryModal === 'function') openGalleryModal(modDynasty);
        }
    });

    closeGameBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            modalSimulator.classList.remove('active');
            const modDynasty = document.getElementById('modal-dynasty-war');
            if (modDynasty && typeof openGalleryModal === 'function') openGalleryModal(modDynasty);
        });
    });
}

// Attach Class Selection
document.querySelectorAll('#modal-dynasty-simulator .class-card').forEach(card => {
    card.addEventListener('click', () => {
        const selectedClass = card.getAttribute('data-class');
        const classes = ['Ogre', 'Knight', 'Mage', 'Swordsman'];
        const remaining = classes.filter(c => c !== selectedClass);
        const compClass = remaining[Math.floor(Math.random() * remaining.length)];

        dynastyGameState.player = { class: selectedClass, hp: 10, maxHp: 10, atk: 3, def: 2 };
        dynastyGameState.comp = { class: compClass, hp: 10, maxHp: 10, atk: 3, def: 2 };

        const logBox = document.getElementById('game-terminal-log');
        if (logBox) logBox.innerHTML = '';

        dynastyLog(`[SYSTEM] Match Started: You (${selectedClass}) VS Computer (${compClass})`, 'sys');
        dynastyLog(`[SYSTEM] Both fighters initialized: 10 HP, 3 ATK, 2 DEF.`, 'sys');

        updateDynastyHUD();
        showDynastyScreen('game-screen-battle');
    });
});

// Execute Combat Turn (reproducing exact main.cpp logic)
function executeDynastyTurn(pAction, cAction) {
    const actionNames = { 1: "Serang (Attack)", 2: "Defend", 3: "Attack Up", 4: "Defense Up", 5: "Heal" };
    dynastyLog(`-----------------------------------------`, 'sys');
    dynastyLog(`[YOU] chose: ${actionNames[pAction]}`, 'player');
    dynastyLog(`[COMP] chose: ${actionNames[cAction]}`, 'comp');

    const doPlayerAtkUp = () => {
        const rand = Math.floor(Math.random() * 3) + 1;
        dynastyGameState.player.atk += rand;
        dynastyLog(`[YOU] Attack Up! ATK increased by +${rand} (Now: ${dynastyGameState.player.atk})`, 'player');
    };
    const doPlayerDefUp = () => {
        const rand = Math.floor(Math.random() * 3) + 1;
        dynastyGameState.player.def += rand;
        dynastyLog(`[YOU] Defense Up! DEF increased by +${rand} (Now: ${dynastyGameState.player.def})`, 'player');
    };
    const doPlayerHeal = () => {
        const missing = dynastyGameState.player.maxHp - dynastyGameState.player.hp + 1;
        const rand = Math.floor(Math.random() * missing) + 1;
        dynastyGameState.player.hp += rand;
        dynastyLog(`[YOU] Heals! HP restored by +${rand} (Now: ${dynastyGameState.player.hp})`, 'player');
    };

    const doCompAtkUp = () => {
        const rand = Math.floor(Math.random() * 3) + 1;
        dynastyGameState.comp.atk += rand;
        dynastyLog(`[COMP] Attack Up! ATK increased by +${rand} (Now: ${dynastyGameState.comp.atk})`, 'comp');
    };
    const doCompDefUp = () => {
        const rand = Math.floor(Math.random() * 3) + 1;
        dynastyGameState.comp.def += rand;
        dynastyLog(`[COMP] Defense Up! DEF increased by +${rand} (Now: ${dynastyGameState.comp.def})`, 'comp');
    };
    const doCompHeal = () => {
        const missing = dynastyGameState.comp.maxHp - dynastyGameState.comp.hp + 1;
        const rand = Math.floor(Math.random() * missing) + 1;
        dynastyGameState.comp.hp += rand;
        dynastyLog(`[COMP] Heals! HP restored by +${rand} (Now: ${dynastyGameState.comp.hp})`, 'comp');
    };

    if (pAction === 1) { // Player Attack
        if (cAction === 1) {
            dynastyLog(`[YOU] Attack! Dealt ${dynastyGameState.player.atk} DMG to Computer!`, 'player');
            dynastyGameState.comp.hp -= dynastyGameState.player.atk;
            if (dynastyGameState.comp.hp > 0) {
                dynastyLog(`[COMP] Attacks back! Dealt ${dynastyGameState.comp.atk} DMG to You!`, 'comp');
                dynastyGameState.player.hp -= dynastyGameState.comp.atk;
            }
        } else if (cAction === 2) {
            dynastyLog(`[COMP] Defended against your attack!`, 'comp');
            if (dynastyGameState.player.atk <= dynastyGameState.comp.def) {
                dynastyLog(`[COMP] Defense (${dynastyGameState.comp.def}) blocked your Attack (${dynastyGameState.player.atk}) completely!`, 'comp');
            } else {
                const dmg = dynastyGameState.player.atk - dynastyGameState.comp.def;
                dynastyGameState.comp.hp -= dmg;
                dynastyLog(`[YOU] Dealt pierce damage of ${dmg} through Computer defense!`, 'player');
            }
        } else if (cAction === 3) {
            dynastyLog(`[YOU] Attack! Dealt ${dynastyGameState.player.atk} DMG to Computer!`, 'player');
            dynastyGameState.comp.hp -= dynastyGameState.player.atk;
            if (dynastyGameState.comp.hp > 0) doCompAtkUp();
        } else if (cAction === 4) {
            dynastyLog(`[YOU] Attack! Dealt ${dynastyGameState.player.atk} DMG to Computer!`, 'player');
            dynastyGameState.comp.hp -= dynastyGameState.player.atk;
            if (dynastyGameState.comp.hp > 0) doCompDefUp();
        } else if (cAction === 5) {
            dynastyLog(`[YOU] Attack! Dealt ${dynastyGameState.player.atk} DMG to Computer!`, 'player');
            dynastyGameState.comp.hp -= dynastyGameState.player.atk;
            if (dynastyGameState.comp.hp > 0) doCompHeal();
        }
    } else if (pAction === 2) { // Player Defend
        if (cAction === 1) {
            dynastyLog(`[YOU] Defended against Computer attack!`, 'player');
            if (dynastyGameState.comp.atk <= dynastyGameState.player.def) {
                dynastyLog(`[YOU] Defense (${dynastyGameState.player.def}) blocked Computer Attack (${dynastyGameState.comp.atk}) completely!`, 'player');
            } else {
                const dmg = dynastyGameState.comp.atk - dynastyGameState.player.def;
                dynastyGameState.player.hp -= dmg;
                dynastyLog(`[COMP] Dealt pierce damage of ${dmg} through your defense!`, 'comp');
            }
        } else if (cAction === 2) {
            dynastyLog(`[SYSTEM] Both fighters chose Defend! Nothing happens...`, 'sys');
        } else if (cAction === 3) {
            dynastyLog(`[YOU] Defends defensively!`, 'player');
            doCompAtkUp();
        } else if (cAction === 4) {
            dynastyLog(`[YOU] Defends defensively!`, 'player');
            doCompDefUp();
        } else if (cAction === 5) {
            dynastyLog(`[YOU] Defends defensively!`, 'player');
            doCompHeal();
        }
    } else if (pAction === 3) { // Player Atk Up
        doPlayerAtkUp();
        if (cAction === 1) {
            dynastyLog(`[COMP] Attacks! Dealt ${dynastyGameState.comp.atk} DMG to You!`, 'comp');
            dynastyGameState.player.hp -= dynastyGameState.comp.atk;
        } else if (cAction === 2) dynastyLog(`[COMP] Defends defensively!`, 'comp');
        else if (cAction === 3) doCompAtkUp();
        else if (cAction === 4) doCompDefUp();
        else if (cAction === 5) doCompHeal();
    } else if (pAction === 4) { // Player Def Up
        doPlayerDefUp();
        if (cAction === 1) {
            dynastyLog(`[COMP] Attacks! Dealt ${dynastyGameState.comp.atk} DMG to You!`, 'comp');
            dynastyGameState.player.hp -= dynastyGameState.comp.atk;
        } else if (cAction === 2) dynastyLog(`[COMP] Defends defensively!`, 'comp');
        else if (cAction === 3) doCompAtkUp();
        else if (cAction === 4) doCompDefUp();
        else if (cAction === 5) doCompHeal();
    } else if (pAction === 5) { // Player Heal
        doPlayerHeal();
        if (cAction === 1) {
            dynastyLog(`[COMP] Attacks! Dealt ${dynastyGameState.comp.atk} DMG to You!`, 'comp');
            dynastyGameState.player.hp -= dynastyGameState.comp.atk;
        } else if (cAction === 2) dynastyLog(`[COMP] Defends defensively!`, 'comp');
        else if (cAction === 3) doCompAtkUp();
        else if (cAction === 4) doCompDefUp();
        else if (cAction === 5) doCompHeal();
    }

    updateDynastyHUD();

    if (dynastyGameState.player.hp <= 0 || dynastyGameState.comp.hp <= 0) {
        dynastyGameState.isOver = true;
        setTimeout(() => {
            showDynastyScreen('game-screen-result');
            const resTitle = document.getElementById('result-title');
            const resDesc = document.getElementById('result-desc');
            const resIcon = document.getElementById('result-icon');
            if (dynastyGameState.player.hp > dynastyGameState.comp.hp) {
                if (resIcon) resIcon.textContent = "🏆";
                if (resTitle) resTitle.textContent = "KAMU MENANG!";
                if (resDesc) resDesc.textContent = "Luar biasa! Kamu berhasil mengalahkan AI komputer dalam pertarungan strategi Dynasty of War!";
            } else {
                if (resIcon) resIcon.textContent = "💀";
                if (resTitle) resTitle.textContent = "KAMU KALAH!";
                if (resDesc) resDesc.textContent = "Jangan menyerah! AI komputer lebih unggul kali ini. Coba lagi dengan taktik berbeda!";
            }
        }, 800);
    }
}

document.querySelectorAll('.battle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (dynastyGameState.isOver) return;
        const pAction = parseInt(btn.getAttribute('data-action'));
        const cAction = Math.floor(Math.random() * 5) + 1;
        executeDynastyTurn(pAction, cAction);
    });
});

const btnPlayAgain = document.getElementById('btn-play-again');
if (btnPlayAgain) {
    btnPlayAgain.addEventListener('click', resetDynastySimulator);
}
