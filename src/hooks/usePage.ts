import { useDocumentTitle } from './useDocumentTitle';
import { useInfiniteScroll } from './useInfiniteScroll';
import { useReducedMotion } from './useReducedMotion';

/** Sets the title and enables page wrapping (off for reduced motion, or when `wrap` is false). */
export function usePage(title: string, wrap = true) {
    const reduced = useReducedMotion();
    useDocumentTitle(`${title} | Calcium King`);
    useInfiniteScroll(wrap && !reduced);
}
