export const LANGUAGES = [
	{ code: 'en', label: 'EN', name: 'English' },
	{ code: 'ru', label: 'RU', name: 'Русский' }
] as const;

export type Lang = (typeof LANGUAGES)[number]['code'];
export const DEFAULT_LANG: Lang = 'en';

export const isLang = (value: unknown): value is Lang =>
	LANGUAGES.some((l) => l.code === value);
