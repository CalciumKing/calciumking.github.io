import { useMemo } from 'react';
import { bilingual, useContent } from '../../i18n/content';

export type Phase = {
	id: string;
	label: string;
	at: number;
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

type PhaseId = 'identity' | 'approach' | 'foundation' | 'direction' | 'conclusion';
type PhaseText = {
	label: string;
	eyebrow: string;
	heading: string;
	body?: string;
	items?: string[];
	groups?: {
		label: string;
		items: string[]
	}[];
	links?: string[];
};

const STRUCTURE: {
	id: PhaseId;
	at: number;
	side: Phase['side'];
	links?: string[]
}[] = [
	{ id: 'identity', at: 0, side: 'left' },
	{ id: 'approach', at: 0.27, side: 'right' },
	{ id: 'foundation', at: 0.52, side: 'left' },
	{ id: 'direction', at: 0.7, side: 'right' },
	{ id: 'conclusion', at: 0.86, side: 'center', links: ['/projects', '/contact'] }
];
export const PHASE_AT = STRUCTURE.map((p) => p.at);

const text = bilingual<Record<PhaseId, PhaseText>>(
	{
		en: {
			identity: {
				label: 'Identity',
				eyebrow: '/About',
				heading: 'The Engineer',
				body: 'An introduction to the engineer, the principles behind the work, and the systems that shape my approach.'
			},
			approach: {
				label: 'Approach',
				eyebrow: '// BACKGROUND',
				heading: 'whoami',
				items: [
					'Landen Ingerslev, known online as Calcium King',
					'Studying computer science and building projects',
					'Started programming at 9 years old',
					'Extensive experience building websites, apps, software, scripts, etc.'
				]
			},
			foundation: {
				label: 'Foundation',
				eyebrow: '// FOUNDATION',
				heading: 'Technical Foundation',
				groups: [
					{ label: 'Languages', items: ['Kotlin', 'Java', 'Python', 'TypeScript'] },
					{ label: 'Frameworks', items: ['Java Swing', 'PyQt', 'Three.js'] },
					{ label: 'Tools', items: ['JetBrains IDEs', 'Git', 'Linux'] }
				]
			},
			direction: {
				label: 'Direction',
				eyebrow: '// DIRECTION',
				heading: 'Current Interests',
				items: [
					'Computational intelligence and neural networks.',
					'Mathematical modeling and higher-dimensional spaces.',
					'Systems engineering and software architecture.',
					'Tools that make complex concepts understandable.'
				]
			},
			conclusion: {
				label: 'Conclusion',
				eyebrow: '// NEXT',
				heading: 'See The Work',
				body: 'Selected projects, or get in touch.',
				links: ['PROJECTS', 'CONTACT']
			}
		},
		ru: {
			identity: {
				label: 'Обо Mне',
				eyebrow: '/О_СЕБЕ',
				heading: 'Инженер',
				body: 'Знакомство с инженером, принципами, на которых строится работа, и системами, определяющими мой подход.'
			},
			approach: {
				label: 'Подход',
				eyebrow: '// БИОГРАФИЯ',
				heading: 'Кто Я?',
				items: [
					'Landen Ingerslev, в сети известен как Calcium King',
					'Изучаю информатику и создаю проекты',
					'Начал программировать в 9 лет',
					'Большой опыт создания сайтов, приложений, программ, скриптов и многого другого'
				]
			},
			foundation: {
				label: 'Основа',
				eyebrow: '// ОСНОВА',
				heading: 'Технический Фундамент',
				groups: [
					{ label: 'Языки', items: ['Kotlin', 'Java', 'Python', 'TypeScript'] },
					{ label: 'Фреймворки', items: ['Java Swing', 'PyQt', 'Three.js'] },
					{ label: 'Инструменты', items: ['JetBrains IDEs', 'Git', 'Linux'] }
				]
			},
			direction: {
				label: 'Направление',
				eyebrow: '// НАПРАВЛЕНИЕ',
				heading: 'Текущие Интересы',
				items: [
					'Вычислительный интеллект и нейронные сети.',
					'Математическое моделирование и многомерные пространства.',
					'Системная инженерия и архитектура программного обеспечения.',
					'Инструменты, которые делают сложные идеи понятными.'
				]
			},
			conclusion: {
				label: 'Итог',
				eyebrow: '// ДАЛЕЕ',
				heading: 'Смотрите Работы',
				body: 'Избранные проекты или связь со мной.',
				links: ['ПРОЕКТЫ', 'КОНТАКТЫ']
			}
		}
	}
);

export function usePhases(): Phase[] {
	const t = useContent(text);
	return useMemo(
		() => STRUCTURE.map(({ id, at, side, links }) => {
			const { links: labels, ...rest } = t[id];
			return { id, at, side, ...rest, links: links?.map((to, i) => ({ to, label: labels![i] })) };
		}),
		[t]
	);
}
