import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {TAU} from "../../../lib/math";

const SURFACE = 0x0a0a0a;
const LINE_STRONG = 0xd9d9d9;
const LINE = 0x9a9a9a;

export type Machine = {
    root: THREE.Group;
    stack: { g: THREE.Group; x: number }[]; // parts spaced along x (stretched by the pose)
    spinners: { g: THREE.Group; k: number }[]; // parts that twist with pose.twist
    panels: { g: THREE.Group; dy: number; dz: number; k: number }[]; // shell panels, radial direction + travel factor
    bands: { g: THREE.Group; k: number }[]; // shell rings that idle-rotate about the axis
    spindle: THREE.Group;
    setShellOpacity: (o: number) => void;
    dispose: () => void;
};

type Fade = { mesh?: THREE.Mesh; lines: THREE.LineSegments };
type Prof = [number, number][]; // [radius, along-axis]

/** Lathe profile revolved around the machine's x axis, centered on its own midpoint. */
const lathe = (pts: Prof, seg: number, phiStart = 0, phiLength = TAU) => {
    const geo = new THREE.LatheGeometry(
        pts.map(([r, y]) => new THREE.Vector2(r, y)),
        seg,
        phiStart,
        phiLength,
    );
    const ys = pts.map((p) => p[1]);
    geo.translate(0, -(Math.min(...ys) + Math.max(...ys)) / 2, 0);
    geo.rotateZ(-Math.PI / 2);
    return geo;
};

/** Copies `base` (axis along x) `count` times around the x axis at `radius`, merged into one geometry. */
const ringOf = (base: THREE.BufferGeometry, count: number, radius: number) => {
    const list: THREE.BufferGeometry[] = [];
    for (let i = 0; i < count; i++) {
        const g = base.clone();
        g.translate(0, radius, 0);
        g.rotateX((i * TAU) / count);
        list.push(g);
    }
    const merged = mergeGeometries(list)!;
    list.forEach((g) => g.dispose());
    base.dispose();
    return merged;
};

