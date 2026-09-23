const canvas: HTMLCanvasElement = document.querySelector<HTMLCanvasElement>('#network-bg');
const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

const IS_MOBILE: boolean = window.innerWidth < 768;
const NODE_COUNT: number = IS_MOBILE ? 35 : 70;
const MAX_DISTANCE: number = IS_MOBILE ? 150 : 200;
const NODE_RADIUS: number = IS_MOBILE ? 2 : 2.5;
const BASE_SPEED: number = IS_MOBILE ? 0.8 : 1.2;

type UINode = {
	x: number;
	y: number;
	vx: number;
	vy: number;
}

let nodes: UINode[];
let animationId: ReturnType<typeof requestAnimationFrame>;
let canvasW: number;
let canvasH: number;


function resize(): void {
	canvasW = canvas.width = window.innerWidth;
	canvasH = canvas.height = window.innerHeight;
	
	canvas.style.width = '100%';
	canvas.style.height = '100%';
}

function initNodes(): void {
	nodes = [];
	for (let i = 0; i < NODE_COUNT; i++) {
		nodes.push({
					   x: Math.random() * canvasW,
					   y: Math.random() * canvasH,
					   vx: (Math.random() - 0.5) * BASE_SPEED,
					   vy: (Math.random() - 0.5) * BASE_SPEED
				   });
	}
}

function animate(): void {
	ctx.clearRect(0, 0, canvasW, canvasH);
	
	for (let i = 0; i < NODE_COUNT; i++) {
		const ni: UINode = nodes[i];
		for (let j = i + 1; j < NODE_COUNT; j++) {
			const nj: UINode   = nodes[j],
			      dx: number   = ni.x - nj.x,
			      dy: number   = ni.y - nj.y,
			      dist: number = Math.sqrt(dx * dx + dy * dy);
			
			if (dist < MAX_DISTANCE) {
				const alpha: number = 1 - dist / MAX_DISTANCE;
				ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
				ctx.lineWidth = IS_MOBILE ? 0.8 : 1;
				ctx.beginPath();
				ctx.moveTo(ni.x, ni.y);
				ctx.lineTo(nj.x, nj.y);
				ctx.stroke();
			}
		}
	}
	
	ctx.fillStyle = 'white';
	for (const node of nodes) {
		node.x += node.vx;
		node.y += node.vy;
		
		if (node.x < 0 || node.x > canvasW)
			node.vx *= -1;
		if (node.y < 0 || node.y > canvasH)
			node.vy *= -1;
		
		ctx.beginPath();
		ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
		ctx.fill();
	}
	
	animationId = requestAnimationFrame(animate);
}

(function (): void {
	let resizeTimeout: ReturnType<typeof setTimeout>;
	window.addEventListener('resize', (): void => {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout((): void => {
			resize();
			initNodes();
		}, 150);
	});
	
	resize();
	initNodes();
	animate();
})();
