import * as THREE from 'three';

export function createRenderer(container: HTMLElement) {
	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.setClearColor(0x000000, 0);
	const canvas = renderer.domElement;
	canvas.style.display = 'block';
	canvas.style.width = '100%';
	canvas.style.height = '100%';
	container.appendChild(canvas);
	const dispose = () => {
		renderer.dispose();
		renderer.forceContextLoss();
		canvas.remove();
	};
	return { renderer, dispose };
}
