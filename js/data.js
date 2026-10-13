/**
 * PORTFOLIO DATA CONFIGURATION
 * Edit your portfolio details here without touching the UI or 3D engine code.
 */

window.PORTFOLIO_DATA = {
    profile: {
        name: "Hatsune Developer",
        displayName: "MIKU / DEV",
        title: "Fullstack Developer & Creative Technologist",
        subtitle: "Building thoughtful digital experiences, creative web interfaces, and interactive worlds.",
        bio: "Saya adalah seorang developer yang berfokus pada web development modern, antarmuka kreatif, dan teknologi interaktif. Senang memadukan estetika visual yang elegan dengan arsitektur kode yang bersih, aksesibel, dan berkinerja tinggi.",
        shortDescription: "Building things, exploring ideas, and turning imagination into something real.",
        location: "Jakarta / Remote (Worldwide)",
        status: "Open for Opportunities & Collaborations",
        avatar: "assets/miku_chibi_pixel.png",
        cvUrl: "#contact",
        stats: [
            { value: "5+", label: "YEARS CODING" },
            { value: "18+", label: "PROJECTS BUILT" },
            { value: "60 FPS", label: "SMOOTH INTERACTIONS" },
            { value: "100%", label: "DEDICATION" }
        ]
    },

    skills: [
        {
            category: "Programming Languages",
            icon: "⚡",
            description: "Bahasa inti untuk pengembangan aplikasi performan & scalable.",
            items: [
                { name: "JavaScript (ESNext)", level: "Advanced", pct: 95 },
                { name: "TypeScript", level: "Advanced", pct: 90 },
                { name: "PHP", level: "Proficient", pct: 85 },
                { name: "Dart", level: "Proficient", pct: 80 },
                { name: "HTML5 & Modern CSS3", level: "Expert", pct: 98 },
                { name: "SQL (MySQL / PostgreSQL)", level: "Proficient", pct: 82 }
            ]
        },
        {
            category: "Frameworks & Libraries",
            icon: "❖",
            description: "Teknologi modern untuk web frontend & backend handal.",
            items: [
                { name: "React & Next.js", level: "Advanced", pct: 92 },
                { name: "Vue.js", level: "Proficient", pct: 82 },
                { name: "Flutter", level: "Proficient", pct: 80 },
                { name: "CodeIgniter / Laravel", level: "Proficient", pct: 84 },
                { name: "Node.js & Express", level: "Advanced", pct: 88 },
                { name: "Three.js / WebGL", level: "Creative", pct: 85 }
            ]
        },
        {
            category: "Creative & Audio Tech",
            icon: "♫",
            description: "Eksplorasi grafis interaktif, audio sintetis & visualisasi.",
            items: [
                { name: "Web Audio API", level: "Advanced", pct: 90 },
                { name: "Canvas 2D Rendering", level: "Advanced", pct: 92 },
                { name: "GLSL & Shaders", level: "Intermediate", pct: 75 },
                { name: "UI/UX & Micro-interactions", level: "Advanced", pct: 94 }
            ]
        },
        {
            category: "Tools & DevOps",
            icon: "⚙",
            description: "Workflow, versioning, deployment, dan otomatisasi.",
            items: [
                { name: "Git & GitHub", level: "Advanced", pct: 92 },
                { name: "VS Code / IDE Workflows", level: "Expert", pct: 96 },
                { name: "Docker & Containerization", level: "Intermediate", pct: 78 },
                { name: "Vite / Webpack", level: "Advanced", pct: 86 },
                { name: "REST & GraphQL APIs", level: "Advanced", pct: 90 }
            ]
        }
    ],

    projects: [
        {
            id: "proj-1",
            title: "Project DIVA // Synth Workstation 39",
            category: "audio",
            categoryLabel: "Audio Engineering & Web Audio API",
            tag: "Featured",
            description: "Synthesizer workstation berbasis Web Audio API dengan visualisasi gelombang FFT real-time, polyphonic oscillator, drum sequencer matriks, dan preset soundbank bertema Vocaloid.",
            image: "assets/project_diva.png",
            tech: ["Web Audio API", "Canvas 2D", "Vanilla ES6", "Glassmorphism"],
            status: "Completed",
            github: "https://github.com",
            demo: "#arcade",
            stats: {
                "Engine": "Web Audio API",
                "Polyphony": "16 Voices",
                "Latency": "< 5ms"
            }
        },
        {
            id: "proj-2",
            title: "Cyber Metaverse Protocol 01",
            category: "3d",
            categoryLabel: "3D Graphics & Interactive World",
            tag: "Interactive 3D",
            description: "Eksplorasi ruang digital 3D dengan procedural city environment, low-poly voxel geometry, custom shader wireframe, dan ambient spatial audio.",
            image: "assets/project_metaverse.png",
            tech: ["Three.js", "WebGL", "TypeScript", "Procedural 3D"],
            status: "Active Prototype",
            github: "https://github.com",
            demo: "#world",
            stats: {
                "Renderer": "Three.js r128",
                "FPS Target": "60 FPS Smooth",
                "Lighting": "PBR Soft Glow"
            }
        },
        {
            id: "proj-3",
            title: "Vocal Matrix // Neural Interface",
            category: "fullstack",
            categoryLabel: "Fullstack & Creative UI Dashboard",
            tag: "Web Application",
            description: "Dashboard interaktif modern dengan visualisasi data real-time, arsitektur micro-interactions elegan, serta audio-reactive waveform analytics berkecepatan 60 FPS.",
            image: "assets/project_neural.png",
            tech: ["React", "Node.js", "Tailored CSS", "WebSockets"],
            status: "Completed",
            github: "https://github.com",
            demo: "#",
            stats: {
                "Framework": "React & Node",
                "Interface": "Glassmorphism",
                "Performance": "Lighthouse 98+"
            }
        }
    ],

    experience: [
        {
            period: "2024 — Sekarang",
            role: "Senior Creative Developer / Fullstack Engineer",
            organization: "Digital Innovations Lab",
            location: "Remote",
            description: "Memimpin perancangan frontend interaktif berbasis Three.js & Canvas, mengoptimalkan pipeline Web Audio, serta mengimplementasikan design system modern yang responsif dan aksesibel."
        },
        {
            period: "2022 — 2024",
            role: "Frontend & Web Application Developer",
            organization: "Studio Cybernetic Media",
            location: "Jakarta, Indonesia",
            description: "Mengembangkan aplikasi web performan tinggi menggunakan React, TypeScript, dan PHP. Mengurangi bundle size sebesar 35% dan meningkatkan core web vitals ke skor 95+."
        },
        {
            period: "2019 — 2022",
            role: "Web & Mobile Developer (Junior to Mid)",
            organization: "Creative Tech House",
            location: "Bandung, Indonesia",
            description: "Membangun antarmuka mobile menggunakan Flutter & Dart, serta portal web dengan CodeIgniter dan REST API terstruktur."
        }
    ],

    education: [
        {
            period: "2018 — 2022",
            degree: "Sarjana Ilmu Komputer / Teknik Informatika",
            institution: "Universitas Teknologi",
            description: "Fokus studi pada Rekayasa Perangkat Lunak, Grafika Komputer, Interaksi Manusia & Komputer (HCI), dan Algoritma Struktur Data."
        }
    ],

    github: {
        username: "hatsunemiku-dev",
        profileUrl: "https://github.com",
        fallbackRepos: [
            {
                name: "miku-digital-world-portfolio",
                description: "Interactive Hatsune Miku inspired 3D digital world portfolio built with Three.js and vanilla web standards.",
                language: "JavaScript",
                stars: 139,
                forks: 39,
                url: "https://github.com",
                updated: "Recently"
            },
            {
                name: "vocaloid-webaudio-synth",
                description: "Real-time polyphonic synthesizer and FFT frequency spectrum analyzer using Web Audio API.",
                language: "TypeScript",
                stars: 84,
                forks: 21,
                url: "https://github.com",
                updated: "1 week ago"
            },
            {
                name: "threejs-isometric-digital-garden",
                description: "Lightweight low-poly voxel garden with smooth follow camera, physics bobbing, and custom shaders.",
                language: "JavaScript",
                stars: 95,
                forks: 18,
                url: "https://github.com",
                updated: "2 weeks ago"
            },
            {
                name: "flutter-vocal-mobile-suite",
                description: "Clean architecture mobile application for audio sequencing, built with Flutter & Dart.",
                language: "Dart",
                stars: 62,
                forks: 14,
                url: "https://github.com",
                updated: "1 month ago"
            }
        ]
    },

    socials: [
        {
            platform: "GitHub",
            username: "github.com/hatsunemiku-dev",
            url: "https://github.com",
            icon: "◈",
            color: "#39E6D0"
        },
        {
            platform: "LinkedIn",
            username: "linkedin.com/in/creative-dev",
            url: "https://linkedin.com",
            icon: "✦",
            color: "#5CE1E6"
        },
        {
            platform: "Discord",
            username: "MikuCoder#3939",
            url: "https://discord.com",
            icon: "⚡",
            color: "#8FFFF5"
        },
        {
            platform: "Email",
            username: "contact@miku-portfolio.space",
            url: "mailto:contact@miku-portfolio.space",
            icon: "✉",
            color: "#39E6D0"
        }
    ],

    contact: {
        heading: "LET'S BUILD SOMETHING TOGETHER.",
        subheading: "Tertarik berkolaborasi untuk proyek baru, freelance, atau ingin sekadar berdiskusi seputar ide kreatif? Silakan kirim pesan.",
        email: "contact@miku-portfolio.space",
        location: "Jakarta, Indonesia (Available for Remote Worldwide)",
        socialLink: "https://linkedin.com"
    },

    checkpoints: [
        {
            id: "start",
            name: "START",
            title: "WELCOME ABOARD",
            subtitle: "Awali penjelajahan dunia digital kecil ini bersama Chibi Miku.",
            icon: "✦",
            color: "#39E6D0",
            x: 0,
            z: 8
        },
        {
            id: "about",
            name: "PROFILE",
            title: "ABOUT ME",
            subtitle: "Ketahui lebih dekat profil, visi kerja, dan cerita di balik layar.",
            icon: "★",
            color: "#5CE1E6",
            x: -8,
            z: 3
        },
        {
            id: "skills",
            name: "SKILLS",
            title: "TECHNICAL CAPABILITIES",
            subtitle: "Keahlian bahasa pemrograman, framework, dan tools modern.",
            icon: "⚡",
            color: "#8FFFF5",
            x: -6,
            z: -5
        },
        {
            id: "projects",
            name: "PROJECTS",
            title: "FEATURED WORK",
            subtitle: "Karya digital, WebGL 3D, dan aplikasi audio mutakhir.",
            icon: "❖",
            color: "#39E6D0",
            x: 0,
            z: -8
        },
        {
            id: "experience",
            name: "EXPERIENCE",
            title: "JOURNEY & TIMELINE",
            subtitle: "Jejak langkah profesional dan latar belakang akademis.",
            icon: "◈",
            color: "#5CE1E6",
            x: 6,
            z: -5
        },
        {
            id: "github",
            name: "GITHUB",
            title: "OPEN SOURCE & REPOSITORIES",
            subtitle: "Eksplorasi kode sumber dan kontribusi proyek terbuka.",
            icon: "⌥",
            color: "#8FFFF5",
            x: 8,
            z: 3
        },
        {
            id: "contact",
            name: "CONTACT",
            title: "GET IN TOUCH",
            subtitle: "Buka saluran komunikasi untuk kolaborasi & diskusi proyek.",
            icon: "✉",
            color: "#39E6D0",
            x: 3,
            z: 7
        }
    ]
};
