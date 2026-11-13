import { useMemo } from 'react';
import type { SceneFactory } from '../../hooks/useThreeScene';
import { bilingual, useContent } from '../../i18n/content';

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

type ProjectId = 'nexar-solutions' | 'slac-inventory' | 'calciumking-portfolio' | 'heimdall' | 'arch-dotfiles'
                 | 'oc-cosmetology';
type ProjectText = {
	tagline: string;
	name: string;
	description: string;
	role?: string
};

const STRUCTURE: {
	id: ProjectId;
	technologies: string[];
	githubUrl?: string;
	liveUrl?: string;
	scene?: SceneFactory
}[] = [
	{ id: 'nexar-solutions', technologies: [], liveUrl: 'https://nexartech.net/' },
	{
		id: 'slac-inventory',
		technologies: ['Python', 'PyQt', 'PyTest', 'MySQL'],
		githubUrl: 'https://github.com/CalciumKing/SLAC-LCLS-Stock-Management'
	},
	{
		id: 'calciumking-portfolio',
		technologies: ['React', 'TypeScript', 'Vite', 'Three.js'],
		githubUrl: 'https://github.com/CalciumKing/calciumking.github.io',
		liveUrl: 'https://cloud.umami.is/share/iTT3nl1TAv5GZasa'
	},
	{
		id: 'heimdall',
		technologies: ['Java', 'JUnit'],
		githubUrl: 'https://github.com/9th-Floor-Developers/Heimdall'
	},
	{
		id: 'arch-dotfiles',
		technologies: ['Arch Linux', 'Hyprland', 'Shell'],
		githubUrl: 'https://github.com/CalciumKing/dotfiles'
	},
	{
		id: 'oc-cosmetology',
		technologies: ['Java', 'JavaFX', 'MySQL'],
		githubUrl: 'https://github.com/CalciumKing/OC_Cosmo_Application'
	}
];
export const PROJECT_COUNT = STRUCTURE.length;

const text = bilingual(
	{
		en: {
			projects: {
				'nexar-solutions': {
					tagline: 'FROM CAPABILITY TO DEPLOYMENT',
					name: 'Nexar Solutions',
					description: 'Commercial software and business development, including websites, AI chatbots, and automation systems.',
					role: 'Co-founder / CTO'
				},
				'slac-inventory': {
					tagline: 'PRECISION AT SCALE',
					name: 'SLAC Inventory Management',
					description: 'Inventory management software developed for the SLAC National Accelerator Laboratory\'s LCLS environment.',
					role: 'Full-Stack Intern'
				},
				'calciumking-portfolio': {
					tagline: 'ARCHITECTURE OF THE PROGRAMMER',
					name: 'CalciumKing Portfolio',
					description: 'This personal developer portfolio website, featuring interactive 3D wireframe visuals and a scroll-driven experiences.',
					role: 'Full-Stack Solo Developer'
				},
				heimdall: {
					tagline: 'BEYOND THE BLACK BOX',
					name: 'Heimdall',
					description: 'A configurable neural network designed to train on diverse datasets, exploring pattern recognition and learning across different types of data.',
					role: 'Co-Developer'
				},
				'arch-dotfiles': {
					tagline: 'ADAPTATION BY DESIGN',
					name: 'Arch Linux Dotfiles',
					description: 'A customized Arch Linux and Hyprland configuration, focused on system customization, workflow, and interface design.'
				},
				'oc-cosmetology': {
					tagline: 'DESIGNED AROUND OPERATION',
					name: 'OC Cosmetology Application',
					description: 'A scheduling and service-tracking application for the Old Colony Regional Vocational Technical High School cosmetology program, built for real use.',
					role: 'Full-Stack Solo Developer'
				}
			} as Record<ProjectId, ProjectText>,
			ui: {
				hero: {
					eyebrow: '/PROJECTS',
					title: 'Selected Work',
					description: 'A collection of engineering, software, and independent development work.'
				},
				selected: 'Selected projects',
				leading: 'Projects',
				slide: { role: 'ROLE', technologies: 'TECHNOLOGIES', github: 'GITHUB ↗', live: 'LIVE PROJECT ↗' }
			}
		},
		ru: {
			projects: {
				'nexar-solutions': {
					tagline: 'ОТ ВОЗМОЖНОСТЕЙ К РЕАЛИЗАЦИИ',
					name: 'Nexar Solutions',
					description: 'Коммерческое программное обеспечение и развитие бизнеса: сайты, ИИ-чат-боты и системы автоматизации.',
					role: 'Сооснователь / CTO'
				},
				'slac-inventory': {
					tagline: 'ТОЧНОСТЬ В МАСШТАБЕ',
					name: 'SLAC Inventory Management',
					description: 'Программа для учёта инвентаря, разработанная для подразделения LCLS Национальной ускорительной лаборатории SLAC.',
					role: 'Full-Stack-стажёр'
				},
				'calciumking-portfolio': {
					tagline: 'АРХИТЕКТУРА ПРОГРАММИСТА',
					name: 'CalciumKing Portfolio',
					description: 'Этот личный сайт-портфолио разработчика с интерактивными 3D-каркасными визуализациями и сценариями, управляемыми прокруткой.',
					role: 'Full-Stack-разработчик (в одиночку)'
				},
				heimdall: {
					tagline: 'ЗА ПРЕДЕЛАМИ ЧЁРНОГО ЯЩИКА',
					name: 'Heimdall',
					description: 'Настраиваемая нейронная сеть, которая обучается на разнообразных наборах данных и исследует распознавание закономерностей и обучение на данных разного типа.',
					role: 'Соразработчик'
				},
				'arch-dotfiles': {
					tagline: 'АДАПТАЦИЯ ЧЕРЕЗ ДИЗАЙН',
					name: 'Arch Linux Dotfiles',
					description: 'Индивидуально настроенная конфигурация Arch Linux и Hyprland: кастомизация системы, рабочий процесс и дизайн интерфейса.'
				},
				'oc-cosmetology': {
					tagline: 'СПРОЕКТИРОВАНО ПОД РАБОТУ',
					name: 'OC Cosmetology Application',
					description: 'Приложение для записи и учёта услуг для программы косметологии в Old Colony Regional Vocational Technical High School, созданное для реального использования.',
					role: 'Full-Stack-разработчик (в одиночку)'
				}
			},
			ui: {
				hero: {
					eyebrow: '/ПРОЕКТЫ',
					title: 'Избранные Работы',
					description: 'Подборка инженерных, программных и самостоятельных разработок.'
				},
				selected: 'Избранные Проекты',
				leading: 'Проекты',
				slide: { role: 'РОЛЬ', technologies: 'ТЕХНОЛОГИИ', github: 'GITHUB ↗', live: 'ОТКРЫТЬ ПРОЕКТ ↗' }
			}
		}
	}
);

export function useProjects(): Project[] {
	const t = useContent(text);
	return useMemo(() => STRUCTURE.map((s) => ({ ...s, ...t.projects[s.id] })), [t]);
}

export const useProjectsUi = () => useContent(text).ui;
