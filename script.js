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

    // ========== WEB AUDIO API — PERCUSSIVE STOMP AUDIO ENGINE ==========
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
            masterGain.gain.setValueAtTime(0.95, audioCtx.currentTime);

            // Master compressor for heavy percussive punch
            masterCompressor = audioCtx.createDynamicsCompressor();
            masterCompressor.threshold.setValueAtTime(-16, audioCtx.currentTime);
            masterCompressor.knee.setValueAtTime(3, audioCtx.currentTime);
            masterCompressor.ratio.setValueAtTime(12, audioCtx.currentTime);
            masterCompressor.attack.setValueAtTime(0.001, audioCtx.currentTime);
            masterCompressor.release.setValueAtTime(0.08, audioCtx.currentTime);

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
    // 🥁 TICK: Crisp Rimshot / Woodblock Snap
    // ─────────────────────────────────────────────────────
    function sfxTick() {
        if (!sfxEnabled || !audioCtx) return;
        const now = audioCtx.currentTime;
        const out = getMaster();

        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.035);
        g.gain.setValueAtTime(0.6, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(g).connect(out);
        osc.start(now);
        osc.stop(now + 0.05);

        const nBuf = createNoiseBuffer(0.04);
        if (nBuf) {
            const n = audioCtx.createBufferSource();
            const ng = audioCtx.createGain();
            const hpf = audioCtx.createBiquadFilter();
            n.buffer = nBuf;
            hpf.type = 'highpass';
            hpf.frequency.setValueAtTime(3000, now);
            ng.gain.setValueAtTime(0.4, now);
            ng.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
            n.connect(hpf).connect(ng).connect(out);
            n.start(now);
            n.stop(now + 0.04);
        }
    }

    // ─────────────────────────────────────────────────────
    // 🥁 STOMP: Heavy 808 Sub Thud + Metallic Slam
    // ─────────────────────────────────────────────────────
    function sfxStomp() {
        if (!sfxEnabled || !audioCtx) return;
        const now = audioCtx.currentTime;
        const out = getMaster();

        const sub = audioCtx.createOscillator();
        const subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(180, now);
        sub.frequency.exponentialRampToValueAtTime(32, now + 0.12);
        sub.frequency.exponentialRampToValueAtTime(18, now + 0.65);
        subG.gain.setValueAtTime(0, now);
        subG.gain.linearRampToValueAtTime(0.85, now + 0.005);
        subG.gain.exponentialRampToValueAtTime(0.18, now + 0.2);
        subG.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        sub.connect(subG).connect(out);
        sub.start(now);
        sub.stop(now + 0.7);

        const metal = audioCtx.createOscillator();
        const metalG = audioCtx.createGain();
        const dist = audioCtx.createWaveShaper();
        const lpf = audioCtx.createBiquadFilter();
        metal.type = 'square';
        metal.frequency.setValueAtTime(300, now);
        metal.frequency.exponentialRampToValueAtTime(60, now + 0.15);
        dist.curve = makeDistCurve(70);
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(800, now);
        lpf.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        metalG.gain.setValueAtTime(0, now);
        metalG.gain.linearRampToValueAtTime(0.35, now + 0.005);
        metalG.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        metal.connect(dist).connect(lpf).connect(metalG).connect(out);
        metal.start(now);
        metal.stop(now + 0.3);
    }

    // ─────────────────────────────────────────────────────
    // 🥁 SNARE: Acoustic Snare Crack
    // ─────────────────────────────────────────────────────
    function sfxSnare() {
        if (!sfxEnabled || !audioCtx) return;
        const now = audioCtx.currentTime;
        const out = getMaster();

        const tone = audioCtx.createOscillator();
        const toneG = audioCtx.createGain();
        tone.type = 'triangle';
        tone.frequency.setValueAtTime(250, now);
        tone.frequency.exponentialRampToValueAtTime(100, now + 0.08);
        toneG.gain.setValueAtTime(0.5, now);
        toneG.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        tone.connect(toneG).connect(out);
        tone.start(now);
        tone.stop(now + 0.12);

        const nBuf = createNoiseBuffer(0.18);
        if (nBuf) {
            const n = audioCtx.createBufferSource();
            const ng = audioCtx.createGain();
            const bpf = audioCtx.createBiquadFilter();
            n.buffer = nBuf;
            bpf.type = 'bandpass';
            bpf.frequency.setValueAtTime(1500, now);
            bpf.Q.setValueAtTime(1.2, now);
            ng.gain.setValueAtTime(0.6, now);
            ng.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
            n.connect(bpf).connect(ng).connect(out);
            n.start(now);
            n.stop(now + 0.18);
        }
    }

    // ─────────────────────────────────────────────────────
    // 💨 WHOOSH: High-Speed Air Sweep
    // ─────────────────────────────────────────────────────
    function sfxWhoosh() {
        if (!sfxEnabled || !audioCtx) return;
        const now = audioCtx.currentTime;
        const out = getMaster();

        const nBuf = createNoiseBuffer(0.22);
        if (nBuf) {
            const n = audioCtx.createBufferSource();
            const ng = audioCtx.createGain();
            const bpf = audioCtx.createBiquadFilter();
            n.buffer = nBuf;
            bpf.type = 'bandpass';
            bpf.frequency.setValueAtTime(400, now);
            bpf.frequency.exponentialRampToValueAtTime(3000, now + 0.1);
            bpf.frequency.exponentialRampToValueAtTime(600, now + 0.2);
            bpf.Q.setValueAtTime(2, now);
            ng.gain.setValueAtTime(0.01, now);
            ng.gain.linearRampToValueAtTime(0.25, now + 0.1);
            ng.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            n.connect(bpf).connect(ng).connect(out);
            n.start(now);
            n.stop(now + 0.22);
        }
    }

    // ─────────────────────────────────────────────────────
    // 💥 MEGA DROP: Final Welcome Shockwave & Curtain Open
    // ─────────────────────────────────────────────────────
    function sfxMegaDrop() {
        if (!sfxEnabled || !audioCtx) return;
        const now = audioCtx.currentTime;
        const out = getMaster();

        // Riser (0s -> 0.55s)
        const riserBuf = createNoiseBuffer(0.6);
        if (riserBuf) {
            const riser = audioCtx.createBufferSource();
            const rG = audioCtx.createGain();
            const rBPF = audioCtx.createBiquadFilter();
            riser.buffer = riserBuf;
            rBPF.type = 'bandpass';
            rBPF.frequency.setValueAtTime(200, now);
            rBPF.frequency.exponentialRampToValueAtTime(6000, now + 0.52);
            rBPF.Q.setValueAtTime(2, now);
            rBPF.Q.linearRampToValueAtTime(10, now + 0.52);
            rG.gain.setValueAtTime(0.01, now);
            rG.gain.exponentialRampToValueAtTime(0.35, now + 0.5);
            rG.gain.linearRampToValueAtTime(0, now + 0.58);
            riser.connect(rBPF).connect(rG).connect(out);
            riser.start(now);
            riser.stop(now + 0.6);
        }

        // Drop at 0.55s
        const drop = now + 0.55;
        const sub = audioCtx.createOscillator();
        const subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(220, drop);
        sub.frequency.exponentialRampToValueAtTime(40, drop + 0.15);
        sub.frequency.exponentialRampToValueAtTime(20, drop + 2.5);
        subG.gain.setValueAtTime(0, drop);
        subG.gain.linearRampToValueAtTime(0.85, drop + 0.006);
        subG.gain.exponentialRampToValueAtTime(0.25, drop + 0.4);
        subG.gain.exponentialRampToValueAtTime(0.001, drop + 2.8);
        sub.connect(subG).connect(out);
        sub.start(drop);
        sub.stop(drop + 3.0);

        const revBuf = createReverbBuffer(3.2, 1.8);
        if (revBuf) {
            const conv = audioCtx.createConvolver();
            conv.buffer = revBuf;
            const rG = audioCtx.createGain();
            rG.gain.setValueAtTime(0.3, drop);
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

    let bgmGain = null;
    let bgmPulseInterval = null;
    let activeDroneOsc = null;
    let activeLfo = null;

    // ─────────────────────────────────────────────────────
    // 🎬 BLOCKBUSTER BGM: Dark Action Drone & Arpeggio Pulse
    // ─────────────────────────────────────────────────────
    function startCinematicBGM() {
        if (!sfxEnabled || !audioCtx) return;
        const now = audioCtx.currentTime;
        const out = getMaster();

        bgmGain = audioCtx.createGain();
        bgmGain.gain.setValueAtTime(0.01, now);
        bgmGain.gain.linearRampToValueAtTime(0.32, now + 1.2);
        bgmGain.connect(out);

        // 1. Deep Sub Drone (55 Hz)
        const droneOsc = audioCtx.createOscillator();
        const droneFilter = audioCtx.createBiquadFilter();
        droneOsc.type = 'sawtooth';
        droneOsc.frequency.setValueAtTime(55, now);
        droneFilter.type = 'lowpass';
        droneFilter.frequency.setValueAtTime(130, now);

        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.setValueAtTime(0.5, now);
        lfoGain.gain.setValueAtTime(45, now);
        lfo.connect(droneFilter.frequency);
        lfo.start(now);

        droneOsc.connect(droneFilter).connect(bgmGain);
        droneOsc.start(now);

        activeDroneOsc = droneOsc;
        activeLfo = lfo;

        // 2. Action Trailer Driving Synth Pulse (16th notes at 125 BPM)
        const notes = [110, 110, 130.81, 146.83, 110, 164.81, 146.83, 130.81];
        let step = 0;

        function playPulseNote() {
            if (!audioCtx || audioCtx.state === 'closed' || !bgmGain) return;
            const t = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const filter = audioCtx.createBiquadFilter();
            const g = audioCtx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(notes[step % notes.length], t);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(700, t);
            filter.frequency.exponentialRampToValueAtTime(140, t + 0.1);

            g.gain.setValueAtTime(0.24, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

            osc.connect(filter).connect(g).connect(bgmGain);
            osc.start(t);
            osc.stop(t + 0.12);

            step++;
        }

        bgmPulseInterval = setInterval(playPulseNote, 120);
    }

    // ─────────────────────────────────────────────────────
    // 🌌 PORTFOLIO REVEAL: Majestic Futuristic Shimmer Tail
    // ─────────────────────────────────────────────────────
    function transitionBGMToPortfolio() {
        if (!audioCtx || !bgmGain) return;
        if (bgmPulseInterval) clearInterval(bgmPulseInterval);

        const now = audioCtx.currentTime;
        bgmGain.gain.setValueAtTime(bgmGain.gain.value, now);
        bgmGain.gain.exponentialRampToValueAtTime(0.08, now + 0.6);
        bgmGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

        if (activeDroneOsc) { activeDroneOsc.stop(now + 3.1); activeDroneOsc = null; }
        if (activeLfo) { activeLfo.stop(now + 3.1); activeLfo = null; }

        const chordNotes = [220, 261.63, 329.63, 392.00, 523.25];
        chordNotes.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            const pan = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            g.gain.setValueAtTime(0.01, now);
            g.gain.linearRampToValueAtTime(0.06, now + 0.3);
            g.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

            if (pan) {
                pan.pan.setValueAtTime((idx - 2) * 0.3, now);
                osc.connect(g).connect(pan).connect(getMaster());
            } else {
                osc.connect(g).connect(getMaster());
            }
            osc.start(now);
            osc.stop(now + 3.1);
        });
    }
    // ========== END PERCUSSIVE STOMP AUDIO ENGINE ==========

    // ═══════════════════════════════════════════════════════════════════
    // KINETIC TIMELINE ORCHESTRATOR — Rhythmic "Don't Blink" Fast Pacing
    // ═══════════════════════════════════════════════════════════════════
    async function animate() {
        const words = Array.from(splash.querySelectorAll('.kinetic-word'));
        words.forEach(w => w.classList.remove('k-active', 'k-out'));

        startCinematicBGM();
        await wait(300);

        // Act 1: "DON'T BLINK." (Stomp)
        words[0].classList.add('k-active');
        sfxStomp();
        await wait(550);
        words[0].classList.add('k-out');
        await wait(120);

        // Act 2: "THIS IS" (Slide left)
        words[1].classList.add('k-active');
        sfxWhoosh();
        sfxTick();
        await wait(400);
        words[1].classList.add('k-out');
        await wait(100);

        // Act 3: "DAFFA RESTU FADHILLAH" (Invert flash impact)
        splash.classList.add('kinetic-inverted');
        words[2].classList.add('k-active');
        sfxStomp();
        sfxSnare();
        await wait(750);
        splash.classList.remove('kinetic-inverted');
        words[2].classList.add('k-out');
        await wait(120);

        // Act 4: "FRONT-END DEVELOPER" (Stomp)
        words[3].classList.add('k-active');
        sfxStomp();
        await wait(480);
        words[3].classList.add('k-out');
        await wait(100);

        // Act 5: "& UI/UX DESIGNER" (Slide right)
        words[4].classList.add('k-active');
        sfxWhoosh();
        sfxTick();
        await wait(480);
        words[4].classList.add('k-out');
        await wait(100);

        // Act 6: "CRAFTING" (Zoom)
        words[5].classList.add('k-active');
        sfxTick();
        await wait(350);
        words[5].classList.add('k-out');
        await wait(80);

        // Act 7: "SMOOTH" (Stretch)
        words[6].classList.add('k-active');
        sfxSnare();
        await wait(380);
        words[6].classList.add('k-out');
        await wait(80);

        // Act 8: "RESPONSIVE" (Bounce)
        words[7].classList.add('k-active');
        sfxTick();
        await wait(380);
        words[7].classList.add('k-out');
        await wait(80);

        // Act 9: "WEB EXPERIENCES." (Stomp)
        words[8].classList.add('k-active');
        sfxStomp();
        await wait(550);
        words[8].classList.add('k-out');
        await wait(150);

        // Act 10: "WELCOME." (Mega riser into drop)
        words[9].classList.add('k-active');
        sfxMegaDrop(); // Riser starts and hits exactly at 0.55s
        await wait(550);

        words[9].classList.add('k-out');
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
