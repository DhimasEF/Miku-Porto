/**
 * PROJECT DIVA // CYBER BEAT MINI-GAME
 * Rhythm Tap Arcade System inspired by Hatsune Miku: Project DIVA
 */

class ProjectDivaGame {
    constructor() {
        this.container = document.getElementById('diva-game-container');
        this.trackEl = document.getElementById('rhythm-track');
        this.scoreEl = document.getElementById('game-score');
        this.comboEl = document.getElementById('game-combo');
        this.ratingEl = document.getElementById('game-rating');
        this.progressBar = document.getElementById('game-progress-bar');
        this.highScoreEl = document.getElementById('game-highscore');

        this.isPlaying = false;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.highScore = parseInt(localStorage.getItem('miku_diva_highscore') || '0', 10);
        this.notes = [];
        this.gameLoopId = null;
        this.songDuration = 35; // 35 seconds per round
        this.elapsedTime = 0;
        this.noteSpawnTimer = 0;

        this.lanes = [
            { key: 'd', label: 'D', symbol: '▲', color: '#ff2a85', hitPos: 0 },
            { key: 'f', label: 'F', symbol: '■', color: '#39c5bb', hitPos: 1 },
            { key: 'j', label: 'J', symbol: '✕', color: '#00ffee', hitPos: 2 },
            { key: 'k', label: 'K', symbol: '●', color: '#f5e050', hitPos: 3 }
        ];

        this.init();
    }

