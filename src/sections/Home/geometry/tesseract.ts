/**
 * Tesseract (4D hypercube): vertices, edges, 4D rotation, and 4D→3D perspective projection.
 * Topology: 16 vertices, 32 edges (24 square faces and 8 cubic cells follow from the same structure).
 */
export type Vec4 = [number, number, number, number];
export type Mat4 = number[]; // row-major 4×4

export type Plane = 'xy' | 'xz' | 'xw' | 'yz' | 'yw' | 'zw';
export type Angles = Partial<Record<Plane, number>>;

/** All (±1, ±1, ±1, ±1). Bit k of the index selects the sign of coordinate k. */
export const TESSERACT_VERTICES: Vec4[] = Array.from({ length: 16 }, (_, i): Vec4 => [
    i & 1 ? 1 : -1,
    i & 2 ? 1 : -1,
    i & 4 ? 1 : -1,
    i & 8 ? 1 : -1,
]);

/** Edges join vertices that differ in exactly one coordinate (one flipped bit). */
export const TESSERACT_EDGES: [number, number][] = (() => {
    const edges: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
        for (let k = 0; k < 4; k++) {
            const j = i ^ (1 << k);
            if (i < j) edges.push([i, j]);
        }
    }
    return edges;
})();

if (TESSERACT_VERTICES.length !== 16 || TESSERACT_EDGES.length !== 32) {
    throw new Error('Tesseract topology invalid');
}

/** Distance of the 4D viewpoint on the w axis. Rotated |w| ≤ 2, so d − w ≥ 2: no singularity. */
export const PROJECTION_DISTANCE = 4;
/** Fits the projected shape to the stage framing. */
export const TESSERACT_SCALE = 4.4;

const PLANES: [Plane, number, number][] = [
    ['xy', 0, 1],
    ['xz', 0, 2],
    ['xw', 0, 3],
    ['yz', 1, 2],
    ['yw', 1, 3],
    ['zw', 2, 3],
];

const identity = (): Mat4 => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

const mul = (a: Mat4, b: Mat4): Mat4 => {
    const out = new Array<number>(16).fill(0);
    for (let r = 0; r < 4; r++)
        for (let c = 0; c < 4; c++)
            for (let k = 0; k < 4; k++) out[r * 4 + c] += a[r * 4 + k] * b[k * 4 + c];
    return out;
};

/** Rotation by θ in the (i, j) coordinate plane; the other two coordinates are untouched. */
function planeRotation(i: number, j: number, theta: number): Mat4 {
    const m = identity();
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    m[i * 4 + i] = c;
    m[i * 4 + j] = -s;
    m[j * 4 + i] = s;
    m[j * 4 + j] = c;
    return m;
}

/** Composition of the requested plane rotations. */
export function rotationMatrix(angles: Angles): Mat4 {
    let m = identity();
    for (const [plane, i, j] of PLANES) {
        const theta = angles[plane];
        if (theta) m = mul(planeRotation(i, j, theta), m);
    }
    return m;
}

/**
 * Rotates the 16 vertices in 4D, then projects (x, y, z) / (d − w).
 * Writes xyz triples to `out` (48 floats) and the rotated w values to `wOut` (16 floats).
 */
export function projectTesseract(angles: Angles, out: Float32Array, wOut: Float32Array) {
    const m = rotationMatrix(angles);
    TESSERACT_VERTICES.forEach((v, i) => {
        const x = m[0] * v[0] + m[1] * v[1] + m[2] * v[2] + m[3] * v[3];
        const y = m[4] * v[0] + m[5] * v[1] + m[6] * v[2] + m[7] * v[3];
        const z = m[8] * v[0] + m[9] * v[1] + m[10] * v[2] + m[11] * v[3];
        const w = m[12] * v[0] + m[13] * v[1] + m[14] * v[2] + m[15] * v[3];
        const k = TESSERACT_SCALE / (PROJECTION_DISTANCE - w);
        out[i * 3] = x * k;
        out[i * 3 + 1] = y * k;
        out[i * 3 + 2] = z * k;
        wOut[i] = w;
    });
}

/** Slow rotation in XW, ZW and XY. t = 0 is the static (reduced-motion) pose. */
export const tesseractAngles = (t: number): Angles => ({
    xw: 0.45 + t * 0.2,
    zw: 0.3 + t * 0.13,
    xy: 0.35 + t * 0.05,
});

/** Edge indices ordered left to right in the static pose (used to pair network segments to edges). */
export function tesseractEdgeOrder(): number[] {
    const p = new Float32Array(48);
    const w = new Float32Array(16);
    projectTesseract(tesseractAngles(0), p, w);
    return TESSERACT_EDGES.map(([a, b], i) => ({
        i,
        x: p[a * 3] + p[b * 3],
        y: p[a * 3 + 1] + p[b * 3 + 1],
    }))
        .sort((s, t) => s.x - t.x || s.y - t.y)
        .map((s) => s.i);
}