export function buildMachine(): Machine {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const shellFade: Fade[] = [];

    const part = (
        geo: THREE.BufferGeometry,
        color: number,
        opts: { solid?: boolean; fade?: Fade[]; thresh?: number } = {},
    ) => {
        const { solid = true, fade, thresh = 10 } = opts;
        const group = new THREE.Group();
        const edgeGeo = new THREE.EdgesGeometry(geo, thresh);
        geometries.add(geo);
        geometries.add(edgeGeo);
        const lineMat = new THREE.LineBasicMaterial({ color, transparent: !!fade });
        materials.add(lineMat);
        const lines = new THREE.LineSegments(edgeGeo, lineMat);
        let mesh: THREE.Mesh | undefined;
        if (solid) {
            const meshMat = new THREE.MeshBasicMaterial({
                color: SURFACE,
                side: THREE.DoubleSide,
                polygonOffset: true,
                polygonOffsetFactor: 1,
                polygonOffsetUnits: 1,
                transparent: !!fade,
            });
            materials.add(meshMat);
            mesh = new THREE.Mesh(geo, meshMat);
            group.add(mesh);
        }
        group.add(lines);
        fade?.push({ mesh, lines });
        return group;
    };

    const root = new THREE.Group();
    const stack: Machine['stack'] = [];
    const spinners: Machine['spinners'] = [];
    const place = (g: THREE.Group, x: number, spin = 0) => {
        g.position.x = x;
        stack.push({ g, x });
        if (spin) spinners.push({ g, k: spin });
        root.add(g);
        return g;
    };

    // ---- Rear cap: dished disc with a ring of bolts ----
    {
        const g = new THREE.Group();
        g.add(part(lathe([[0.5, -0.1], [1.6, -0.1], [1.6, 0.04], [1.3, 0.1], [0.5, 0.1], [0.5, -0.1]], 28), LINE_STRONG));
        const bolt = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8);
        bolt.rotateZ(-Math.PI / 2);
        bolt.translate(0.1, 0, 0);
        g.add(part(ringOf(bolt, 12, 1.4), LINE));
        place(g, -3.2);
    }

    // ---- Pod carrier: hub with six capsule pods ----
    {
        const g = new THREE.Group();
        g.add(part(lathe([[0.22, -0.2], [0.5, -0.2], [0.5, 0.2], [0.22, 0.2], [0.22, -0.2]], 20), LINE_STRONG));
        const capsule = new THREE.CapsuleGeometry(0.19, 0.5, 3, 10);
        capsule.rotateZ(-Math.PI / 2);
        const peg = new THREE.CylinderGeometry(0.07, 0.07, 0.2, 8);
        peg.rotateZ(-Math.PI / 2);
        peg.translate(0.54, 0, 0);
        const pod = mergeGeometries([capsule, peg])!;
        capsule.dispose();
        peg.dispose();
        g.add(part(ringOf(pod, 6, 0.78), LINE_STRONG));
        place(g, -2.4, 1);
    }

    // ---- Knurled ring ----
    {
        const g = new THREE.Group();
        g.add(part(lathe([[1.0, -0.25], [1.12, -0.25], [1.12, 0.25], [1.0, 0.25], [1.0, -0.25]], 24), LINE_STRONG));
        g.add(part(ringOf(new THREE.BoxGeometry(0.5, 0.1, 0.06), 28, 1.15), LINE));
        place(g, -1.6, -0.6);
    }

    // ---- Housings: ridged barrels, split around the core ----
    const housing = (mirror: boolean) => {
        const L = 1.2;
        const prof: Prof = [[0.6, 0], [1.2, 0], [1.2, 0.08], [1.0, 0.08]];
        for (let k = 0; k < 4; k++) {
            const y = 0.2 + k * 0.2;
            prof.push([1.0, y], [1.08, y], [1.08, y + 0.1], [1.0, y + 0.1]);
        }
        prof.push([1.0, L], [0.6, L], [0.6, 0]);
        return lathe(mirror ? prof.map(([r, y]) => [r, L - y] as [number, number]) : prof, 16);
    };
    {
        const g = new THREE.Group();
        g.add(part(housing(false), LINE_STRONG));
        const lug = new THREE.SphereGeometry(0.11, 8, 5);
        for (const sz of [-1, 1]) {
            const l = part(lug, LINE_STRONG);
            l.position.set(-0.1, 1.04, sz * 0.14);
            g.add(l);
        }
        place(g, -0.62);
    }
    place(part(housing(true), LINE_STRONG), 0.62);

    // ---- Fin fan: five tabbed discs ----
    for (let i = 0; i < 5; i++) {
        const r = 0.98 - i * 0.05;
        const g = new THREE.Group();
        g.add(part(lathe([[0.2, 0], [r, 0], [r, 0.05], [0.2, 0.05], [0.2, 0]], 24), LINE_STRONG));
        g.add(part(ringOf(new THREE.BoxGeometry(0.07, 0.14, 0.22), 3, r), LINE));
        place(g, 1.55 + i * 0.16, 0.3 * (i + 1) * (i % 2 ? -1 : 1));
    }

    // ---- Petal plate: six-lobed ----
    {
        const g = new THREE.Group();
        const s = new THREE.Shape();
        const N = 120;
        for (let i = 0; i < N; i++) {
            const a = (i / N) * TAU;
            const r = 0.7 + 0.28 * Math.cos(6 * a);
            const x = r * Math.cos(a);
            const y = r * Math.sin(a);
            if (i) s.lineTo(x, y);
            else s.moveTo(x, y);
        }
        s.closePath();
        s.holes.push(new THREE.Path(new THREE.EllipseCurve(0, 0, 0.2, 0.2, 0, TAU, true, 0).getPoints(20)));
        const plate = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: false });
        plate.translate(0, 0, -0.04);
        plate.rotateY(Math.PI / 2);
        g.add(part(plate, LINE_STRONG));
        g.add(part(lathe([[0.2, -0.15], [0.36, -0.15], [0.36, 0.15], [0.2, 0.15], [0.2, -0.15]], 16), LINE_STRONG));
        place(g, 2.55, 0.5);
    }

    // ---- Front cap: toothed ring ----
    {
        const g = new THREE.Group();
        g.add(part(lathe([[0.5, -0.15], [1.3, -0.15], [1.3, 0.1], [1.0, 0.15], [0.5, 0.15], [0.5, -0.15]], 28), LINE_STRONG));
        g.add(part(ringOf(new THREE.BoxGeometry(0.22, 0.08, 0.05), 44, 1.34), LINE));
        place(g, 3.2);
    }

    // ---- Core (fixed at the center): faceted heart and a thin ring ----
    {
        const g = new THREE.Group();
        g.add(part(new THREE.IcosahedronGeometry(0.4, 1), LINE_STRONG));
        const torus = new THREE.TorusGeometry(0.5, 0.04, 6, 24);
        torus.rotateY(Math.PI / 2);
        g.add(part(torus, LINE));
        spinners.push({ g, k: -1 });
        root.add(g);
    }

    // ---- Spindle through everything ----
    const spindleGeo = new THREE.CylinderGeometry(0.1, 0.1, 7, 12);
    spindleGeo.rotateZ(-Math.PI / 2);
    const spindle = part(spindleGeo, LINE);
    spindle.position.x = 0.1;
    root.add(spindle);

    // ---- Shell: 4 bands x 8 panels fully enclose the machine ----
    const panels: Machine['panels'] = [];
    const bands: Machine['bands'] = [];
    const BANDS = 4;
    const SEGS = 8;
    const SPAN = 7.2; // length covered along x
    const bandLen = SPAN / BANDS;
    const sweep = TAU / SEGS - 0.05;
    for (let b = 0; b < BANDS; b++) {
        const bandG = new THREE.Group();
        bandG.position.x = -SPAN / 2 + bandLen * (b + 0.5);
        root.add(bandG);
        bands.push({ g: bandG, k: b % 2 ? -1 : 1 });
        const L = bandLen / 2 - 0.03;
        const base = lathe([[1.75, -L], [1.83, -L], [1.83, L], [1.75, L], [1.75, -L]], 6, 0, sweep);
        for (let j = 0; j < SEGS; j++) {
            const mid = (j + 0.5) * (TAU / SEGS);
            const rot = new THREE.Group();
            rot.rotation.x = mid - sweep / 2; // lathe starts at phi = 0
            rot.add(part(j === 0 ? base : base.clone(), LINE_STRONG, { fade: shellFade }));
            const holder = new THREE.Group();
            holder.add(rot);
            bandG.add(holder);
            panels.push({ g: holder, dy: -Math.sin(mid), dz: Math.cos(mid), k: 0.85 + 0.15 * (b % 2) });
        }
    }

    const setShellOpacity = (o: number) => {
        const meshO = Math.min(1, Math.max(0, (o - 0.5) * 2)); // surfaces vanish first, leaving outlines
        for (const { mesh, lines } of shellFade) {
            lines.visible = o > 0.02;
            (lines.material as THREE.LineBasicMaterial).opacity = o;
            if (mesh) {
                const m = mesh.material as THREE.MeshBasicMaterial;
                mesh.visible = meshO > 0.02;
                m.opacity = meshO;
                m.depthWrite = meshO > 0.98;
            }
        }
    };

    return {
        root,
        stack,
        spinners,
        panels,
        bands,
        spindle,
        setShellOpacity,
        dispose: () => {
            geometries.forEach((g) => g.dispose());
            materials.forEach((m) => m.dispose());
        },
    };
}
