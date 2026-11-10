import * as THREE from 'three';
import type { SceneHandle } from '../../../hooks/useThreeScene';
import { MOBILE_MAX } from '../../../lib/layout';
import { createRenderer } from '../../../lib/three/createRenderer';
import { CONTACTS } from '../contactContent';
import { createRig } from './keyframes';
import { buildSystem } from './parts';

export type ContactSceneOptions = {
	reducedMotion: boolean;
	progress: { current: number };
	shifts: { x: number; y: number }[];
};

const MOBILE_SHIFT_Y = -0.2;

export function createContactScene(container: HTMLElement, options: ContactSceneOptions): SceneHandle {
	const { reducedMotion, progress, shifts } = options;
	
	const { renderer, dispose: disposeRenderer } = createRenderer(container);
	
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 1000);
	const system = buildSystem(CONTACTS.map((c) => c.body));
	scene.add(system.root);
	
	const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
	const rig = createRig(system, shifts, tanHalf);
	
	let w = 1;
	let h = 1;
	let compact = false;
	const resize = () => {
		w = Math.max(1, container.clientWidth);
		h = Math.max(1, container.clientHeight);
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		compact = w <= MOBILE_MAX;
		rig.resize(camera.aspect, compact);
	};
	
	let last = performance.now();
	let clock = 0;
	
	const render = (now: number) => {
		const dt = Math.min(0.1, (now - last) / 1000);
		last = now;
		if (!reducedMotion)
			clock += dt;
		
		system.setClock(clock);
		system.root.updateMatrixWorld(true);
		
		const s = rig.sample(progress.current);
		camera.position.copy(s.pos);
		camera.lookAt(s.target);
		const sx = compact ? 0 : s.shiftX;
		const sy = compact ? MOBILE_SHIFT_Y : s.shiftY;
		camera.setViewOffset(w, h, -sx * w, sy * h, w, h);
		
		renderer.render(scene, camera);
	};
	
	let raf = 0;
	let visible = true;
	const tick = (now: number) => {
		raf = 0;
		if (!visible)
			return;
		render(now);
		raf = requestAnimationFrame(tick);
	};
	
	const ro = new ResizeObserver(() => {
		resize();
		if (reducedMotion)
			render(performance.now());
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
	
	if (reducedMotion)
		render(performance.now());
	else
		raf = requestAnimationFrame(tick);
	
	return {
		dispose: () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			io.disconnect();
			system.dispose();
			disposeRenderer();
		}
	};
}
