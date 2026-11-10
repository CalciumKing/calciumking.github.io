import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

export function useScrollProgress(trackRef: RefObject<HTMLElement>, enabled: boolean) {
	const progress = useRef(0);
	
	useEffect(() => {
		const track = trackRef.current;
		if (!track || !enabled)
			return;
		const sticky = track.firstElementChild as HTMLElement | null;
		
		const update = () => {
			const range = track.offsetHeight - (sticky?.offsetHeight ?? window.innerHeight);
			const top = track.getBoundingClientRect().top;
			const p = range > 0 ? Math.min(1, Math.max(0, -top / range)) : 0;
			progress.current = p;
			track.style.setProperty('--p', p.toFixed(4));
		};
		
		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	}, [trackRef, enabled]);
	
	return progress;
}
