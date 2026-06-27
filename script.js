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

    // ========== WEB AUDIO API — CINEMATIC BLOCKBUSTER SFX ENGINE ==========
    let audioCtx = null;
    let sfxEnabled = false;
    let masterCompressor = null;

    function initAudio() {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            // Master compressor for punchier, louder output without clipping
            masterCompressor = audioCtx.createDynamicsCompressor();
            masterCompressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
            masterCompressor.knee.setValueAtTime(6, audioCtx.currentTime);
            masterCompressor.ratio.setValueAtTime(8, audioCtx.currentTime);
            masterCompressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
            masterCompressor.release.setValueAtTime(0.15, audioCtx.currentTime);
            masterCompressor.connect(audioCtx.destination);
            sfxEnabled = true;
        } catch (e) {
            sfxEnabled = false;
        }
    }

    function getMaster() {
        return masterCompressor || audioCtx.destination;
    }

    // Create noise buffer for impacts and textures
    function createNoiseBuffer(duration) {
        if (!audioCtx) return null;
        const sampleRate = audioCtx.sampleRate;
        const length = sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    // Create a waveshaper distortion curve for gritty bass
    function makeDistortionCurve(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        return curve;
    }

    // Utility: create a simple convolution-style reverb tail
    function createReverbBuffer(duration, decay) {
        if (!audioCtx) return null;
        const sampleRate = audioCtx.sampleRate;
        const length = sampleRate * duration;
        const buffer = audioCtx.createBuffer(2, length, sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const data = buffer.getChannelData(ch);
            for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
            }
        }
        return buffer;
    }

    // ───────────────────────────────────────────────
    // SFX: INCEPTION "BWAAAAM" — Logo Appear
    // Deep sub-bass impact + brass-like mid harmonics + reverb tail
    // ───────────────────────────────────────────────
    function sfxLogoAppear() {
        if (!sfxEnabled || !audioCtx) return;
        const now = audioCtx.currentTime;
        const master = getMaster();

        // Layer 1: Massive sub-bass hit (the "BWAAAAM" core)
        const subOsc = audioCtx.createOscillator();
        const subGain = audioCtx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(38, now);
        subOsc.frequency.exponentialRampToValueAtTime(28, now + 2.0);
        subGain.gain.setValueAtTime(0, now);
        subGain.gain.linearRampToValueAtTime(0.45, now + 0.015);  // Hard transient
        subGain.gain.setValueAtTime(0.4, now + 0.05);
        subGain.gain.exponentialRampToValueAtTime(0.12, now + 0.8);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
        subOsc.connect(subGain).connect(master);
        subOsc.start(now);
        subOsc.stop(now + 2.3);

        // Layer 2: Low brass-like tone with distortion (the "honk")
        const brassOsc = audioCtx.createOscillator();
        const brassGain = audioCtx.createGain();
        const brassDistortion = audioCtx.createWaveShaper();
        const brassFilter = audioCtx.createBiquadFilter();
        brassOsc.type = 'sawtooth';
        brassOsc.frequency.setValueAtTime(75, now);
        brassOsc.frequency.exponentialRampToValueAtTime(55, now + 1.5);
        brassDistortion.curve = makeDistortionCurve(80);
        brassDistortion.oversample = '4x';
        brassFilter.type = 'lowpass';
        brassFilter.frequency.setValueAtTime(400, now);
        brassFilter.frequency.exponentialRampToValueAtTime(120, now + 1.5);
        brassFilter.Q.setValueAtTime(2, now);
        brassGain.gain.setValueAtTime(0, now);
        brassGain.gain.linearRampToValueAtTime(0.18, now + 0.02);
        brassGain.gain.exponentialRampToValueAtTime(0.06, now + 0.6);
        brassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        brassOsc.connect(brassDistortion).connect(brassFilter).connect(brassGain).connect(master);
        brassOsc.start(now);
        brassOsc.stop(now + 1.9);

        // Layer 3: Mid harmonic for "body" (detuned pair for width)
        [0, 7].forEach(detuneCents => {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 1.2);
            osc.detune.setValueAtTime(detuneCents, now);
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.08, now + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
            osc.connect(g).connect(master);
            osc.start(now);
            osc.stop(now + 1.5);
        });

        // Layer 4: Impact noise transient (the "crack" at the start)
        const impactNoise = createNoiseBuffer(0.15);
        if (impactNoise) {
            const nSrc = audioCtx.createBufferSource();
            const nGain = audioCtx.createGain();
            const nFilter = audioCtx.createBiquadFilter();
            nSrc.buffer = impactNoise;
            nFilter.type = 'bandpass';
            nFilter.frequency.setValueAtTime(800, now);
            nFilter.Q.setValueAtTime(1.5, now);
            nGain.gain.setValueAtTime(0.35, now);
            nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            nSrc.connect(nFilter).connect(nGain).connect(master);
            nSrc.start(now);
            nSrc.stop(now + 0.15);
        }

        // Layer 5: Reverb tail for epic spaciousness
        const reverbBuf = createReverbBuffer(2.5, 2.5);
        if (reverbBuf) {
            const convolver = audioCtx.createConvolver();
            convolver.buffer = reverbBuf;
            const reverbGain = audioCtx.createGain();
            reverbGain.gain.setValueAtTime(0.12, now);

            // Feed a short burst into the reverb
            const burstOsc = audioCtx.createOscillator();
            const burstGain = audioCtx.createGain();
            burstOsc.type = 'sine';
            burstOsc.frequency.setValueAtTime(60, now);
            burstGain.gain.setValueAtTime(0.3, now);
            burstGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            burstOsc.connect(burstGain).connect(convolver).connect(reverbGain).connect(master);
            burstOsc.start(now);
            burstOsc.stop(now + 0.1);
        }
    }

    // ───────────────────────────────────────────────
    // SFX: Dramatic Impact Hit — Text Reveal
    // Metallic slam + sub-bass thump + cinematic whoosh
    // ───────────────────────────────────────────────
    function sfxTextReveal(pitchOffset) {
        if (!sfxEnabled || !audioCtx) return;
        const now = audioCtx.currentTime;
        const master = getMaster();
        const idx = pitchOffset || 0;
        // Each successive hit drops slightly in pitch for dramatic descent
        const baseTone = 65 - idx * 8;

        // Layer 1: Sub-bass thump
        const subOsc = audioCtx.createOscillator();
        const subGain = audioCtx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(baseTone, now);
        subOsc.frequency.exponentialRampToValueAtTime(baseTone * 0.6, now + 0.6);
        subGain.gain.setValueAtTime(0, now);
        subGain.gain.linearRampToValueAtTime(0.3, now + 0.01);
        subGain.gain.exponentialRampToValueAtTime(0.08, now + 0.25);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        subOsc.connect(subGain).connect(master);
        subOsc.start(now);
        subOsc.stop(now + 0.9);

        // Layer 2: Metallic impact (distorted mid-range)
        const metalOsc = audioCtx.createOscillator();
        const metalGain = audioCtx.createGain();
        const metalDist = audioCtx.createWaveShaper();
        const metalFilter = audioCtx.createBiquadFilter();
        metalOsc.type = 'square';
        metalOsc.frequency.setValueAtTime(200 - idx * 20, now);
        metalOsc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        metalDist.curve = makeDistortionCurve(50);
        metalFilter.type = 'bandpass';
        metalFilter.frequency.setValueAtTime(500, now);
        metalFilter.frequency.exponentialRampToValueAtTime(150, now + 0.3);
        metalFilter.Q.setValueAtTime(3, now);
        metalGain.gain.setValueAtTime(0, now);
        metalGain.gain.linearRampToValueAtTime(0.12, now + 0.005);
        metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        metalOsc.connect(metalDist).connect(metalFilter).connect(metalGain).connect(master);
        metalOsc.start(now);
        metalOsc.stop(now + 0.45);

        // Layer 3: Impact noise burst
        const noiseBuffer = createNoiseBuffer(0.25);
        if (noiseBuffer) {
            const noise = audioCtx.createBufferSource();
            const nGain = audioCtx.createGain();
            const nLPF = audioCtx.createBiquadFilter();
            noise.buffer = noiseBuffer;
            nLPF.type = 'lowpass';
            nLPF.frequency.setValueAtTime(2000, now);
            nLPF.frequency.exponentialRampToValueAtTime(200, now + 0.2);
            nGain.gain.setValueAtTime(0.2, now);
            nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            noise.connect(nLPF).connect(nGain).connect(master);
            noise.start(now);
            noise.stop(now + 0.25);
        }

        // Layer 4: Short cinematic "whoosh" tail
        const whooshNoise = createNoiseBuffer(0.4);
        if (whooshNoise) {
            const whoosh = audioCtx.createBufferSource();
            const wGain = audioCtx.createGain();
            const wBPF = audioCtx.createBiquadFilter();
            whoosh.buffer = whooshNoise;
            wBPF.type = 'bandpass';
            wBPF.frequency.setValueAtTime(600, now);
            wBPF.frequency.exponentialRampToValueAtTime(200, now + 0.35);
            wBPF.Q.setValueAtTime(1.5, now);
            wGain.gain.setValueAtTime(0, now + 0.02);
            wGain.gain.linearRampToValueAtTime(0.06, now + 0.06);
            wGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            whoosh.connect(wBPF).connect(wGain).connect(master);
            whoosh.start(now);
            whoosh.stop(now + 0.4);
        }
    }

    // ───────────────────────────────────────────────
    // SFX: Thunderous Percussion Impact — Marquee Reveal
    // Deep percussion + rumbling bass + tonal stab
    // ───────────────────────────────────────────────
    function sfxMarqueeReveal(index) {
        if (!sfxEnabled || !audioCtx) return;
        const now = audioCtx.currentTime;
        const master = getMaster();
        const basePitch = 50 - index * 5;

        // Layer 1: Deep percussion hit (kick-drum style)
        const kickOsc = audioCtx.createOscillator();
        const kickGain = audioCtx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(120, now);
        kickOsc.frequency.exponentialRampToValueAtTime(basePitch, now + 0.08);
        kickGain.gain.setValueAtTime(0, now);
        kickGain.gain.linearRampToValueAtTime(0.35, now + 0.005);
        kickGain.gain.exponentialRampToValueAtTime(0.1, now + 0.15);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        kickOsc.connect(kickGain).connect(master);
        kickOsc.start(now);
        kickOsc.stop(now + 0.65);

        // Layer 2: Distorted bass stab
        const stabOsc = audioCtx.createOscillator();
        const stabGain = audioCtx.createGain();
        const stabDist = audioCtx.createWaveShaper();
        const stabLPF = audioCtx.createBiquadFilter();
        stabOsc.type = 'sawtooth';
        stabOsc.frequency.setValueAtTime(basePitch * 2, now);
        stabOsc.frequency.exponentialRampToValueAtTime(basePitch, now + 0.2);
        stabDist.curve = makeDistortionCurve(60);
        stabDist.oversample = '4x';
        stabLPF.type = 'lowpass';
        stabLPF.frequency.setValueAtTime(350, now);
        stabLPF.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        stabGain.gain.setValueAtTime(0, now);
        stabGain.gain.linearRampToValueAtTime(0.14, now + 0.01);
        stabGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        stabOsc.connect(stabDist).connect(stabLPF).connect(stabGain).connect(master);
        stabOsc.start(now);
        stabOsc.stop(now + 0.4);

        // Layer 3: Rumbling sub-bass tail
        const rumbleNoise = createNoiseBuffer(0.5);
        if (rumbleNoise) {
            const rumble = audioCtx.createBufferSource();
            const rGain = audioCtx.createGain();
            const rLPF = audioCtx.createBiquadFilter();
            rumble.buffer = rumbleNoise;
            rLPF.type = 'lowpass';
            rLPF.frequency.setValueAtTime(120, now);
            rGain.gain.setValueAtTime(0, now);
            rGain.gain.linearRampToValueAtTime(0.15, now + 0.02);
            rGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            rumble.connect(rLPF).connect(rGain).connect(master);
            rumble.start(now);
            rumble.stop(now + 0.5);
        }

        // Layer 4: Short metallic click for definition
        const clickOsc = audioCtx.createOscillator();
        const clickGain = audioCtx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(2500, now);
        clickOsc.frequency.exponentialRampToValueAtTime(800, now + 0.025);
        clickGain.gain.setValueAtTime(0.12, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        clickOsc.connect(clickGain).connect(master);
        clickOsc.start(now);
        clickOsc.stop(now + 0.05);
    }

    // ───────────────────────────────────────────────
    // SFX: Epic Cinematic Riser → Bass Drop — Curtain Exit
    // Tension riser sweep + massive bass drop + reverb wash
    // ───────────────────────────────────────────────
    function sfxCurtainExit() {
        if (!sfxEnabled || !audioCtx) return;
        const now = audioCtx.currentTime;
        const master = getMaster();

        // Phase 1: Tension riser (0.0s – 0.5s)
        // Rising filtered noise
        const riserNoise = createNoiseBuffer(0.55);
        if (riserNoise) {
            const riser = audioCtx.createBufferSource();
            const rGain = audioCtx.createGain();
            const rBPF = audioCtx.createBiquadFilter();
            riser.buffer = riserNoise;
            rBPF.type = 'bandpass';
            rBPF.frequency.setValueAtTime(200, now);
            rBPF.frequency.exponentialRampToValueAtTime(4000, now + 0.45);
            rBPF.Q.setValueAtTime(3, now);
            rBPF.Q.linearRampToValueAtTime(8, now + 0.45);
            rGain.gain.setValueAtTime(0.01, now);
            rGain.gain.linearRampToValueAtTime(0.18, now + 0.4);
            rGain.gain.linearRampToValueAtTime(0, now + 0.52);
            riser.connect(rBPF).connect(rGain).connect(master);
            riser.start(now);
            riser.stop(now + 0.55);
        }

        // Rising tonal sweep
        const sweepOsc = audioCtx.createOscillator();
        const sweepGain = audioCtx.createGain();
        const sweepFilter = audioCtx.createBiquadFilter();
        sweepOsc.type = 'sawtooth';
        sweepOsc.frequency.setValueAtTime(100, now);
        sweepOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.48);
        sweepFilter.type = 'lowpass';
        sweepFilter.frequency.setValueAtTime(300, now);
        sweepFilter.frequency.exponentialRampToValueAtTime(5000, now + 0.45);
        sweepGain.gain.setValueAtTime(0, now);
        sweepGain.gain.linearRampToValueAtTime(0.08, now + 0.15);
        sweepGain.gain.linearRampToValueAtTime(0.12, now + 0.42);
        sweepGain.gain.linearRampToValueAtTime(0, now + 0.5);
        sweepOsc.connect(sweepFilter).connect(sweepGain).connect(master);
        sweepOsc.start(now);
        sweepOsc.stop(now + 0.52);

        // Phase 2: MASSIVE BASS DROP at 0.5s
        const dropTime = now + 0.5;

        // Drop: Sub-bass slam
        const dropSub = audioCtx.createOscillator();
        const dropSubGain = audioCtx.createGain();
        dropSub.type = 'sine';
        dropSub.frequency.setValueAtTime(45, dropTime);
        dropSub.frequency.exponentialRampToValueAtTime(25, dropTime + 1.5);
        dropSubGain.gain.setValueAtTime(0, dropTime);
        dropSubGain.gain.linearRampToValueAtTime(0.4, dropTime + 0.01);
        dropSubGain.gain.exponentialRampToValueAtTime(0.1, dropTime + 0.5);
        dropSubGain.gain.exponentialRampToValueAtTime(0.001, dropTime + 1.8);
        dropSub.connect(dropSubGain).connect(master);
        dropSub.start(dropTime);
        dropSub.stop(dropTime + 1.9);

        // Drop: Distorted mid-bass
        const dropMid = audioCtx.createOscillator();
        const dropMidGain = audioCtx.createGain();
        const dropMidDist = audioCtx.createWaveShaper();
        const dropMidLPF = audioCtx.createBiquadFilter();
        dropMid.type = 'sawtooth';
        dropMid.frequency.setValueAtTime(90, dropTime);
        dropMid.frequency.exponentialRampToValueAtTime(50, dropTime + 1.0);
        dropMidDist.curve = makeDistortionCurve(70);
        dropMidDist.oversample = '4x';
        dropMidLPF.type = 'lowpass';
        dropMidLPF.frequency.setValueAtTime(500, dropTime);
        dropMidLPF.frequency.exponentialRampToValueAtTime(100, dropTime + 1.0);
        dropMidGain.gain.setValueAtTime(0, dropTime);
        dropMidGain.gain.linearRampToValueAtTime(0.15, dropTime + 0.015);
        dropMidGain.gain.exponentialRampToValueAtTime(0.001, dropTime + 1.2);
        dropMid.connect(dropMidDist).connect(dropMidLPF).connect(dropMidGain).connect(master);
        dropMid.start(dropTime);
        dropMid.stop(dropTime + 1.3);

        // Drop: Impact noise crack
        const dropNoise = createNoiseBuffer(0.2);
        if (dropNoise) {
            const dn = audioCtx.createBufferSource();
            const dnGain = audioCtx.createGain();
            const dnBPF = audioCtx.createBiquadFilter();
            dn.buffer = dropNoise;
            dnBPF.type = 'bandpass';
            dnBPF.frequency.setValueAtTime(1000, dropTime);
            dnBPF.Q.setValueAtTime(1, dropTime);
            dnGain.gain.setValueAtTime(0.25, dropTime);
            dnGain.gain.exponentialRampToValueAtTime(0.001, dropTime + 0.15);
            dn.connect(dnBPF).connect(dnGain).connect(master);
            dn.start(dropTime);
            dn.stop(dropTime + 0.2);
        }

        // Drop: Reverb wash
        const reverbBuf = createReverbBuffer(2.0, 2.0);
        if (reverbBuf) {
            const convolver = audioCtx.createConvolver();
            convolver.buffer = reverbBuf;
            const reverbGain = audioCtx.createGain();
            reverbGain.gain.setValueAtTime(0.1, dropTime);
            const burstOsc = audioCtx.createOscillator();
            const burstGain = audioCtx.createGain();
            burstOsc.type = 'sine';
            burstOsc.frequency.setValueAtTime(50, dropTime);
            burstGain.gain.setValueAtTime(0.25, dropTime);
            burstGain.gain.exponentialRampToValueAtTime(0.001, dropTime + 0.06);
            burstOsc.connect(burstGain).connect(convolver).connect(reverbGain).connect(master);
            burstOsc.start(dropTime);
            burstOsc.stop(dropTime + 0.08);
        }
    }
    // ========== END CINEMATIC SFX ENGINE ==========

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
        sfxLogoAppear();

        // Phase 2: Spotlight text from About Me (cycle one at a time)
        await wait(800);

        for (let i = 0; i < textLines.length; i++) {
            // Hide previous text line
            if (i > 0) hideLine(textLines[i - 1]);
            await wait(i > 0 ? 300 : 0);
            showLine(textLines[i]);
            sfxTextReveal(i);
            await wait(600);
        }

        // Phase 3: Marquee text (cycle one at a time, replacing spotlight)
        hideLine(textLines[textLines.length - 1]);
        await wait(300);

        for (let i = 0; i < marqueeLines.length; i++) {
            if (i > 0) hideLine(marqueeLines[i - 1]);
            await wait(i > 0 ? 300 : 0);
            showLine(marqueeLines[i]);
            sfxMarqueeReveal(i);
            await wait(550);
        }

        // Phase 4: Exit - fade everything, then curtain split
        await wait(300);
        splash.classList.add('exit');
        sfxCurtainExit();

        // Wait for curtain animation to complete
        await wait(900);

        // Cleanup
        splash.classList.add('done');
        document.body.classList.remove('splash-active');

        // Close audio context after splash is done
        if (audioCtx && audioCtx.state !== 'closed') {
            setTimeout(() => {
                audioCtx.close().catch(() => {});
            }, 1000);
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

            setTimeout(() => ctx.close().catch(() => {}), 500);
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
