import { useMemo } from 'react';
import { bilingual, useContent } from '../../i18n/content';

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

type EntryId = 'roots' | 'sprout' | 'trunk' | 'growth' | 'expansion' | 'maturation';
type EntryText = {
	eyebrow: string;
	title: string;
	date: string;
	description: string
};

const STRUCTURE: {
	id: EntryId;
	category: Category
}[] = [
	{ id: 'roots', category: 'education' },
	{ id: 'sprout', category: 'education' },
	{ id: 'trunk', category: 'experience' },
	{ id: 'growth', category: 'education' },
	{ id: 'expansion', category: 'business' },
	{ id: 'maturation', category: 'education' }
];
export const ENTRY_COUNT = STRUCTURE.length;

const text = bilingual(
	{
		en: {
			entries: {
				roots: {
					eyebrow: 'ROOTS',
					title: 'Programming Begins',
					date: '2016',
					description: 'Started programming at 9 years old after playing Watchdogs 2. Started with Windows VBScript (.vbs) and batch (.bat) scripts.'
				},
				sprout: {
					eyebrow: 'HIGH SCHOOL',
					title: 'Old Colony Regional Vocational Technical High School',
					date: '2021 – 2025',
					description: 'Attended a vocational high school, studying computer science. Learned programming fundamentals and eventually made apps for the school. Graduated with a 3.9 GPA.'
				},
				trunk: {
					eyebrow: 'INTERNSHIP',
					title: 'Stanford Internship',
					date: 'Summer 2025',
					description: 'Landed an internship with the LCLS division of SLAC National Lab. Made a python application to manage inventory. Experienced programming in industry.'
				},
				growth: {
					eyebrow: 'FRESHMEN YEAR',
					title: 'UMass Boston',
					date: '2025 – 2026',
					description: 'Began studying computer science in a formal setting. Worked on several major projects and heightened programming abilities. First semester GPA: 3.98/4.00.'
				},
				expansion: {
					eyebrow: 'BUSINESS',
					title: 'Nexar Solutions',
					date: '2025 – 2026',
					description: 'Co-founder and CTO. Provided enterprise websites, chatbots, automations, marketing, and digital presence. Managed multiple clients simultaneously, scaled to ~$7k/mo.'
				},
				maturation: {
					eyebrow: 'SOPHOMORE YEAR',
					title: 'UMass Amherst',
					date: '2026 – Present',
					description: 'Transferred for a better education. Continued working on projects and expanded programming horizons.'
				}
			} as Record<EntryId, EntryText>,
			ui: {
				categories: {
					education: 'EDUCATION',
					experience: 'EXPERIENCE',
					business: 'BUSINESS',
					project: 'PROJECT',
					achievement: 'ACHIEVEMENT'
				} as Record<Category, string>,
				intro: {
					eyebrow: '/RESUME',
					heading: 'Professional Growth',
					body: 'A professional history, from first code to current work.'
				},
				final: {
					eyebrow: '// RESUME',
					heading: 'Download Resume',
					body: 'The complete record as a standard PDF.'
				},
				stopIntro: 'Resume',
				stopFinal: 'Download',
				download: 'DOWNLOAD RESUME ↓',
				downloadAria: 'Download resume (PDF)'
			}
		},
		ru: {
			entries: {
				roots: {
					eyebrow: 'КОРНИ',
					title: 'Начало Пути В Программировании',
					date: '2016',
					description: 'Начал программировать в 9 лет после игры в Watch Dogs 2. Начал со скриптов Windows VBScript (.vbs) и пакетных файлов (.bat).'
				},
				sprout: {
					eyebrow: 'СТАРШАЯ ШКОЛА',
					title: 'Old Colony Regional Vocational Technical High School',
					date: '2021 – 2025',
					description: 'Учился в профессионально-технической школе, изучал информатику. Освоил основы программирования и со временем создавал приложения для школы. Окончил с GPA 3,9.'
				},
				trunk: {
					eyebrow: 'СТАЖИРОВКА',
					title: 'Стажировка В Стэнфорде',
					date: 'Лето 2025',
					description: 'Получил стажировку в подразделении LCLS Национальной ускорительной лаборатории SLAC. Написал приложение на Python для учёта инвентаря. Познакомился с программированием в индустрии.'
				},
				growth: {
					eyebrow: 'ПЕРВЫЙ КУРС',
					title: 'UMass Boston',
					date: '2025 – 2026',
					description: 'Начал изучать информатику в университете. Работал над несколькими крупными проектами и укрепил навыки программирования. Средний балл за первый семестр: 3,98 из 4,00.'
				},
				expansion: {
					eyebrow: 'БИЗНЕС',
					title: 'Nexar Solutions',
					date: '2025 – 2026',
					description: 'Сооснователь и технический директор (CTO). Создавал корпоративные сайты, чат-боты, автоматизации, занимался маркетингом и цифровым присутствием. Вёл сразу нескольких клиентов, масштабировал бизнес до ~7 тыс. долларов в месяц.'
				},
				maturation: {
					eyebrow: 'ВТОРОЙ КУРС',
					title: 'UMass Amherst',
					date: '2026 – настоящее время',
					description: 'Перевёлся ради лучшего образования. Продолжил работу над проектами и расширил горизонты в программировании.'
				}
			},
			ui: {
				categories: {
					education: 'ОБРАЗОВАНИЕ',
					experience: 'ОПЫТ',
					business: 'БИЗНЕС',
					project: 'ПРОЕКТ',
					achievement: 'ДОСТИЖЕНИЕ'
				},
				intro: {
					eyebrow: '/РЕЗЮМЕ',
					heading: 'Профессиональный Рост',
					body: 'Профессиональный путь — от первых строк кода до текущей работы.'
				},
				final: {
					eyebrow: '// РЕЗЮМЕ',
					heading: 'Скачать Резюме',
					body: 'Полная история в виде стандартного PDF (на английском языке).'
				},
				stopIntro: 'Резюме',
				stopFinal: 'Скачать',
				download: 'СКАЧАТЬ РЕЗЮМЕ (EN) ↓',
				downloadAria: 'Скачать резюме (PDF, на английском языке)'
			}
		}
	}
);

export function useResumeContent() {
	const t = useContent(text);
	const entries = useMemo<Entry[]>(
		() => STRUCTURE.map(({ id, category }) => ({ id, category, ...t.entries[id] })),
		[t]
	);
	return { entries, ui: t.ui };
}
