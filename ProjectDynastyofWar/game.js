// Dynasty of War — 2D AdventureQuest Worlds RPG Engine
// Built with vanilla JS and Web Audio API synthesizer

/* --- Web Audio API Sound Synthesizer --- */
class SoundFX {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) this.ctx = new AudioContext();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq, type, duration, delay = 0, vol = 0.15) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        setTimeout(() => {
            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                
                gain.gain.setValueAtTime(vol, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (e) {
                console.error("Audio playback error:", e);
            }
        }, delay);
    }

    slash() {
        this.playTone(300, 'sawtooth', 0.15, 0, 0.2);
        this.playTone(150, 'square', 0.2, 50, 0.15);
    }

    block() {
        this.playTone(800, 'triangle', 0.1, 0, 0.25);
        this.playTone(1200, 'sine', 0.15, 30, 0.15);
    }

    buff() {
        this.playTone(400, 'sine', 0.15, 0, 0.15);
        this.playTone(600, 'sine', 0.15, 100, 0.15);
        this.playTone(800, 'triangle', 0.25, 200, 0.2);
    }

    heal() {
        this.playTone(523.25, 'sine', 0.2, 0, 0.2);
        this.playTone(659.25, 'sine', 0.2, 120, 0.2);
        this.playTone(783.99, 'sine', 0.35, 240, 0.2);
    }

    win() {
        this.playTone(523.25, 'triangle', 0.2, 0, 0.2);
        this.playTone(659.25, 'triangle', 0.2, 150, 0.2);
        this.playTone(783.99, 'triangle', 0.2, 300, 0.2);
        this.playTone(1046.50, 'sawtooth', 0.5, 450, 0.25);
    }

    lose() {
        this.playTone(300, 'sawtooth', 0.25, 0, 0.2);
        this.playTone(260, 'sawtooth', 0.25, 200, 0.2);
        this.playTone(200, 'sawtooth', 0.5, 400, 0.25);
    }
}

const sfx = new SoundFX();

/* --- Game State & Engine --- */
const gameState = {
    player: { class: 'Holy Knight', img: 'assets/knight.png', hp: 25, maxHp: 25, atk: 5, def: 4 },
    enemy: { class: 'Ogre Berserker', img: 'assets/ogre.png', hp: 30, maxHp: 30, atk: 6, def: 3 },
    isBusy: false,
    turnsCount: 0
};

// UI Elements
const screenSelect = document.getElementById('select-screen');
const screenBattle = document.getElementById('battle-screen');
const screenResult = document.getElementById('result-screen');
const battleLog = document.getElementById('battle-log');
const soundToggleBtn = document.getElementById('btn-sound-toggle');

// Keyboard support
window.addEventListener('keydown', (e) => {
    if (!screenBattle.classList.contains('active') || gameState.isBusy) return;
    if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const btn = document.querySelector(`.skill-btn[data-action="${e.key}"]`);
        if (btn && !btn.disabled) btn.click();
    }
});

// Sound Toggle
if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
        sfx.muted = !sfx.muted;
        soundToggleBtn.classList.toggle('muted', sfx.muted);
        soundToggleBtn.innerHTML = sfx.muted ? '<i class="ph-bold ph-speaker-slash"></i>' : '<i class="ph-bold ph-speaker-high"></i>';
    });
}

function showScreen(targetScreen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    targetScreen.classList.add('active');
}

function logMessage(text) {
    if (!battleLog) return;
    battleLog.style.opacity = '0';
    setTimeout(() => {
        battleLog.textContent = text;
        battleLog.style.opacity = '1';
    }, 150);
}

// Class Selection
document.querySelectorAll('.class-card').forEach(card => {
    card.addEventListener('click', () => {
        sfx.init();
        sfx.buff();

        const cls = card.getAttribute('data-class');
        const img = card.getAttribute('data-img');
        const hp = parseInt(card.getAttribute('data-hp'));
        const atk = parseInt(card.getAttribute('data-atk'));
        const def = parseInt(card.getAttribute('data-def'));

        gameState.player = { class: card.querySelector('h3').textContent, img: img, hp: hp, maxHp: hp, atk: atk, def: def };
        gameState.enemy = { class: 'Ogre Berserker', img: 'assets/ogre.png', hp: 30, maxHp: 30, atk: 6, def: 3 };
        gameState.turnsCount = 0;

        // Initialize HUD
        document.getElementById('hud-player-name').textContent = gameState.player.class;
        document.getElementById('hud-player-img').src = gameState.player.img;
        document.getElementById('player-sprite-img').src = gameState.player.img;

        document.getElementById('hud-enemy-name').textContent = gameState.enemy.class;
        document.getElementById('hud-enemy-img').src = gameState.enemy.img;
        document.getElementById('enemy-sprite-img').src = gameState.enemy.img;

        updateHUD();
        setButtonsDisabled(false);
        logMessage(`Match Started: ${gameState.player.class} VS ${gameState.enemy.class}! Prepare your turn.`);
        showScreen(screenBattle);
    });
});

