const canvas: HTMLCanvasElement = document.querySelector<HTMLCanvasElement>('canvas');
const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

const characters: string = 'abcdefghijklmnopqrstuvwxyz1234567890';
const fontSize: number = 16;

let columns: number;
let drops: number[];

function resize(): void {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	columns = Math.floor(canvas.width / fontSize);
	
	drops = [];
	
	for (let i = 0; i < columns; i++)
		drops[i] = Math.random() * -100;
}

function draw(): void {
	ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	ctx.font = `${fontSize}px space mono`;
	ctx.fillStyle = 'rgb(255, 255, 255, 0.4)';
	
	for (let i = 0; i < drops.length; i++) {
		const character = characters[Math.floor(Math.random() * characters.length)];
		const x: number = i * fontSize;
		const y: number = drops[i] * fontSize;
		
		ctx.fillText(character, x, y);
		
		if (y > canvas.height)
			drops[i] = 0;
		
		drops[i]++;
	}
}

(function (): void {
	resize();
	window.addEventListener('resize', resize);
	setInterval(draw, 50);
})();
