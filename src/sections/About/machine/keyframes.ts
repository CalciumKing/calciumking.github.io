/** One full machine + camera state. Everything the scene needs is sampled from this at a scroll progress. */
export type Pose = {
    panel: number; // 0..1 shell panels fly out radially
    explode: number; // 0..1 stack stretches along x
    open: number; // 0..1 stack stretches further, exposing the core
    twist: number; // rad, twisting parts rotate about the axis
    shellOp: number; // panel opacity (outline ghosting below ~0.5)
    spin: number; // 1 = idle auto-rotation (hero), 0 = fixed yaw
    az: number; // camera azimuth (rad)
    el: number; // camera elevation (rad)
    extH: number; // half-width the framing must fit
    extV: number; // half-height the framing must fit
    tx: number;
    ty: number;
    tz: number;
    shiftX: number; // desktop: machine offset as a fraction of viewport width (+ = right)
    shiftY: number; // desktop: fraction of viewport height (+ = up)
};

const BASE: Pose = {
    panel: 0, explode: 0, open: 0, twist: 0, shellOp: 1, spin: 0,
    az: 0.6, el: 0.35, extH: 3.8, extV: 2.3, tx: 0, ty: 0, tz: 0, shiftX: 0, shiftY: 0,
};

const IDENTITY: Pose = { ...BASE, spin: 1, shiftX: 0.22 };
const APPROACH: Pose = {
    ...BASE, panel: 1, explode: 0.35, twist: 0.9, shellOp: 0.9,
    az: 1.0, el: 0.5, extH: 5.0, extV: 3.6, shiftX: -0.2,
};
const FOUNDATION: Pose = {
    ...BASE, panel: 1, explode: 1, twist: 1.2, shellOp: 0.4,
    az: 0.15, el: 1.2, extH: 5.4, extV: 3.8, tx: 0.2, shiftX: 0.2,
};
const DIRECTION: Pose = {
    ...BASE, panel: 1, explode: 1, open: 1, twist: 1.8, shellOp: 0.06,
    az: -0.6, el: 0.3, extH: 6.6, extV: 3.4, tx: 0.2, shiftX: -0.2,
};
const CONCLUSION: Pose = {
    ...BASE, twist: 0, shellOp: 0.25, az: 0.5, el: 0.3, extH: 3.8, extV: 2.4, shiftY: 0.12,
};

/** Pose stops by scroll progress. Pairs of equal poses are the "hold" zones around each phase. */
const STOPS: { at: number; pose: Pose }[] = [
    { at: 0, pose: IDENTITY },
    { at: 0.08, pose: IDENTITY },
    { at: 0.23, pose: APPROACH },
    { at: 0.31, pose: APPROACH },
    { at: 0.48, pose: FOUNDATION },
    { at: 0.56, pose: FOUNDATION },
    { at: 0.66, pose: DIRECTION },
    { at: 0.74, pose: DIRECTION },
    { at: 0.84, pose: CONCLUSION },
    { at: 0.9, pose: CONCLUSION },
    { at: 1, pose: IDENTITY },
];

const KEYS = Object.keys(BASE) as (keyof Pose)[];
const smooth = (t: number) => t * t * (3 - 2 * t);

export function samplePose(p: number): Pose {
    if (p <= STOPS[0].at) return STOPS[0].pose;
    for (let i = 1; i < STOPS.length; i++) {
        if (p <= STOPS[i].at) {
            const a = STOPS[i - 1];
            const b = STOPS[i];
            const t = smooth((p - a.at) / (b.at - a.at));
            const out = { ...a.pose };
            for (const k of KEYS) out[k] = a.pose[k] + (b.pose[k] - a.pose[k]) * t;
            return out;
        }
    }
    return STOPS[STOPS.length - 1].pose;
}
