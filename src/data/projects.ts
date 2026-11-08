import type { SceneFactory } from '../hooks/useThreeScene';

export type Project = {
    id: string;
    tagline: string;
    name: string;
    description: string;
    role?: string;
    technologies: string[];
    githubUrl?: string;
    liveUrl?: string;
    /** Wireframe visual. Omit until the project's scene exists; the frame renders empty. */
    scene?: SceneFactory;
};

// To add a visual: create a SceneFactory (see MobiusScene.ts) and set `scene` on the project.
export const PROJECTS: Project[] = [
    {
        id: 'nexar-solutions',
        tagline: 'FROM CAPABILITY TO DEPLOYMENT',
        name: 'Nexar Solutions',
        description: 'Commercial software and business development, including websites, AI chatbots, and automation systems.',
        role: 'Co-founder / CTO',
        technologies: [],
        liveUrl: 'https://nexartech.net/'
    },
    {
        id: 'slac-inventory',
        tagline: 'PRECISION AT SCALE',
        name: 'SLAC Inventory Management',
        description: "Inventory management software developed for the SLAC National Accelerator Laboratory's LCLS environment.",
        role: 'Full-Stack Intern',
        technologies: ['Python', 'PyQt', 'PyTest', 'MySQL'],
        githubUrl: 'https://github.com/CalciumKing/SLAC-LCLS-Stock-Management',
    },
    {
        id: 'calciumking-portfolio',
        tagline: 'ARCHITECTURE OF THE PROGRAMMER',
        name: 'CalciumKing Portfolio',
        description: 'This personal developer portfolio, featuring interactive 3D wireframe visuals and scroll-driven experiences.',
        role: 'Full-Stack Solo Developer',
        technologies: ['React', 'TypeScript', 'Vite', 'Three.js'],
        githubUrl: 'https://github.com/CalciumKing/calciumking.github.io',
    },
    {
        id: 'heimdall',
        tagline: 'BEYOND THE BLACK BOX',
        name: 'Heimdall',
        description: 'A neural network implementation and machine learning project, focused on the underlying engineering and experimentation.',
        role: 'Co-Developer',
        technologies: ['Java', 'JUnit'],
        githubUrl: 'https://github.com/9th-Floor-Developers/Heimdall',
    },
    {
        id: 'arch-dotfiles',
        tagline: 'ADAPTATION BY DESIGN',
        name: 'Arch Linux Dotfiles',
        description: 'A customized Arch Linux and Hyprland configuration, focused on system customization, workflow, and interface design.',
        technologies: ['Arch Linux', 'Hyprland', 'PyWal'],
        githubUrl: 'https://github.com/CalciumKing/dotfiles',
    },
    {
        id: 'oc-cosmetology',
        tagline: 'DESIGNED AROUND OPERATION',
        name: 'OC Cosmetology Application',
        description: 'A scheduling and service-tracking application for the Old Colony Regional Vocational Technical High School cosmetology program, built for real use.',
        role: 'Full-Stack Solo Developer',
        technologies: ['Java', 'JavaFX', 'SQL'],
        githubUrl: 'https://github.com/CalciumKing/OC_Cosmo_Application',
    },
];
