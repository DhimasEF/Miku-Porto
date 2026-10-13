/**
 * CYBER-MIKU TERMINAL CONSOLE
 * Interactive CLI Command Center for developer portfolio
 */

class CyberTerminal {
    constructor() {
        this.modal = document.getElementById('terminal-modal');
        this.openBtn = document.getElementById('open-terminal-btn');
        this.closeBtn = document.getElementById('close-terminal-btn');
        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');
        this.history = [];
        this.historyIndex = -1;

        this.init();
    }

    init() {
        if (this.openBtn) {
            this.openBtn.addEventListener('click', () => this.open());
        }
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        // Global key shortcut: `~` (tilde)
        window.addEventListener('keydown', (e) => {
            if (e.key === '`' || e.key === '~') {
                if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                    e.preventDefault();
                    this.toggle();
                }
            } else if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
                this.close();
            }
        });

        if (this.input) {
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const cmd = this.input.value.trim();
                    if (cmd) {
                        this.history.push(cmd);
                        this.historyIndex = this.history.length;
                        this.execute(cmd);
                        this.input.value = '';
                    }
                } else if (e.key === 'ArrowUp') {
                    if (this.historyIndex > 0) {
                        this.historyIndex--;
                        this.input.value = this.history[this.historyIndex];
                    }
                } else if (e.key === 'ArrowDown') {
                    if (this.historyIndex < this.history.length - 1) {
                        this.historyIndex++;
                        this.input.value = this.history[this.historyIndex];
                    } else {
                        this.historyIndex = this.history.length;
                        this.input.value = '';
                    }
                }
            });
        }
    }

    toggle() {
        if (this.modal && this.modal.classList.contains('active')) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (!this.modal) return;
        this.modal.classList.add('active');
        if (window.cyberAudio) window.cyberAudio.playOpen();
        setTimeout(() => {
            if (this.input) this.input.focus();
        }, 150);
    }

    close() {
        if (!this.modal) return;
        this.modal.classList.remove('active');
        if (window.cyberAudio) window.cyberAudio.playClick();
    }

    print(text, type = 'normal') {
        if (!this.output) return;
        const line = document.createElement('div');
        line.className = `term-line ${type}`;
        line.innerHTML = text;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
    }

    execute(rawCmd) {
        this.print(`<span class="term-prompt">MIKU-OS:~$</span> ${this.escapeHTML(rawCmd)}`, 'cmd');

        const parts = rawCmd.trim().split(' ');
        const cmd = parts[0].toLowerCase();
        const arg = parts.slice(1).join(' ').toLowerCase();

        if (window.cyberAudio) window.cyberAudio.playClick();
        const data = window.PORTFOLIO_DATA || {};

        switch (cmd) {
            case 'help':
                this.print(`
<span class="highlight">==== AVAILABLE VOCALOID SYSTEM COMMANDS ====</span>
  <span class="cmd-name">help</span>        : Tampilkan daftar perintah
  <span class="cmd-name">whoami</span>      : Informasi profil & role developer
  <span class="cmd-name">skills</span>      : Ringkasan keahlian teknis
  <span class="cmd-name">projects</span>    : Daftar proyek unggulan
  <span class="cmd-name">miku</span>        : Sapaan Chibi Hatsune Miku 39
  <span class="cmd-name">world</span>       : Kunjungi 3D Interactive World
  <span class="cmd-name">arcade</span>      : Buka mini-game Diva Beat Arcade
  <span class="cmd-name">contact</span>     : Buka informasi saluran kontak
  <span class="cmd-name">clear</span>       : Bersihkan layar terminal
  <span class="cmd-name">exit</span>        : Tutup terminal
`);
                break;

            case 'whoami':
                const p = data.profile || {};
                this.print(`
<span class="highlight">[PROFILE IDENTITY]</span>
  NAME     : ${p.name || 'Hatsune Developer'}
  ROLE     : ${p.title || 'Fullstack & Creative Developer'}
  LOCATION : ${p.location || 'Worldwide'}
  STATUS   : ${p.status || 'Active'}
`);
                break;

            case 'skills':
                if (data.skills) {
                    let out = `<span class="highlight">[TECHNICAL CAPABILITIES]</span><br>`;
                    data.skills.forEach(g => {
                        out += `  <strong>${g.category}</strong>: ${g.items.map(i => i.name).join(', ')}<br>`;
                    });
                    this.print(out);
                }
                break;

            case 'projects':
                if (data.projects) {
                    let out = `<span class="highlight">[FEATURED PROJECTS]</span><br>`;
                    data.projects.forEach((proj, idx) => {
                        out += `  [0${idx+1}] <strong>${proj.title}</strong> (${proj.categoryLabel})<br>`;
                    });
                    this.print(out);
                }
                break;

            case 'miku':
                this.print(`
<pre style="color: #39e6d0; font-size: 11px; line-height: 1.1;">
      .---.
     /     \\     ♫ "Sekaaaaai de ichiban ohime-sama!" ♫
    | () () |    Chibi Hatsune Miku 39 is online!
     \\  ^  /     Welcome to my master's digital world! ✦
    ===|||===
</pre>
`);
                if (window.cyberAudio) window.cyberAudio.playHit('PERFECT');
                break;

            case 'world':
                this.close();
                document.getElementById('world')?.scrollIntoView({ behavior: 'smooth' });
                break;

            case 'arcade':
                this.close();
                document.getElementById('arcade')?.scrollIntoView({ behavior: 'smooth' });
                break;

            case 'contact':
                const c = data.contact || {};
                this.print(`
<span class="highlight">[COMMUNICATION FREQUENCY]</span>
  EMAIL    : ${c.email || 'contact@miku-portfolio.space'}
  LOCATION : ${c.location || 'Remote'}
`);
                break;

            case 'clear':
                this.output.innerHTML = '';
                break;

            case 'exit':
                this.close();
                break;

            default:
                this.print(`<span class="error" style="color: #ff99aa;">Perintah '${this.escapeHTML(cmd)}' tidak dikenali. Ketik '<span class="cmd-name">help</span>' untuk bantuan.</span>`);
                break;
        }
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cyberTerminal = new CyberTerminal();
});
