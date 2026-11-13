import * as THREE from 'three';
import { TAU } from '../../../lib/math';
import type { BodyKind } from '../contactContent';

const SURFACE = 0x0a0a0a;
const LINE_STRONG = 0xd9d9d9;
const LINE = 0x9a9a9a;
const LINE_DIM = 0x4a4a4a;

export const R0 = 24;
export const DR = 9;
const STEP_ANGLE = 2.4;
const SUN_R = 4.2;
const SHELL_R = 5.7;

const EXT: Record<BodyKind, number> = { terran: 2.4, icosa: 2.4, dyson: 2.0, ringed: 3.0, belt: 2.6, banded: 2.8 };

type V3 = THREE.Vector3;
type Pair = [V3, V3];
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export type ContactSystem = {
	root: THREE.Group;
	bodies: THREE.Group[];
	extents: number[];
	extent: number;
	sunExt: number;
	setClock: (t: number) => void;
	dispose: () => void;
};

const rng = (seed: number) => () => {
	seed = (seed * 16807) % 2147483647;
	return seed / 2147483647;
};

const SHAPES = [
	{
		v: [v3(1, 1, 1), v3(-1, -1, 1), v3(-1, 1, -1), v3(1, -1, -1)],
		e: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]
	},
	{
		v: [v3(1, 0, 0), v3(-1, 0, 0), v3(0, 1, 0), v3(0, -1, 0), v3(0, 0, 1), v3(0, 0, -1)],
		e: [[0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5], [2, 4], [2, 5], [3, 4], [3, 5]]
	}
];

const WINDOWS = [v3(0.8, 0.3, 0.5).normalize(), v3(-0.6, -0.5, 0.6).normalize()];

const PLANET_SPIN = [0.12, -0.07, 0.18, 0.07, -0.14, 0.09];
const ACCESSORY_SPIN = [-0.05, 0.1, -0.15, 0.15, 0.2, -0.11];

