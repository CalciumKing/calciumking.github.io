import { useMediaQuery } from './useMediaQuery';

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
