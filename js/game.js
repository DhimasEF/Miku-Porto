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
        this.songDuration = 78;
        this.trackAudio = document.getElementById('bgm-audio');
        this.trackStartTime = 162; // 2:42 excerpt start
        this.noteSpeed = 650;
        this.noteTravelTime = 0;
        this.chartIndex = 0;
        this.chart = [];
        this.chartReady = window.osuArcadeChartReady;
        this.trackExcerptEnded = false;
        this.audioStarted = false;
        this.audioStartPending = false;
        this.pressedLanes = new Set();
        this.activeHolds = [];
        this.elapsedTime = 0;
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
            if (e.repeat) return;
            const key = e.key.toLowerCase();
            const laneIndex = this.lanes.findIndex(l => l.key === key);
            if (laneIndex !== -1) {
                e.preventDefault();
                this.pressedLanes.add(laneIndex);
                this.hitLane(laneIndex);
            }
        });

        window.addEventListener('keyup', (e) => {
            const laneIndex = this.lanes.findIndex(lane => lane.key === e.key.toLowerCase());
            if (laneIndex !== -1) {
                this.pressedLanes.delete(laneIndex);
                this.breakReleasedHolds(laneIndex);
            }
        });
        window.addEventListener('blur', () => this.pressedLanes.clear());

        // Touch/Click triggers for on-screen buttons
        const triggerBtns = document.querySelectorAll('.game-key-btn');
        triggerBtns.forEach((btn, idx) => {
            const handlePress = (e) => {
                e.preventDefault();
                if (this.isPlaying) {
                    this.hitLane(idx);
                }
            };
            btn.addEventListener('pointerdown', (e) => {
                this.pressedLanes.add(idx);
                try { btn.setPointerCapture(e.pointerId); } catch (error) { /* Ignore unsupported capture. */ }
                handlePress(e);
            });
            const release = () => {
                this.pressedLanes.delete(idx);
                this.breakReleasedHolds(idx);
            };
            btn.addEventListener('pointerup', release);
            btn.addEventListener('pointercancel', release);
            btn.addEventListener('lostpointercapture', release);
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

    async startGame() {
        if (this.isPlaying) return;
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.innerText = 'LOADING BEATMAP...';
        }
        try {
            if (!this.chartReady || typeof this.chartReady.then !== 'function') {
                throw new Error('Beatmap loader did not initialize. Check that js/osu-chart.js loads before js/game.js.');
            }
            this.chart = this.buildChart(await this.chartReady);
            if (this.chart.length === 0) throw new Error('The beatmap loaded but has no notes in 162000–240000 ms.');
        } catch (error) {
            console.error('DIVA beatmap could not be loaded:', error);
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.innerText = 'CHART LOAD ERROR';
                startBtn.title = error instanceof Error ? error.message : String(error);
            }
            this.showRating('CHART ERROR', '#ff4d6d');
            return;
        }
        if (startBtn) startBtn.disabled = false;
        this.isPlaying = true;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.elapsedTime = 0;
        this.chartIndex = 0;
        this.trackExcerptEnded = false;
        this.audioStarted = false;
        this.audioStartPending = false;
        this.notes = [];
        this.activeHolds = [];
        this.pressedLanes.clear();
        this.updateHUD();

        if (this.trackEl) {
            // clear old note DOMs
            const oldNotes = this.trackEl.querySelectorAll('.rhythm-note');
            oldNotes.forEach(n => n.remove());
        }

        if (startBtn) startBtn.style.display = 'none';

        if (this.trackAudio) {
            this.trackAudio.loop = false;
            if (this.trackAudio.readyState < 1) {
                await new Promise(resolve => {
                    this.trackAudio.addEventListener('loadedmetadata', resolve, { once: true });
                    this.trackAudio.addEventListener('error', resolve, { once: true });
                    this.trackAudio.load();
                });
            }
            if (this.trackAudio.error || !Number.isFinite(this.trackAudio.duration)) {
                this.isPlaying = false;
                if (startBtn) {
                    startBtn.style.display = 'inline-flex';
                    startBtn.disabled = false;
                    startBtn.innerText = 'AUDIO LOAD ERROR';
                    startBtn.title = 'Could not load assets/greenlight.mp3';
                }
                this.showRating('AUDIO ERROR', '#ff4d6d');
                return;
            }
            if (this.trackAudio.duration < this.trackStartTime + this.songDuration) {
                this.isPlaying = false;
                if (startBtn) {
                    startBtn.style.display = 'inline-flex';
                    startBtn.disabled = false;
                    startBtn.innerText = 'AUDIO TOO SHORT';
                    startBtn.title = `The audio is ${this.trackAudio.duration.toFixed(2)}s; the requested excerpt ends at 240s.`;
                }
                this.showRating('AUDIO TOO SHORT', '#ff4d6d');
                return;
            }

            this.trackAudio.pause();
            try {
                await this.seekTrackAudio(this.trackStartTime);
            } catch (error) {
                this.isPlaying = false;
                if (startBtn) {
                    startBtn.style.display = 'inline-flex';
                    startBtn.disabled = false;
                    startBtn.innerText = 'AUDIO SEEK ERROR';
                    startBtn.title = error instanceof Error ? error.message : String(error);
                }
                this.showRating('AUDIO SEEK ERROR', '#ff4d6d');
                return;
            }
            // Match note lead-in to the visible lane height so notes enter at
            // the top edge and travel across the full playfield before impact.
            const trackHeight = this.trackEl ? this.trackEl.clientHeight : 360;
            const targetY = trackHeight - 52;
            this.noteTravelTime = (targetY + 17) / this.noteSpeed;
            // Show the first in-range notes before the excerpt starts without
            // shifting the original beatmap timestamps or audio start.
            this.elapsedTime = -this.noteTravelTime;
        }

        if (window.cyberAudio) window.cyberAudio.ensureContext();

        const beginGameLoop = () => {
            if (!this.isPlaying) return;
            let lastTime = performance.now();
            const loop = (currentTime) => {
                if (!this.isPlaying) return;
                const delta = (currentTime - lastTime) / 1000;
                lastTime = currentTime;
                this.update(delta);
                this.gameLoopId = requestAnimationFrame(loop);
            };
            this.gameLoopId = requestAnimationFrame(loop);
        };

        this.setArcadePerformanceMode(true);
        beginGameLoop();
    }

    startExcerptPlayback() {
        if (this.audioStartPending || this.audioStarted) return;
        this.audioStartPending = true;
        const playback = this.trackAudio && !(window.cyberAudio && window.cyberAudio.isMuted)
            ? this.trackAudio.play()
            : Promise.resolve();
        Promise.resolve(playback).then(() => {
            this.audioStartPending = false;
            this.audioStarted = true;
            if (this.trackAudio && !this.trackAudio.paused && window.cyberAudio) {
                window.cyberAudio.setBGMPlaying(true);
            }
        }).catch(error => {
            console.error('DIVA excerpt audio could not be played:', error);
            this.isPlaying = false;
            if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);
            this.trackAudio?.pause();
            if (window.cyberAudio) window.cyberAudio.setBGMPlaying(false);
            this.setArcadePerformanceMode(false);
            const startBtn = document.getElementById('start-game-btn');
            if (startBtn) {
                startBtn.style.display = 'inline-flex';
                startBtn.disabled = false;
                startBtn.innerText = 'AUDIO PLAY ERROR';
                startBtn.title = error instanceof Error ? error.message : String(error);
            }
        });
    }

    async seekTrackAudio(seconds) {
        const audio = this.trackAudio;
        if (Math.abs(audio.currentTime - seconds) < 0.02 && !audio.seeking) return;

        await new Promise(resolve => {
            let timeoutId;
            const finish = () => {
                clearTimeout(timeoutId);
                audio.removeEventListener('seeked', finish);
                audio.removeEventListener('error', finish);
                resolve();
            };
            audio.addEventListener('seeked', finish, { once: true });
            audio.addEventListener('error', finish, { once: true });
            timeoutId = setTimeout(finish, 2000);
            audio.currentTime = seconds;
            if (!audio.seeking && Math.abs(audio.currentTime - seconds) < 0.02) finish();
        });
        if (audio.error) {
            throw new Error(`greenlight.mp3 media error ${audio.error.code}: ${audio.error.message || 'unknown media error'}`);
        }
        if (Math.abs(audio.currentTime - seconds) > 1) {
            throw new Error(`Seek ended at ${audio.currentTime.toFixed(3)}s instead of ${seconds}s.`);
        }
    }

    setArcadePerformanceMode(active) {
        if (window.cyberBg) {
            if (active) window.cyberBg.pauseForArcade();
            else window.cyberBg.resumeAfterArcade();
        }
        if (window.digitalWorld) {
            if (active) window.digitalWorld.pauseForArcade();
            else window.digitalWorld.resumeAfterArcade();
        }
    }

    buildChart(sourceNotes) {
        return sourceNotes.map(note => ({
            sourceTimeMs: note.sourceTimeMs,
            hitTime: (note.sourceTimeMs - 162000) / 1000,
            lane: note.lane,
            holdDuration: (note.endTimeMs - note.sourceTimeMs) / 1000,
            endTime: (note.endTimeMs - 162000) / 1000
        }));
    }

    update(delta) {
        if (!this.audioStarted) {
            if (!this.audioStartPending) {
                this.elapsedTime = Math.min(0, this.elapsedTime + delta);
                if (this.elapsedTime >= 0) this.startExcerptPlayback();
            }
        } else if (this.trackAudio && !this.trackAudio.paused && !this.trackExcerptEnded) {
            this.elapsedTime = Math.max(0, this.trackAudio.currentTime - this.trackStartTime);
        } else {
            this.elapsedTime += delta;
        }

        // Update progress bar
        const progress = Math.max(0, Math.min((this.elapsedTime / this.songDuration) * 100, 100));
        if (this.progressBar) this.progressBar.style.width = `${progress}%`;
        if (this.elapsedTime >= this.songDuration && !this.trackExcerptEnded) {
            this.trackExcerptEnded = true;
            if (this.trackAudio && !this.trackAudio.paused) {
                if (window.cyberAudio) window.cyberAudio.stopBGM();
                this.trackAudio.pause();
            }
        }

        // Chart notes stay aligned to the selected 2:42–4:00 track excerpt.
        while (this.chartIndex < this.chart.length) {
            const event = this.chart[this.chartIndex];
            if (event.hitTime - this.noteTravelTime > this.elapsedTime) break;
            this.chartIndex++;
            if (event.hitTime <= this.songDuration) {
                this.spawnNote(event.lane, event.holdDuration, event.hitTime, event.endTime, event.sourceTimeMs);
            }
        }

        // Update notes position
        const trackHeight = this.trackEl ? this.trackEl.clientHeight : 320;
        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];
            note.y = trackHeight - 52 - this.noteSpeed * (note.hitTime - this.elapsedTime);

            if (note.element) {
                note.element.style.transform = `translate3d(0, ${note.y}px, 0)`;
            }

            // Allow the full GOOD timing window before marking a note missed.
            if (this.elapsedTime > note.hitTime + 0.15 && !note.hit) {
                this.registerHit('MISS', note);
                if (note.element) note.element.remove();
                this.notes.splice(i, 1);
            }
        }

        for (let i = this.activeHolds.length - 1; i >= 0; i--) {
            const hold = this.activeHolds[i];
            if (this.elapsedTime < hold.endTime) continue;
            const held = this.pressedLanes.has(hold.lane) && !hold.broken;
            this.registerHit(held ? 'PERFECT' : 'MISS', hold);
            if (hold.element) {
                hold.element.classList.add(held ? 'hold-complete' : 'hold-broken');
                setTimeout(() => hold.element?.remove(), 180);
            }
            this.activeHolds.splice(i, 1);
        }

        // End condition
        if (this.elapsedTime >= this.songDuration && this.notes.length === 0 && this.activeHolds.length === 0) {
            this.endGame();
        }
    }

    breakReleasedHolds(laneIndex) {
        for (const hold of this.activeHolds) {
            if (hold.lane === laneIndex && this.elapsedTime < hold.endTime) hold.broken = true;
        }
    }

    spawnNote(laneIndex, holdDuration = 0, hitTime = 0, endTime = hitTime, sourceTimeMs = 0) {
        if (!this.trackEl) return;
        const lane = this.lanes[laneIndex];

        const noteEl = document.createElement('div');
        noteEl.className = `rhythm-note lane-${laneIndex}`;
        if (holdDuration > 0) {
            noteEl.classList.add('hold-note');
            noteEl.style.setProperty('--hold-length', `${this.noteSpeed * holdDuration}px`);
        }
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
            holdDuration,
            hitTime,
            endTime,
            sourceTimeMs,
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

        // Notes may scroll during the visual pre-roll, but scoring begins with
        // the excerpt and remains anchored to its original object timestamps.
        if (this.elapsedTime < 0 || !this.audioStarted) return;

        // Judge against original chart time, independent of visual position.
        const inputTime = this.elapsedTime;
        let bestNote = null;
        let minDiff = Infinity;

        for (const note of this.notes) {
            if (note.lane === laneIndex && !note.hit) {
                const diff = Math.abs((inputTime - note.hitTime) * 1000);
                if (diff < minDiff && diff <= 150) {
                    minDiff = diff;
                    bestNote = note;
                }
            }
        }

        if (bestNote) {
            bestNote.hit = true;
            let rating = 'GOOD';
            if (minDiff <= 50) rating = 'PERFECT';
            else if (minDiff <= 100) rating = 'GREAT';

            this.registerHit(rating, bestNote);
            if (bestNote.holdDuration > 0) {
                bestNote.element.classList.add('hold-pressed');
                this.activeHolds.push({
                    lane: bestNote.lane,
                    endTime: bestNote.endTime,
                    element: bestNote.element,
                    broken: false
                });
            } else {
                bestNote.element.classList.add('hit-sparkle');
            }
            setTimeout(() => {
                if (bestNote.element && bestNote.holdDuration <= 0) bestNote.element.remove();
            }, 140);

            const index = this.notes.indexOf(bestNote);
            if (index > -1) this.notes.splice(index, 1);
        } else {
            this.registerHit('MISS', null);
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
            if (rating === 'GREAT') {
                pts = 140;
                color = '#ff78b8';
            } else if (rating === 'GOOD') {
                pts = 90;
                color = '#f5e050';
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
        this.setArcadePerformanceMode(false);
        if (window.cyberAudio) window.cyberAudio.stopBGM();
        this.trackAudio?.pause();
        if (this.trackAudio) this.trackAudio.loop = true;

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
