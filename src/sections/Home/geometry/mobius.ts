import * as THREE from 'three';

// Strip geometry
const RADIUS = 2.2; // R: center-circle radius
const HALF_WIDTH = 0.9; // w: v ∈ [-w, w]
const LONG_DIVISIONS = 4; // longitudinal lines at v = ±w·k/K (k = 0..K) → 2K+1 lines
const TRANSVERSE_COUNT = 48; // transverse lines around the loop
const SAMPLES = 240; // segments per 2π along longitudinal lines

// Colors mirror tokens.css (--color-line, --color-line-strong, --color-text)
export const COLOR_TRANSVERSE = 0x777777;
export const COLOR_LONGITUDINAL = 0xd9d9d9;
export const COLOR_VERTEX = 0xf2f2f2;

export const STATIC_TIME = 6; // fixed pose (seconds) for reduced motion

function pushPoint(out: number[], u: number, v: number) {
	const r = RADIUS + v * Math.cos(u / 2);
	out.push(r * Math.cos(u), r * Math.sin(u), v * Math.sin(u / 2));
}

/**
 * Seam handling: (u + 2π, v) maps to the same point as (u, −v).
 * A constant-v curve therefore closes only after u = 4π, and it traces both
 * the +v and −v lines. Each k > 0 emits one 4π loop (covering ±v); k = 0 emits
 * a single 2π loop. Transverse lines use u ∈ [0, 2π) so none is doubled.
 */
export function buildGeometry() {
	const longitudinal: number[] = [];
	const step = (Math.PI * 2) / SAMPLES;
	
	for (let k = 0; k <= LONG_DIVISIONS; k++) {
		const v = (HALF_WIDTH * k) / LONG_DIVISIONS;
		const total = k === 0 ? SAMPLES : SAMPLES * 2;
		for (let i = 0; i < total; i++) {
			pushPoint(longitudinal, i * step, v);
			pushPoint(longitudinal, (i + 1) * step, v);
		}
	}
	
	const transverse: number[] = [];
	for (let i = 0; i < TRANSVERSE_COUNT; i++) {
		const u = (i * Math.PI * 2) / TRANSVERSE_COUNT;
		pushPoint(transverse, u, -HALF_WIDTH);
		pushPoint(transverse, u, HALF_WIDTH);
	}
	
	const make = (data: number[]) => {
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.Float32BufferAttribute(data, 3));
		return g;
	};
	
	return { longitudinal: make(longitudinal), transverse: make(transverse) };
}
