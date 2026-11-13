import { common } from '../i18n/common';
import { useContent } from '../i18n/content';
import { useDocumentTitle } from './useDocumentTitle';
import { useInfiniteScroll } from './useInfiniteScroll';
import { useReducedMotion } from './useReducedMotion';

export function usePage(title: string, wrap = true) {
	const c = useContent(common);
	const reduced = useReducedMotion();
	useDocumentTitle(`${ (c.titles as Record<string, string>)[title] ?? title } | Calcium King`);
	useInfiniteScroll(wrap && !reduced);
}
