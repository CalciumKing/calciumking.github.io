import { clamp01 } from '../../../lib/math';

export const MORPH_START = 0.12;
export const MORPH_SPAN = 0.58;
export const MOVE_START = 0.1;
export const MOVE_SPAN = 0.6;

const SCROLL_A = 0.38;
const NET_START = 0.5;
const NET_SPAN = 0.34;
export const SPLIT = 0.7;
const GEO_START = 0.74;
const GEO_SPAN = 0.2;

export const OLD_SHARE = 0.55;
export const DIR_END = 0.75;
export const DIR_MORPH = 0.85;

export const STAGE_PROGRESS = {
    hero: 0,
    computation: 0.322 * OLD_SHARE,
    intelligence: 0.7 * OLD_SHARE,
    geometry: OLD_SHARE,
} as const;

export const phaseA = (p: number) => clamp01(p / SCROLL_A);
export const morphOf = (p: number) => clamp01((phaseA(p) - MORPH_START) / MORPH_SPAN);
export const netOf = (p: number) => clamp01((p - NET_START) / NET_SPAN);
export const geoOf = (p: number) => clamp01((p - GEO_START) / GEO_SPAN);
export const oldOf = (all: number) => clamp01(all / OLD_SHARE);
export const dirOf = (all: number) => clamp01((all - OLD_SHARE) / (DIR_END - OLD_SHARE));
export const retOf = (all: number) => clamp01((all - DIR_END) / (1 - DIR_END));
