import { type FocusEvent, useEffect, useRef, useState } from 'react';
import { common } from '../../i18n/common';
import { useContent } from '../../i18n/content';
import { useLanguage } from '../../i18n/languageContext';
import { LANGUAGES } from '../../i18n/languages';
import styles from './LanguageToggle.module.css';

export default function LanguageToggle() {
	const { lang, setLang } = useLanguage();
	const c = useContent(common);
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
	
	useEffect(() => {
		if (!open)
			return;
		const onDown = (e: PointerEvent) => {
			if (!rootRef.current?.contains(e.target as Node))
				setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== 'Escape')
				return;
			setOpen(false);
			rootRef.current?.querySelector('button')?.focus();
		};
		document.addEventListener('pointerdown', onDown);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('pointerdown', onDown);
			document.removeEventListener('keydown', onKey);
		};
	}, [open]);
	
	const onBlur = (e: FocusEvent<HTMLDivElement>) => {
		if (!e.currentTarget.contains(e.relatedTarget))
			setOpen(false);
	};
	
	return (
		<div ref={ rootRef } className={ styles.root } onBlur={ onBlur }>
			<button
				type="button"
				className={ styles.trigger }
				aria-haspopup="true"
				aria-expanded={ open }
				aria-label={ `${ c.language }: ${ current.name }` }
				onClick={ () => setOpen((o) => !o) }
			>
				{ '<' }{ current.label }{ '>' }
				<span className={ styles.chevron } aria-hidden="true"/>
			</button>
			{ open && (
				<ul className={ styles.menu }>
					{ LANGUAGES.map((l) => (
						<li key={ l.code }>
							<button
								type="button"
								lang={ l.code }
								className={ l.code === lang ? `${ styles.option } ${ styles.active }` : styles.option }
								aria-current={ l.code === lang ? 'true' : undefined }
								onClick={ () => {
									setLang(l.code);
									setOpen(false);
								} }
							>
								<span className={ styles.code }>{ l.label }</span>
								<span>{ l.name }</span>
							</button>
						</li>
					)) }
				</ul>
			) }
		</div>
	);
}
