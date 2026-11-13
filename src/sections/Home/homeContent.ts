import { bilingual } from '../../i18n/content';

export const homeContent = bilingual(
	{
		en: {
			hero: {
				role: '// SOFTWARE ENGINEER',
				first: 'Landen',
				last: 'Ingerslev',
				statement: 'Working across disciplines. Driven by curiosity. Focused on building things that matter.'
			},
			sections: {
				computation: {
					label: '// MINDSET',
					title: 'Understand Before Building',
					statement: 'Good engineering starts with comprehension. I enjoy looking beyond the surface, questioning assumptions, and understanding the systems behind the things we use.'
				},
				intelligence: {
					label: '// CURIOSITY',
					title: 'Intelligence Through Connection',
					statement: 'The unknown is the frontier of knowledge. I\'m drawn to unfamiliar ideas, difficult questions, and unique perspectives.'
				},
				geometry: {
					label: '// PERSPECTIVE',
					title: 'Think Beyond Convention',
					statement: 'Possibilities emerge in challenging the model. I try to approach problems from different perspectives, and using ideas that challenge familiar ways of thinking.'
				}
			},
			directory: {
				label: '// DIRECTORY',
				entries: [
					{
						label: 'PROJECTS',
						description: 'Selected engineering work, software, and development projects.'
					},
					{ label: 'ABOUT', description: 'Background, capabilities, and personal introduction.' },
					{ label: 'RESUME', description: 'Professional experience, education, and qualifications.' },
					{ label: 'CONTACT', description: 'Contact information and correspondence.' }
				]
			},
			rail: ['Hero', 'Computation', 'Intelligence', 'Geometry', 'Directory']
		},
		ru: {
			hero: {
				role: '// ИНЖЕНЕР-ПРОГРАММИСТ',
				first: 'Landen',
				last: 'Ingerslev',
				statement: 'Работаю на стыке дисциплин. Двигает меня любопытство. Создаю то, что действительно важно.'
			},
			sections: {
				computation: {
					label: '// ПОДХОД',
					title: 'Сначала Понять, Потом Строить',
					statement: 'Хорошая инженерия начинается с понимания. Мне нравится смотреть глубже поверхности, подвергать сомнению допущения и разбираться в системах, на которых держится всё, чем мы пользуемся.'
				},
				intelligence: {
					label: '// ЛЮБОЗНАТЕЛЬНОСТЬ',
					title: 'Интеллект Рождается Из Связей',
					statement: 'Неизвестное — граница знания. Меня тянут незнакомые идеи, сложные вопросы и непривычные точки зрения.'
				},
				geometry: {
					label: '// ВЗГЛЯД',
					title: 'Мыслить За Рамками Привычного',
					statement: 'Новые возможности появляются, когда ставишь модель под сомнение. Я стараюсь смотреть на задачи под разными углами и опираться на идеи, которые выходят за рамки привычного мышления.'
				}
			},
			directory: {
				label: '// КАТАЛОГ',
				entries: [
					{ label: 'ПРОЕКТЫ', description: 'Избранные инженерные работы, программы и проекты.' },
					{ label: 'О_СЕБЕ', description: 'Опыт, навыки и краткое представление.' },
					{ label: 'РЕЗЮМЕ', description: 'Профессиональный опыт, образование и квалификация.' },
					{ label: 'КОНТАКТЫ', description: 'Контактные данные и связь.' }
				]
			},
			rail: ['Главная', 'Вычисления', 'Интеллект', 'Геометрия', 'Каталог']
		}
	}
);