export function buildSystem(kinds: BodyKind[]): ContactSystem {
	const geometries = new Set<THREE.BufferGeometry>();
	const materials = new Set<THREE.Material>();
	
	const geo = <T extends THREE.BufferGeometry>(g: T): T => {
		geometries.add(g);
		return g;
	};
	const lineMat = (color: number) => {
		const m = new THREE.LineBasicMaterial({ color });
		materials.add(m);
		return m;
	};
	const surface = () => {
		const m = new THREE.MeshBasicMaterial({
			                                      color: SURFACE,
			                                      side: THREE.DoubleSide,
			                                      polygonOffset: true,
			                                      polygonOffsetFactor: 1,
			                                      polygonOffsetUnits: 1
		                                      });
		materials.add(m);
		return m;
	};
	
	const part = (g: THREE.BufferGeometry, color: number, solid = true) => {
		const group = new THREE.Group();
		geo(g);
		const edges = geo(new THREE.EdgesGeometry(g, 10));
		if (solid)
			group.add(new THREE.Mesh(g, surface()));
		group.add(new THREE.LineSegments(edges, lineMat(color)));
		return group;
	};
	
	const segments = (pairs: Pair[], color: number) => {
		const pts: V3[] = [];
		for (const [a, b] of pairs)
			pts.push(a, b);
		return new THREE.LineSegments(geo(new THREE.BufferGeometry().setFromPoints(pts)), lineMat(color));
	};
	
	const wire = (g: THREE.BufferGeometry, color: number) => {
		geo(g);
		return new THREE.LineSegments(geo(new THREE.WireframeGeometry(g)), lineMat(color));
	};
	
	const loop = (r: number, color: number, y = 0) => {
		const pts: V3[] = [];
		for (let i = 0; i < 128; i++) {
			const a = (i / 128) * TAU;
			pts.push(v3(r * Math.cos(a), y, r * Math.sin(a)));
		}
		return new THREE.LineLoop(geo(new THREE.BufferGeometry().setFromPoints(pts)), lineMat(color));
	};
	
	const ticks = (r: number) => {
		const pairs: Pair[] = [];
		for (let i = 0; i < 90; i++) {
			const a = (i / 90) * TAU;
			const len = r * (i % 5 === 0 ? 0.022 : 0.01);
			const c = Math.cos(a);
			const s = Math.sin(a);
			pairs.push([v3(r * c, 0, r * s), v3((r - len) * c, 0, (r - len) * s)]);
		}
		return segments(pairs, LINE_DIM);
	};
	
	const band = (r1: number, r2: number, count: number, color = LINE_STRONG) => {
		const g = new THREE.Group();
		g.add(loop(r1, color), loop(r2, LINE));
		const pairs: Pair[] = [];
		for (let i = 0; i < count; i++) {
			const a = (i / count) * TAU;
			pairs.push([v3(Math.cos(a) * r1, 0, Math.sin(a) * r1), v3(Math.cos(a) * r2, 0, Math.sin(a) * r2)]);
		}
		g.add(segments(pairs, LINE));
		return g;
	};
	
	const graticule = (r: number, lats: number, lons: number, color: number) => {
		const pairs: Pair[] = [];
		const N = 48;
		for (let i = 1; i <= lats; i++) {
			const phi = (Math.PI * i) / (lats + 1);
			const y = r * Math.cos(phi);
			const rr = r * Math.sin(phi);
			for (let k = 0; k < N; k++) {
				const a = (k / N) * TAU;
				const b = ((k + 1) / N) * TAU;
				pairs.push([v3(rr * Math.cos(a), y, rr * Math.sin(a)), v3(rr * Math.cos(b), y, rr * Math.sin(b))]);
			}
		}
		for (let j = 0; j < lons; j++) {
			const th = (j * Math.PI) / lons;
			const p = (a: number) => v3(r * Math.sin(a) * Math.cos(th),
			                            r * Math.cos(a),
			                            r * Math.sin(a) * Math.sin(th));
			for (let k = 0; k < N; k++)
				pairs.push([p((k / N) * TAU), p(((k + 1) / N) * TAU)]);
		}
		return segments(pairs, color);
	};
	
	const planet = (r: number, lats: number, lons: number, color = LINE_STRONG) => {
		const g = new THREE.Group();
		g.add(new THREE.Mesh(geo(new THREE.SphereGeometry(r * 0.995, 32, 20)), surface()));
		g.add(graticule(r, lats, lons, color));
		return g;
	};
	
	const faceted = (r: number, detail: number) => {
		const g = geo(new THREE.IcosahedronGeometry(r, detail));
		const grp = new THREE.Group();
		grp.add(new THREE.Mesh(g, surface()));
		grp.add(new THREE.LineSegments(geo(new THREE.WireframeGeometry(g)), lineMat(LINE_STRONG)));
		return grp;
	};
	
	const openShell = (r: number, detail: number, cut = true) => {
		const src = new THREE.IcosahedronGeometry(r, detail);
		const p = src.getAttribute('position');
		const keep: number[] = [];
		const c = new THREE.Vector3();
		for (let i = 0; i < p.count; i += 3) {
			c.set(0, 0, 0);
			for (let k = 0; k < 3; k++)
				c.add(v3(p.getX(i + k), p.getY(i + k), p.getZ(i + k)));
			c.normalize();
			if (cut && WINDOWS.some((w) => c.dot(w) > 0.86))
				continue;
			for (let k = 0; k < 3; k++)
				keep.push(p.getX(i + k), p.getY(i + k), p.getZ(i + k));
		}
		src.dispose();
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.Float32BufferAttribute(keep, 3));
		return g;
	};
	
	const node = (r: number, x: number, z: number) => {
		const n = part(new THREE.IcosahedronGeometry(r, 0), LINE_STRONG);
		n.position.set(x, 0, z);
		return n;
	};
	
	const tilted = (g: THREE.Group, z: number, x = 0) => {
		g.rotation.set(x, 0, z);
		return g;
	};
	
	const ship = (s: number) => {
		const g = new THREE.ConeGeometry(0.28 * s, 0.9 * s, 4);
		g.rotateZ(-Math.PI / 2);
		return part(g, LINE_STRONG);
	};
	
	const asteroidBelt = (r: number, width: number, count: number, seed: number) => {
		const rand = rng(seed);
		const pts: V3[] = [];
		for (let i = 0; i < count; i++) {
			const ang = rand() * TAU;
			const rr = r + (rand() - 0.5) * width;
			const c = v3(rr * Math.cos(ang), (rand() - 0.5) * width * 0.25, rr * Math.sin(ang));
			const s = 0.12 + rand() * 0.28;
			const qt = new THREE.Quaternion().setFromEuler(new THREE.Euler(rand() * TAU, rand() * TAU, rand() * TAU));
			const shape = SHAPES[rand() < 0.5 ? 0 : 1];
			const verts = shape.v.map((b) => b.clone().multiplyScalar(s).applyQuaternion(qt).add(c));
			shape.e.forEach(([a, b]) => pts.push(verts[a], verts[b]));
		}
		return new THREE.LineSegments(geo(new THREE.BufferGeometry().setFromPoints(pts)), lineMat(LINE));
	};
	
	const BUILD: Record<BodyKind, () => THREE.Group> = {
		terran: () => {
			const g = new THREE.Group();
			g.add(planet(1.5, 8, 9));
			g.add(tilted(band(2.1, 2.3, 28), 0.45));
			return g;
		},
		icosa: () => {
			const g = new THREE.Group();
			g.add(faceted(1.7, 2));
			g.add(tilted(band(2.2, 2.35, 20, LINE), 0.3, 0.2));
			return g;
		},
		dyson: () => {
			const g = new THREE.Group();
			g.add(planet(1.0, 6, 7, LINE));
			g.add(wire(openShell(1.9, 1), LINE_STRONG));
			return g;
		},
		ringed: () => {
			const g = new THREE.Group();
			g.add(planet(1.3, 7, 8));
			const rings = new THREE.Group();
			[2.0, 2.2, 2.45, 2.8].forEach((r, i) => rings.add(loop(r, i % 2 ? LINE : LINE_STRONG)));
			rings.add(node(0.06, 2.2, 0), node(0.06, -2.45, 0), node(0.06, 0, 2.8));
			g.add(tilted(rings, 0.4));
			return g;
		},
		belt: () => {
			const g = new THREE.Group();
			g.add(planet(1.4, 7, 8));
			const b = new THREE.Group();
			b.add(loop(2.1, LINE_STRONG, 0.14), loop(2.1, LINE_STRONG, -0.14), loop(2.45, LINE));
			const pairs: Pair[] = [];
			for (let i = 0; i < 36; i++) {
				const a = (i / 36) * TAU;
				pairs.push([
					           v3(2.1 * Math.cos(a), -0.14, 2.1 * Math.sin(a)),
					           v3(2.1 * Math.cos(a), 0.14, 2.1 * Math.sin(a))
				           ]);
			}
			b.add(segments(pairs, LINE));
			g.add(tilted(b, -0.35, 0.2));
			return g;
		},
		banded: () => {
			const g = new THREE.Group();
			g.add(planet(1.8, 14, 5));
			const o = new THREE.Group();
			o.add(loop(2.6, LINE_DIM), node(0.14, 2.6, 0));
			g.add(tilted(o, 0.6));
			return g;
		}
	};
	
	const root = new THREE.Group();
	const orbiters: {
		pivot: THREE.Group;
		a0: number;
		w: number
	}[] = [];
	const spinners: {
		g: THREE.Group;
		w: number
	}[] = [];
	const belts: {
		g: THREE.Object3D;
		w: number
	}[] = [];
	
	const lane = (parent: THREE.Object3D, r: number, a0: number, w: number, s: number, tx: number, tz: number) => {
		const holder = new THREE.Group();
		holder.rotation.set(tx, 0, tz);
		const pivot = new THREE.Group();
		const sh = ship(s);
		sh.position.x = r;
		sh.rotation.y = w < 0 ? -Math.PI / 2 : Math.PI / 2;
		pivot.add(sh);
		holder.add(pivot);
		parent.add(holder);
		orbiters.push({ pivot, a0, w });
	};
	
	const sunCore = planet(SUN_R, 14, 16);
	const sunShell = new THREE.Group();
	sunShell.add(wire(openShell(SHELL_R, 2, false), LINE));
	const sunRings = new THREE.Group();
	sunRings.add(band(6.8, 7.1, 48));
	sunRings.add(node(0.16, 6.95, 0), node(0.16, -6.95, 0));
	sunRings.rotation.set(0.25, 0, 0.1);
	root.add(sunCore, sunShell, sunRings);
	spinners.push({ g: sunCore, w: 0.04 }, { g: sunShell, w: -0.025 }, { g: sunRings, w: 0.05 });
	
	const bodies: THREE.Group[] = [];
	const extents: number[] = [];
	kinds.forEach((kind, i) => {
		const r = R0 + DR * i;
		const holder = new THREE.Group();
		holder.rotation.set((i % 2 ? -1 : 1) * (0.03 + 0.012 * i), 0, (i % 3 - 1) * 0.05);
		holder.add(loop(r, LINE), ticks(r));
		
		const pivot = new THREE.Group();
		const carrier = new THREE.Group();
		carrier.position.x = r;
		const visual = BUILD[kind]();
		const body = visual.children[0] as THREE.Group;
		const acc = visual.children[1] as THREE.Group;
		const tiltWrap = new THREE.Group();
		tiltWrap.rotation.copy(acc.rotation);
		acc.rotation.set(0, 0, 0);
		visual.remove(acc);
		tiltWrap.add(acc);
		visual.add(tiltWrap);
		carrier.add(visual);
		const ext = EXT[kind];
		lane(carrier, ext * 1.35, i * 1.7, 0.35 + 0.08 * i, 0.45, 0.5 - 0.2 * i, 0.2 * i);
		lane(carrier, ext * 1.6, i * 2.3 + 1, -0.28, 0.4, -0.3, 0.1 * i);
		pivot.add(carrier);
		holder.add(pivot);
		root.add(holder);
		
		orbiters.push({ pivot, a0: i * STEP_ANGLE, w: 0.045 / (1 + 0.4 * i) });
		spinners.push(
			{ g: body, w: PLANET_SPIN[i % PLANET_SPIN.length] },
			{ g: acc, w: ACCESSORY_SPIN[i % ACCESSORY_SPIN.length] }
		);
		bodies.push(carrier);
		extents.push(ext);
	});
	
	const rand = rng(7);
	for (let k = 0; k <= kinds.length; k++) {
		const r = R0 - 4.5 + DR * k;
		for (let j = 0; j < 2; j++)
			lane(root, r, rand() * TAU, ((0.07 + rand() * 0.05) * (j ? -1 : 1)) / (1 + 0.15 * k), 1.0,
			     (rand() - 0.5) * 0.3, (rand() - 0.5) * 0.3);
	}
	
	const n = kinds.length;
	if (n >= 3) {
		const b = asteroidBelt(R0 + DR * 1.5, 5, 240, 3);
		root.add(b);
		belts.push({ g: b, w: 0.012 });
	}
	const outer = asteroidBelt(R0 + DR * (n - 0.5), 6, 300, 11);
	root.add(outer);
	belts.push({ g: outer, w: -0.008 });
	
	const setClock = (t: number) => {
		orbiters.forEach(({ pivot, a0, w }) => (pivot.rotation.y = a0 + t * w));
		spinners.forEach(({ g, w }) => (g.rotation.y = t * w));
		belts.forEach(({ g, w }) => (g.rotation.y = t * w));
	};
	setClock(0);
	
	return {
		root,
		bodies,
		extents,
		extent: R0 + DR * (n - 0.5) + 3,
		sunExt: 6.4,
		setClock,
		dispose: () => {
			geometries.forEach((g) => g.dispose());
			materials.forEach((m) => m.dispose());
		}
	};
}
