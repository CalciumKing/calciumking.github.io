import { useMemo } from 'react';
import { bilingual, useContent } from '../../i18n/content';

export type BodyKind = 'terran' | 'icosa' | 'dyson' | 'ringed' | 'belt' | 'banded';

export type Contact = {
	id: string;
	label: string;
	heading: string;
	display: string;
	href: string;
	external: boolean;
	copy?: string;
	body: BodyKind;
};

type ContactId = 'email' | 'github' | 'linkedin' | 'discord' | 'spotify';
type ContactText = {
	label: string;
	heading: string;
	display: string
};

const STRUCTURE: {
	id: ContactId;
	href: string;
	external: boolean;
	copy?: string;
	body: BodyKind
}[] = [
	{
		id: 'email',
		href: 'mailto:lkingerslev@gmail.com',
		external: false,
		copy: 'lkingerslev@gmail.com',
		body: 'terran'
	},
	{ id: 'github', href: 'https://github.com/CalciumKing', external: true, body: 'icosa' },
	{ id: 'linkedin', href: 'https://www.linkedin.com/in/landen-ingerslev', external: true, body: 'ringed' },
	{ id: 'discord', href: 'https://discordapp.com/users/541352538910359563', external: true, body: 'belt' },
	{
		id: 'spotify',
		href: 'https://open.spotify.com/user/31g5myjpi3aesuarmxy67vrybvwi?si=92ccbab32ccd4cba',
		external: true,
		body: 'banded'
	}
];
export const CONTACT_COUNT = STRUCTURE.length;
export const CONTACT_BODIES: BodyKind[] = STRUCTURE.map((s) => s.body);

const text = bilingual(
	{
		en: {
			contacts: {
				email: { label: 'EMAIL', heading: 'Primary Contact', display: 'lkingerslev@gmail.com' },
				github: { label: 'GITHUB', heading: 'Code', display: 'github.com/CalciumKing' },
				linkedin: {
					label: 'LINKEDIN',
					heading: 'Professional Profile',
					display: 'linkedin.com/in/landen-ingerslev'
				},
				discord: { label: 'DISCORD', heading: 'Direct Message', display: 'calcium_king on Discord' },
				spotify: { label: 'SPOTIFY', heading: 'Music Profile', display: 'CalciumKing on Spotify' }
			} as Record<ContactId, ContactText>,
			ui: {
				intro: {
					eyebrow: '/Contact',
					heading: 'Get In Touch',
					body: 'Email is the primary channel. Other destinations follow along the system.'
				},
				final: { eyebrow: '// ALL SOCIALS', heading: 'Contact' },
				stopSystem: 'System',
				stopContact: 'Contact',
				open: 'OPEN ↗',
				mail: 'MAIL →',
				ariaOpen: (label: string) => `Open ${ label } (new tab)`,
				ariaMail: (display: string) => `Email ${ display }`,
				copy: 'COPY',
				copied: 'COPIED',
				copyFailed: 'COPY FAILED'
			}
		},
		ru: {
			contacts: {
				email: { label: 'ПОЧТА', heading: 'Основной Контакт', display: 'lkingerslev@gmail.com' },
				github: { label: 'GITHUB', heading: 'Код', display: 'github.com/CalciumKing' },
				linkedin: {
					label: 'LINKEDIN',
					heading: 'Профессиональный Профиль',
					display: 'linkedin.com/in/landen-ingerslev'
				},
				discord: { label: 'DISCORD', heading: 'Личные Сообщения', display: 'calcium_king в Discord' },
				spotify: { label: 'SPOTIFY', heading: 'Музыкальный Профиль', display: 'CalciumKing в Spotify' }
			},
			ui: {
				intro: {
					eyebrow: '/КОНТАКТЫ',
					heading: 'Связаться Со Мной',
					body: 'Основной канал связи — электронная почта. Остальные способы — дальше по системе.'
				},
				final: { eyebrow: '// ВСЕ КОНТАКТЫ', heading: 'Контакты' },
				stopSystem: 'Система',
				stopContact: 'Контакты',
				open: 'ОТКРЫТЬ ↗',
				mail: 'ПИСЬМО →',
				ariaOpen: (label: string) => `Открыть ${ label } (в новой вкладке)`,
				ariaMail: (display: string) => `Написать на ${ display }`,
				copy: 'КОПИРОВАТЬ',
				copied: 'СКОПИРОВАНО',
				copyFailed: 'НЕ УДАЛОСЬ'
			}
		}
	}
);

export function useContactContent() {
	const t = useContent(text);
	const contacts = useMemo<Contact[]>(() => STRUCTURE.map((s) => ({ ...s, ...t.contacts[s.id] })), [t]);
	return { contacts, ui: t.ui };
}
