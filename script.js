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

    // ========== WEB AUDIO API — EPIC BLOCKBUSTER "BOOM" SFX ENGINE ==========
    let audioCtx = null;
    let sfxEnabled = false;
    let masterCompressor = null;
    let masterGain = null;

    function initAudio() {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            masterGain = audioCtx.createGain();
            masterGain.gain.setValueAtTime(0.9, audioCtx.currentTime);

            // Master compressor for heavy trailer punch and loudness
            masterCompressor = audioCtx.createDynamicsCompressor();
            masterCompressor.threshold.setValueAtTime(-18, audioCtx.currentTime);
            masterCompressor.knee.setValueAtTime(4, audioCtx.currentTime);
            masterCompressor.ratio.setValueAtTime(12, audioCtx.currentTime);
            masterCompressor.attack.setValueAtTime(0.001, audioCtx.currentTime);
            masterCompressor.release.setValueAtTime(0.1, audioCtx.currentTime);

            masterGain.connect(masterCompressor).connect(audioCtx.destination);
            sfxEnabled = true;
        } catch (e) {
            sfxEnabled = false;
        }
    }

    function getMaster() {
        return masterGain || audioCtx.destination;
    }

    function createNoiseBuffer(duration) {
        if (!audioCtx) return null;
        const sr = audioCtx.sampleRate;
        const len = sr * duration;
        const buf = audioCtx.createBuffer(1, len, sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        return buf;
    }

    function createReverbBuffer(duration, decay) {
        if (!audioCtx) return null;
        const sr = audioCtx.sampleRate;
        const len = sr * duration;
        const buf = audioCtx.createBuffer(2, len, sr);
        for (let ch = 0; ch < 2; ch++) {
            const d = buf.getChannelData(ch);
            for (let i = 0; i < len; i++) {
                d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
            }
        }
        return buf;
    }

    function makeDistCurve(amount) {
        const n = 44100;
        const curve = new Float32Array(n);
        const deg = Math.PI / 180;
        for (let i = 0; i < n; i++) {
            const x = (i * 2) / n - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        return curve;
    }

    // ─────────────────────────────────────────────────────
    // 💥 BOOM #1: MASSIVE CINEMATIC TRAILER HIT (Logo)
    // Deep chest-thump impact (180Hz -> 35Hz) + orchestral brass BWAAAAM
    // ─────────────────────────────────────────────────────
    function sfxBoomLogo() {
        if (!sfxEnabled || !audioCtx) return;
        const now = audioCtx.currentTime;
        const out = getMaster();

        // 1. Audible Punch & Sub Drop (180Hz -> 35Hz gives punch on phones AND subwoofers)
        const sub = audioCtx.createOscillator();
        const subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(180, now);
        sub.frequency.exponentialRampToValueAtTime(45, now + 0.15);
        sub.frequency.exponentialRampToValueAtTime(25, now + 2.2);
        subG.gain.setValueAtTime(0, now);
        subG.gain.linearRampToValueAtTime(0.7, now + 0.008); // Instant mallet hit
        subG.gain.exponentialRampToValueAtTime(0.3, now + 0.4);
        subG.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
        sub.connect(subG).connect(out);
        sub.start(now);
        sub.stop(now + 2.6);

        // 2. Heavy Orchestral Brass / Taiko Body
        const brass = audioCtx.createOscillator();
        const brassG = audioCtx.createGain();
        const brassDist = audioCtx.createWaveShaper();
        const brassLPF = audioCtx.createBiquadFilter();
        brass.type = 'sawtooth';
        brass.frequency.setValueAtTime(110, now);
        brass.frequency.exponentialRampToValueAtTime(50, now + 1.8);
        brassDist.curve = makeDistCurve(90);
        brassDist.oversample = '4x';
        brassLPF.type = 'lowpass';
        brassLPF.frequency.setValueAtTime(800, now);
        brassLPF.frequency.exponentialRampToValueAtTime(90, now + 1.8);
        brassG.gain.setValueAtTime(0, now);
        brassG.gain.linearRampToValueAtTime(0.3, now + 0.015);
        brassG.gain.exponentialRampToValueAtTime(0.05, now + 0.7);
        brassG.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
        brass.connect(brassDist).connect(brassLPF).connect(brassG).connect(out);
        brass.start(now);
        brass.stop(now + 2.1);

        // 3. Stereo Widening Harmonics
        [-15, 0, 15].forEach(detune => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = 'triangle';
            o.frequency.setValueAtTime(220, now);
            o.frequency.exponentialRampToValueAtTime(80, now + 1.5);
            o.detune.setValueAtTime(detune, now);
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.12, now + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, now + 1.7);
            o.connect(g).connect(out);
            o.start(now);
            o.stop(now + 1.8);
        });

        // 4. Percussive Smack / Leather Crack
        const crackBuf = createNoiseBuffer(0.15);
        if (crackBuf) {
            const crack = audioCtx.createBufferSource();
            const cG = audioCtx.createGain();
            const cBPF = audioCtx.createBiquadFilter();
            crack.buffer = crackBuf;
            cBPF.type = 'bandpass';
            cBPF.frequency.setValueAtTime(1000, now);
            cBPF.Q.setValueAtTime(1.2, now);
            cG.gain.setValueAtTime(0.55, now);
            cG.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            crack.connect(cBPF).connect(cG).connect(out);
            crack.start(now);
            crack.stop(now + 0.15);
        }

        // 5. Cinematic Stadium Reverb Wash
        const revBuf = createReverbBuffer(3.0, 2.0);
        if (revBuf) {
            const conv = audioCtx.createConvolver();
            conv.buffer = revBuf;
            const rG = audioCtx.createGain();
            rG.gain.setValueAtTime(0.2, now);
            const burst = audioCtx.createOscillator();
            const bG = audioCtx.createGain();
            burst.type = 'sine';
            burst.frequency.setValueAtTime(80, now);
            bG.gain.setValueAtTime(0.4, now);
            bG.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            burst.connect(bG).connect(conv).connect(rG).connect(out);
            burst.start(now);
            burst.stop(now + 0.1);
        }
    }

    // ─────────────────────────────────────────────────────
    // 💥 BOOM #2: HEAVY TRAILER IMPACT (Text Cards)
    // Deep dramatic drum hit descending in pitch
    // ─────────────────────────────────────────────────────
    function sfxBoomText(index) {
        if (!sfxEnabled || !audioCtx) return;
        const now = audioCtx.currentTime;
        const out = getMaster();
        const pitch = 160 - index * 18; // 160Hz -> 142Hz -> 124Hz...

        const sub = audioCtx.createOscillator();
        const subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(pitch, now);
        sub.frequency.exponentialRampToValueAtTime(45, now + 0.12);
        sub.frequency.exponentialRampToValueAtTime(28, now + 0.9);
        subG.gain.setValueAtTime(0, now);
        subG.gain.linearRampToValueAtTime(0.55, now + 0.006);
        subG.gain.exponentialRampToValueAtTime(0.15, now + 0.3);
        subG.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        sub.connect(subG).connect(out);
        sub.start(now);
        sub.stop(now + 1.1);

        const mid = audioCtx.createOscillator();
        const midG = audioCtx.createGain();
        const midDist = audioCtx.createWaveShaper();
        const midLPF = audioCtx.createBiquadFilter();
        mid.type = 'square';
        mid.frequency.setValueAtTime(pitch * 2, now);
        mid.frequency.exponentialRampToValueAtTime(60, now + 0.2);
        midDist.curve = makeDistCurve(70);
        midLPF.type = 'lowpass';
        midLPF.frequency.setValueAtTime(700, now);
        midLPF.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        midG.gain.setValueAtTime(0, now);
        midG.gain.linearRampToValueAtTime(0.2, now + 0.005);
        midG.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        mid.connect(midDist).connect(midLPF).connect(midG).connect(out);
        mid.start(now);
        mid.stop(now + 0.45);

        const snapBuf = createNoiseBuffer(0.1);
        if (snapBuf) {
            const snap = audioCtx.createBufferSource();
            const sG = audioCtx.createGain();
            const sHPF = audioCtx.createBiquadFilter();
            snap.buffer = snapBuf;
            sHPF.type = 'bandpass';
            sHPF.frequency.setValueAtTime(1200, now);
            sHPF.Q.setValueAtTime(1.5, now);
            sG.gain.setValueAtTime(0.4, now);
            sG.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
            snap.connect(sHPF).connect(sG).connect(out);
            snap.start(now);
            snap.stop(now + 0.09);
        }
    }

    // ─────────────────────────────────────────────────────
    // 💥 BOOM #3: ESCALATING THUNDER BOOM (Marquee)
    // Thunderous percussion hits building tension
    // ─────────────────────────────────────────────────────
    function sfxBoomMarquee(index) {
        if (!sfxEnabled || !audioCtx) return;
        const now = audioCtx.currentTime;
        const out = getMaster();
        const intensity = 1 + index * 0.25;
        const pitch = 140 - index * 15;

        const sub = audioCtx.createOscillator();
        const subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(pitch, now);
        sub.frequency.exponentialRampToValueAtTime(40, now + 0.08);
        sub.frequency.exponentialRampToValueAtTime(25, now + 1.1);
        subG.gain.setValueAtTime(0, now);
        subG.gain.linearRampToValueAtTime(0.6 * intensity, now + 0.005);
        subG.gain.exponentialRampToValueAtTime(0.18 * intensity, now + 0.25);
        subG.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        sub.connect(subG).connect(out);
        sub.start(now);
        sub.stop(now + 1.3);

        const saw = audioCtx.createOscillator();
        const sawG = audioCtx.createGain();
        const sawDist = audioCtx.createWaveShaper();
        const sawLPF = audioCtx.createBiquadFilter();
        saw.type = 'sawtooth';
        saw.frequency.setValueAtTime(pitch * 2.2, now);
        saw.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        sawDist.curve = makeDistCurve(85);
        sawLPF.type = 'lowpass';
        sawLPF.frequency.setValueAtTime(600, now);
        sawLPF.frequency.exponentialRampToValueAtTime(80, now + 0.4);
        sawG.gain.setValueAtTime(0, now);
        sawG.gain.linearRampToValueAtTime(0.22 * intensity, now + 0.008);
        sawG.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        saw.connect(sawDist).connect(sawLPF).connect(sawG).connect(out);
        saw.start(now);
        saw.stop(now + 0.55);

        const crackBuf = createNoiseBuffer(0.12);
        if (crackBuf) {
            const crack = audioCtx.createBufferSource();
            const cG = audioCtx.createGain();
            const cBPF = audioCtx.createBiquadFilter();
            crack.buffer = crackBuf;
            cBPF.type = 'bandpass';
            cBPF.frequency.setValueAtTime(1400 - index * 150, now);
            cBPF.Q.setValueAtTime(1.0, now);
            cG.gain.setValueAtTime(0.45 * intensity, now);
            cG.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
            crack.connect(cBPF).connect(cG).connect(out);
            crack.start(now);
            crack.stop(now + 0.12);
        }
    }

    // ─────────────────────────────────────────────────────
    // 💥 BOOM #4: MEGA SHOCKWAVE REVEAL (Curtain Exit & Web Reveal)
    // Cinematic tension riser releasing into massive earth-shaking boom
    // ─────────────────────────────────────────────────────
    function sfxBoomCurtainExit() {
        if (!sfxEnabled || !audioCtx) return;
        const now = audioCtx.currentTime;
        const out = getMaster();

        // Phase 1: Tension Riser (0s – 0.55s)
        const riserBuf = createNoiseBuffer(0.6);
        if (riserBuf) {
            const riser = audioCtx.createBufferSource();
            const rG = audioCtx.createGain();
            const rBPF = audioCtx.createBiquadFilter();
            riser.buffer = riserBuf;
            rBPF.type = 'bandpass';
            rBPF.frequency.setValueAtTime(180, now);
            rBPF.frequency.exponentialRampToValueAtTime(6000, now + 0.52);
            rBPF.Q.setValueAtTime(2, now);
            rBPF.Q.linearRampToValueAtTime(10, now + 0.52);
            rG.gain.setValueAtTime(0.01, now);
            rG.gain.exponentialRampToValueAtTime(0.3, now + 0.5);
            rG.gain.linearRampToValueAtTime(0, now + 0.58);
            riser.connect(rBPF).connect(rG).connect(out);
            riser.start(now);
            riser.stop(now + 0.6);
        }

        const sweep = audioCtx.createOscillator();
        const sweepG = audioCtx.createGain();
        const sweepLPF = audioCtx.createBiquadFilter();
        sweep.type = 'sawtooth';
        sweep.frequency.setValueAtTime(90, now);
        sweep.frequency.exponentialRampToValueAtTime(1800, now + 0.52);
        sweepLPF.type = 'lowpass';
        sweepLPF.frequency.setValueAtTime(250, now);
        sweepLPF.frequency.exponentialRampToValueAtTime(7000, now + 0.5);
        sweepG.gain.setValueAtTime(0, now);
        sweepG.gain.linearRampToValueAtTime(0.06, now + 0.1);
        sweepG.gain.exponentialRampToValueAtTime(0.18, now + 0.48);
        sweepG.gain.linearRampToValueAtTime(0, now + 0.55);
        sweep.connect(sweepLPF).connect(sweepG).connect(out);
        sweep.start(now);
        sweep.stop(now + 0.58);

        // Phase 2: THE MEGA BOOM DROP at 0.55s (Curtain Opens & Web Enters)
        const drop = now + 0.55;

        const dropSub = audioCtx.createOscillator();
        const dropSubG = audioCtx.createGain();
        dropSub.type = 'sine';
        dropSub.frequency.setValueAtTime(200, drop);
        dropSub.frequency.exponentialRampToValueAtTime(45, drop + 0.15);
        dropSub.frequency.exponentialRampToValueAtTime(20, drop + 2.5);
        dropSubG.gain.setValueAtTime(0, drop);
        dropSubG.gain.linearRampToValueAtTime(0.75, drop + 0.006);
        dropSubG.gain.exponentialRampToValueAtTime(0.25, drop + 0.4);
        dropSubG.gain.exponentialRampToValueAtTime(0.001, drop + 2.8);
        dropSub.connect(dropSubG).connect(out);
        dropSub.start(drop);
        dropSub.stop(drop + 3.0);

        const dropBrass = audioCtx.createOscillator();
        const dropBrassG = audioCtx.createGain();
        const dropBrassDist = audioCtx.createWaveShaper();
        const dropBrassLPF = audioCtx.createBiquadFilter();
        dropBrass.type = 'sawtooth';
        dropBrass.frequency.setValueAtTime(130, drop);
        dropBrass.frequency.exponentialRampToValueAtTime(40, drop + 1.5);
        dropBrassDist.curve = makeDistCurve(95);
        dropBrassLPF.type = 'lowpass';
        dropBrassLPF.frequency.setValueAtTime(900, drop);
        dropBrassLPF.frequency.exponentialRampToValueAtTime(80, drop + 1.5);
        dropBrassG.gain.setValueAtTime(0, drop);
        dropBrassG.gain.linearRampToValueAtTime(0.3, drop + 0.01);
        dropBrassG.gain.exponentialRampToValueAtTime(0.001, drop + 1.8);
        dropBrass.connect(dropBrassDist).connect(dropBrassLPF).connect(dropBrassG).connect(out);
        dropBrass.start(drop);
        dropBrass.stop(drop + 1.9);

        const dropCrackBuf = createNoiseBuffer(0.2);
        if (dropCrackBuf) {
            const dc = audioCtx.createBufferSource();
            const dcG = audioCtx.createGain();
            const dcBPF = audioCtx.createBiquadFilter();
            dc.buffer = dropCrackBuf;
            dcBPF.type = 'bandpass';
            dcBPF.frequency.setValueAtTime(1100, drop);
            dcBPF.Q.setValueAtTime(0.8, drop);
            dcG.gain.setValueAtTime(0.6, drop);
            dcG.gain.exponentialRampToValueAtTime(0.001, drop + 0.15);
            dc.connect(dcBPF).connect(dcG).connect(out);
            dc.start(drop);
            dc.stop(drop + 0.18);
        }

        const revBuf = createReverbBuffer(3.2, 1.8);
        if (revBuf) {
            const conv = audioCtx.createConvolver();
            conv.buffer = revBuf;
            const rG = audioCtx.createGain();
            rG.gain.setValueAtTime(0.25, drop);
            const burst = audioCtx.createOscillator();
            const bG = audioCtx.createGain();
            burst.type = 'sine';
            burst.frequency.setValueAtTime(60, drop);
            bG.gain.setValueAtTime(0.5, drop);
            bG.gain.exponentialRampToValueAtTime(0.001, drop + 0.06);
            burst.connect(bG).connect(conv).connect(rG).connect(out);
            burst.start(drop);
            burst.stop(drop + 0.08);
        }
    }
    // ========== END BLOCKBUSTER SFX ENGINE ==========

    function showLine(el) {
        el.classList.remove('fade-out');
        el.style.display = '';
        void el.offsetWidth;
        el.classList.add('visible');
    }

    function hideLine(el) {
        el.classList.remove('visible');
        el.classList.add('fade-out');
    }

    // ═══════════════════════════════════════════════════
    // ANIMATION ORCHESTRATOR — Cinematic Trailer Pacing
    // ═══════════════════════════════════════════════════
    async function animate() {
        splash.querySelectorAll('.splash-line').forEach(l => {
            l.style.display = 'none';
        });

        // ACT 1: Logo Appear (Anticipation then BOOM)
        await wait(500);
        logo.style.display = '';
        showLine(logo);
        sfxBoomLogo();

        // ACT 2: Text Cards (Dramatic beats)
        await wait(1200);

        for (let i = 0; i < textLines.length; i++) {
            if (i > 0) hideLine(textLines[i - 1]);
            await wait(i > 0 ? 450 : 0);
            showLine(textLines[i]);
            sfxBoomText(i);
            await wait(800);
        }

        // ACT 3: Marquee Escalating Thunder
        hideLine(textLines[textLines.length - 1]);
        await wait(500);

        for (let i = 0; i < marqueeLines.length; i++) {
            if (i > 0) hideLine(marqueeLines[i - 1]);
            await wait(i > 0 ? 400 : 0);
            showLine(marqueeLines[i]);
            sfxBoomMarquee(i);
            await wait(750);
        }

        // ACT 4: The Reveal (Riser into Mega Shockwave & Web Entrance)
        await wait(400);
        sfxBoomCurtainExit(); // 0.55s riser starts
        await wait(550);      // Wait exactly for the drop moment...

        // 💥 MEGA BOOM DROP! Open curtains AND trigger cinematic entrance of web content!
        splash.classList.add('exit');
        document.body.classList.remove('splash-active');

        // Wait for curtain split and reverb decay
        await wait(1100);

        splash.classList.add('done');

        if (audioCtx && audioCtx.state !== 'closed') {
            setTimeout(() => {
                audioCtx.close().catch(() => { });
            }, 3000);
        }
    }

    // Wait for user click/tap to start animation (guarantees AudioContext unlock)
    function waitForUserGesture() {
        const enterPrompt = document.getElementById('splash-enter');

        function onUserGesture() {
            // Remove listener to prevent double-fires
            splash.removeEventListener('click', onUserGesture);
            splash.removeEventListener('touchstart', onUserGesture);

            // Init audio inside user gesture — browser guarantees it will be "running"
            initAudio();

            // Hide the enter prompt
            if (enterPrompt) enterPrompt.classList.add('hidden');

            // Start animation after prompt fully fades out
            setTimeout(animate, 600);
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
