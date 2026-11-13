import { bilingual } from './content';

export const common = bilingual(
	{
		en: {
			navLabel: 'Primary',
			language: 'Language',
			links: [
				{ label: '/ABOUT', to: '/about' },
				{ label: '/PROJECTS', to: '/projects' },
				{ label: '/RESUME', to: '/resume' },
				{ label: '/CONTACT', to: '/contact' }
			],
			footer: ['THE CALCIUM KING', 'LANDEN INGERSLEV', 'SOFTWARE ENGINEER'],
			scroll: 'SCROLL',
			titles: {
				Home: 'Home',
				Projects: 'Projects',
				About: 'About',
				Resume: 'Resume',
				Contact: 'Contact',
				'404': '404'
			},
			pageSections: 'Page sections'
		},
		ru: {
			navLabel: 'Основная Навигация',
			language: 'Язык',
			links: [
				{ label: '/О_СЕБЕ', to: '/about' },
				{ label: '/ПРОЕКТЫ', to: '/projects' },
				{ label: '/РЕЗЮМЕ', to: '/resume' },
				{ label: '/КОНТАКТЫ', to: '/contact' }
			],
			footer: ['THE CALCIUM KING', 'LANDEN INGERSLEV', 'ИНЖЕНЕР-ПРОГРАММИСТ'],
			scroll: 'ПРОКРУТИТЕ',
			titles: {
				Home: 'Главная',
				Projects: 'Проекты',
				About: 'О Себе',
				Resume: 'Резюме',
				Contact: 'Контакты',
				'404': '404'
			},
			pageSections: 'Разделы Страницы'
		}
	}
);
