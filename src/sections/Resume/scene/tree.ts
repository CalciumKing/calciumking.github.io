import * as THREE from 'three';
import { TAU } from '../../../lib/math';

type V3 = THREE.Vector3;
const v3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = new THREE.Vector3(0, 1, 0);

const SEG_SPAN = 0.7;
const LINE_GROW = 0.12;
const LEAF_DELAY = 0.1;
const LEAF_GROW = 0.15;
const TUBE_MIN = 0.045;
const SIDES = 7;

const TOPS = [0, 0.6, 2.5, 3.5, 6, 6];
const topOf = (s: number) => TOPS[s - 1] ?? TOPS[TOPS.length - 1] + 1.8 * (s - TOPS.length);
const LEAF_STAGE = 6;
const trunkR = (y: number) => 0.1 + 0.3 * Math.exp(-y / 6) + 0.45 * Math.exp(-y / 0.8);
const center = (y: number) => v3(0.14 * Math.sin(0.45 * y), y, 0.1 * Math.sin(0.33 * y + 1));

const N_SEG = [5, 4, 3, 2];
const P_CHILD = [0.85, 0.75, 0.6, 0];
const P_CHILD_OPEN = [0.7, 0.5, 0, 0];
const LEAF_SIZE = [0.8, 0.7, 0.6, 0.45];
const LEAF_COUNT = [2, 2, 1, 1];
const LEAF_KEEP = [1, 0.6, 0.35, 0.3];

const hash = (a: number, b: number) => {
	const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
	return s - Math.floor(s);
};

const rng = (seed: number) => {
	let s = Math.max(1, Math.floor(seed) % 2147483647);
	return () => {
		s = (s * 16807) % 2147483647;
		return s / 2147483647;
	};
};

const turn = (d: V3, ang: number, rand: () => number) => {
	const axis = v3(rand() - 0.5, rand() - 0.5, rand() - 0.5).cross(d);
	if (axis.lengthSq() < 1e-6)
		return d.clone();
	return d.clone().applyAxisAngle(axis.normalize(), ang).normalize();
};

type Seg = {
	a: V3;
	b: V3;
	stage: number;
	dist: number;
	tone: number
};
type Leaf = {
	pos: V3;
	dir: V3;
	size: number;
	stage: number;
	dist: number;
	roll: number
};

export type TreeOptions = {
	stages: number;
	compact: boolean;
};

export type Tree = {
	root: THREE.Group;
	ground: THREE.Group;
	stages: number;
	boxes: THREE.Box3[];
	full: THREE.Box3;
	radius: number;
	setGrowth: (g: number) => void;
	dispose: () => void;
};

const LINE_VS = /* glsl */ `
attribute vec3 anchor;
attribute float aBirth;
attribute float aTone;
uniform float uG;
varying float vA;
varying float vTone;
void main() {
	float t = clamp((uG - aBirth) / ${ LINE_GROW.toFixed(3) }, 0.0, 1.0);
	vec3 p = mix(anchor, position, t);
	vA = t;
	vTone = aTone;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const LINE_FS = /* glsl */ `
varying float vA;
varying float vTone;
void main() {
	if (vA < 0.001) discard;
	gl_FragColor = vec4(vec3(vTone), 1.0);
}`;

const LEAF_VS = /* glsl */ `
attribute vec3 iPos;
attribute vec4 iQuat;
attribute float iSize;
attribute float iBirth;
attribute float aTone;
uniform float uG;
varying float vA;
varying float vTone;
vec3 qrot(vec4 q, vec3 v) {
	return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}
