import { useDocumentTitle } from './useDocumentTitle';
import { useInfiniteScroll } from './useInfiniteScroll';
import { useReducedMotion } from './useReducedMotion';

export function usePage(title: string, wrap = true) {
	const reduced = useReducedMotion();
	useDocumentTitle(`${ title } | Calcium King`);
	useInfiniteScroll(wrap && !reduced);
}
