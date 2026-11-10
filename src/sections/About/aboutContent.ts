export type Phase = {
	id: string;
	label: string; // section rail label
	at: number; // scroll progress where this phase is fully established
	side: 'left' | 'right' | 'center';
	eyebrow: string;
	heading: string;
	body?: string;
	items?: string[];
	groups?: {
		label: string;
		items: string[]
	}[];
	links?: {
		label: string;
		to: string
	}[];
};

export const PHASES: Phase[] = [
	{
		id: 'identity',
		label: 'Identity',
		at: 0,
		side: 'left',
		eyebrow: '/About',
		heading: 'The Engineer',
		body: 'An introduction to the engineer, the principles behind the work, and the systems that shape my approach.'
	},
	{
		id: 'approach',
		label: 'Approach',
		at: 0.27,
		side: 'right',
		eyebrow: '// BACKGROUND',
		heading: 'whoami',
		items: [
			'Landen Ingerslev, otherwise known online as Calcium King',
			'Studying computer science, constantly building projects',
			'Started programming at 9 years old after playing Watchdogs 2',
			'Extensive experience building websites, apps, software, scripts, etc.'
		]
	},
	{
		id: 'foundation',
		label: 'Foundation',
		at: 0.52,
		side: 'left',
		eyebrow: '// FOUNDATION',
		heading: 'Technical foundation',
		groups: [
			{ label: 'Languages', items: ['Kotlin', 'Java', 'Python', 'TypeScript'] },
			{ label: 'Frameworks', items: ['Java Swing', 'PyQt', 'Three.js'] },
			{ label: 'Tools', items: ['JetBrains IDEs', 'Git', 'Linux'] }
		]
	},
	{
		id: 'direction',
		label: 'Direction',
		at: 0.7,
		side: 'right',
		eyebrow: '// DIRECTION',
		heading: 'Current Interests',
		items: [
			'Computational intelligence and neural networks.',
			'Mathematical modeling and higher-dimensional spaces.',
			'Systems engineering and software architecture.',
			'Tools that make complex concepts understandable.'
		]
	},
	{
		id: 'conclusion',
		label: 'Conclusion',
		at: 0.86,
		side: 'center',
		eyebrow: '// NEXT',
		heading: 'See the work',
		body: 'Selected projects, or get in touch.',
		links: [
			{ label: 'PROJECTS', to: '/projects' },
			{ label: 'CONTACT', to: '/contact' }
		]
	}
];
