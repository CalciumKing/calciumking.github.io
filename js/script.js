const canvas = document.getElementById('network-bg');
const ctx = canvas.getContext('2d');

const isMobile = window.innerWidth < 768;
const nodeCount = isMobile ? 35 : 70;
const maxDistance = isMobile ? 150 : 200;

let nodes = [];
let animationId;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.style.width = '100%';
    canvas.style.height = '100%';
}

function initNodes() {
    nodes = [];
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * (isMobile ? 0.8 : 1.2),
            vy: (Math.random() - 0.5) * (isMobile ? 0.8 : 1.2)
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / maxDistance})`;
                ctx.lineWidth = isMobile ? 0.8 : 1;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
            }
        }
    }

    for (let node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width)
            node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height)
            node.vy *= -1;

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(node.x, node.y, isMobile ? 2 : 2.5, 0, Math.PI * 2);
        ctx.fill();
    }

    animationId = requestAnimationFrame(animate);
}

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resize();
        initNodes();
    }, 150);
});

resize();
initNodes();
animate();
