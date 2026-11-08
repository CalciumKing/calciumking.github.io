import * as THREE from 'three';
import type { SceneHandle, SceneOptions } from '../../hooks/useThreeScene';

// Strip geometry
const RADIUS = 2.2; // R: center-circle radius
const HALF_WIDTH = 0.9; // w: v ∈ [-w, w]
const LONG_DIVISIONS = 4; // longitudinal lines at v = ±w·k/K (k = 0..K) → 2K+1 lines
const TRANSVERSE_COUNT = 48; // transverse lines around the loop
const SAMPLES = 240; // segments per 2π along longitudinal lines

// Colors mirror tokens.css (--color-line, --color-line-strong, --color-text)
export const COLOR_TRANSVERSE = 0x777777;
export const COLOR_LONGITUDINAL = 0xd9d9d9;
export const COLOR_VERTEX = 0xf2f2f2;

export const STATIC_TIME = 6; // fixed pose (seconds) for reduced motion

function pushPoint(out: number[], u: number, v: number) {
    const r = RADIUS + v * Math.cos(u / 2);
    out.push(r * Math.cos(u), r * Math.sin(u), v * Math.sin(u / 2));
}

/**
 * Seam handling: (u + 2π, v) maps to the same point as (u, −v).
 * A constant-v curve therefore closes only after u = 4π, and it traces both
 * the +v and −v lines. Each k > 0 emits one 4π loop (covering ±v); k = 0 emits
 * a single 2π loop. Transverse lines use u ∈ [0, 2π) so none is doubled.
 */
export function buildGeometry() {
    const longitudinal: number[] = [];
    const step = (Math.PI * 2) / SAMPLES;

    for (let k = 0; k <= LONG_DIVISIONS; k++) {
        const v = (HALF_WIDTH * k) / LONG_DIVISIONS;
        const total = k === 0 ? SAMPLES : SAMPLES * 2;
        for (let i = 0; i < total; i++) {
            pushPoint(longitudinal, i * step, v);
            pushPoint(longitudinal, (i + 1) * step, v);
        }
    }

    const transverse: number[] = [];
    for (let i = 0; i < TRANSVERSE_COUNT; i++) {
        const u = (i * Math.PI * 2) / TRANSVERSE_COUNT;
        pushPoint(transverse, u, -HALF_WIDTH);
        pushPoint(transverse, u, HALF_WIDTH);
    }

    const vertices: number[] = [];
    for (let i = 0; i < TRANSVERSE_COUNT; i++) {
        const u = (i * Math.PI * 2) / TRANSVERSE_COUNT;
        for (let k = -LONG_DIVISIONS; k <= LONG_DIVISIONS; k++) {
            pushPoint(vertices, u, (HALF_WIDTH * k) / LONG_DIVISIONS);
        }
    }

    const make = (data: number[]) => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(data, 3));
        return g;
    };

    return { longitudinal: make(longitudinal), transverse: make(transverse), vertices: make(vertices) };
}

export function createMobiusScene(
    container: HTMLElement,
    { reducedMotion }: SceneOptions,
): SceneHandle {
    // Throws if WebGL is unavailable; useThreeScene catches it and shows the fallback.
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);

    const geometry = buildGeometry();
    const materials = {
        longitudinal: new THREE.LineBasicMaterial({ color: COLOR_LONGITUDINAL, transparent: true, opacity: 0.9 }),
        transverse: new THREE.LineBasicMaterial({ color: COLOR_TRANSVERSE, transparent: true, opacity: 0.8 }),
        vertices: new THREE.PointsMaterial({ color: COLOR_VERTEX, size: 2.5, sizeAttenuation: false }),
    };

    const group = new THREE.Group();
    group.add(new THREE.LineSegments(geometry.transverse, materials.transverse));
    group.add(new THREE.LineSegments(geometry.longitudinal, materials.longitudinal));
    group.add(new THREE.Points(geometry.vertices, materials.vertices));
    scene.add(group);

    const applyPose = (t: number) => {
        group.rotation.x = 1.0 + 0.2 * Math.sin(t * 0.11);
        group.rotation.y = t * 0.14;
        group.rotation.z = 0.25 * Math.sin(t * 0.07);
    };

    const render = () => renderer.render(scene, camera);

    const fit = () => {
        const w = Math.max(container.clientWidth, 1);
        const h = Math.max(container.clientHeight, 1);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Keep the strip fully in frame on narrow (portrait) containers.
        const base = 13;
        camera.position.set(0, 0, camera.aspect < 1 ? base / camera.aspect : base);
        camera.updateProjectionMatrix();
        render();
    };

    let time = STATIC_TIME;
    let last = 0;
    let raf = 0;
    let running = false;

    const frame = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        time += dt;
        applyPose(time);
        render();
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

    applyPose(time);

    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(container);
    fit();

    // Animate only while visible; reduced motion renders static frames only.
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
            stop();
            resizeObserver.disconnect();
            intersectionObserver?.disconnect();
            geometry.longitudinal.dispose();
            geometry.transverse.dispose();
            geometry.vertices.dispose();
            materials.longitudinal.dispose();
            materials.transverse.dispose();
            materials.vertices.dispose();
            renderer.dispose();
            renderer.forceContextLoss();
            canvas.remove();
        },
    };
}
