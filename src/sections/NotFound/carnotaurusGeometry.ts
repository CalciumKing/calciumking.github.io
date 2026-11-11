import * as THREE from 'three';

export type CarnotaurusRig = {
	root: THREE.Group;
	ribs: THREE.Group;
	neck: THREE.Group[];
	neckRest: number[];
	skull: THREE.Group;
	skullRest: number;
	jaw: THREE.Group;
	jawRest: number;
	dispose: () => void;
};

const SEG_LEN = 0.62;
const NECK_REST = [-1.0, 0.2, 0.2, 0.2, 0.2];
const SKULL_REST = 0.2;
const JAW_REST = 0.04;
const SKULL_SCALE = 1.3;

const DORSAL = 6;
const DORSAL_STEP = 0.55;
const DORSAL_TILT = -0.12;
const RIB_SIZE = [0.75, 0.95, 1, 0.95, 0.8, 0.6];

const FILL = 0x050505;
const SKULL_LINE = 0xd9d9d9;
const BONE_LINE = 0x9a9a9a;
const RIB_LINE = 0x6e6e6e;

const SKULL: [number, number][] = [
	[-2.0, -0.30], [-2.05, 0.05], [-1.95, 0.45], [-1.5, 0.58], [-0.95, 0.68], [-0.55, 0.78],
	[-0.1, 0.85], [0.45, 0.92], [0.9, 0.8], [1.2, 0.45], [1.3, 0.0], [1.2, -0.45],
	[0.8, -0.65], [0.3, -0.62], [-0.3, -0.45], [-1.0, -0.42], [-1.7, -0.38]
];
const SKULL_HOLES: [number, number][][] = [
	[[-1.8, 0.28], [-1.55, 0.4], [-1.5, 0.2]],
	[[-1.15, 0.15], [-0.8, 0.38], [-0.7, 0.1], [-0.95, 0.0]],
	[[-0.5, 0.3], [-0.35, 0.58], [-0.05, 0.62], [0.1, 0.4], [0.0, 0.12], [-0.25, 0.0], [-0.45, 0.08]],
	[[0.4, 0.5], [0.7, 0.62], [0.95, 0.3], [0.85, -0.2], [0.55, -0.3], [0.35, 0.0]]
];
const JAW_PIVOT: [number, number] = [0.7, -0.55];
const JAW: [number, number][] = [
	[0.85, -0.3], [0.9, -0.8], [0.4, -0.97], [-0.3, -0.95], [-1.0, -0.85], [-1.8, -0.68],
	[-1.9, -0.52], [-1.0, -0.52], [-0.3, -0.5], [0.2, -0.4], [0.55, -0.22]
];
const JAW_HOLES: [number, number][][] = [
	[[-0.05, -0.7], [0.2, -0.62], [0.45, -0.7], [0.2, -0.78]]
];

const hw = (x: number) => 0.2 + 0.35 * Math.min(1, Math.max(0, (x + 2) / 2.4));
const taper = (geo: THREE.BufferGeometry, ox: number, k: number) => {
	const p = geo.attributes.position;
	for (let i = 0; i < p.count; i++)
		p.setZ(i, p.getZ(i) * hw(p.getX(i) + ox) * k);
	p.needsUpdate = true;
};

