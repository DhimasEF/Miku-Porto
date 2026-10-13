/**
 * MAIN PORTFOLIO CONTROLLER
 * Handles data rendering, mode switching, GitHub API, modal drawers, and interactions.
 */

class PortfolioController {
    constructor() {
        this.data = window.PORTFOLIO_DATA || {};
        this.currentMode = localStorage.getItem('portfolio_mode') || 'normal'; // 'normal' | 'explore'

        this.init();
    }

    init() {
        this.renderHero();
        this.renderAbout();
        this.renderSkills();
        this.renderProjects();
        this.renderExperience();
        this.renderGitHub();
        this.renderSocials();
        this.renderContact();

        this.setupNavigation();
        this.setupModeSwitcher();
        this.setupCheckpointListener();
        this.setupProjectModal();
        this.setupAudioControls();
        this.setupContactForm();
        this.setupScrollParallax();
        this.init3DWorld();
        this.setupClock();
    }

    // 1. RENDER HERO
    renderHero() {
        const p = this.data.profile;
        if (!p) return;

        const nameEl = document.getElementById('hero-name');
        const roleEl = document.getElementById('hero-role');
        const bioEl = document.getElementById('hero-bio');
        const statsContainer = document.getElementById('hero-stats-row');

        if (nameEl) nameEl.textContent = p.name;
        if (roleEl) roleEl.textContent = p.title;
        if (bioEl) bioEl.textContent = p.shortDescription || p.bio;

        if (statsContainer && p.stats) {
            statsContainer.innerHTML = p.stats.map(s => `
                <div class="stat-item">
                    <span class="stat-val">${s.value}</span>
                    <span class="stat-lbl">${s.label}</span>
                </div>
            `).join('');
        }
    }

    // 2. RENDER ABOUT
    renderAbout() {
        const p = this.data.profile;
        if (!p) return;

        const aboutName = document.getElementById('about-name');
        const aboutTitle = document.getElementById('about-title');
        const aboutBio = document.getElementById('about-bio');
        const aboutLocation = document.getElementById('about-location');
        const aboutStatus = document.getElementById('about-status');

        if (aboutName) aboutName.textContent = p.name;
        if (aboutTitle) aboutTitle.textContent = p.title;
        if (aboutBio) aboutBio.textContent = p.bio;
        if (aboutLocation) aboutLocation.textContent = p.location;
        if (aboutStatus) aboutStatus.textContent = p.status;
    }