    init() {
        if (this.highScoreEl) this.highScoreEl.innerText = this.highScore;

        // Key bindings
        window.addEventListener('keydown', (e) => {
            if (!this.isPlaying) return;
            const key = e.key.toLowerCase();
            const laneIndex = this.lanes.findIndex(l => l.key === key);
            if (laneIndex !== -1) {
                e.preventDefault();
                this.hitLane(laneIndex);
            }
        });

        // Touch/Click triggers for on-screen buttons
        const triggerBtns = document.querySelectorAll('.game-key-btn');
        triggerBtns.forEach((btn, idx) => {
            const handlePress = (e) => {
                e.preventDefault();
                if (this.isPlaying) {
                    this.hitLane(idx);
                }
            };
            btn.addEventListener('mousedown', handlePress);
            btn.addEventListener('touchstart', handlePress, { passive: false });
        });

        // Play / Restart button
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (window.cyberAudio) window.cyberAudio.playClick();
                this.startGame();
            });
        }
    }

    startGame() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.elapsedTime = 0;
        this.notes = [];
        this.updateHUD();

        if (this.trackEl) {
            // clear old note DOMs
            const oldNotes = this.trackEl.querySelectorAll('.rhythm-note');
            oldNotes.forEach(n => n.remove());
        }

        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) startBtn.style.display = 'none';

        if (window.cyberAudio) {
            window.cyberAudio.ensureContext();
            window.cyberAudio.startBGM();
        }

        let lastTime = performance.now();
        const loop = (currentTime) => {
            if (!this.isPlaying) return;
            const delta = (currentTime - lastTime) / 1000;
            lastTime = currentTime;

            this.update(delta);
            this.gameLoopId = requestAnimationFrame(loop);
        };

        this.gameLoopId = requestAnimationFrame(loop);
    }

    update(delta) {
        this.elapsedTime += delta;
        this.noteSpawnTimer += delta;

        // Update progress bar
        const progress = Math.min((this.elapsedTime / this.songDuration) * 100, 100);
        if (this.progressBar) this.progressBar.style.width = `${progress}%`;

        // Spawn notes periodically (sync with BPM-like interval ~ 0.55s)
        const spawnInterval = 0.52 - Math.min(this.elapsedTime * 0.004, 0.2);
        if (this.noteSpawnTimer >= spawnInterval && this.elapsedTime < this.songDuration - 2) {
            this.noteSpawnTimer = 0;
            this.spawnNote();
        }

        // Update notes position
        const trackHeight = this.trackEl ? this.trackEl.clientHeight : 320;
        const noteSpeed = 360; // pixels per second

        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];
            note.y += noteSpeed * delta;

            if (note.element) {
                note.element.style.transform = `translateY(${note.y}px)`;
            }

            // Missed note (passed target by 40px)
            const targetY = trackHeight - 65;
            if (note.y > targetY + 40 && !note.hit) {
                this.registerHit('MISS', note);
                if (note.element) note.element.remove();
                this.notes.splice(i, 1);
            }
        }

        // End condition
        if (this.elapsedTime >= this.songDuration && this.notes.length === 0) {
            this.endGame();
        }
    }

    spawnNote() {
        if (!this.trackEl) return;
        const laneIndex = Math.floor(Math.random() * this.lanes.length);
        const lane = this.lanes[laneIndex];

        const noteEl = document.createElement('div');
        noteEl.className = `rhythm-note lane-${laneIndex}`;
        noteEl.style.color = lane.color;
        noteEl.style.borderColor = lane.color;
        noteEl.innerHTML = `<span>${lane.symbol}</span>`;

        // Position in lane column
        const laneCol = this.trackEl.querySelector(`.lane-col[data-lane="${laneIndex}"]`);
        if (laneCol) {
            laneCol.appendChild(noteEl);
        } else {
            this.trackEl.appendChild(noteEl);
        }

        this.notes.push({
            lane: laneIndex,
            y: 0,
            element: noteEl,
            hit: false
        });
    }

    hitLane(laneIndex) {
        // Visual button flare
        const btn = document.querySelectorAll('.game-key-btn')[laneIndex];
        if (btn) {
            btn.classList.add('active-hit');
            setTimeout(() => btn.classList.remove('active-hit'), 120);
        }

        const targetCol = this.trackEl ? this.trackEl.querySelector(`.lane-col[data-lane="${laneIndex}"] .target-receptor`) : null;
        if (targetCol) {
            targetCol.classList.add('pulse-glow');
            setTimeout(() => targetCol.classList.remove('pulse-glow'), 120);
        }

        const trackHeight = this.trackEl ? this.trackEl.clientHeight : 320;
        const targetY = trackHeight - 65;

        // Find nearest note in this lane
        let bestNote = null;
        let minDiff = Infinity;

        for (const note of this.notes) {
            if (note.lane === laneIndex && !note.hit) {
                const diff = Math.abs(note.y - targetY);
                if (diff < minDiff && diff < 85) {
                    minDiff = diff;
                    bestNote = note;
                }
            }
        }

        if (bestNote) {
            bestNote.hit = true;
            let rating = 'GOOD';
            if (minDiff < 22) rating = 'PERFECT';
            else if (minDiff < 45) rating = 'COOL';

            this.registerHit(rating, bestNote);
            bestNote.element.classList.add('hit-sparkle');
            setTimeout(() => {
                if (bestNote.element) bestNote.element.remove();
            }, 100);

            const index = this.notes.indexOf(bestNote);
            if (index > -1) this.notes.splice(index, 1);
        }
    }

    registerHit(rating, note) {
        if (rating === 'MISS') {
            this.combo = 0;
            this.showRating('MISS', '#ff4d6d');
            if (window.cyberAudio) window.cyberAudio.playHit('MISS');
        } else {
            this.combo++;
            if (this.combo > this.maxCombo) this.maxCombo = this.combo;

            let pts = 50;
            let color = '#f5e050';
            if (rating === 'COOL') {
                pts = 100;
                color = '#39c5bb';
            } else if (rating === 'PERFECT') {
                pts = 200;
                color = '#00ffee';
            }

            // Combo multiplier bonus
            const bonus = Math.floor(this.combo / 5) * 15;
            this.score += pts + bonus;

            this.showRating(rating, color);
            if (window.cyberAudio) window.cyberAudio.playHit(rating);
        }

        this.updateHUD();
    }

    showRating(text, color) {
        if (!this.ratingEl) return;
        this.ratingEl.innerText = text;
        this.ratingEl.style.color = color;
        this.ratingEl.style.textShadow = `0 0 16px ${color}`;
        this.ratingEl.classList.remove('rating-pop');
        void this.ratingEl.offsetWidth; // trigger reflow
        this.ratingEl.classList.add('rating-pop');
    }

    updateHUD() {
        if (this.scoreEl) this.scoreEl.innerText = this.score;
        if (this.comboEl) this.comboEl.innerText = `${this.combo}x`;
    }

    endGame() {
        this.isPlaying = false;
        if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('miku_diva_highscore', this.highScore.toString());
            if (this.highScoreEl) this.highScoreEl.innerText = this.highScore;
        }

        // Grant EXP to user's main profile!
        const earnedExp = Math.floor(this.score / 8) + 60;
        if (window.cyberPortfolio) {
            window.cyberPortfolio.addExp(earnedExp, `DIVA BEAT ARCADE (SCORE: ${this.score})`);
        }

        if (window.cyberAudio) {
            window.cyberAudio.playLevelUp();
        }

        // Show game over modal / banner
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.style.display = 'inline-flex';
            startBtn.innerText = 'PLAY AGAIN // RE-SYNC';
        }

        this.showRating(`CLEAR! +${earnedExp} EXP`, '#39c5bb');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.divaGame = new ProjectDivaGame();
});
