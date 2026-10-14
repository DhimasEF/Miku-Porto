/**
 * ATMOSPHERIC CYBER PARTICLE BACKGROUND
 * Preserved from original codebase and enhanced for smooth, lightweight ambient depth.
 * A restrained teal, violet, pink, and blue palette with a sparse constellation mesh.
 */

class CyberBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.notes = [];
        this.isPaused = false;
        this.arcadePaused = false;
        this.animationFrameId = null;
        this.mouse = { x: -1000, y: -1000, parallaxX: 0, parallaxY: 0 };
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.frame = 0;
        this.themeColors = {
            primary: '#39E6D0',
            secondary: '#5CE1E6',
            accent: '#9B82FF',
            pink: '#F47AB8',
            blue: '#77B9FF',
            line: 'rgba(119, 185, 255, 0.08)'
        };
        this.particlePalette = [this.themeColors.primary, this.themeColors.secondary, this.themeColors.accent, this.themeColors.pink, this.themeColors.blue];

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            // Parallax offset for atmospheric depth (0.15x)
            this.mouse.parallaxX = (e.clientX / window.innerWidth - 0.5) * 20;
            this.mouse.parallaxY = (e.clientY / window.innerHeight - 0.5) * 20;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }
        }, { passive: true });

        window.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
            this.mouse.parallaxX = 0;
            this.mouse.parallaxY = 0;
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) this.pauseAnimation();
            else if (!this.arcadePaused && this.isPaused) {
                this.isPaused = false;
                this.animate();
            }
        });

        // Listen for reduced motion changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.reducedMotion = e.matches;
        });

        this.createParticles();
        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        const scale = Math.min(window.devicePixelRatio || 1, 1.5);
        this.canvas.width = Math.round(this.width * scale);
        this.canvas.height = Math.round(this.height * scale);
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.setTransform(scale, 0, 0, scale, 0, 0);
    }

    createParticles() {
        // Optimal lightweight count: not overcrowded, soft atmospheric depth
        const count = Math.min(Math.floor((this.width * this.height) / 24000), 54);
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                radius: Math.random() * 1.8 + 0.9,
                color: Math.random() < 0.58 ? this.themeColors.primary : this.particlePalette[Math.floor(Math.random() * this.particlePalette.length)],
                alpha: Math.random() * 0.2 + 0.1,
                pulseSpeed: Math.random() * 0.02 + 0.008,
                pulse: Math.random() * Math.PI
            });
        }

        // Floating subtle cyber musical glyphs (♪, ♫, 01, 39, ✦)
        const noteSymbols = ['♪', '♫', '01', '39', '✦', '✧'];
        this.notes = [];
        const noteCount = Math.min(Math.floor(this.width / 270), 7);
        for (let i = 0; i < noteCount; i++) {
            this.notes.push({
                symbol: noteSymbols[Math.floor(Math.random() * noteSymbols.length)],
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vy: -(Math.random() * 0.25 + 0.12),
                vx: (Math.random() - 0.5) * 0.1,
                size: Math.random() * 4 + 9,
                alpha: Math.random() * 0.18 + 0.07,
                color: this.particlePalette[Math.floor(Math.random() * this.particlePalette.length)],
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.015
            });
        }
    }

    createBurst(x, y) {
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            const speed = Math.random() * 2 + 1.5;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 2 + 1,
                color: this.particlePalette[Math.floor(Math.random() * this.particlePalette.length)],
                alpha: 0.8,
                isBurst: true,
                life: 1
            });
        }
    }

    animate() {
        if (document.hidden || this.isPaused) return;
        this.animationFrameId = requestAnimationFrame(() => {
            this.animationFrameId = null;
            this.animate();
        });
        this.frame++;

        this.ctx.clearRect(0, 0, this.width, this.height);

        // A sparse constellation mesh adds depth without turning the background into a grid.
        this.ctx.save();
        this.ctx.lineWidth = 0.7;
        for (let i = 0; i < this.particles.length; i++) {
            const a = this.particles[i];
            if (a.isBurst) continue;
            for (let j = i + 1; j < this.particles.length; j++) {
                const b = this.particles[j];
                if (b.isBurst) continue;
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const distance = Math.hypot(dx, dy);
                if (distance > 138) continue;
                this.ctx.beginPath();
                this.ctx.moveTo(a.x, a.y);
                this.ctx.lineTo(b.x, b.y);
                this.ctx.strokeStyle = a.color;
                this.ctx.globalAlpha = (1 - distance / 138) * 0.12;
                this.ctx.stroke();
            }
        }
        this.ctx.restore();

        // Render ambient floating particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            if (!this.reducedMotion) {
                p.x += p.vx;
                p.y += p.vy;
            }

            if (p.isBurst) {
                p.alpha -= 0.02;
                p.radius *= 0.97;
                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }
            } else {
                p.pulse += p.pulseSpeed;
                const dynamicAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

                // Screen bounds loop
                if (p.x < 0) p.x = this.width;
                if (p.x > this.width) p.x = 0;
                if (p.y < 0) p.y = this.height;
                if (p.y > this.height) p.y = 0;

                // Subtle mouse parallax shift (Layer 2 - 0.15x)
                const renderX = p.x - (this.reducedMotion ? 0 : this.mouse.parallaxX);
                const renderY = p.y - (this.reducedMotion ? 0 : this.mouse.parallaxY);

                // Render particle with soft cyan glow
                this.ctx.beginPath();
                this.ctx.arc(renderX, renderY, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = dynamicAlpha;
                this.ctx.shadowBlur = 9 + p.radius * 2;
                this.ctx.shadowColor = p.color;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
                this.ctx.globalAlpha = 1;
            }
        }

        // Render subtle floating musical glyphs
        if (!this.reducedMotion) {
            this.ctx.save();
            for (let n of this.notes) {
                n.y += n.vy;
                n.x += n.vx;
                n.rotation += n.rotSpeed;

                if (n.y < -20) {
                    n.y = this.height + 20;
                    n.x = Math.random() * this.width;
                }

                const renderX = n.x - this.mouse.parallaxX * 0.8;
                const renderY = n.y - this.mouse.parallaxY * 0.8;

                this.ctx.save();
                this.ctx.translate(renderX, renderY);
                this.ctx.rotate(n.rotation);
                this.ctx.font = `500 ${n.size}px 'Space Grotesk', monospace`;
                this.ctx.fillStyle = n.color;
                this.ctx.globalAlpha = n.alpha;
                this.ctx.fillText(n.symbol, -n.size / 2, n.size / 2);
                this.ctx.restore();
            }
            this.ctx.restore();
        }
    }

    pauseForArcade() {
        this.arcadePaused = true;
        this.isPaused = true;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    resumeAfterArcade() {
        this.arcadePaused = false;
        if (document.hidden) return;
        this.isPaused = false;
        this.animate();
    }

    pauseAnimation() {
        this.isPaused = true;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cyberBg = new CyberBackground('bg-canvas');
});
