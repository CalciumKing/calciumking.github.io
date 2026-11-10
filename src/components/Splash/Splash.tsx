import { useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Splash.module.css';

const HOLD = 700;
const FADE = 500;

export default function Splash() {
	const { pathname } = useLocation();
	const first = useRef(true);
	const [phase, setPhase] = useState<'off' | 'on' | 'fading'>('off');
	
	useLayoutEffect(() => {
		if (first.current) {
			first.current = false;
			return;
		}
		setPhase('on');
		const t1 = window.setTimeout(() => setPhase('fading'), HOLD);
		const t2 = window.setTimeout(() => setPhase('off'), HOLD + FADE);
		return () => {
			window.clearTimeout(t1);
			window.clearTimeout(t2);
		};
	}, [pathname]);
	
	if (phase === 'off')
		return null;
	
	return (
		<div className={ `${ styles.splash } ${ phase === 'fading' ? styles.hidden : '' }` } aria-hidden="true">
			<img src="/git-triad-transparent-bg.png" alt="" className={ styles.logo }/>
		</div>
	);
}
