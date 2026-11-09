import { clamp01 } from '../../../lib/math';

type Pt = [number, number];
type TreeLine = { a: Pt; b: Pt; len: number };

/**
 * Reads the DOM tree's [data-tree-line] elements, converts them to group-local coordinates,
 * and deals the segments (in `treeOrder`) along them, writing into `toTree`.
 * Returns false if the tree can't be measured yet.
 */
export function layoutTree(
    container: HTMLElement,
    root: HTMLElement | null | undefined,
    visW: number,
    visH: number,
    scale: number,
    treeOrder: number[],
    toTree: Float32Array,
): boolean {
    const box = container.getBoundingClientRect();
    if (!root || box.width < 1 || box.height < 1) return false;

    const toWorld = (x: number, y: number): Pt => [
        (((x - box.left) / box.width - 0.5) * visW) / scale,
        ((0.5 - (y - box.top) / box.height) * visH) / scale,
    ];

    const lines: TreeLine[] = [];
    root.querySelectorAll<HTMLElement>('[data-tree-line]').forEach((el) => {
        const r = el.getBoundingClientRect();
        const vertical = el.dataset.treeLine === 'v';
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const a = toWorld(vertical ? cx : r.left, vertical ? r.top : cy);
        const b = toWorld(vertical ? cx : r.right, vertical ? r.bottom : cy);
        lines.push({ a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]) });
    });
    const total = lines.reduce((sum, l) => sum + l.len, 0);
    if (total <= 0) return false;

    const count = treeOrder.length;
    let start = 0; // length of all lines before line k
    let k = 0;
    treeOrder.forEach((i, r) => {
        const u0 = (r / count) * total;
        const u1 = ((r + 1) / count) * total;
        const um = (u0 + u1) / 2;
        while (k < lines.length - 1 && um >= start + lines[k].len) {
            start += lines[k].len;
            k++;
        }
        const l = lines[k];
        const s0 = l.len > 0 ? clamp01((u0 - start) / l.len) : 0;
        const s1 = l.len > 0 ? clamp01((u1 - start) / l.len) : 0;
        const o = i * 6;
        toTree[o] = l.a[0] + (l.b[0] - l.a[0]) * s0;
        toTree[o + 1] = l.a[1] + (l.b[1] - l.a[1]) * s0;
        toTree[o + 2] = 0;
        toTree[o + 3] = l.a[0] + (l.b[0] - l.a[0]) * s1;
        toTree[o + 4] = l.a[1] + (l.b[1] - l.a[1]) * s1;
        toTree[o + 5] = 0;
    });
    return true;
}
