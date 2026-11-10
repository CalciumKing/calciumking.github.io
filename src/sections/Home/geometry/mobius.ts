import * as THREE from 'three';

const RADIUS = 2.2;
const HALF_WIDTH = 0.9;
const LONG_DIVISIONS = 4;
const TRANSVERSE_COUNT = 48;
const SAMPLES = 240;

export const COLOR_TRANSVERSE = 0x777777;
export const COLOR_LONGITUDINAL = 0xd9d9d9;
export const STATIC_TIME = 6;

function pushPoint(out: number[], u: number, v: number) {
	const r = RADIUS + v * Math.cos(u / 2);
	out.push(r * Math.cos(u), r * Math.sin(u), v * Math.sin(u / 2));
}

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
