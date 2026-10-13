/**
 * ATMOSPHERIC CYBER PARTICLE BACKGROUND
 * Preserved from original codebase and enhanced for smooth, lightweight ambient depth.
 * Subtle Hatsune Miku turquoise glow (#39E6D0, #5CE1E6, #8FFFF5).
 */

class CyberBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.notes = [];
        this.mouse = { x: -1000, y: -1000, parallaxX: 0, parallaxY: 0 };
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.frame = 0;
        this.themeColors = {
            primary: '#39E6D0',
            secondary: '#5CE1E6',
            accent: '#8FFFF5',
            line: 'rgba(57, 230, 208, 0.08)'
        };

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
            if (!document.hidden) this.animate();
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
        const count = Math.min(Math.floor((this.width * this.height) / 32000), 38);
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.18,
                vy: (Math.random() - 0.5) * 0.18,
                radius: Math.random() * 1.4 + 0.6,
                color: Math.random() > 0.3 ? this.themeColors.primary : this.themeColors.accent,
                alpha: Math.random() * 0.22 + 0.08,
                pulseSpeed: Math.random() * 0.02 + 0.008,
                pulse: Math.random() * Math.PI
            });
        }

        // Floating subtle cyber musical glyphs (♪, ♫, 01, 39, ✦)
        const noteSymbols = ['♪', '♫', '01', '39', '✦', '✧'];
        this.notes = [];
        const noteCount = Math.min(Math.floor(this.width / 320), 5);
        for (let i = 0; i < noteCount; i++) {
            this.notes.push({
                symbol: noteSymbols[Math.floor(Math.random() * noteSymbols.length)],
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vy: -(Math.random() * 0.25 + 0.12),
                vx: (Math.random() - 0.5) * 0.1,
                size: Math.random() * 4 + 9,
                alpha: Math.random() * 0.18 + 0.07,
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
                color: this.themeColors.accent,
                alpha: 0.8,
                isBurst: true,
                life: 1
            });
        }
    }

    animate() {
        if (document.hidden) return;
        requestAnimationFrame(() => this.animate());
        this.frame++;

        this.ctx.clearRect(0, 0, this.width, this.height);

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
                this.ctx.shadowBlur = 6;
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
                this.ctx.fillStyle = this.themeColors.primary;
                this.ctx.globalAlpha = n.alpha;
                this.ctx.fillText(n.symbol, -n.size / 2, n.size / 2);
                this.ctx.restore();
            }
            this.ctx.restore();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cyberBg = new CyberBackground('bg-canvas');
});
