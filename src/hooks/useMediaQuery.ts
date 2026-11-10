import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(
		() => typeof window !== 'undefined' && window.matchMedia(query).matches
	);
	
	useEffect(() => {
		const mq = window.matchMedia(query);
		const update = () => setMatches(mq.matches);
		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	}, [query]);
	
	return matches;
}
