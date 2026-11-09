import * as THREE from 'three';
import type { SceneHandle } from '../../../hooks/useThreeScene';
import {
    buildGeometry,
    COLOR_LONGITUDINAL,
    COLOR_TRANSVERSE,
    STATIC_TIME,
} from '../geometry/mobius';
import { buildCpuSegments, resampleSegments } from '../geometry/cpu';
import { buildNetworkSegments, LAYER_COUNT, LAYER_GAP, LAYER_X0, SIGNAL_SET_COUNT } from '../geometry/network';
import type { NetSegment } from '../geometry/network';
import {
    projectTesseract,
    tesseractAngles,
    tesseractEdgeOrder,
    TESSERACT_EDGES,
} from '../geometry/tesseract';
import {clamp01, lerp, smooth, TAU} from "../../../lib/math";
import {
    DIR_MORPH, MOVE_SPAN, MOVE_START, SPLIT,
    dirOf, geoOf, morphOf, netOf, oldOf, phaseA, retOf,
} from './phases';
import {layoutTree} from "./measureTree";
import {MOBILE_QUERY} from "../../../lib/layout";
import {createRenderer} from "../../../lib/three/createRenderer";

export { OLD_SHARE, STAGE_PROGRESS } from './phases';

export type StageLayout = 'stage' | 'inline';
export type StageOptions = {
    reducedMotion: boolean;
    layout: StageLayout; // 'stage': full-viewport, shifts right→left. 'inline': centered, fixed progress.
    progress: { current: number };
    tree?: { current: HTMLElement | null }; // directory tree; its [data-tree-line] elements are the morph targets
};
type Frame = {
    m: number; n: number; g: number; d: number; r: number;
    offX: number; offY: number;
    scan: number; scanX: number;
    pulse: number; pulseSet: number; pulsePos: number;
};

const CAMERA_Z = 13;
const GROUP_SCALE = 0.95;
const CPU_POSE = { x: -0.95, y: 0, z: Math.PI / 4 };
const DELAY_RADIUS = 3.8;

const NET_POSE = { x: 0.18, y: -0.6, z: 0 };
const PULSE_PERIOD = 7; // seconds per signal cycle
const PULSE_SWEEP = 4.5; // seconds of that cycle spent sweeping; the rest is rest

/**
 * One line buffer morphing between the Möbius strip (progress 0) and the CPU (progress 1).
 * The scene is a pure function of progress, so scrolling back reverses it.
 */
