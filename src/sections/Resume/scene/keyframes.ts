import * as THREE from 'three';
import { clamp01, lerp, smooth } from '../../../lib/math';
import type { Tree } from './tree';

const HOLD = 0.22;

export type SceneStop = {
	frame: number;
	shiftX: number;
	shiftY: number;
};

export type Sample = {
	pos: THREE.Vector3;
	target: THREE.Vector3;
	shiftX: number;
	shiftY: number;
	g: number;
};

export function createRig(tree: Tree, stops: SceneStop[], tanHalf: number) {
	const S = tree.stages;
	const N = stops.length;
	const frames = Array.from({ length: S + 2 }, () => ({
		pos: new THREE.Vector3(),
		target: new THREE.Vector3()
	}));
	const d = new THREE.Vector3();
	const c = new THREE.Vector3();
	const sz = new THREE.Vector3();
	const out: Sample = { pos: new THREE.Vector3(), target: new THREE.Vector3(), shiftX: 0, shiftY: 0, g: 0 };
	let aspect = 1;
	
	const fit = (
		i: number, center: THREE.Vector3, ex: number,
		ey: number, az: number, el: number, fw: number, fh: number
	) => {
		const ty = ey * Math.cos(el) + ex * Math.sin(el);
		const dist = Math.max(ex / (tanHalf * aspect * fw), ty / (tanHalf * fh));
		d.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
		frames[i].target.copy(center);
		frames[i].pos.copy(center).addScaledVector(d, dist);
	};
	
	const resize = (a: number, compact: boolean) => {
		aspect = a;
		const fw = compact ? 0.92 : 0.5;
		const fh = compact ? 0.42 : 0.78;
		
		fit(0, c.set(0, -0.2, 0), 4.2, 1.8, 0.5, 0.18, fw, fh);
		
		for (let s = 1; s <= S; s++) {
			const box = tree.boxes[s - 1].clone();
			if (s === 1)
				box.expandByPoint(sz.set(0, 1, 0));
			else
				box.expandByPoint(sz.set(0, box.min.y - 1.5, 0));
			box.getCenter(c);
			box.getSize(sz);
			const ex = Math.max(2.4, Math.max(sz.x, sz.z) / 2);
			const ey = Math.max(1.8, sz.y / 2);
			fit(s, c, ex, ey, s % 2 ? 0.55 : -0.5, 0.1 + 0.03 * Math.min(s, 6), fw, fh);
		}
		
		tree.full.getSize(sz);
		c.set(0, (tree.full.min.y + tree.full.max.y) / 2, 0);
		fit(S + 1, c, tree.radius, sz.y / 2, 0.4, 0.2, compact ? 0.95 : 0.8, compact ? 0.4 : 0.58);
	};
	
	const sample = (p: number): Sample => {
		const s = clamp01(p) * N;
		const k = Math.min(N - 1, Math.floor(s));
		const k1 = (k + 1) % N;
		const fa = stops[k].frame;
		const fb = stops[k1].frame;
		const e = fa !== fb ? smooth((s - k - HOLD) / (1 - 2 * HOLD)) : 0;
		const a = frames[fa];
		const b = frames[fb];
		out.pos.lerpVectors(a.pos, b.pos, e);
		out.target.lerpVectors(a.target, b.target, e);
		out.pos.y += Math.sin(Math.PI * e) * a.pos.distanceTo(b.pos) * 0.12;
		out.g = lerp(fa, fb, e);
		out.shiftX = lerp(stops[k].shiftX, stops[k1].shiftX, e);
		out.shiftY = lerp(stops[k].shiftY, stops[k1].shiftY, e);
		return out;
	};
	
	return { resize, sample };
}
