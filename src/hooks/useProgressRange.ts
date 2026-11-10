import { useEffect, useState } from 'react';

export function useProgressRange(progress: {
	current: number
}, lo: number, hi: number, enabled: boolean) {
	const [inside, setInside] = useState(false);
	
	useEffect(() => {
		if (!enabled)
			return;
		const update = () => setInside(progress.current > lo && progress.current < hi);
		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	}, [progress, lo, hi, enabled]);
	
	return inside;
}