function updateHUD() {
    // Player HUD
    document.getElementById('hud-player-hp-txt').textContent = `${Math.max(0, gameState.player.hp)} / ${gameState.player.maxHp}`;
    document.getElementById('hud-player-atk').textContent = gameState.player.atk;
    document.getElementById('hud-player-def').textContent = gameState.player.def;
    const pPct = Math.max(0, Math.min(100, (gameState.player.hp / gameState.player.maxHp) * 100));
    document.getElementById('hud-player-hp-bar').style.width = `${pPct}%`;

    // Enemy HUD
    document.getElementById('hud-enemy-hp-txt').textContent = `${Math.max(0, gameState.enemy.hp)} / ${gameState.enemy.maxHp}`;
    document.getElementById('hud-enemy-atk').textContent = gameState.enemy.atk;
    document.getElementById('hud-enemy-def').textContent = gameState.enemy.def;
    const ePct = Math.max(0, Math.min(100, (gameState.enemy.hp / gameState.enemy.maxHp) * 100));
    document.getElementById('hud-enemy-hp-bar').style.width = `${ePct}%`;
}

/* --- Visual FX & Floating Text Generator --- */
function spawnFloatingText(text, type, isPlayerTarget = false) {
    const layer = document.getElementById('floating-text-layer');
    if (!layer) return;

    const el = document.createElement('div');
    el.className = `floating-num num-${type}`;
    el.textContent = text;

    // Position based on target box
    const targetBox = document.getElementById(isPlayerTarget ? 'player-sprite-box' : 'enemy-sprite-box');
    if (targetBox) {
        const rect = targetBox.getBoundingClientRect();
        const stageRect = layer.getBoundingClientRect();
        const left = rect.left - stageRect.left + (rect.width / 2) + (Math.random() * 40 - 20);
        const top = rect.top - stageRect.top + (rect.height / 3);
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
    }

    layer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function spawnVisualEffect(effectClass, isPlayerTarget = false) {
    const container = document.getElementById(isPlayerTarget ? 'player-visual-effect' : 'enemy-visual-effect');
    if (!container) return;

    const el = document.createElement('div');
    el.className = effectClass;
    container.appendChild(el);
    setTimeout(() => el.remove(), 600);
}

function triggerAnim(elementId, animClass, duration = 500) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.classList.add(animClass);
    setTimeout(() => el.classList.remove(animClass), duration);
}

/* --- Combat Execution --- */
document.querySelectorAll('.skill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (gameState.isBusy) return;
        const pAction = parseInt(btn.getAttribute('data-action'));
        const cAction = Math.floor(Math.random() * 5) + 1; // Enemy AI random 1-5
        executeTurn(pAction, cAction);
    });
});

function setButtonsDisabled(disabled) {
    gameState.isBusy = disabled;
    document.querySelectorAll('.skill-btn').forEach(btn => btn.disabled = disabled);
}

function executeTurn(pAction, cAction) {
    setButtonsDisabled(true);
    gameState.turnsCount++;
    const actionNames = { 1: "Attack", 2: "Defend", 3: "Atk Up", 4: "Def Up", 5: "Heal" };

    logMessage(`Turn ${gameState.turnsCount}: You chose [${actionNames[pAction]}], Boss chose [${actionNames[cAction]}]`);

    // Step 1: Player Action (0 ms)
    setTimeout(() => {
        performAction(pAction, cAction, true);
        updateHUD();
    }, 100);

    // Step 2: Enemy Action (700 ms)
    setTimeout(() => {
        if (gameState.enemy.hp > 0) {
            performAction(cAction, pAction, false);
            updateHUD();
        }
    }, 800);

    // Step 3: Resolution & Unlock (1500 ms)
    setTimeout(() => {
        checkGameOver();
        if (gameState.player.hp > 0 && gameState.enemy.hp > 0) {
            setButtonsDisabled(false);
        }
    }, 1600);
}

