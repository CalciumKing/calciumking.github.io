import * as THREE from 'three';
import type { SceneHandle, SceneOptions } from '../../../hooks/useThreeScene';
import { clamp01, smooth } from '../../../lib/math';
import { createRenderer } from '../../../lib/three/createRenderer';

const WIDTH = 3.6;
const HEIGHT = 2.6;
const TAB_WIDTH = 1.3;
const TAB_HEIGHT = 0.35;
const TAB_SLANT = 0.25;
const THICKNESS = 0.05;

const COUNT = 6;
const GAP = 0.8;
const DRIFT_X = 0.35;
const DRIFT_Y = 0.25;
const LIFT = 3.2;

const PERIOD = 3;
const EPOCH = performance.now();

const NEAR = new THREE.Color(0xf2f2f2);
const FAR = new THREE.Color(0x4a4a4a);

function folderShape() {
	const l = -WIDTH / 2;
	const r = WIDTH / 2;
	const b = -(HEIGHT + TAB_HEIGHT) / 2;
	const t = b + HEIGHT;
	const s = new THREE.Shape();
	s.moveTo(l, b);
	s.lineTo(r, b);
	s.lineTo(r, t);
	s.lineTo(l + TAB_WIDTH + TAB_SLANT, t);
	s.lineTo(l + TAB_WIDTH, t + TAB_HEIGHT);
	s.lineTo(l, t + TAB_HEIGHT);
	s.closePath();
	return s;
}

export function createProjectsHeroScene(container: HTMLElement, { reducedMotion }: SceneOptions): SceneHandle {
	const { renderer, dispose: disposeRenderer } = createRenderer(container);
	
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
	
	const solid = new THREE.ExtrudeGeometry(folderShape(), { depth: THICKNESS, bevelEnabled: false });
	solid.translate(0, 0, -THICKNESS / 2);
	const edges = new THREE.EdgesGeometry(solid, 20);
	
	const fill = new THREE.MeshBasicMaterial({
		                                         color: 0x050505,
		                                         polygonOffset: true,
		                                         polygonOffsetFactor: 1,
		                                         polygonOffsetUnits: 1
	                                         });
	
	const stack = new THREE.Group();
	const folders: {
		group: THREE.Group;
		line: THREE.LineBasicMaterial
	}[] = [];
	for (let i = 0; i < COUNT; i++) {
		const line = new THREE.LineBasicMaterial({ color: NEAR });
		const group = new THREE.Group();
		group.add(new THREE.Mesh(solid, fill));
		group.add(new THREE.LineSegments(edges, line));
		stack.add(group);
		folders.push({ group, line });
	}
	
	const mid = (COUNT - 1) / 2;
	const frame = new THREE.Group();
	stack.position.set(-DRIFT_X * mid, -DRIFT_Y * mid, GAP * mid);
	frame.add(stack);
	frame.rotation.set(0.28, -0.62, 0);
	scene.add(frame);
	
	const applyPose = (time: number) => {
		const cycle = Math.floor(time / PERIOD);
		const u = (time / PERIOD) % 1;
		const up = smooth(clamp01(u / 0.25));
		const back = smooth(clamp01((u - 0.25) / 0.5));
		const down = smooth(clamp01((u - 0.75) / 0.25));
		folders.forEach(({ group, line }, f) => {
			const rank = (((f - cycle) % COUNT) + COUNT) % COUNT;
			const front = rank === 0;
			const slot = front ? back * (COUNT - 1) : rank - back;
			const lift = front ? (up - down) * LIFT : 0;
			group.position.set(slot * DRIFT_X, slot * DRIFT_Y + lift, -slot * GAP);
			line.color.copy(NEAR).lerp(FAR, slot / (COUNT - 1));
		});
	};
	
	const render = () => renderer.render(scene, camera);
	
	const fit = () => {
		const w = Math.max(container.clientWidth, 1);
		const h = Math.max(container.clientHeight, 1);
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		const base = 19;
		camera.position.set(0, 0, camera.aspect < 1 ? base / camera.aspect : base);
		camera.updateProjectionMatrix();
		render();
	};
	
	let raf = 0;
	let running = false;
	
	const tick = (now: number) => {
		applyPose((now - EPOCH) / 1000);
		render();
		raf = requestAnimationFrame(tick);
	};
	
	const start = () => {
		if (running)
			return;
		running = true;
		raf = requestAnimationFrame(tick);
	};
	
	const stop = () => {
		running = false;
		cancelAnimationFrame(raf);
	};
	
	applyPose(reducedMotion ? 0 : (performance.now() - EPOCH) / 1000);
	
	const resizeObserver = new ResizeObserver(fit);
	resizeObserver.observe(container);
	fit();
	
	let intersectionObserver: IntersectionObserver | null = null;
	if (!reducedMotion) {
		intersectionObserver = new IntersectionObserver((entries) => {
			if (entries[0]?.isIntersecting)
				start();
			else
				stop();
		});
		intersectionObserver.observe(container);
	}
	
	return {
		dispose() {
			stop();
			resizeObserver.disconnect();
			intersectionObserver?.disconnect();
			solid.dispose();
			edges.dispose();
			fill.dispose();
			folders.forEach(({ line }) => line.dispose());
			disposeRenderer();
		}
	};
}
