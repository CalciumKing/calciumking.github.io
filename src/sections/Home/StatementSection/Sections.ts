import { useMemo } from 'react';
import { useContent } from '../../../i18n/content';
import { homeContent } from '../homeContent';

const STRUCTURE = {
	computation: { id: 'computation', visualSide: 'left' },
	intelligence: { id: 'intelligence', visualSide: 'right' },
	geometry: { id: 'geometry', visualSide: 'left' }
} as const;

export function useSections() {
	const t = useContent(homeContent).sections;
	return useMemo(() => ({
		computation: { ...STRUCTURE.computation, ...t.computation },
		intelligence: { ...STRUCTURE.intelligence, ...t.intelligence },
		geometry: { ...STRUCTURE.geometry, ...t.geometry }
	}), [t]);
}
