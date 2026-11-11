import * as THREE from 'three';
import type { SceneHandle } from '../../../hooks/useThreeScene';
import { MOBILE_MAX } from '../../../lib/layout';
import { clamp01, TAU } from '../../../lib/math';
import { createRenderer } from '../../../lib/three/createRenderer';
import { createRig, type SceneStop } from './keyframes';
import { buildTree } from './tree';

export type ResumeSceneOptions = {
	reducedMotion: boolean;
	progress: {
		current: number
	};
	stops: SceneStop[];
	stages: number;
	inline?: boolean;
};

const MOBILE_SHIFT_Y = -0.2;
const SPIN = 0.12;

export function createResumeScene(container: HTMLElement, options: ResumeSceneOptions): SceneHandle {
	const { reducedMotion, progress, stops, stages, inline = false } = options;
	
	const { renderer, dispose: disposeRenderer } = createRenderer(container);
	
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 1000);
	const tree = buildTree({
		                       stages,
		                       compact: (container.clientWidth || window.innerWidth) <= MOBILE_MAX
	                       });
	scene.add(tree.ground, tree.root);
	
	const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
	const rig = createRig(tree, stops, tanHalf);
	
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
	let spin = 0;
	
	const render = (now: number) => {
		const dt = Math.min(0.1, (now - last) / 1000);
		last = now;
		
		const s = rig.sample(progress.current);
		tree.setGrowth(s.g);
		
		if (!reducedMotion) {
			const fin = clamp01(s.g - tree.stages);
			if (fin >= 0.98)
				spin += dt * SPIN;
			else
				spin += (Math.round(spin / TAU) * TAU - spin) * (1 - Math.exp(-dt * 3));
		}
		tree.root.rotation.y = spin;
		
		camera.position.copy(s.pos);
		camera.lookAt(s.target);
		const sx = inline || compact ? 0 : s.shiftX;
		const sy = inline ? 0 : compact ? MOBILE_SHIFT_Y : s.shiftY;
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
			tree.dispose();
			disposeRenderer();
		}
	};
}
