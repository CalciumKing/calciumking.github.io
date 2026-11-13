import { type Lang, useLanguage } from './languageContext';

export type Bilingual<T> = Record<Lang, T>;

export const bilingual = <T>(content: Bilingual<T>): Bilingual<T> => content;

export function useContent<T>(content: Bilingual<T>): T {
	return content[useLanguage().lang];
}
