import { createContext, useContext } from 'react';
import { DEFAULT_LANG, type Lang } from './languages';

export type { Lang };

export type LanguageValue = {
	lang: Lang;
	setLang: (lang: Lang) => void;
};

export const LanguageContext = createContext<LanguageValue>({ lang: DEFAULT_LANG, setLang: () => {} });

export const useLanguage = () => useContext(LanguageContext);
