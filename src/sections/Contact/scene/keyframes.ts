import * as THREE from 'three';
import { clamp01, lerp, smooth } from '../../../lib/math';
import type { ContactSystem } from './parts';

const HOLD = 0.22;
const UP = new THREE.Vector3(0, 1, 0);

export type Sample = {
	pos: THREE.Vector3;
	target: THREE.Vector3;
	shiftX: number;
	shiftY: number;
};

type Shift = {
	x: number;
	y: number
};

// Stops: [overview, ...planets (live, follow orbit), final]
export function createRig(system: ContactSystem, shifts: Shift[], tanHalf: number) {
	const last = system.bodies.length + 1; // final-view frame
	const m = last + 1; // segments; frame m is the overview again (loop)
	let aspect = 1;
	let compact = false;
	
	const frames = Array.from({ length: m + 1 }, () => ({
		pos: new THREE.Vector3(),
		target: new THREE.Vector3()
	}));
	const wp = new THREE.Vector3();
	const o = new THREE.Vector3();
	const tn = new THREE.Vector3();
	const d = new THREE.Vector3();
	const out: Sample = { pos: new THREE.Vector3(), target: new THREE.Vector3(), shiftX: 0, shiftY: 0 };
	
	const dist = (extH: number, extV: number, fw: number, fh: number) =>
		Math.max(extH / (tanHalf * aspect * fw), extV / (tanHalf * fh));
	
	const dirOf = (az: number, el: number) =>
		d.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
	
	// Aspect-dependent static frames. Call on resize.
	const resize = (a: number, c: boolean) => {
		aspect = a;
		compact = c;
		
		// Overview: low, close, huge sun; outer orbits run off-frame
		const s = system.sunExt;
		frames[0].target.set(0, 0, 0);
		frames[0].pos.copy(dirOf(0.9, 0.3)).multiplyScalar(dist(s, s, c ? 0.92 : 0.56, c ? 0.45 : 0.7));
		
		// Final: pulled back above the plane
		const e = system.extent;
		frames[m].target.set(0, 0, 0);
		frames[m].pos.copy(dirOf(-0.5, 0.55)).multiplyScalar(dist(e * 0.8, e * 0.45, c ? 0.98 : 0.9, c ? 0.35 : 0.62));
		
		frames[last].target.set(0, 0, 0);
		frames[last].pos.copy(dirOf(-0.5, 0.55))
		            .multiplyScalar(dist(e * 0.8, e * 0.45, c ? 0.98 : 0.9, c ? 0.35 : 0.62));
		
		frames[m].pos.copy(frames[0].pos);
		frames[m].target.copy(frames[0].target);
	};
	
	// Planet frames follow each planet's live position
	const updatePlanets = () => {
		system.bodies.forEach((b, i) => {
			b.getWorldPosition(wp);
			o.set(wp.x, 0, wp.z).normalize();
			tn.set(-o.z, 0, o.x);
			// Sunward side, slightly sideways and above: looks outward, away from the other planets
			d.copy(o).multiplyScalar(-0.78).addScaledVector(tn, 0.45).addScaledVector(UP, 0.38).normalize();
			const ext = system.extents[i] * 1.05;
			const dd = dist(ext, ext, compact ? 0.92 : 0.56, compact ? 0.45 : 0.9);
			frames[i + 1].target.copy(wp);
			frames[i + 1].pos.copy(wp).addScaledVector(d, dd);
		});
	};
	
	// Call after system.setClock and root.updateMatrixWorld
	const sample = (p: number): Sample => {
		updatePlanets();
		const s = clamp01(p) * m;
		const k = Math.min(m - 1, Math.floor(s));
		const e = smooth((s - k - HOLD) / (1 - 2 * HOLD));
		const a = frames[k];
		const b = frames[k + 1];
		out.pos.lerpVectors(a.pos, b.pos, e);
		out.target.lerpVectors(a.target, b.target, e);
		// Lift over the system mid-transition
		out.pos.y += Math.sin(Math.PI * e) * a.pos.distanceTo(b.pos) * 0.3;
		const nx = shifts[(k + 1) % shifts.length];
		out.shiftX = lerp(shifts[k].x, nx.x, e);
		out.shiftY = lerp(shifts[k].y, nx.y, e);
		return out;
	};
	
	return { resize, sample };
}
