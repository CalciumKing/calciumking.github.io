export type Phase = {
    id: string;
    label: string; // section rail label
    at: number; // scroll progress where this phase is fully established
    side: 'left' | 'right' | 'center';
    eyebrow: string;
    heading: string;
    body?: string;
    items?: string[];
    groups?: { label: string; items: string[] }[];
    links?: { label: string; to: string }[];
};

export const PHASES: Phase[] = [
    {
        id: 'identity',
        label: 'Identity',
        at: 0,
        side: 'left',
        eyebrow: '01 / IDENTITY',
        heading: 'Landen Ingerslev',
        body: "I'm a software developer interested in building intelligent systems, computational tools, and software that solves practical problems.",
    },
    {
        id: 'approach',
        label: 'Approach',
        at: 0.27,
        side: 'right',
        eyebrow: '02 / APPROACH',
        heading: 'Start with the problem',
        items: [
            'Understand the underlying problem before implementing a solution.',
            'Think in systems: how each component behaves and how they interact.',
            'Build software that is functional, maintainable, and purposeful.',
            'Pair theoretical understanding with practical implementation.',
        ],
    },
    {
        id: 'foundation',
        label: 'Foundation',
        at: 0.52,
        side: 'left',
        eyebrow: '03 / FOUNDATION',
        heading: 'Technical foundation',
        groups: [
            { label: 'Languages', items: ['Kotlin', 'Java', 'Python', 'TypeScript', 'JavaScript'] },
            { label: 'Software', items: ['React', 'Three.js', 'PyQt', 'MySQL'] },
            { label: 'Exploration', items: ['Neural networks', 'Computational modeling'] },
        ],
    },
    {
        id: 'direction',
        label: 'Direction',
        at: 0.7,
        side: 'right',
        eyebrow: '04 / DIRECTION',
        heading: 'What I want to build next',
        items: [
            'Computational intelligence and neural networks.',
            'Mathematical modeling and higher-dimensional spaces.',
            'Systems engineering and software architecture.',
            'Tools that make complex concepts understandable.',
        ],
    },
    {
        id: 'conclusion',
        label: 'Conclusion',
        at: 0.86,
        side: 'center',
        eyebrow: '05 / NEXT',
        heading: 'See the work',
        body: 'Selected projects, or get in touch.',
        links: [
            { label: 'PROJECTS', to: '/projects' },
            { label: 'CONTACT', to: '/contact' },
        ],
    },
];
