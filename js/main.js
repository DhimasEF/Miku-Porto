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
        const aboutStatus = document.getElementById('about-status');

        if (aboutName) aboutName.textContent = p.name;
        if (aboutTitle) aboutTitle.textContent = p.title;
        if (aboutBio) aboutBio.textContent = p.bio;
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
                    <div class="timeline-meta">${item.organization}</div>
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
                <a href="https://github.com/${this.data.github.username}/${encodeURIComponent(repo.name)}" target="_blank" rel="noopener noreferrer" class="github-repo-card">
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
        container.innerHTML = `<div class="gh-loading"><span>✦</span> Fetching latest GitHub repositories...</div>`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const res = await fetch(`https://api.github.com/users/${gh.username}/repos?sort=updated&per_page=6`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error("GitHub API rate limit or error");
            const repos = await res.json();

            // Fix repo URLs to point directly to github.com/username/reponame
            const fixUrl = (repo) => ({
                ...repo,
                html_url: `https://github.com/${gh.username}/${repo.name}`
            });

            if (Array.isArray(repos) && repos.length >= 3) {
                renderCards(repos.map(fixUrl));
            } else if (Array.isArray(repos) && repos.length > 0) {
                const combined = [...repos.map(fixUrl), ...gh.fallbackRepos.slice(repos.length)];
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
        if (emailEl) {
            emailEl.textContent = c.email;
            emailEl.href = `mailto:${c.email}`;
        }
    }

    // 9. NAVIGATION & SMOOTH SCROLL
    setupNavigation() {
        const getHeaderOffset = () => {
            const header = document.querySelector('.hud-header');
            return header ? header.offsetHeight + 16 : 88;
        };

        const smoothScrollTo = (targetEl) => {
            const startY = window.scrollY;
            const targetY = Math.max(0, targetEl.getBoundingClientRect().top + startY - getHeaderOffset());
            const distance = targetY - startY;
            const duration = Math.min(1100, Math.max(650, Math.abs(distance) * 0.45));
            const startTime = performance.now();
            const animate = (now) => {
                const progress = Math.min(1, (now - startTime) / duration);
                const eased = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                window.scrollTo(0, startY + distance * eased);
                if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        };

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId && targetId !== '#') {
                    e.preventDefault();
                    const targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        smoothScrollTo(targetEl);
                        if (window.cyberAudio) window.cyberAudio.playClick();
                    }
                }
            });
        });

        // Also expose smoothScrollTo globally for use elsewhere
        window._smoothScrollTo = smoothScrollTo;

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

    // 10. NAVIGATION MODES (removed - no mode switcher)
    // setupModeSwitcher() is no longer used.

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
                drawerJumpBtn.textContent = `Open ${cp.name} Section ↗`;
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
                        <p>Welcome to the digital portfolio world! Move <strong>Chibi Miku</strong> using <strong>WASD</strong>, <strong>Arrow Keys</strong>, or click on the island ground.</p>
                        <p>Visit each checkpoint to read about skills, featured projects, GitHub, and contact info.</p>
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
                            <span class="badge">✦ ${p.status}</span>
                        </div>
                    </div>
                `;
            case 'skills':
                return `
                    <div class="cp-preview-box">
                        <p>Skills include <strong>PHP/CodeIgniter</strong>, <strong>JavaScript/Node.js</strong>, <strong>Flutter</strong>, <strong>VB.NET/Windows Forms</strong>, <strong>MySQL/MariaDB</strong>, and <strong>Grafana</strong>.</p>
                        <p>Open the full section to see detailed proficiency levels and tools.</p>
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
                        <p>Professional experience in web development, internal desktop applications, and IT support across multiple organizations.</p>
                        <p>Click below to see the full career and education timeline.</p>
                    </div>
                `;
            case 'github':
                return `
                    <div class="cp-preview-box">
                        <p>Connected to GitHub to display public repositories and open source projects.</p>
                        <p>Repository: <strong>@${this.data.github.username}</strong></p>
                    </div>
                `;
            case 'contact':
                return `
                    <div class="cp-preview-box">
                        <h4>LET'S BUILD SOMETHING TOGETHER</h4>
                        <p>Email: <a href="mailto:${this.data.contact.email}" style="color: var(--miku-primary);">${this.data.contact.email}</a></p>
                        <p>Open the transmission form below to send a direct message.</p>
                    </div>
                `;
            default:
                return `<div class="cp-preview-box"><p>Explore this digital world to discover more information.</p></div>`;
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
                    <div class="modal-section-title">// TECHNOLOGIES USED</div>
                    <div class="proj-tech-row">
                        ${proj.tech.map(t => `<span class="tech-pill">${t}</span>`).join('')}
                    </div>
                    ${proj.stats ? `
                        <div class="modal-section-title" style="margin-top: 18px;">// SPEC HIGHLIGHTS</div>
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
                        ${proj.github ? `
                            <a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="cyber-btn secondary">
                                <span>⌥</span> GITHUB REPO
                            </a>
                        ` : ''}
                    </div>
                `;

                modal.classList.add('active');
                if (window.cyberAudio) window.cyberAudio.playOpen();
            }
        });
    }

    // 14. AUDIO CONTROLS — dropdown-based
    setupAudioControls() {
        const audioBtn = document.getElementById('audio-toggle-btn');
        const sfxBtn = document.getElementById('sfx-toggle-btn');
        const dropdownTrigger = document.getElementById('audio-dropdown-trigger');
        const dropdownMenu = document.getElementById('audio-dropdown-menu');
        const dropdownWrap = document.getElementById('audio-dropdown-wrap');

        // Toggle dropdown visibility
        if (dropdownTrigger && dropdownMenu) {
            dropdownTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = dropdownMenu.classList.toggle('is-open');
                dropdownTrigger.classList.toggle('active', isOpen);
                if (window.cyberAudio) window.cyberAudio.playClick();
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (dropdownWrap && !dropdownWrap.contains(e.target)) {
                    dropdownMenu.classList.remove('is-open');
                    dropdownTrigger.classList.remove('active');
                }
            });
        }

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

            window.addEventListener('cyber:bgm-state', updateBgmLabel);
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
                    if (feedback) feedback.innerHTML = `<span class="err">Please fill in all fields.</span>`;
                    return;
                }

                const mailto = `mailto:${this.data.contact.email}?subject=${encodeURIComponent('Portfolio Message from ' + name)}&body=${encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message)}`;
                window.location.href = mailto;

                if (feedback) {
                    feedback.innerHTML = `<span class="success">✦ Your message has been prepared in your email app. Thank you!</span>`;
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
