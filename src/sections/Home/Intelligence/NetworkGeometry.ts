import type { CpuSegment, Vec3 } from '../Computation/CpuGeometry';

export type NetSegment = CpuSegment & { mask: number }; // mask: bit k = belongs to signal path set k

export const LAYER_SIZES = [4, 6, 6, 3];
export const LAYER_COUNT = LAYER_SIZES.length;
export const LAYER_GAP = 2;
export const LAYER_X0 = -3;
export const SIGNAL_SET_COUNT = 3;

const NODE_RADIUS = [0.16, 0.18, 0.18, 0.22];

// Each path lists one node index per layer. Sets take turns carrying the signal.
const PATH_SETS: number[][][] = [
    [[0, 1, 4, 0], [3, 5, 2, 2]],
    [[1, 3, 0, 1], [2, 0, 5, 2]],
    [[2, 4, 3, 1], [0, 2, 1, 0]],
];

const grid = (ys: number[], zs: number[]): [number, number][] =>
    ys.flatMap((y) => zs.map((z): [number, number] => [y, z]));

// [y, z] positions per layer
const LAYERS: [number, number][][] = [
    grid([-0.75, 0.75], [-0.75, 0.75]),
    grid([-1.5, 0, 1.5], [-0.8, 0.8]),
    grid([-1.5, 0, 1.5], [-0.8, 0.8]),
    grid([-1.2, 0, 1.2], [0]),
];

const nodePos = (layer: number, idx: number): Vec3 => {
    const [y, z] = LAYERS[layer][idx];
    return [LAYER_X0 + layer * LAYER_GAP, y, z];
};

const nodeMask = (layer: number, idx: number) =>
    PATH_SETS.reduce(
        (m, paths, k) => (paths.some((p) => p[layer] === idx) ? m | (1 << k) : m),
        0,
    );

const edgeMask = (gap: number, a: number, b: number) =>
    PATH_SETS.reduce(
        (m, paths, k) => (paths.some((p) => p[gap] === a && p[gap + 1] === b) ? m | (1 << k) : m),
        0,
    );

function octahedron(c: Vec3, r: number, mask: number, out: NetSegment[]) {
    for (let i = 0; i < 3; i++) {
        for (let j = i + 1; j < 3; j++) {
            for (const si of [-1, 1]) {
                for (const sj of [-1, 1]) {
                    const a: Vec3 = [c[0], c[1], c[2]];
                    const b: Vec3 = [c[0], c[1], c[2]];
                    a[i] += si * r;
                    b[j] += sj * r;
                    out.push({ a, b, bright: true, mask });
                }
            }
        }
    }
}

/** Feedforward 4-6-6-3 network as technical linework: wireframe octahedra (nodes) and edges. */
export function buildNetworkSegments(): { nodes: NetSegment[]; edges: NetSegment[] } {
    const nodes: NetSegment[] = [];
    const edges: NetSegment[] = [];

    LAYER_SIZES.forEach((size, layer) => {
        for (let idx = 0; idx < size; idx++) {
            octahedron(nodePos(layer, idx), NODE_RADIUS[layer], nodeMask(layer, idx), nodes);
        }
    });

    for (let g = 0; g < LAYER_COUNT - 1; g++) {
        for (let a = 0; a < LAYER_SIZES[g]; a++) {
            for (let b = 0; b < LAYER_SIZES[g + 1]; b++) {
                const p = nodePos(g, a);
                const q = nodePos(g + 1, b);
                const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
                const len = Math.hypot(d[0], d[1], d[2]);
                const ra = NODE_RADIUS[g] / len;
                const rb = NODE_RADIUS[g + 1] / len;
                // Edges stop at the node cages instead of passing through them.
                const s: Vec3 = [p[0] + d[0] * ra, p[1] + d[1] * ra, p[2] + d[2] * ra];
                const e: Vec3 = [q[0] - d[0] * rb, q[1] - d[1] * rb, q[2] - d[2] * rb];
                edges.push({ a: s, b: e, bright: false, mask: edgeMask(g, a, b) });
            }
        }
    }

    return { nodes, edges };
}