export function createStageScene(
    container: HTMLElement,
    { reducedMotion, layout, progress, tree }: StageOptions,
): SceneHandle {
    const { renderer, dispose: disposeRenderer } = createRenderer(container);

    // ---- Source (Möbius) data ----
    const mobius = buildGeometry();
    const lp = new Float32Array(mobius.longitudinal.getAttribute('position').array);
    const tp = new Float32Array(mobius.transverse.getAttribute('position').array);
    mobius.longitudinal.dispose();
    mobius.transverse.dispose();

    const segCount = (lp.length + tp.length) / 6;
    const lpSegs = lp.length / 6;
    const from = new Float32Array(segCount * 6);
    from.set(lp, 0);
    from.set(tp, lp.length);

    const cBright = new THREE.Color(COLOR_LONGITUDINAL);
    const cGray = new THREE.Color(COLOR_TRANSVERSE);
    const setColor = (arr: Float32Array, seg: number, c: THREE.Color) => {
        for (let v = 0; v < 2; v++) arr.set([c.r, c.g, c.b], seg * 6 + v * 3);
    };
    const colorFrom = new Float32Array(segCount * 6);
    const colorTo = new Float32Array(segCount * 6);
    for (let i = 0; i < segCount; i++) setColor(colorFrom, i, i < lpSegs ? cBright : cGray);

    // ---- Target (CPU) data ----
    const base = buildCpuSegments();
    const cpu = resampleSegments(base, segCount);
    const to = new Float32Array(segCount * 6);
    const delay = new Float32Array(segCount);
    const midX = new Float32Array(segCount);
    cpu.forEach((s, i) => {
        to.set(s.a, i * 6);
        to.set(s.b, i * 6 + 3);
        setColor(colorTo, i, s.bright ? cBright : cGray);
        const mx = (s.a[0] + s.b[0]) / 2;
        const my = (s.a[1] + s.b[1]) / 2;
        midX[i] = mx;
        delay[i] = clamp01(Math.hypot(mx, my) / DELAY_RADIUS); // center resolves first
    });

    // ---- Target 2 (network) data ----
    // CPU body/die segments become node cages, lead segments become edges.
    // Both sides are paired in left-to-right order so the reorganization stays coherent.
    const netGeo = buildNetworkSegments();
    const brightIdx: number[] = [];
    const leadIdx: number[] = [];
    cpu.forEach((s, i) => {
        (s.bright ? brightIdx : leadIdx).push(i);
    });
    const toNet = new Float32Array(segCount * 6);
    const colorNet = new Float32Array(segCount * 6);
    const delay2 = new Float32Array(segCount);
    const netPos = new Float32Array(segCount); // position along the layers (0-LAYER_COUNT-1)
    const netMask = new Uint8Array(segCount); // signal path-set membership

    const pair = (idx: number[], segs: NetSegment[]) => {
        const order = [...idx].sort((p, q) => midX[p] - midX[q]);
        const sorted = [...segs].sort((p, q) => p.a[0] + p.b[0] - (q.a[0] + q.b[0]));
        order.forEach((i, k) => {
            const s = sorted[k];
            if (!s) return;
            toNet.set(s.a, i * 6);
            toNet.set(s.b, i * 6 + 3);
            setColor(colorNet, i, s.bright ? cBright : cGray);
            const pos = ((s.a[0] + s.b[0]) / 2 - LAYER_X0) / LAYER_GAP;
            netPos[i] = pos;
            netMask[i] = s.mask;
            delay2[i] = clamp01(pos / (LAYER_COUNT - 1)); // input layer resolves first
        });
    };
    pair(brightIdx, resampleSegments(netGeo.nodes, brightIdx.length));
    pair(leadIdx, resampleSegments(netGeo.edges, leadIdx.length));

    // ---- Target 3 (tesseract) data ----
// Each segment becomes a slice [f0, f1] of one tesseract edge; edge endpoints are re-projected every frame.
    const EDGE_COUNT = TESSERACT_EDGES.length;
    const segEdge = new Uint8Array(segCount);
    const segVa = new Uint8Array(segCount);
    const segVb = new Uint8Array(segCount);
    const f0 = new Float32Array(segCount);
    const f1 = new Float32Array(segCount);
    {
        const nx = (i: number) => toNet[i * 6] + toNet[i * 6 + 3];
        const ny = (i: number) => toNet[i * 6 + 1] + toNet[i * 6 + 4];
        // Network segments left→right are dealt to tesseract edges left→right.
        const bySeg = Array.from({ length: segCount }, (_, i) => i).sort(
            (p, q) => nx(p) - nx(q) || ny(p) - ny(q),
        );
        const base = Math.floor(segCount / EDGE_COUNT);
        const extra = segCount % EDGE_COUNT;
        let cursor = 0;
        tesseractEdgeOrder().forEach((edge, k) => {
            const size = base + (k < extra ? 1 : 0);
            const chunk = bySeg.slice(cursor, cursor + size).sort((p, q) => ny(p) - ny(q));
            cursor += size;
            chunk.forEach((i, j) => {
                segEdge[i] = edge;
                segVa[i] = TESSERACT_EDGES[edge][0];
                segVb[i] = TESSERACT_EDGES[edge][1];
                f0[i] = j / size;
                f1[i] = (j + 1) / size;
            });
        });
    }
    const proj = new Float32Array(48); // 16 projected vertices
    const projW = new Float32Array(16); // rotated w per vertex
    const edgeShade = new Float32Array(EDGE_COUNT).fill(1);
    const brightRGB = [cBright.r, cBright.g, cBright.b];

    // ---- Target 4 (directory tree) data ----
    // Segments keep their tesseract order (edge by edge, left→right) and are dealt along the tree's lines
    // (spine first, then each branch). Positions are measured from the DOM (measureTree).
    const edgeRank = new Uint8Array(EDGE_COUNT);
    tesseractEdgeOrder().forEach((e, k) => {
        edgeRank[e] = k;
    });
    const treeOrder = Array.from({ length: segCount }, (_, i) => i).sort(
        (p, q) => edgeRank[segEdge[p]] - edgeRank[segEdge[q]] || f0[p] - f0[q],
    );
    const toTree = new Float32Array(segCount * 6);
    const delay4 = new Float32Array(segCount);
    treeOrder.forEach((i, r) => {
        delay4[i] = r / segCount; // top of the tree resolves first
    });
    const grayRGB = [cGray.r, cGray.g, cGray.b];
    let treeReady = false;

    // Return phase: tree targets re-expressed in the group's moving frame so they stay fixed in the world.
    const treeLocal = new Float32Array(segCount * 6);
    const invWorld = new THREE.Matrix4();
    const tmpV = new THREE.Vector3();

    // ---- Scene objects ----
    const linePos = new Float32Array(from);
    const lineCol = new Float32Array(colorFrom);
    const posAttr = new THREE.BufferAttribute(linePos, 3).setUsage(THREE.DynamicDrawUsage);
    const colAttr = new THREE.BufferAttribute(lineCol, 3).setUsage(THREE.DynamicDrawUsage);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', posAttr);
    lineGeo.setAttribute('color', colAttr);

    const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9 });

    const lines = new THREE.LineSegments(lineGeo, lineMat);
    lines.frustumCulled = false;

    const group = new THREE.Group();
    group.scale.setScalar(GROUP_SCALE);
    group.add(lines);

    const scene = new THREE.Scene();
    scene.add(group);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);

    // ---- Per-frame update ----
    const updateBuffers = ({ m, n, g, d, r, offX, offY, scan, scanX, pulse, pulseSet, pulsePos }: Frame) => {
        if (r > 0 && treeReady) {
            invWorld.copy(group.matrixWorld).invert();
            for (let i = 0; i < segCount; i++) {
                for (let end = 0; end < 2; end++) {
                    const o = i * 6 + end * 3;
                    tmpV.set(toTree[o] * GROUP_SCALE, toTree[o + 1] * GROUP_SCALE, 0).applyMatrix4(invWorld);
                    treeLocal[o] = tmpV.x;
                    treeLocal[o + 1] = tmpV.y;
                    treeLocal[o + 2] = tmpV.z;
                }
            }
        }
        if (g > 0) {
            projectTesseract(tesseractAngles(state.tessTime), proj, projW);
            TESSERACT_EDGES.forEach(([a, b], e) => {
                // Nearer in w (larger, closer to the 4D viewpoint) reads brighter: a depth cue.
                edgeShade[e] = 0.5 + 0.5 * ((projW[a] + projW[b]) / 8 + 0.5);
            });
        }
        for (let i = 0; i < segCount; i++) {
            const t1 = smooth((m - delay[i] * 0.45) / 0.55);
            const t2 = smooth((n - delay2[i] * 0.5) / 0.5);
            const t3 = g > 0 ? smooth((g - delay2[i] * 0.5) / 0.5) : 0;
            const t4 = d > 0 && treeReady ? smooth((d - delay4[i] * 0.5) / 0.5) : 0;
            const t5 = r > 0 ? smooth((r - (1 - delay4[i]) * 0.5) / 0.5) : 0;
            let boost = scan > 0 ? scan * 0.5 * Math.exp(-((midX[i] - scanX) ** 2) / 0.6) : 0;
            if (pulse > 0 && ((netMask[i] >> pulseSet) & 1) === 1) {
                boost += pulse * 0.9 * Math.exp(-((netPos[i] - pulsePos) ** 2) / 0.15);
            }
            const o = i * 6;
            const va = segVa[i] * 3;
            const vb = segVb[i] * 3;
            for (let k = 0; k < 6; k++) {
                const kk = k % 3;
                const cpuPos = from[o + k] + (to[o + k] - from[o + k]) * t1;
                let pos = cpuPos + (toNet[o + k] - cpuPos) * t2;
                const cpuCol = colorFrom[o + k] + (colorTo[o + k] - colorFrom[o + k]) * t1;
                let c = cpuCol + (colorNet[o + k] - cpuCol) * t2;
                if (t3 > 0) {
                    const pa = proj[va + kk];
                    const pb = proj[vb + kk];
                    const f = k < 3 ? f0[i] : f1[i];
                    pos += (pa + (pb - pa) * f - pos) * t3;
                    c += (brightRGB[kk] * edgeShade[segEdge[i]] - c) * t3;
                }
                if (t4 > 0) {
                    const target = r > 0 ? treeLocal[o + k] : toTree[o + k] - (kk === 0 ? offX : kk === 1 ? offY : 0);
                    pos += (target - pos) * t4;
                    c += (grayRGB[kk] - c) * t4;
                }
                if (t5 > 0) {
                    pos += (from[o + k] - pos) * t5;
                    c += (colorFrom[o + k] - c) * t5;
                }
                linePos[o + k] = pos;
                lineCol[o + k] = Math.min(1, c * (1 + boost));
            }
        }

        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
    };

    const state = {
        rotTime: STATIC_TIME,
        tessTime: 0, // tesseract time; stops as the directory forms
        clock: 0,
        xOffset: 0,
        yOffset: 0,
        visW: 1, // visible world size on the z = 0 plane
        visH: 1,
        lastM: -1,
        lastN: -1,
        lastG: -1,
    };

    /** Converts the DOM tree's lines to group-local coordinates and deals the segments along them. */
    const measureTree = () => {
        treeReady = layoutTree(container, tree?.current, state.visW, state.visH, GROUP_SCALE, treeOrder, toTree);
    };

    const draw = () => {
        const all = progress.current;
        const raw = oldOf(all); // earlier phases, 0..1
        const d = clamp01(dirOf(all) / DIR_MORPH); // tesseract → tree
        const r = retOf(all); // tree → Möbius
        const p = clamp01(raw / SPLIT); // the original 0..1 progress for the earlier phases
        const g = geoOf(raw);
        const m = morphOf(p);
        const n = netOf(p);
        const e = smooth(m);
        const e2 = smooth(n);
        const e3 = smooth(g);
        const ed = smooth(d);
        const er = smooth(r);
        const scan = reducedMotion ? 0 : smooth((m - 0.9) / 0.1) * (1 - clamp01(n * 10));
        const scanX = -4 + ((state.clock / 14) % 1) * 8;

        const pulse = reducedMotion ? 0 : smooth((n - 0.9) / 0.1) * (1 - clamp01(g * 10));
        const cycle = state.clock / PULSE_PERIOD;
        const pulseSet = Math.floor(cycle) % SIGNAL_SET_COUNT;
        const pulsePos = -0.6 + ((((cycle % 1) * PULSE_PERIOD) / PULSE_SWEEP) * LAYER_COUNT + 0.2);

        // Right → left (Hero→CPU), left → right (CPU→network), right → left (network→tesseract),
        // center (tree), then back to the right (tree→Möbius).
        const moveA = smooth((phaseA(p) - MOVE_START) / MOVE_SPAN);
        const px = lerp(state.xOffset * (1 - 2 * moveA + 2 * e2 - 2 * e3) * (1 - ed), state.xOffset, er);
        const py = lerp(state.yOffset * (1 - ed), state.yOffset, er);
        group.position.set(px, py, 0);

        // Pose: Möbius tumble → tilted CPU → slightly rotated network → upright → Möbius tumble again.
        const t = state.rotTime;
        const sway = reducedMotion ? 0 : Math.sin(state.clock * 0.25) * 0.07;
        const mx = 1.0 + 0.2 * Math.sin(t * 0.11);
        const mz = 0.25 * Math.sin(t * 0.07);
        const yM = t * 0.14;
        const yMw = yM - TAU * Math.round(yM / TAU); // wrapped, so the return does not spin through many turns
        const targetY = CPU_POSE.y + sway;
        const nearestY = targetY + TAU * Math.round((yM - targetY) / TAU);
        const y1 = e2 > 0 ? targetY : lerp(yM, nearestY, e);
        const rx = lerp(lerp(mx, CPU_POSE.x + sway * 0.5, e), NET_POSE.x + sway * 0.5, e2);
        const ry = lerp(y1, NET_POSE.y + sway, e2);
        const rz = lerp(lerp(mz, CPU_POSE.z, e), NET_POSE.z, e2);
        group.rotation.set(
            lerp(lerp(rx, 0, e3), mx, er),
            lerp(lerp(ry, 0, e3), yMw, er),
            lerp(lerp(rz, 0, e3), mz, er),
        );
        group.updateMatrixWorld(true);

        // The tesseract target rotates, so buffers update every frame while g > 0.
        if (m !== state.lastM || n !== state.lastN || g !== state.lastG || g > 0 || scan > 0 || pulse > 0) {
            updateBuffers({ m, n, g, d, r, offX: px / GROUP_SCALE, offY: py / GROUP_SCALE, scan, scanX, pulse, pulseSet, pulsePos });            state.lastN = n;
            state.lastG = g;
        }

        renderer.render(scene, camera);
    };

    const fit = () => {
        const w = Math.max(container.clientWidth, 1);
        const h = Math.max(container.clientHeight, 1);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;

        const mobile = window.matchMedia(MOBILE_QUERY).matches;
        const stageMobile = layout === 'stage' && mobile;
        const hostH = container.parentElement?.clientHeight ?? h;
        // Mobile: the canvas spans the viewport (so the tree can sit anywhere), but the object keeps the
        // framing it had in the old lower-46% canvas: same camera distance and same on-screen size.
        const refAspect = stageMobile ? w / (hostH * 0.54) : camera.aspect;
        const z = refAspect < 1 ? CAMERA_Z / refAspect : CAMERA_Z;
        const tan = Math.tan(THREE.MathUtils.degToRad(17.5));
        camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan((tan * refAspect) / camera.aspect));
        camera.position.set(0, 0, z);
        camera.updateProjectionMatrix();
        state.visH = 2 * z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        state.visW = state.visH * camera.aspect;

        if (layout === 'stage' && !mobile) {
            state.xOffset = ((Math.min(w, 1200) * 0.22) / w) * state.visW; // center of the hero's right column
            state.yOffset = 0;
        } else if (stageMobile) {
            state.xOffset = 0;
            // Move the object down to where the old lower-46% canvas centered it (73% of the stage height).
            state.yOffset = (-(0.73 * hostH - (container.offsetTop + h / 2)) * state.visH) / h;
        } else {
            state.xOffset = 0;
            state.yOffset = 0;
        }
        state.lastM = -1;
        state.lastN = -1;
        state.lastG = -1;
        measureTree();
        draw();
    };

    let last = 0;
    let raf = 0;
    let running = false;
    let disposed = false

    const frame = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        state.clock += dt;
        const all = progress.current;
        const spin = Math.max(1 - smooth(morphOf(oldOf(all) / SPLIT)), smooth(retOf(all)));
        state.rotTime += dt * spin; // the Möbius resumes tumbling as it re-forms
        state.tessTime += dt * (1 - smooth(dirOf(all) / 0.5)); // the tesseract comes to rest as the tree forms
        if (dirOf(all) < 1 || retOf(all) > 0) draw(); // the canvas is only invisible while the DOM tree is shown
        raf = requestAnimationFrame(frame);
    };
    const start = () => {
        if (running) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
    };
    const stop = () => {
        running = false;
        cancelAnimationFrame(raf);
    };

    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(container);
    if (tree?.current) resizeObserver.observe(tree.current);
    fit();
    // Font swaps change the tree's metrics after the first measurement.
    void document.fonts?.ready.then(() => {
        if (!disposed) fit();
    });

    let intersectionObserver: IntersectionObserver | null = null;
    if (!reducedMotion) {
        intersectionObserver = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting) start();
            else stop();
        });
        intersectionObserver.observe(container);
    }

    return {
        dispose() {
            disposed = true;
            stop();
            resizeObserver.disconnect();
            intersectionObserver?.disconnect();
            lineGeo.dispose();
            lineMat.dispose();
            disposeRenderer()
        },
    };
}
