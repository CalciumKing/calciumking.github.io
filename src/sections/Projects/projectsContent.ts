import type { SceneFactory } from '../../hooks/useThreeScene';

export type Project = {
	id: string;
	tagline: string;
	name: string;
	description: string;
	role?: string;
	technologies: string[];
	githubUrl?: string;
	liveUrl?: string;
	scene?: SceneFactory;
};

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
		description: 'Inventory management software developed for the SLAC National Accelerator Laboratory\'s LCLS environment.',
		role: 'Full-Stack Intern',
		technologies: ['Python', 'PyQt', 'PyTest', 'MySQL'],
		githubUrl: 'https://github.com/CalciumKing/SLAC-LCLS-Stock-Management'
	},
	{
		id: 'calciumking-portfolio',
		tagline: 'ARCHITECTURE OF THE PROGRAMMER',
		name: 'CalciumKing Portfolio',
		description: 'This personal developer portfolio website, featuring interactive 3D wireframe visuals and a scroll-driven experiences.',
		role: 'Full-Stack Solo Developer',
		technologies: ['React', 'TypeScript', 'Vite', 'Three.js'],
		githubUrl: 'https://github.com/CalciumKing/calciumking.github.io',
		liveUrl: 'https://cloud.umami.is/share/iTT3nl1TAv5GZasa'
	},
	{
		id: 'heimdall',
		tagline: 'BEYOND THE BLACK BOX',
		name: 'Heimdall',
		description: 'A configurable neural network designed to train on diverse datasets, exploring pattern recognition and learning across different types of data.',
		role: 'Co-Developer',
		technologies: ['Java', 'JUnit'],
		githubUrl: 'https://github.com/9th-Floor-Developers/Heimdall'
	},
	{
		id: 'arch-dotfiles',
		tagline: 'ADAPTATION BY DESIGN',
		name: 'Arch Linux Dotfiles',
		description: 'A customized Arch Linux and Hyprland configuration, focused on system customization, workflow, and interface design.',
		technologies: ['Arch Linux', 'Hyprland', 'Shell'],
		githubUrl: 'https://github.com/CalciumKing/dotfiles'
	},
	{
		id: 'oc-cosmetology',
		tagline: 'DESIGNED AROUND OPERATION',
		name: 'OC Cosmetology Application',
		description: 'A scheduling and service-tracking application for the Old Colony Regional Vocational Technical High School cosmetology program, built for real use.',
		role: 'Full-Stack Solo Developer',
		technologies: ['Java', 'JavaFX', 'MySQL'],
		githubUrl: 'https://github.com/CalciumKing/OC_Cosmo_Application'
	}
];
