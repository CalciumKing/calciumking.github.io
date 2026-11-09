import * as THREE from 'three';
import type { SceneHandle } from '../../../hooks/useThreeScene';
import { buildMachine } from './parts';
import { samplePose } from './keyframes';
import {MOBILE_MAX} from "../../../lib/layout";
import {TAU} from "../../../lib/math";
import {createRenderer} from "../../../lib/three/createRenderer";

export type MachineSceneOptions = {
    reducedMotion: boolean;
    progress: { current: number };
};

const SPIN_RATE = 0.12; // rad/s, hero idle rotation
const MOBILE_SHIFT_Y = -0.2; // machine sits in the lower part of the screen on mobile
const PANEL_TRAVEL = 3.2;
const IDLE_RATE = 0.4; // rad/s, part twist while running

export function createMachineScene(container: HTMLElement, options: MachineSceneOptions): SceneHandle {
    const { reducedMotion, progress } = options;

    const { renderer, dispose: disposeRenderer } = createRenderer(container);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
    const machine = buildMachine();
    scene.add(machine.root);

    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

    let w = 1;
    let h = 1;
    let compact = false;
    const resize = () => {
        w = Math.max(1, container.clientWidth);
        h = Math.max(1, container.clientHeight);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        compact = w <= MOBILE_MAX;
    };

    let spin = reducedMotion ? 0.5 : 0;
    let lockTarget: number | null = null;
    let last = performance.now();
    let clock = 0;

    const render = (now: number) => {
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        const pose = samplePose(progress.current);

        if (!reducedMotion) clock += dt;

        // Hero idle spin: when leaving the hero, ease to the nearest full turn so later poses start aligned.
        let yaw: number;
        if (reducedMotion) {
            yaw = spin * pose.spin;
        } else if (pose.spin >= 0.999) {
            lockTarget = null;
            spin += dt * SPIN_RATE;
            yaw = spin;
        } else {
            if (lockTarget === null) {
                // Rest at the nearest multiple of a full turn: at most half a turn of easing.
                spin = ((spin % TAU) + TAU) % TAU;
                lockTarget = spin > Math.PI ? TAU : 0;
            }
            yaw = spin * pose.spin + lockTarget * (1 - pose.spin);
            // Fully settled: start the next hero spin from the rest angle, so returning adds no extra rotation.
            if (pose.spin < 0.001) spin = lockTarget;
        }

        machine.root.rotation.y = yaw;

        const stretch = 1 + 0.55 * pose.explode + 0.45 * pose.open;
        machine.stack.forEach(({ g, x }) => (g.position.x = x * stretch));
        machine.spinners.forEach(({ g, k }) => (g.rotation.x = k * (pose.twist + clock * IDLE_RATE)));
        machine.spindle.scale.x = stretch;
        machine.panels.forEach(({ g, dy, dz, k }) => {
            const d = pose.panel * PANEL_TRAVEL * k;
            g.position.set(0, dy * d, dz * d);
        });
        machine.setShellOpacity(pose.shellOp);

        // Camera: distance is derived from the framing extents and how much of the screen the machine may use.
        const fracW = compact ? 0.92 : 0.55;
        const fracH = compact ? 0.45 : 0.75;
        const dist = Math.max(pose.extH / (tanHalf * camera.aspect * fracW), pose.extV / (tanHalf * fracH));
        camera.position.set(
            pose.tx + dist * Math.cos(pose.el) * Math.sin(pose.az),
            pose.ty + dist * Math.sin(pose.el),
            pose.tz + dist * Math.cos(pose.el) * Math.cos(pose.az),
        );
        camera.lookAt(pose.tx, pose.ty, pose.tz);
        const sx = compact ? 0 : pose.shiftX;
        const sy = compact ? MOBILE_SHIFT_Y : pose.shiftY;
        camera.setViewOffset(w, h, -sx * w, sy * h, w, h);

        renderer.render(scene, camera);
    };

    let raf = 0;
    let visible = true;
    const tick = (now: number) => {
        raf = 0;
        if (!visible) return;
        render(now);
        raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(() => {
        resize();
        if (reducedMotion) render(performance.now());
    });
    ro.observe(container);
    resize();

    const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf && !reducedMotion) {
            last = performance.now();
            raf = requestAnimationFrame(tick);
        }
    });
    io.observe(container);

    if (reducedMotion) render(performance.now());
    else raf = requestAnimationFrame(tick);

    return {
        dispose: () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
            machine.dispose();
            disposeRenderer()
        },
    };
}
