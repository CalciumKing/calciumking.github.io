import { lerp3 } from '../../../lib/math';

export type Vec3 = [number, number, number];
export type CpuSegment = {
	a: Vec3;
	b: Vec3;
	bright: boolean
};

const B = 1.7;
const C = 0.45;
const H = 0.45;
const DIE = 1.0;
const DIE_H = 0.1;
const LEADS = 9;
const LEAD_PITCH = 0.28;
const LEAD_W = 0.16;
const LEAD_PROFILE: [number, number][] = [
	[0, 0.25],
	[0.3, 0.25],
	[0.5, 0],
	[0.78, 0]
];

export function buildCpuSegments(): CpuSegment[] {
	const out: CpuSegment[] = [];
	const seg
		= (a: Vec3, b: Vec3, bright: boolean) => out.push({ a, b, bright });
	
	const oct: [number, number][] = [
		[-B + C, -B], [B - C, -B], [B, -B + C], [B, B - C],
		[B - C, B], [-B + C, B], [-B, B - C], [-B, -B + C]
	];
	oct.forEach(([x, y], i) => {
		const [nx, ny] = oct[(i + 1) % oct.length];
		seg([x, y, 0], [nx, ny, 0], true);
		seg([x, y, H], [nx, ny, H], true);
		seg([x, y, 0], [x, y, H], true);
	});
	
	// Raised die on top
	for (const z of [H, H + DIE_H]) {
		seg([-DIE, -DIE, z], [DIE, -DIE, z], true);
		seg([DIE, -DIE, z], [DIE, DIE, z], true);
		seg([DIE, DIE, z], [-DIE, DIE, z], true);
		seg([-DIE, DIE, z], [-DIE, -DIE, z], true);
	}
	for (const sx of [-1, 1])
		for (const sy of [-1, 1])
			seg([sx * DIE, sy * DIE, H], [sx * DIE, sy * DIE, H + DIE_H], true);
	
	for (let side = 0; side < 4; side++) {
		const ang = (side * Math.PI) / 2;
		const nx = Math.round(Math.cos(ang));
		const ny = Math.round(Math.sin(ang));
		const tx = -ny;
		const ty = nx;
		const pt = (d: number, t: number, z: number): Vec3 => [
			nx * (B + d) + tx * t,
			ny * (B + d) + ty * t,
			z
		];
		for (let i = 0; i < LEADS; i++) {
			const t = (i - (LEADS - 1) / 2) * LEAD_PITCH;
			LEAD_PROFILE.forEach(([d, z], k) => {
				seg(pt(d, t - LEAD_W / 2, z), pt(d, t + LEAD_W / 2, z), false); // rung
				if (k > 0) {
					const [pd, pz] = LEAD_PROFILE[k - 1];
					seg(pt(pd, t - LEAD_W / 2, pz), pt(d, t - LEAD_W / 2, z), false);
					seg(pt(pd, t + LEAD_W / 2, pz), pt(d, t + LEAD_W / 2, z), false);
				}
			});
		}
	}
	
	return out;
}

const length = (s: CpuSegment) =>
	Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1], s.b[2] - s.a[2]);

export function resampleSegments<T extends CpuSegment>(src: T[], count: number): T[] {
	const len = src.map(length);
	const total = len.reduce((a, b) => a + b, 0);
	const n = len.map((l) => Math.max(1, Math.floor((count * l) / total)));
	let sum = n.reduce((a, b) => a + b, 0);
	
	while (sum < count) {
		let best = 0;
		let bv = -1;
		n.forEach((c, i) => {
			const v = len[i] / c;
			if (v > bv) {
				bv = v;
				best = i;
			}
		});
		n[best]++;
		sum++;
	}
	while (sum > count) {
		let best = -1;
		let bv = Infinity;
		n.forEach((c, i) => {
			if (c > 1 && len[i] / (c - 1) < bv) {
				bv = len[i] / (c - 1);
				best = i;
			}
		});
		if (best < 0)
			break;
		n[best]--;
		sum--;
	}
	
	const out: T[] = [];
	src.forEach((s, i) => {
		const c = n[i];
		for (let k = 0; k < c; k++)
			out.push({ ...s, a: lerp3(s.a, s.b, k / c), b: lerp3(s.a, s.b, (k + 1) / c) });
	});
	return out;
}