export function buildCarnotaurus(): CarnotaurusRig {
	const geos: THREE.BufferGeometry[] = [];
	const mats: THREE.Material[] = [];
	const edgeCache = new Map<THREE.BufferGeometry, THREE.EdgesGeometry>();
	
	const track = <T extends THREE.BufferGeometry>(g: T): T => {
		geos.push(g);
		return g;
	};
	const lineMat = (color: number) => {
		const m = new THREE.LineBasicMaterial({ color });
		mats.push(m);
		return m;
	};
	const fill = new THREE.MeshBasicMaterial({
		                                         color: FILL,
		                                         polygonOffset: true,
		                                         polygonOffsetFactor: 1,
		                                         polygonOffsetUnits: 1
	                                         });
	const skullLine = lineMat(SKULL_LINE);
	const boneLine = lineMat(BONE_LINE);
	const ribLine = lineMat(RIB_LINE);
	
	const solid = (parent: THREE.Object3D, geo: THREE.BufferGeometry, line: THREE.LineBasicMaterial, threshold = 20) => {
		let edges = edgeCache.get(geo);
		if (!edges) {
			edges = track(new THREE.EdgesGeometry(geo, threshold));
			edgeCache.set(geo, edges);
		}
		const group = new THREE.Group();
		group.add(new THREE.Mesh(geo, fill), new THREE.LineSegments(edges, line));
		parent.add(group);
		return group;
	};
	
	const centrum = track(new THREE.CylinderGeometry(1, 1, 1, 6));
	centrum.rotateZ(Math.PI / 2);
	const box = track(new THREE.BoxGeometry(1, 1, 1));
	
	const vertebra = (parent: THREE.Object3D, len: number, r: number, spine: number, x: number) => {
		const c = solid(parent, centrum, boneLine);
		c.scale.set(len * 0.9, r, r);
		c.position.x = x;
		const s = solid(parent, box, boneLine);
		s.scale.set(0.3, spine, 0.06);
		s.position.set(x, r + spine / 2 - 0.05, 0);
		const t = solid(parent, box, boneLine);
		t.scale.set(0.18, 0.05, r * 2.6);
		t.position.x = x;
	};
	
	const rib = (x0: number, y0: number, size: number, side: number) => {
		const pts: THREE.Vector3[] = [];
		for (let k = 0; k <= 12; k++) {
			const a = (k / 12) * 2.4;
			const c = 1 - Math.cos(a);
			pts.push(new THREE.Vector3(x0 + 0.35 * size * c, y0 - 0.8 * size * c, side * 0.95 * size * Math.sin(a)));
		}
		return new THREE.Line(track(new THREE.BufferGeometry().setFromPoints(pts)), ribLine);
	};
	
	const profile = (pts: [number, number][], ox = 0, oy = 0, holes: [number, number][][] = []) => {
		const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x - ox, y - oy)));
		shape.holes = holes.map((h) => new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x - ox, y - oy))));
		return shape;
	};
	
	const root = new THREE.Group();
	root.rotation.y = 0.35;
	
	const torso = new THREE.Group();
	torso.position.set(3.2, -1.2, 0);
	root.add(torso);
	const ribs = new THREE.Group();
	torso.add(ribs);
	
	for (let j = 0; j < DORSAL; j++) {
		const d = DORSAL_STEP * (j + 0.5);
		const px = d * Math.cos(DORSAL_TILT);
		const py = d * Math.sin(DORSAL_TILT);
		const holder = new THREE.Group();
		holder.position.set(px, py, 0);
		holder.rotation.z = DORSAL_TILT;
		torso.add(holder);
		vertebra(holder, DORSAL_STEP, 0.9, 0.6, 0);
		ribs.add(rib(px, py - 0.9, RIB_SIZE[j], -1), rib(px, py - 0.9, RIB_SIZE[j], 1));
	}
	
	const neck: THREE.Group[] = [];
	let parent: THREE.Object3D = torso;
	NECK_REST.forEach((rest, i) => {
		const seg = new THREE.Group();
		seg.rotation.z = rest;
		if (i > 0)
			seg.position.x = -SEG_LEN;
		parent.add(seg);
		vertebra(seg, SEG_LEN, 0.8 - 0.3 * (i / (NECK_REST.length - 1)), 0.35, -SEG_LEN / 2);
		neck.push(seg);
		parent = seg;
	});
	
	const skull = new THREE.Group();
	skull.position.x = -SEG_LEN;
	skull.rotation.z = SKULL_REST;
	parent.add(skull);
	
	const content = new THREE.Group();
	content.position.set(-1.5, 0.1, 0);
	content.scale.setScalar(SKULL_SCALE);
	skull.add(content);
	
	const skullGeo = track(new THREE.ExtrudeGeometry(profile(SKULL, 0, 0, SKULL_HOLES), {
		depth: 2, bevelEnabled: false, curveSegments: 1
	}));
	skullGeo.translate(0, 0, -1);
	taper(skullGeo, 0, 1);
	solid(content, skullGeo, skullLine, 4);
	
	const hornGeo = track(new THREE.CylinderGeometry(0.08, 0.27, 0.95, 5));
	hornGeo.translate(0, 0.475, 0);
	for (const side of [-1, 1]) {
		const horn = solid(content, hornGeo, skullLine);
		horn.position.set(0.05, 0.78, side * 0.32);
		horn.rotation.set(side * 0.75, 0, -0.35);
	}
	
	const toothGeo = track(new THREE.ConeGeometry(0.055, 0.2, 4));
	toothGeo.translate(0, 0.1, 0);
	for (let x = -1.85; x <= -0.4; x += 0.2) {
		for (const side of [-1, 1]) {
			const tooth = solid(content, toothGeo, skullLine);
			tooth.position.set(x, -0.4 - 0.0625 * (x + 1.8), side * hw(x) * 0.9);
			tooth.rotation.z = Math.PI;
		}
	}
	
	const jaw = new THREE.Group();
	jaw.position.set(JAW_PIVOT[0], JAW_PIVOT[1], 0);
	jaw.rotation.z = JAW_REST;
	content.add(jaw);
	const jawGeo = track(new THREE.ExtrudeGeometry(profile(JAW, JAW_PIVOT[0], JAW_PIVOT[1], JAW_HOLES), {
		depth: 2, bevelEnabled: false, curveSegments: 1
	}));
	jawGeo.translate(0, 0, -1);
	taper(jawGeo, JAW_PIVOT[0], 0.8);
	solid(jaw, jawGeo, skullLine, 4);
	for (let x = -1.7; x <= -0.5; x += 0.3) {
		for (const side of [-1, 1]) {
			const tooth = solid(jaw, toothGeo, skullLine);
			tooth.scale.setScalar(0.8);
			tooth.position.set(x - JAW_PIVOT[0], 0, side * hw(x) * 0.72);
		}
	}
	
	return {
		root, ribs, neck, skull, jaw,
		neckRest: NECK_REST,
		skullRest: SKULL_REST,
		jawRest: JAW_REST,
		dispose() {
			geos.forEach((g) => g.dispose());
			mats.forEach((m) => m.dispose());
		}
	};
}
