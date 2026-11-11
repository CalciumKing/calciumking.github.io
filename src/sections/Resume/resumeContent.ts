export const RESUME_URL = '/simple-resume.pdf';

export type Category = 'education' | 'experience' | 'business' | 'project' | 'achievement';

export type Entry = {
	id: string;
	eyebrow: string;
	title: string;
	date: string;
	category: Category;
	description: string;
};

export const CATEGORY_LABEL: Record<Category, string> = {
	education: 'EDUCATION',
	experience: 'EXPERIENCE',
	business: 'BUSINESS',
	project: 'PROJECT',
	achievement: 'ACHIEVEMENT'
};

export const ENTRIES: Entry[] = [
	{
		id: 'roots',
		eyebrow: 'ROOTS',
		title: 'Programming Begins',
		date: '2016',
		category: 'education',
		description: 'Started programming at 9 years old after playing Watchdogs 2. Started with Windows VBScript (.vbs) and batch (.bat) scripts.'
	},
	{
		id: 'sprout',
		eyebrow: 'HIGH SCHOOL',
		title: 'Old Colony Regional Vocational Technical High School',
		date: '2021 – 2025',
		category: 'education',
		description: 'Attended a vocational high school, studying computer science. Learned programming fundamentals and eventually made apps for the school. Graduated with a 3.9 GPA.'
	},
	{
		id: 'trunk',
		eyebrow: 'INTERNSHIP',
		title: 'Stanford Internship',
		date: 'Summer 2025',
		category: 'experience',
		description: 'Landed an internship with the LCLS division of SLAC National Lab. Made a python application to manage inventory. Experienced programming in industry.'
	},
	{
		id: 'growth',
		eyebrow: 'FRESHMEN YEAR',
		title: 'UMass Boston',
		date: '2025 – 2026',
		category: 'education',
		description: 'Began studying computer science in a formal setting. Worked on several major projects and heightened programming abilities. First semester GPA: 3.98/4.00.'
	},
	{
		id: 'expansion',
		eyebrow: 'BUSINESS',
		title: 'Nexar Solutions',
		date: '2025 – 2026',
		category: 'business',
		description: 'Co-founder and CTO. Provided enterprise websites, chatbots, automations, marketing, and digital presence. Managed multiple clients simultaneously, scaled to ~$7k/mo.'
	},
	{
		id: 'maturation',
		eyebrow: 'SOPHOMORE YEAR',
		title: 'UMass Amherst',
		date: '2026 – Present',
		category: 'education',
		description: 'Transferred for a better education. Continued working on projects and expanded programming horizons.'
	}
];

export const INTRO = {
	eyebrow: '/RESUME',
	heading: 'Professional Growth',
	body: 'A professional history, from first code to current work.'
};

export const FINAL = {
	eyebrow: '// RESUME',
	heading: 'Download Resume',
	body: 'The complete record as a standard PDF.'
};
