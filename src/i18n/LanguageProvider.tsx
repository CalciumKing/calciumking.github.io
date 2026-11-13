import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { type Lang, LanguageContext } from './languageContext';
import { DEFAULT_LANG, isLang } from './languages';

const KEY = 'ck-lang';

const read = (): Lang => {
	try {
		const stored = localStorage.getItem(KEY);
		return isLang(stored) ? stored : DEFAULT_LANG;
	} catch {
		return DEFAULT_LANG;
	}
};

export default function LanguageProvider({ children }: {
	children: ReactNode
}) {
	const [lang, setLangState] = useState<Lang>(read);
	
	const setLang = useCallback((next: Lang) => {
		setLangState(next);
		try {
			localStorage.setItem(KEY, next);
		} catch {}
	}, []);
	
	useEffect(() => {
		document.documentElement.lang = lang;
	}, [lang]);
	
	const value =
		useMemo(() => ({ lang, setLang }), [lang, setLang]);
	return <LanguageContext.Provider value={ value }>{ children }</LanguageContext.Provider>;
}
