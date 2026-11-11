import * as THREE from 'three';
import type { SceneHandle, SceneOptions } from '../../hooks/useThreeScene';
import { smooth } from '../../lib/math';
import { createRenderer } from '../../lib/three/createRenderer';
import { buildCarnotaurus } from './carnotaurusGeometry';

const FOV = 30;
const FRAME = { cx: 1.2, cy: -0.5, w: 10.4, h: 6.2 };

const YAW_MIN = -0.4;
const YAW_MAX = 1.1;
const PITCH_LIMIT = 0.5;
const REST_YAW = -0.3;
const REST_PITCH = 0.08;
const PLANE = 3;

const NECK_YAW = 0.1;
const NECK_PITCH = 0.08;
const SKULL_YAW = 0.5;
const SKULL_PITCH = 0.6;
const NECK_RATE = [1.4, 1.8, 2.2, 2.7, 3.2];
const SKULL_RATE = 4.5;
const WANDER_AFTER = 3000;
const MOUTH_OPEN = 0.3;
const MOUTH_NEAR = 0.3;
const MOUTH_FAR = 1.1;
const MOUTH_RATE = 5;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function createCarnotaurusScene(container: HTMLElement, { reducedMotion }: SceneOptions): SceneHandle {
	const { renderer, dispose: disposeRenderer } = createRenderer(container);
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
	const rig = buildCarnotaurus();
	scene.add(rig.root);
	
	const joints = rig.neck.length + 1;
	const yaw: number[] = new Array(joints).fill(0);
	const pitch: number[] = new Array(joints).fill(0);
	
	const ndc = new THREE.Vector2();
	const tmpS = new THREE.Vector3();
	const tmpP = new THREE.Vector3();
	const tmpD = new THREE.Vector3();
	const rootInv = new THREE.Quaternion();
	let pointerSeen = false;
	let lastInput = 0;
	let touch = window.matchMedia('(hover: none)').matches;
	let targetYaw = REST_YAW;
	let targetPitch = REST_PITCH;
	const tmpM = new THREE.Vector3();
	let mouth = 0;
	let mouthTarget = 0;
	
	const render = () => renderer.render(scene, camera);
	
	const computeTarget = (time: number) => {
		mouthTarget = 0;
		if (touch && !reducedMotion && (!pointerSeen || time * 1000 - lastInput > WANDER_AFTER)) {
			targetYaw = 0.35 + 0.3 * Math.sin(time * 0.4);
			targetPitch = 0.12 * Math.sin(time * 0.3);
			return;
		}
		if (!pointerSeen) {
			targetYaw = REST_YAW;
			targetPitch = REST_PITCH;
			return;
		}
		scene.updateMatrixWorld();
		rig.skull.getWorldPosition(tmpS);
		tmpM.set(-2, 0, 0);
		rig.skull.localToWorld(tmpM);
		tmpM.project(camera);
		const near = Math.hypot((ndc.x - tmpM.x) * camera.aspect, ndc.y - tmpM.y);
		mouthTarget = 1 - smooth((near - MOUTH_NEAR) / (MOUTH_FAR - MOUTH_NEAR));
		tmpP.set(ndc.x, ndc.y, 0.5).unproject(camera).sub(camera.position).normalize();
		const t = (tmpS.z + PLANE - camera.position.z) / tmpP.z;
		tmpP.multiplyScalar(t).add(camera.position);
		tmpD.copy(tmpP).sub(tmpS).applyQuaternion(rootInv.copy(rig.root.quaternion).invert());
		targetYaw = clamp(Math.atan2(tmpD.z, -tmpD.x), YAW_MIN, YAW_MAX);
		targetPitch = clamp(Math.atan2(tmpD.y, Math.hypot(tmpD.x, tmpD.z)), -PITCH_LIMIT, PITCH_LIMIT);
	};
	
	const applyPose = (dt: number, time: number) => {
		computeTarget(time);
		const idle = reducedMotion ? 0 : 1;
		for (let i = 0; i < joints; i++) {
			const isSkull = i === joints - 1;
			const yawGoal = targetYaw * (isSkull ? SKULL_YAW : NECK_YAW);
			const pitchGoal = targetPitch * (isSkull ? SKULL_PITCH : NECK_PITCH) + idle * 0.015 * Math.sin(time * 0.7
			                  + i * 0.6);
			const k = reducedMotion ? 1 : 1 - Math.exp(-dt * (isSkull ? SKULL_RATE : NECK_RATE[i]));
			yaw[i] += (yawGoal - yaw[i]) * k;
			pitch[i] += (pitchGoal - pitch[i]) * k;
			const joint = isSkull ? rig.skull : rig.neck[i];
			joint.rotation.y = yaw[i];
			joint.rotation.z = (isSkull ? rig.skullRest : rig.neckRest[i]) - pitch[i];
		}
		mouth += (mouthTarget - mouth) * (reducedMotion ? 1 : 1 - Math.exp(-dt * MOUTH_RATE));
		rig.jaw.rotation.z = rig.jawRest + idle * (0.025 + 0.02 * Math.sin(time * 0.5)) + mouth * MOUTH_OPEN;
		rig.ribs.scale.y = 1 + idle * 0.012 * Math.sin(time * 1.1);
	};
	
	const fit = () => {
		const w = Math.max(container.clientWidth, 1);
		const h = Math.max(container.clientHeight, 1);
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
		const dist = Math.max(FRAME.h / 2, FRAME.w / 2 / camera.aspect) / tan;
		camera.position.set(FRAME.cx, FRAME.cy + dist * 0.18, dist);
		camera.lookAt(FRAME.cx, FRAME.cy, 0);
		camera.updateProjectionMatrix();
		camera.updateMatrixWorld();
		render();
	};
	
	const onPointer = (e: PointerEvent) => {
		const r = container.getBoundingClientRect();
		if (r.width === 0 || r.height === 0)
			return;
		ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
		pointerSeen = true;
		touch = e.pointerType === 'touch';
		lastInput = performance.now();
		if (reducedMotion) {
			applyPose(1, 0);
			render();
		}
	};
	
	let raf = 0;
	let running = false;
	let last = 0;
	
	const tick = (now: number) => {
		const dt = Math.min((now - last) / 1000, 0.1);
		last = now;
		applyPose(dt, now / 1000);
		render();
		raf = requestAnimationFrame(tick);
	};
	const start = () => {
		if (running)
			return;
		running = true;
		last = performance.now();
		raf = requestAnimationFrame(tick);
	};
	const stop = () => {
		running = false;
		cancelAnimationFrame(raf);
	};
	
	const resizeObserver = new ResizeObserver(fit);
	resizeObserver.observe(container);
	fit();
	applyPose(10, 0);
	render();
	
	window.addEventListener('pointermove', onPointer, { passive: true });
	window.addEventListener('pointerdown', onPointer, { passive: true });
	
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
			window.removeEventListener('pointermove', onPointer);
			window.removeEventListener('pointerdown', onPointer);
			resizeObserver.disconnect();
			intersectionObserver?.disconnect();
			rig.dispose();
			disposeRenderer();
		}
	};
}