    // 3. RENDER SKILLS
    renderSkills() {
        const container = document.getElementById('skills-grid-container');
        if (!container || !this.data.skills) return;

        container.innerHTML = this.data.skills.map((group, idx) => `
            <div class="skill-category-card" data-idx="${idx}">
                <div class="skill-cat-header">
                    <span class="skill-cat-icon">${group.icon}</span>
                    <div>
                        <h3 class="skill-cat-title">${group.category}</h3>
                        <p class="skill-cat-desc">${group.description}</p>
                    </div>
                </div>
                <div class="skill-items-list">
                    ${group.items.map(item => `
                        <div class="skill-item">
                            <div class="skill-label-row">
                                <span class="skill-name">${item.name}</span>
                                <span class="skill-level">${item.level}</span>
                            </div>
                            <div class="skill-meter-track">
                                <div class="skill-meter-fill" style="width: ${item.pct}%;"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // 4. RENDER PROJECTS
    renderProjects() {
        const grid = document.getElementById('projects-grid');
        const filterContainer = document.getElementById('project-filter-buttons');
        if (!grid || !this.data.projects) return;

        // Render Cards
        grid.innerHTML = this.data.projects.map(proj => `
            <article class="project-card" data-category="${proj.category}" id="card-${proj.id}">
                <div class="proj-preview-wrap">
                    <img src="${proj.image}" alt="${proj.title}" class="proj-preview-img" loading="lazy">
                    <span class="proj-tag-badge">${proj.tag}</span>
                </div>
                <div class="proj-body">
                    <span class="proj-cat-label">${proj.categoryLabel}</span>
                    <h3 class="proj-title">${proj.title}</h3>
                    <p class="proj-desc">${proj.description}</p>
                    <div class="proj-tech-row">
                        ${proj.tech.map(t => `<span class="tech-pill">${t}</span>`).join('')}
                    </div>
                    <div class="proj-actions">
                        <button class="cyber-btn secondary inspect-proj-btn" data-id="${proj.id}">
                            <span>◈</span> INSPECT
                        </button>
                        ${proj.demo ? `
                            <a href="${proj.demo}" class="cyber-btn primary">
                                <span>⚡</span> LIVE DEMO
                            </a>
                        ` : ''}
                        ${proj.github ? `
                            <a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="cyber-btn secondary">
                                <span>⌥</span> GITHUB
                            </a>
                        ` : ''}
                    </div>
                </div>
            </article>
        `).join('');

        // Setup Filter Buttons
        if (filterContainer) {
            const buttons = filterContainer.querySelectorAll('.filter-btn');
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    buttons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const filter = btn.dataset.filter;

                    const cards = grid.querySelectorAll('.project-card');
                    cards.forEach(card => {
                        if (filter === 'all' || card.dataset.category.includes(filter)) {
                            card.style.display = 'flex';
                        } else {
                            card.style.display = 'none';
                        }
                    });

                    if (window.cyberAudio) window.cyberAudio.playClick();
                });
            });
        }
    }

    // 5. RENDER EXPERIENCE & EDUCATION
    renderExperience() {
        const expContainer = document.getElementById('experience-timeline');
        const eduContainer = document.getElementById('education-timeline');

        if (expContainer && this.data.experience) {
            expContainer.innerHTML = this.data.experience.map(item => `
                <div class="timeline-entry">
                    <div class="timeline-dot"></div>
                    <span class="timeline-period">${item.period}</span>
                    <h3 class="timeline-role">${item.role}</h3>
                    <div class="timeline-meta">${item.organization} · ${item.location}</div>
                    <p class="timeline-desc">${item.description}</p>
                </div>
            `).join('');
        }

        if (eduContainer && this.data.education) {
            eduContainer.innerHTML = this.data.education.map(item => `
                <div class="timeline-entry">
                    <div class="timeline-dot"></div>
                    <span class="timeline-period">${item.period}</span>
                    <h3 class="timeline-role">${item.degree}</h3>
                    <div class="timeline-meta">${item.institution}</div>
                    <p class="timeline-desc">${item.description}</p>
                </div>
            `).join('');
        }
    }

    // 6. GITHUB REPOSITORIES INTEGRATION (With Fallback)
    async renderGitHub() {
        const container = document.getElementById('github-repos-grid');
        const userLink = document.getElementById('github-user-link');
        if (!container || !this.data.github) return;

        const gh = this.data.github;
        if (userLink) {
            userLink.href = `https://github.com/${gh.username}`;
            userLink.textContent = `@${gh.username}`;
        }

        const renderCards = (repos) => {
            container.innerHTML = repos.map(repo => `
                <a href="${repo.url || repo.html_url}" target="_blank" rel="noopener noreferrer" class="github-repo-card">
                    <div class="repo-card-top">
                        <span class="repo-icon">⌥</span>
                        <h4 class="repo-name">${repo.name}</h4>
                    </div>
                    <p class="repo-desc">${repo.description || 'Public GitHub repository showcasing source code & documentation.'}</p>
                    <div class="repo-meta-row">
                        <span class="repo-lang"><span class="lang-dot"></span>${repo.language || 'Code'}</span>
                        <span class="repo-stars">★ ${repo.stargazers_count ?? repo.stars ?? 0}</span>
                        <span class="repo-forks">⑂ ${repo.forks_count ?? repo.forks ?? 0}</span>
                    </div>
                </a>
            `).join('');
        };

        // Show Skeleton / Loading
        container.innerHTML = `<div class="gh-loading"><span>✦</span> Mengambil repositori GitHub terkini...</div>`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const res = await fetch(`https://api.github.com/users/${gh.username}/repos?sort=updated&per_page=6`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error("GitHub API rate limit or error");
            const repos = await res.json();

            if (Array.isArray(repos) && repos.length >= 3) {
                renderCards(repos);
            } else if (Array.isArray(repos) && repos.length > 0) {
                const combined = [...repos, ...gh.fallbackRepos.slice(repos.length)];
                renderCards(combined);
            } else {
                renderCards(gh.fallbackRepos);
            }
        } catch (e) {
            console.log("Using cached/fallback GitHub repositories:", e.message);
            renderCards(gh.fallbackRepos);
        }
    }

    // 7. RENDER SOCIALS
    renderSocials() {
        const container = document.getElementById('socials-list');
        if (!container || !this.data.socials) return;

        container.innerHTML = this.data.socials.map(soc => `
            <a href="${soc.url}" target="_blank" rel="noopener noreferrer" class="social-chip">
                <span class="soc-icon" style="color: ${soc.color};">${soc.icon}</span>
                <div class="soc-info">
                    <span class="soc-platform">${soc.platform}</span>
                    <span class="soc-handle">${soc.username}</span>
                </div>
            </a>
        `).join('');
    }

    // 8. RENDER CONTACT
    renderContact() {
        const c = this.data.contact;
        if (!c) return;

        const emailEl = document.getElementById('contact-email-val');
        const locEl = document.getElementById('contact-location-val');
        if (emailEl) {
            emailEl.textContent = c.email;
            emailEl.href = `mailto:${c.email}`;
        }
        if (locEl) locEl.textContent = c.location;
    }

    // 9. NAVIGATION & SMOOTH SCROLL
    setupNavigation() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId && targetId !== '#') {
                    e.preventDefault();
                    const targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                        if (window.cyberAudio) window.cyberAudio.playClick();
                    }
                }
            });
        });

        // Mobile Menu Drawer Toggle
        const menuBtn = document.getElementById('mobile-menu-toggle');
        const navMenu = document.getElementById('main-nav-links');
        if (menuBtn && navMenu) {
            menuBtn.addEventListener('click', () => {
                navMenu.classList.toggle('is-open');
                menuBtn.classList.toggle('active');
                if (window.cyberAudio) window.cyberAudio.playClick();
            });

            // Close on link click
            navMenu.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('is-open');
                    menuBtn.classList.remove('active');
                });
            });
        }
    }

    // 10. NAVIGATION MODES (Explore 3D vs Normal CV)
    setupModeSwitcher() {
        const toggleBtn = document.getElementById('mode-toggle-btn');
        const heroExploreBtn = document.getElementById('btn-hero-explore');
        const heroNormalBtn = document.getElementById('btn-hero-cv');

        const updateModeUI = (mode) => {
            this.currentMode = mode;
            localStorage.setItem('portfolio_mode', mode);

            const modeLabel = document.getElementById('mode-toggle-label');
            if (modeLabel) {
                modeLabel.textContent = mode === 'explore' ? 'MODE: 3D WORLD' : 'MODE: NORMAL CV';
            }
            if (toggleBtn) {
                toggleBtn.classList.toggle('is-explore', mode === 'explore');
            }

            document.body.classList.toggle('mode-explore', mode === 'explore');
        };

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const nextMode = this.currentMode === 'explore' ? 'normal' : 'explore';
                updateModeUI(nextMode);
                if (window.cyberAudio) window.cyberAudio.playClick();

                if (nextMode === 'explore') {
                    document.getElementById('world')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        if (heroExploreBtn) {
            heroExploreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                updateModeUI('explore');
                document.getElementById('world')?.scrollIntoView({ behavior: 'smooth' });
            });
        }

        if (heroNormalBtn) {
            heroNormalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                updateModeUI('normal');
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            });
        }

        updateModeUI(this.currentMode);
    }

    // 11. 3D DIGITAL WORLD INITIALIZATION
    init3DWorld() {
        const worldStage = document.getElementById('world-canvas-container');
        if (worldStage && typeof THREE !== 'undefined') {
            window.digitalWorld = new DigitalWorld3D('world-canvas-container');
        }
    }

    // 12. CHECKPOINT INTERACTION LISTENER & DRAWER
    setupCheckpointListener() {
        const drawer = document.getElementById('checkpoint-drawer');
        const drawerClose = document.getElementById('checkpoint-drawer-close');
        const drawerTitle = document.getElementById('drawer-checkpoint-title');
        const drawerSubtitle = document.getElementById('drawer-checkpoint-subtitle');
        const drawerContent = document.getElementById('drawer-checkpoint-content');
        const drawerJumpBtn = document.getElementById('drawer-jump-section-btn');

        const closeDrawer = () => {
            if (drawer) drawer.classList.remove('active');
            if (window.cyberAudio) window.cyberAudio.playClick();
        };

        if (drawerClose) drawerClose.addEventListener('click', closeDrawer);

        // Global key shortcut ESC to close
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer && drawer.classList.contains('active')) {
                closeDrawer();
            }
        });

        // Listen for Checkpoint Activation
        window.addEventListener('checkpoint:activate', (e) => {
            const cp = e.detail;
            if (!drawer || !cp) return;

            drawerTitle.textContent = `${cp.name} // ${cp.title}`;
            drawerSubtitle.textContent = cp.subtitle;

            // Generate content preview based on checkpoint
            drawerContent.innerHTML = this.generateCheckpointPreview(cp.id);

            // Configure Jump Button
            if (drawerJumpBtn) {
                drawerJumpBtn.textContent = `Buka Bagian ${cp.name} Penuh ↗`;
                drawerJumpBtn.onclick = () => {
                    closeDrawer();
                    document.getElementById(cp.id)?.scrollIntoView({ behavior: 'smooth' });
                };
            }

            drawer.classList.add('active');
        });
    }

    generateCheckpointPreview(checkpointId) {
        switch (checkpointId) {
            case 'start':
                return `
                    <div class="cp-preview-box">
                        <p>Halo! Selamat datang di dunia digital portfolio. Anda dapat menggerakkan <strong>Chibi Miku</strong> menggunakan tombol <strong>WASD</strong>, <strong>Tombol Panah</strong>, atau langsung mengklik tanah pada pulau digital ini.</p>
                        <p>Kunjungi setiap checkpoint untuk membaca informasi keahlian, proyek unggulan, GitHub, dan kontak.</p>
                    </div>
                `;
            case 'about':
                const p = this.data.profile;
                return `
                    <div class="cp-preview-box">
                        <h4>${p.name}</h4>
                        <p class="highlight-text">${p.title}</p>
                        <p>${p.bio}</p>
                        <div class="cp-tags-row">
                            <span class="badge">📍 ${p.location}</span>
                            <span class="badge">✦ ${p.status}</span>
                        </div>
                    </div>
                `;
            case 'skills':
                return `
                    <div class="cp-preview-box">
                        <p>Keahlian mencakup <strong>JavaScript/TypeScript</strong>, <strong>React/Next.js</strong>, <strong>PHP/CodeIgniter</strong>, <strong>Flutter/Dart</strong>, <strong>Three.js</strong>, dan <strong>Web Audio API</strong>.</p>
                        <p>Buka bagian lengkap untuk melihat rincian penguasaan teknis dan tools yang digunakan.</p>
                    </div>
                `;
            case 'projects':
                const topProj = this.data.projects[0];
                return `
                    <div class="cp-preview-box">
                        <h4>${topProj.title}</h4>
                        <p>${topProj.description}</p>
                        <div class="proj-tech-row" style="margin-top: 10px;">
                            ${topProj.tech.map(t => `<span class="tech-pill">${t}</span>`).join('')}
                        </div>
                    </div>
                `;
            case 'experience':
                return `
                    <div class="cp-preview-box">
                        <p>Pengalaman profesional dalam web development modern, interactive UI 60 FPS, dan aplikasi mobile skala produksi.</p>
                        <p>Tekan tombol di bawah untuk melihat timeline perjalanan karir dan pendidikan.</p>
                    </div>
                `;
            case 'github':
                return `
                    <div class="cp-preview-box">
                        <p>Terhubung langsung dengan GitHub API untuk menampilkan proyek open source dan repository publik terkini.</p>
                        <p>Repositori: <strong>@${this.data.github.username}</strong></p>
                    </div>
                `;
            case 'contact':
                return `
                    <div class="cp-preview-box">
                        <h4>LET'S BUILD SOMETHING TOGETHER</h4>
                        <p>Email: <a href="mailto:${this.data.contact.email}" style="color: var(--miku-primary);">${this.data.contact.email}</a></p>
                        <p>Buka form transmisi di bawah untuk mengirim pesan langsung.</p>
                    </div>
                `;
            default:
                return `<div class="cp-preview-box"><p>Jelajahi dunia digital ini untuk menemukan informasi lebih lanjut.</p></div>`;
        }
    }

    // 13. PROJECT MODAL INSPECT INTEL
    setupProjectModal() {
        const modal = document.getElementById('project-detail-modal');
        const modalBody = document.getElementById('project-modal-body');
        const modalClose = document.getElementById('project-modal-close');

        const closeModal = () => {
            if (modal) modal.classList.remove('active');
            if (window.cyberAudio) window.cyberAudio.playClick();
        };

        if (modalClose) modalClose.addEventListener('click', closeModal);

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
                closeModal();
            }
        });

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.inspect-proj-btn');
            if (btn && modal && modalBody) {
                const id = btn.dataset.id;
                const proj = this.data.projects.find(p => p.id === id);
                if (!proj) return;

                modalBody.innerHTML = `
                    <div class="modal-header-meta">
                        <span class="proj-cat-label">${proj.categoryLabel}</span>
                        <span class="proj-tag-badge">${proj.tag}</span>
                    </div>
                    <h2 class="modal-title">${proj.title}</h2>
                    <div class="modal-img-wrap">
                        <img src="${proj.image}" alt="${proj.title}" class="modal-img">
                    </div>
                    <p class="modal-desc">${proj.description}</p>
                    <div class="modal-section-title">// TEKNOLOGI YANG DIGUNAKAN</div>
                    <div class="proj-tech-row">
                        ${proj.tech.map(t => `<span class="tech-pill">${t}</span>`).join('')}
                    </div>
                    ${proj.stats ? `
                        <div class="modal-section-title" style="margin-top: 18px;">// HIGHLIGHT SPESIFIKASI</div>
                        <div class="modal-stats-grid">
                            ${Object.entries(proj.stats).map(([k, v]) => `
                                <div class="modal-stat-box">
                                    <div class="k">${k}</div>
                                    <div class="v">${v}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div class="modal-actions-row">
                        ${proj.demo ? `
                            <a href="${proj.demo}" class="cyber-btn primary">
                                <span>⚡</span> LIVE DEMO
                            </a>
                        ` : ''}
                        ${proj.github ? `
                            <a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="cyber-btn secondary">
                                <span>⌥</span> REPOSITORI GITHUB
                            </a>
                        ` : ''}
                    </div>
                `;

                modal.classList.add('active');
                if (window.cyberAudio) window.cyberAudio.playOpen();
            }
        });
    }

    // 14. AUDIO CONTROLS
    setupAudioControls() {
        const audioBtn = document.getElementById('audio-toggle-btn');
        const sfxBtn = document.getElementById('sfx-toggle-btn');

        if (audioBtn) {
            const updateBgmLabel = () => {
                const isPlaying = window.cyberAudio.bgmPlaying;
                audioBtn.innerHTML = isPlaying ? `<span>♪</span> MUSIC: ON` : `<span>♫</span> MUSIC: OFF`;
                audioBtn.classList.toggle('active', isPlaying);
            };

            audioBtn.addEventListener('click', () => {
                window.cyberAudio.toggleBGM();
                updateBgmLabel();
            });

            // Initial check
            updateBgmLabel();
        }

        if (sfxBtn) {
            const updateSfxLabel = () => {
                const isMuted = window.cyberAudio.isMuted;
                sfxBtn.innerHTML = isMuted ? `<span>✕</span> SFX: OFF` : `<span>⚡</span> SFX: ON`;
                sfxBtn.classList.toggle('active', !isMuted);
            };

            sfxBtn.addEventListener('click', () => {
                window.cyberAudio.toggleMute();
                updateSfxLabel();
            });

            updateSfxLabel();
        }

        // Global sound triggers on interactive elements
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('button, a, .interactive-card, .social-chip')) {
                if (window.cyberAudio) window.cyberAudio.playHover();
            }
        });
    }

    // 15. CONTACT FORM
    setupContactForm() {
        const form = document.getElementById('contact-form');
        const feedback = document.getElementById('contact-feedback');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('form-name').value.trim();
                const email = document.getElementById('form-email').value.trim();
                const message = document.getElementById('form-message').value.trim();

                if (!name || !email || !message) {
                    if (feedback) feedback.innerHTML = `<span class="err">Harap lengkapi semua bidang isian.</span>`;
                    return;
                }

                const mailto = `mailto:${this.data.contact.email}?subject=${encodeURIComponent('Pesan Portfolio dari ' + name)}&body=${encodeURIComponent('Nama: ' + name + '\nEmail: ' + email + '\n\nPesan:\n' + message)}`;
                window.location.href = mailto;

                if (feedback) {
                    feedback.innerHTML = `<span class="success">✦ Pesan Anda disiapkan di aplikasi email. Terima kasih!</span>`;
                }

                if (window.cyberAudio) window.cyberAudio.playHit();
                form.reset();
            });
        }
    }

    // 16. SCROLL PARALLAX (Subtle & Performant)
    setupScrollParallax() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            document.documentElement.style.setProperty('--scroll-y', `${scrolled}px`);
        }, { passive: true });
    }

    // 17. SYSTEM CLOCK
    setupClock() {
        const clockEl = document.getElementById('hud-system-clock');
        const update = () => {
            if (!clockEl) return;
            const now = new Date();
            clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
        };
        update();
        setInterval(update, 1000);
    }
}

// Instantiate on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new PortfolioController();
});
