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

export const CONTACTS: Contact[] = [
	{
		id: 'email',
		label: 'EMAIL',
		heading: 'Primary Contact',
		display: 'lkingerslev@gmail.com',
		href: 'mailto:lkingerslev@gmail.com',
		external: false,
		copy: 'lkingerslev@gmail.com',
		body: 'terran'
	},
	{
		id: 'github',
		label: 'GITHUB',
		heading: 'Code',
		display: 'github.com/CalciumKing',
		href: 'https://github.com/CalciumKing',
		external: true,
		body: 'icosa'
	},
	{
		id: 'linkedin',
		label: 'LINKEDIN',
		heading: 'Professional Profile',
		display: 'linkedin.com/in/landen-ingerslev',
		href: 'https://www.linkedin.com/in/landen-ingerslev',
		external: true,
		body: 'ringed'
	},
	{
		id: 'discord',
		label: 'DISCORD',
		heading: 'Direct Message',
		display: 'calcium_king on Discord',
		href: 'https://discordapp.com/users/541352538910359563',
		external: true,
		body: 'belt'
	},
	{
		id: 'spotify',
		label: 'SPOTIFY',
		heading: 'Music Profile',
		display: 'CalciumKing on Spotify',
		href: 'https://open.spotify.com/user/31g5myjpi3aesuarmxy67vrybvwi?si=92ccbab32ccd4cba',
		external: true,
		body: 'banded'
	}
];

export const INTRO = {
	eyebrow: '/Contact',
	heading: 'Get In Touch',
	body: 'Email is the primary channel. Other destinations follow along the system.'
};

export const FINAL = {
	eyebrow: '// ALL SOCIALS',
	heading: 'Contact'
};
