import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(
        () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
    );

    useEffect(() => {
        const mq = window.matchMedia(QUERY);
        const update = () => setReduced(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    return reduced;
}