void main() {
	float t = smoothstep(0.0, 1.0, clamp((uG - iBirth) / ${ LEAF_GROW.toFixed(3) }, 0.0, 1.0));
	vec3 p = iPos + qrot(iQuat, position * iSize * t);
	vA = t;
	vTone = aTone;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

function leafGeometry() {
	const pts: number[] = [];
	const tone: number[] = [];
	const w = (t: number) => 0.28 * Math.sin(Math.PI * Math.pow(t, 0.7));
	const seg = (ax: number, ay: number, bx: number, by: number, tn: number) => {
		pts.push(ax, ay, 0, bx, by, 0);
		tone.push(tn, tn);
	};
	const K = 8;
	for (let k = 0; k < K; k++) {
		const t0 = k / K;
		const t1 = (k + 1) / K;
		seg(-w(t0), t0, -w(t1), t1, 0.7);
		seg(w(t0), t0, w(t1), t1, 0.7);
	}
	seg(0, -0.14, 0, 1, 0.7);
	[0.25, 0.45, 0.65].forEach((t) => {
		const u = Math.min(0.97, t + 0.17);
		seg(0, t, -w(u), u, 0.38);
		seg(0, t, w(u), u, 0.38);
	});
	const g = new THREE.BufferGeometry();
	g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
	g.setAttribute('aTone', new THREE.Float32BufferAttribute(tone, 1));
	return g;
}

export function buildTree({ stages, compact }: TreeOptions): Tree {
	const S = stages;
	const segs: Seg[] = [];
	const leaves: Leaf[] = [];
	const boxes = Array.from({ length: S }, () => new THREE.Box3(v3(), v3()));
	const thin = compact ? 0.7 : 1;
	let maxR = 0;
	
	const touch = (p: V3, stage: number) => {
		boxes[stage - 1].expandByPoint(p);
		maxR = Math.max(maxR, Math.hypot(p.x, p.z));
	};
	const addSeg = (a: V3, b: V3, stage: number, dist: number, tone: number) => {
		segs.push({ a: a.clone(), b: b.clone(), stage, dist, tone });
		touch(a, stage);
		touch(b, stage);
	};
	
	const leafFan =
		(tip: V3, dir: V3, level: number, stage: number, dist: number) => {
			if (hash(dist * 7.3 + level, stage * 5 + 1) > LEAF_KEEP[level])
				return;
			const ls = stage === 4 || stage === 5 ? Math.min(LEAF_STAGE, S) : stage;
			const count = LEAF_COUNT[level];
			let perp = dir.clone().cross(UP);
			if (perp.lengthSq() < 1e-6)
				perp = v3(1, 0, 0);
			perp.normalize();
			const roll = hash(stage * 3 + level, dist) * 0.8;
			for (let j = 0; j < count; j++) {
				const a = (j - (count - 1) / 2) * 0.62;
				const d = dir.clone().applyAxisAngle(perp, a).normalize();
				const size = LEAF_SIZE[level] * (0.9 + 0.3 * hash(j + level, stage + dist));
				leaves.push({ pos: tip.clone(), dir: d, size, stage: ls, dist, roll });
				touch(tip.clone().addScaledVector(d, size), ls);
			}
		};
	
	const growRoot = (
		start: V3, az: number, pitch: number, n: number, len: number,
		level: number, dist0: number, rand: () => number
	): void => {
		let p = start.clone();
		let a = az;
		let pt = pitch;
		let dist = dist0;
		for (let k = 0; k < n; k++) {
			a += (rand() - 0.5) * 0.5;
			pt = Math.max(0.12, pt - 0.07 + (rand() - 0.5) * 0.1);
			const l = len * (1 - 0.08 * k);
			const d = v3(Math.cos(a) * Math.cos(pt), -Math.sin(pt), Math.sin(a) * Math.cos(pt));
			const q = p.clone().addScaledVector(d, l);
			dist += l;
			addSeg(p, q, 1, dist, level === 0 ? 0.85 : level === 1 ? 0.6 : 0.4);
			if (level < 2 && k >= 1 && k < n - 1 && rand() < 0.75 - level * 0.2) {
				const side = rand() < 0.5 ? -1 : 1;
				growRoot(q,
				         a + side * (0.6 + rand() * 0.5),
				         pt + 0.05,
				         level === 0 ? 4 : 2,
				         len * 0.55,
				         level + 1,
				         dist,
				         rand);
			}
			p = q;
		}
	};
	{
		const rand = rng(1001);
		const N = 7;
		for (let i = 0; i < N; i++) {
			const az = (i / N) * TAU + (rand() - 0.5) * 0.4;
			growRoot(v3(Math.cos(az) * 0.3, -0.05, Math.sin(az) * 0.3), az, 0.62, 6, 0.95, 0, 0, rand);
		}
		boxes[0].expandByPoint(v3(0, 1, 0));
	}
	
	function grow(
		start: V3, dir0: V3, r0: number, level: number, stage: number, dist0: number,
		len: number, rand: () => number, open = false
	): void {
		const n = N_SEG[level];
		const pts = [start.clone()];
		const ds = [dist0];
		const rs = [r0];
		const dirs: V3[] = [];
		const lift = level === 0 ? (open ? 0.03 : 0.1) : (open ? 0.05 : 0.06);
		const wob = level === 0 ? (open ? 0.22 : 0.2) : 0.5;
		let d = dir0.clone().normalize();
		for (let k = 0; k < n; k++) {
			const sign = rand() < 0.5 ? -1 : 1;
			d = turn(d, sign * (0.12 + rand() * wob), rand);
			d.y += lift;
			d.normalize();
			const l = len * (0.85 + 0.3 * rand()) * (1 - 0.06 * k);
			pts.push(pts[k].clone().addScaledVector(d, l));
			ds.push(ds[k] + l);
			rs.push(r0 * (1 - 0.75 * ((k + 1) / n)));
			dirs.push(d.clone());
		}
		
		const sides = r0 > 0.15 ? 6 : 4;
		const rings: (V3[] | null)[] = [];
		let u: V3 | null = null;
		for (let k = 0; k <= n; k++) {
			if (rs[k] < TUBE_MIN) {
				rings.push(null);
				continue;
			}
			const t = k === 0 ? dirs[0] : k === n ? dirs[n - 1] : dirs[k - 1].clone().add(dirs[k]).normalize();
			u = u
			    ? u.clone().addScaledVector(t, -u.dot(t)).normalize()
			    : (Math.abs(t.y) < 0.9 ? UP.clone() : v3(1, 0, 0)).cross(t).normalize();
			const w = t.clone().cross(u);
			const uu = u;
			rings.push(Array.from({ length: sides }, (_, i) => {
				const a = (i / sides) * TAU + (hash(k + level, i) - 0.5) * 0.3;
				const rr = rs[k] * (0.88 + 0.24 * hash(i, k + stage));
				return pts[k].clone().addScaledVector(uu, Math.cos(a) * rr).addScaledVector(w, Math.sin(a) * rr);
			}));
		}
		
		const T = 0.8;
		const first = rings[0];
		if (first)
			for (let i = 0; i < sides; i++)
				addSeg(first[i], first[(i + 1) % sides], stage, ds[0], T * 0.85);
		for (let k = 0; k < n; k++) {
			const A = rings[k];
			const B = rings[k + 1];
			if (A && B) {
				for (let i = 0; i < sides; i++) {
					const i2 = (i + 1) % sides;
					addSeg(A[i], B[i], stage, ds[k + 1], T);
					addSeg(A[i],
					       hash(i + k, stage + level) > 0.5 ? B[i2] : B[(i + sides - 1) % sides],
					       stage,
					       ds[k + 1],
					       T * 0.85);
					addSeg(B[i], B[i2], stage, ds[k + 1], T * 0.85);
				}
			} else if (A) {
				A.forEach((a) => addSeg(a, pts[k + 1], stage, ds[k + 1], T));
			} else {
				addSeg(pts[k], pts[k + 1], stage, ds[k + 1], 0.85);
			}
		}
		
		leafFan(pts[n], dirs[n - 1], level, stage, ds[n]);
		
		const maxLevel = open ? 2 : 3;
		const pc = (open ? P_CHILD_OPEN : P_CHILD)[level] * thin;
		const kStart = open ? 2 : 1;
		for (let k = kStart; k < n; k++) {
			if (level < maxLevel && rand() < pc) {
				const side = rand() < 0.5 ? -1 : 1;
				const cd = turn(dirs[k - 1], side * (0.55 + rand() * 0.6), rand);
				cd.y += open ? 0.12 : 0.25;
				grow(pts[k], cd, rs[k] * 0.6, level + 1, stage, ds[k], len * 0.72, rand, open);
			}
		}
	}
	
	if (S >= 2) {
		const top = topOf(2);
		const c1 = center(top);
		addSeg(center(0), c1, 2, top, 0.7);
		[1, -1].forEach((sg, i) => {
			const d = v3(sg, 0.45, 0.2 * sg).normalize();
			leaves.push({ pos: c1.clone(), dir: d, size: 0.32, stage: 2, dist: top, roll: i * 1.3 });
			touch(c1.clone().addScaledVector(d, 0.32), 2);
		});
	}
	
	if (S >= 3) {
		const rand = rng(777);
		const top = topOf(3);
		const m = 5;
		const stemRing = (y: number) => {
			const c = center(y);
			const r = 0.05 + 0.03 * (1 - y / top);
			return Array.from({ length: 4 }, (_, i) => {
				const a = (i / 4) * TAU;
				return v3(c.x + Math.cos(a) * r, y, c.z + Math.sin(a) * r);
			});
		};
		for (let j = 0; j < m; j++) {
			const A = stemRing((j / m) * top);
			const B = stemRing(((j + 1) / m) * top);
			const dist = ((j + 1) / m) * top;
			for (let i = 0; i < 4; i++) {
				addSeg(A[i], B[i], 3, dist, 0.6);
				addSeg(A[i], B[(i + 1) % 4], 3, dist, 0.5);
				addSeg(B[i], B[(i + 1) % 4], 3, dist, 0.6);
			}
		}
		grow(center(top), v3(0.5, 1, 0.2), 0.03, 3, 3, top, 0.5, rand);
		grow(center(top), v3(-0.5, 1, -0.3), 0.03, 3, 3, top, 0.45, rand);
		grow(center(1.6), v3(0.9, 0.7, -0.4), 0.03, 3, 3, 1.6, 0.4, rand);
	}
	
	const ringAt = (y: number) => {
		const c = center(y);
		const key = Math.round(y * 100);
		const r = trunkR(y);
		return Array.from({ length: SIDES }, (_, i) => {
			const a = (i / SIDES) * TAU + (hash(i, key) - 0.5) * 0.35;
			const rr = r * (0.9 + 0.2 * hash(i * 3 + 1, key));
			return v3(c.x + Math.cos(a) * rr, y, c.z + Math.sin(a) * rr);
		});
	};
	const spacing = compact ? 0.8 : 0.55;
	const GOLDEN = 2.399963;
	
	const spawn = (y: number, az: number, el: number, r0: number, s: number, total: number, rand: () => number, open: boolean) => {
		const d = v3(Math.cos(az) * Math.cos(el), Math.sin(el), Math.sin(az) * Math.cos(el));
		const c = center(y);
		const rt = trunkR(y) * 0.7;
		const from = v3(c.x + Math.cos(az) * rt, y, c.z + Math.sin(az) * rt);
		grow(from, d, r0, 0, s, y, total / N_SEG[0], rand, open);
	};
	
	for (let s = 4; s <= S; s++) {
		if (s === 6)
			continue;
		const ya = s === 4 ? 0 : topOf(s - 1);
		const yb = topOf(s);
		const m = Math.max(1, Math.round((yb - ya) / spacing));
		
		if (s === 4) {
			const base = ringAt(0);
			for (let i = 0; i < SIDES; i++)
				addSeg(base[i], base[(i + 1) % SIDES], 4, 0, 0.6);
		}
		for (let j = 0; j < m; j++) {
			const lo = ya + (j / m) * (yb - ya);
			const hi = ya + ((j + 1) / m) * (yb - ya);
			const A = ringAt(lo);
			const B = ringAt(hi);
			for (let i = 0; i < SIDES; i++) {
				const i2 = (i + 1) % SIDES;
				addSeg(A[i], B[i], s, hi, 0.6);
				addSeg(A[i], hash(i, j + s * 7) > 0.5 ? B[i2] : B[(i + SIDES - 1) % SIDES], s, hi, 0.5);
				addSeg(B[i], B[i2], s, hi, 0.6);
			}
		}
		
		if (s === 4) {
			const rand = rng(4040);
			for (let i = 0; i < 3; i++)
				spawn(0.9 + i * 0.9, i * GOLDEN + 1, 0.3, 0.09, s, 1.3, rand, false);
			continue;
		}
		
		if (s === 5) {
			const rand = rng(5000 + 3 * 131);
			const nb = 5;
			for (let i = 0; i < nb; i++) {
				const y = 1.2 + ((i + 0.5 + (rand() - 0.5) * 0.5) / nb) * (yb - 1.2);
				const az = (30 + i) * GOLDEN + 0.3;
				const el = 0.15 + 0.5 * rand();
				spawn(y, az, el, 0.12 + 0.03 * rand(), s, Math.min(3.4, Math.max(1.6, 3.6 - 0.12 * y)), rand, false);
			}
			for (let i = 0; i < 2; i++) {
				const az = 3 * 2.1 + i * Math.PI;
				const el = 1.0 + 0.2 * rand();
				grow(center(yb), v3(Math.cos(az) * Math.cos(el), Math.sin(el), Math.sin(az) * Math.cos(el)),
				     0.1, 0, s, yb, 0.55, rand, false);
			}
			continue;
		}
		
		const rand = rng(5000 + s * 131);
		for (let i = 0; i < 3; i++) {
			const y = ya + ((i + 0.5) / 3) * (yb - ya);
			const az = s * 0.9 + (i * TAU) / 3;
			spawn(y, az, 0.2 + 0.2 * rand(), 0.13, s, Math.max(2.6, 4.8 - 0.2 * (y - 6)), rand, true);
		}
		const az = s * 2.1;
		grow(center(yb), v3(Math.cos(az) * Math.cos(1.15), Math.sin(1.15), Math.sin(az) * Math.cos(1.15)),
		     0.1, 0, s, yb, 0.6, rand, true);
	}
	
	if (S >= 6) {
		[4, 5].forEach((i) => {
			for (let j = 2; j < i; j++)
				boxes[i].union(boxes[j]);
		});
	}
	
	const maxD = new Array<number>(S + 1).fill(1e-6);
	segs.forEach((sg) => (maxD[sg.stage] = Math.max(maxD[sg.stage], sg.dist)));
	leaves.forEach((l) => (maxD[l.stage] = Math.max(maxD[l.stage], l.dist)));
	const birthOf = (stage: number, dist: number) =>
		stage - 1 + 0.02 + SEG_SPAN * Math.min(1, dist / maxD[stage]);
	
	const geometries = new Set<THREE.BufferGeometry>();
	const materials = new Set<THREE.Material>();
	const uG = { value: 0 };
	const track = <T extends THREE.BufferGeometry>(g: T): T => {
		geometries.add(g);
		return g;
	};
	const shader = (vs: string) => {
		const m = new THREE.ShaderMaterial({ vertexShader: vs, fragmentShader: LINE_FS, uniforms: { uG } });
		materials.add(m);
		return m;
	};
	
	const root = new THREE.Group();
	
	{
		const n = segs.length;
		const pos = new Float32Array(n * 6);
		const anc = new Float32Array(n * 6);
		const birth = new Float32Array(n * 2);
		const tone = new Float32Array(n * 2);
		segs.forEach((s, i) => {
			pos.set([s.a.x, s.a.y, s.a.z, s.b.x, s.b.y, s.b.z], i * 6);
			anc.set([s.a.x, s.a.y, s.a.z, s.a.x, s.a.y, s.a.z], i * 6);
			const b = birthOf(s.stage, s.dist);
			birth[i * 2] = birth[i * 2 + 1] = b;
			tone[i * 2] = tone[i * 2 + 1] = s.tone;
		});
		const g = track(new THREE.BufferGeometry());
		g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		g.setAttribute('anchor', new THREE.BufferAttribute(anc, 3));
		g.setAttribute('aBirth', new THREE.BufferAttribute(birth, 1));
		g.setAttribute('aTone', new THREE.BufferAttribute(tone, 1));
		const lines = new THREE.LineSegments(g, shader(LINE_VS));
		lines.frustumCulled = false;
		root.add(lines);
	}
	
	if (leaves.length) {
		const n = leaves.length;
		const base = track(leafGeometry());
		const ig = track(new THREE.InstancedBufferGeometry() as unknown as THREE.BufferGeometry) as THREE.InstancedBufferGeometry;
		ig.setAttribute('position', base.getAttribute('position'));
		ig.setAttribute('aTone', base.getAttribute('aTone'));
		ig.instanceCount = n;
		const iPos = new Float32Array(n * 3);
		const iQuat = new Float32Array(n * 4);
		const iSize = new Float32Array(n);
		const iBirth = new Float32Array(n);
		const q = new THREE.Quaternion();
		const roll = new THREE.Quaternion();
		leaves.forEach((l, i) => {
			q.setFromUnitVectors(UP, l.dir);
			roll.setFromAxisAngle(l.dir, l.roll);
			q.premultiply(roll);
			iPos.set([l.pos.x, l.pos.y, l.pos.z], i * 3);
			iQuat.set([q.x, q.y, q.z, q.w], i * 4);
			iSize[i] = l.size;
			iBirth[i] = birthOf(l.stage, l.dist) + LEAF_DELAY;
		});
		ig.setAttribute('iPos', new THREE.InstancedBufferAttribute(iPos, 3));
		ig.setAttribute('iQuat', new THREE.InstancedBufferAttribute(iQuat, 4));
		ig.setAttribute('iSize', new THREE.InstancedBufferAttribute(iSize, 1));
		ig.setAttribute('iBirth', new THREE.InstancedBufferAttribute(iBirth, 1));
		const leafLines = new THREE.LineSegments(ig, shader(LEAF_VS));
		leafLines.frustumCulled = false;
		root.add(leafLines);
	}
	
	const ground = new THREE.Group();
	{
		const rings: number[] = [];
		const ticks: number[] = [];
		const N = 96;
		[2.4, 4.8, 7.2].forEach((r) => {
			for (let i = 0; i < N; i++) {
				const a = (i / N) * TAU;
				const b = ((i + 1) / N) * TAU;
				rings.push(r * Math.cos(a), 0, r * Math.sin(a), r * Math.cos(b), 0, r * Math.sin(b));
			}
		});
		for (let i = 0; i < 72; i++) {
			const a = (i / 72) * TAU;
			const len = i % 6 === 0 ? 0.28 : 0.12;
			ticks.push(7.2 * Math.cos(a),
			           0,
			           7.2 * Math.sin(a),
			           (7.2 - len) * Math.cos(a),
			           0,
			           (7.2 - len) * Math.sin(a));
		}
		ticks.push(-0.25, 0, 0, 0.25, 0, 0, 0, 0, -0.25, 0, 0, 0.25);
		const mk = (data: number[], color: number) => {
			const g = track(new THREE.BufferGeometry());
			g.setAttribute('position', new THREE.Float32BufferAttribute(data, 3));
			const m = new THREE.LineBasicMaterial({ color });
			materials.add(m);
			return new THREE.LineSegments(g, m);
		};
		ground.add(mk(rings, 0x333333), mk(ticks, 0x5a5a5a));
	}
	
	const full = new THREE.Box3();
	boxes.forEach((b) => full.union(b));
	
	return {
		root,
		ground,
		stages: S,
		boxes,
		full,
		radius: Math.max(maxR, 4),
		setGrowth: (g) => {
			uG.value = g;
		},
		dispose: () => {
			geometries.forEach((g) => g.dispose());
			materials.forEach((m) => m.dispose());
		}
	};
}
