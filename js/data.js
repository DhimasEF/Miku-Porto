/**
 * PORTFOLIO DATA CONFIGURATION
 * Edit your portfolio details here without touching the UI or 3D engine code.
 */

window.PORTFOLIO_DATA = {
    profile: {
        name: "Dhimas Erzal Firmansyah",
        displayName: "DHIMAS / DEV",
        title: "Web & Application Developer | UI/UX",
        subtitle: "Building functional, structured, and enjoyable digital experiences.",
        bio: "Computer Science graduate experienced in web and desktop application development, REST API integration, database management, and technical support. Interested in building practical applications with a strong focus on usability and UI/UX.",
        shortDescription: "Building functional, structured & user-friendly web and desktop applications.",
        status: "Open for Opportunities & Collaborations",
        avatar: "assets/miku_chibi_pixel.png",
        cvUrl: "#contact",
        stats: [
            { value: "3.82", label: "GPA / 4.00" },
            { value: "3+", label: "PROJECTS BUILT" },
            { value: "B.Sc.", label: "COMPUTER SCIENCE" },
            { value: "100%", label: "DEDICATION" }
        ]
    },

    skills: [
        {
            category: "Web Development",
            icon: "⚡",
            description: "Core technologies for modern, responsive web applications.",
            items: [
                { name: "PHP", level: "Proficient", pct: 85 },
                { name: "CodeIgniter", level: "Proficient", pct: 83 },
                { name: "JavaScript", level: "Proficient", pct: 80 },
                { name: "Node.js", level: "Intermediate", pct: 72 },
                { name: "HTML5 & CSS3", level: "Advanced", pct: 90 }
            ]
        },
        {
            category: "Application Development",
            icon: "❖",
            description: "Cross-platform desktop and mobile application development.",
            items: [
                { name: "Flutter", level: "Proficient", pct: 78 },
                { name: "VB.NET", level: "Proficient", pct: 80 },
                { name: "Windows Forms", level: "Proficient", pct: 80 },
                { name: "REST API / Web Services", level: "Proficient", pct: 82 }
            ]
        },
        {
            category: "UI/UX Design",
            icon: "♫",
            description: "Designing polished, responsive, and easy-to-use interfaces.",
            items: [
                { name: "UI Design", level: "Proficient", pct: 80 },
                { name: "User Experience", level: "Proficient", pct: 78 },
                { name: "Responsive Interface", level: "Advanced", pct: 85 }
            ]
        },
        {
            category: "Database & Tools",
            icon: "⚙",
            description: "Database management, development tools, and technical support.",
            items: [
                { name: "MySQL / MariaDB", level: "Proficient", pct: 83 },
                { name: "Git & GitHub", level: "Proficient", pct: 80 },
                { name: "Grafana", level: "Intermediate", pct: 70 },
                { name: "SAP", level: "Intermediate", pct: 65 },
                { name: "Application Troubleshooting", level: "Proficient", pct: 80 }
            ]
        }
    ],

    projects: [
        {
            id: "proj-1",
            title: "Ticketing Management System (TMS)",
            category: "fullstack",
            categoryLabel: "Desktop Application & Internal System",
            tag: "Featured",
            description: "An internal VB.NET / Windows Forms application supporting request and assignment workflows at PT Hardo Soloplast. Includes MariaDB/MySQL storage and operational reporting.",
            image: "assets/project_diva.png",
            tech: ["VB.NET", "Windows Forms", "MariaDB", "MySQL"],
            status: "Completed",
            github: "https://github.com/DhimasEF",
            stats: {
                "Platform": "Windows Desktop",
                "Database": "MariaDB / MySQL",
                "Type": "Internal System"
            }
        },
        {
            id: "proj-2",
            title: "Grafana Logistics Dashboard",
            category: "3d",
            categoryLabel: "Data Visualization & Monitoring",
            tag: "Dashboard",
            description: "A Grafana logistics dashboard for monitoring operational data in real time in an industrial environment.",
            image: "assets/project_metaverse.png",
            tech: ["Grafana", "Data Visualization", "SQL", "Monitoring"],
            status: "Completed",
            github: "https://github.com/DhimasEF",
            stats: {
                "Tool": "Grafana",
                "Type": "Logistics Dashboard",
                "Focus": "Real-time Data"
            }
        },
        {
            id: "proj-3",
            title: "AMV Community Web",
            category: "fullstack",
            categoryLabel: "Web Development & Community Platform",
            tag: "Web Application",
            description: "A community website that shares information and supports the needs of an Anime Music Video (AMV) community, built with a modern web development approach.",
            image: "assets/project_neural.png",
            tech: ["PHP", "JavaScript", "MySQL", "CSS3"],
            status: "Completed",
            github: "https://github.com/DhimasEF",
            stats: {
                "Platform": "Web",
                "Type": "Community Site",
                "Stack": "PHP + JS"
            }
        }
    ],

    experience: [
        {
            period: "July 2026 — Present",
            role: "Cashier • Administration • Warehouse Operations",
            organization: "Toko Jantan",
            description: "Process customer sales and payments, maintain operational records, monitor and organize inventory, and support receiving, storage, and order preparation."
        },
        {
            period: "2025 — 2026",
            role: "Staff IT",
            organization: "PT Hardo Soloplast",
            description: "Contributed to a VB.NET/Windows Forms Ticketing Management System (TMS). Supported database management, data integration, reporting, application troubleshooting, and technical support using SAP, Flutter/Android, .NET desktop, and local networks."
        },
        {
            period: "September 2024 — November 2024",
            role: "Web Development Intern",
            organization: "Dinas Tenaga Kerja Kota Semarang",
            description: "Helped develop a web-based information system for managing events and articles published by the Semarang City Department of Manpower, improving how information was organized and shared."
        }
    ],

    education: [
        {
            period: "Graduated 2025",
            degree: "B.Sc. in Computer Science",
            institution: "Universitas Kristen Teknologi Surakarta",
            description: "GPA: 3.82 / 4.00. Focused on software engineering, web and mobile development, and databases, with hands-on experience in academic projects and information systems."
        }
    ],

    github: {
        username: "DhimasEF",
        profileUrl: "https://github.com/DhimasEF",
        fallbackRepos: [
            {
                name: "ticketing-management-system",
                description: "An internal VB.NET/Windows Forms TMS supporting company request and assignment workflows.",
                language: "VB.NET",
                stars: 5,
                forks: 1,
                url: "https://github.com/DhimasEF",
                updated: "Recently"
            },
            {
                name: "amv-community-web",
                description: "A PHP and MySQL community website for sharing information and supporting AMV community services.",
                language: "PHP",
                stars: 3,
                forks: 0,
                url: "https://github.com/DhimasEF",
                updated: "2 months ago"
            },
            {
                name: "grafana-logistics-dashboard",
                description: "A Grafana dashboard for real-time logistics and operations monitoring.",
                language: "SQL",
                stars: 4,
                forks: 0,
                url: "https://github.com/DhimasEF",
                updated: "3 months ago"
            },
            {
                name: "web-codeigniter-project",
                description: "A PHP CodeIgniter information system with CRUD, REST API, and database management features.",
                language: "PHP",
                stars: 2,
                forks: 0,
                url: "https://github.com/DhimasEF",
                updated: "4 months ago"
            }
        ]
    },

    socials: [
        {
            platform: "GitHub",
            username: "github.com/DhimasEF",
            url: "https://github.com/DhimasEF",
            icon: "◈",
            color: "#39E6D0"
        },
        {
            platform: "Instagram",
            username: "@fly.y4z_4k3",
            url: "https://instagram.com/fly.y4z_4k3/",
            icon: "✦",
            color: "#5CE1E6"
        },
        {
            platform: "Email",
            username: "dhimasfirmansyah016@gmail.com",
            url: "mailto:dhimasfirmansyah016@gmail.com",
            icon: "✉",
            color: "#39E6D0"
        }
    ],

    contact: {
        heading: "LET'S BUILD SOMETHING TOGETHER.",
        subheading: "Interested in collaborating on a project, freelance work, or a creative idea? Send me a message.",
        email: "dhimasfirmansyah016@gmail.com",
        socialLink: "https://github.com/DhimasEF"
    },

    checkpoints: [
        {
            id: "start",
            name: "START",
            title: "WELCOME ABOARD",
            subtitle: "Begin exploring this small digital world with Chibi Miku.",
            icon: "✦",
            color: "#39E6D0",
            x: 0,
            z: 8
        },
        {
            id: "about",
            name: "PROFILE",
            title: "ABOUT ME",
            subtitle: "Learn about my background, approach, and work.",
            icon: "★",
            color: "#5CE1E6",
            x: -8,
            z: 3
        },
        {
            id: "skills",
            name: "SKILLS",
            title: "TECHNICAL CAPABILITIES",
            subtitle: "Programming languages, frameworks, and modern development tools.",
            icon: "⚡",
            color: "#8FFFF5",
            x: -6,
            z: -5
        },
        {
            id: "projects",
            name: "PROJECTS",
            title: "FEATURED WORK",
            subtitle: "Featured digital projects, 3D WebGL, and interactive applications.",
            icon: "❖",
            color: "#39E6D0",
            x: 0,
            z: -8
        },
        {
            id: "experience",
            name: "EXPERIENCE",
            title: "JOURNEY & TIMELINE",
            subtitle: "Professional experience and academic background.",
            icon: "◈",
            color: "#5CE1E6",
            x: 6,
            z: -5
        },
        {
            id: "github",
            name: "GITHUB",
            title: "OPEN SOURCE & REPOSITORIES",
            subtitle: "Explore source code and open-source contributions.",
            icon: "⌥",
            color: "#8FFFF5",
            x: 8,
            z: 3
        },
        {
            id: "contact",
            name: "CONTACT",
            title: "GET IN TOUCH",
            subtitle: "Get in touch to discuss a project or collaboration.",
            icon: "✉",
            color: "#39E6D0",
            x: 3,
            z: 7
        }
    ]
};