function performAction(actorAction, opponentAction, isPlayer) {
    const actor = isPlayer ? gameState.player : gameState.enemy;
    const opponent = isPlayer ? gameState.enemy : gameState.player;
    const actorBoxId = isPlayer ? 'player-sprite-box' : 'enemy-sprite-box';
    const opponentBoxId = isPlayer ? 'enemy-sprite-box' : 'player-sprite-box';

    if (actorAction === 1) { // Attack
        triggerAnim(actorBoxId, 'attacking', 500);

        setTimeout(() => {
            if (opponentAction === 2) { // Opponent Defended
                sfx.block();
                spawnVisualEffect('shield-fx', !isPlayer);
                if (actor.atk <= opponent.def) {
                    spawnFloatingText("BLOCKED!", "block", !isPlayer);
                    logMessage(`${isPlayer ? 'Boss' : 'You'} completely blocked the incoming strike!`);
                } else {
                    const pierceDmg = actor.atk - opponent.def;
                    opponent.hp -= pierceDmg;
                    triggerAnim(opponentBoxId, 'hit', 400);
                    spawnVisualEffect('slash-fx', !isPlayer);
                    spawnFloatingText(`-${pierceDmg}`, "dmg", !isPlayer);
                    logMessage(`${isPlayer ? 'You' : 'Boss'} pierced defense for ${pierceDmg} DMG!`);
                }
            } else { // Normal Hit
                sfx.slash();
                const isCrit = Math.random() < 0.25;
                const finalDmg = isCrit ? Math.round(actor.atk * 1.5) : actor.atk;
                opponent.hp -= finalDmg;
                triggerAnim(opponentBoxId, 'hit', 400);
                spawnVisualEffect('slash-fx', !isPlayer);
                spawnFloatingText(isCrit ? `CRIT -${finalDmg}` : `-${finalDmg}`, isCrit ? "crit" : "dmg", !isPlayer);
            }
        }, 250);

    } else if (actorAction === 2) { // Defend
        sfx.block();
        spawnVisualEffect('shield-fx', isPlayer);
        spawnFloatingText("SHIELD UP", "block", isPlayer);

    } else if (actorAction === 3) { // Atk Up
        sfx.buff();
        const boost = Math.floor(Math.random() * 3) + 2; // +2 to +4
        actor.atk += boost;
        spawnVisualEffect('shield-fx', isPlayer);
        spawnFloatingText(`+${boost} ATK`, "buff", isPlayer);
        logMessage(`${isPlayer ? 'Your' : "Boss's"} Attack power surged to ${actor.atk}!`);

    } else if (actorAction === 4) { // Def Up
        sfx.buff();
        const boost = Math.floor(Math.random() * 3) + 2;
        actor.def += boost;
        spawnVisualEffect('shield-fx', isPlayer);
        spawnFloatingText(`+${boost} DEF`, "buff", isPlayer);
        logMessage(`${isPlayer ? 'Your' : "Boss's"} Defense fortified to ${actor.def}!`);

    } else if (actorAction === 5) { // Heal
        sfx.heal();
        const missing = actor.maxHp - actor.hp + 2;
        const healAmt = Math.min(actor.maxHp - actor.hp, Math.floor(Math.random() * Math.min(missing, 10)) + 4);
        actor.hp = Math.min(actor.maxHp, actor.hp + healAmt);
        spawnVisualEffect('heal-fx', isPlayer);
        spawnFloatingText(`+${healAmt} HP`, "heal", isPlayer);
        logMessage(`${isPlayer ? 'You' : 'Boss'} restored ${healAmt} health points!`);
    }
}

function checkGameOver() {
    if (gameState.player.hp <= 0 || gameState.enemy.hp <= 0) {
        setButtonsDisabled(true);
        const isWin = gameState.player.hp > 0;
        logMessage(isWin ? "💥 Boss HP reached 0! Victory imminent..." : "💀 Your HP reached 0! You have fallen...");
        
        setTimeout(() => {
            if (isWin) sfx.win(); else sfx.lose();

            document.getElementById('result-icon-box').textContent = isWin ? "🏆" : "💀";
            document.getElementById('result-title').textContent = isWin ? "VICTORY!" : "DEFEATED!";
            document.getElementById('result-title').style.color = isWin ? "#f59e0b" : "#ef4444";
            document.getElementById('result-message').textContent = isWin 
                ? `Incredible tactics! You crushed the ${gameState.enemy.class} in ${gameState.turnsCount} turns!`
                : `The ${gameState.enemy.class} overwhelmed your defenses after ${gameState.turnsCount} turns. Rise again, warrior!`;
            
            document.getElementById('result-stats').innerHTML = `
                <div><span>Turns:</span> <b>${gameState.turnsCount}</b></div>
                <div><span>Final HP:</span> <b>${Math.max(0, gameState.player.hp)}/${gameState.player.maxHp}</b></div>
                <div><span>ATK/DEF:</span> <b>${gameState.player.atk}/${gameState.player.def}</b></div>
            `;
            showScreen(screenResult);
        }, 2000);
    }
}

// Play Again Button
document.getElementById('btn-play-again').addEventListener('click', () => {
    sfx.buff();
    gameState.isBusy = false;
    showScreen(screenSelect);
});
