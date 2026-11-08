var canvas = document.querySelector('#network-bg');
var ctx = canvas.getContext('2d');
var IS_MOBILE = window.innerWidth < 768;
var NODE_COUNT = IS_MOBILE ? 35 : 70;
var MAX_DISTANCE = IS_MOBILE ? 150 : 200;
var NODE_RADIUS = IS_MOBILE ? 2 : 2.5;
var BASE_SPEED = IS_MOBILE ? 0.8 : 1.2;
var nodes;
var animationId;
var canvasW;
var canvasH;
function resize() {
    canvasW = canvas.width = window.innerWidth;
    canvasH = canvas.height = window.innerHeight;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
}
function initNodes() {
    nodes = [];
    for (var i = 0; i < NODE_COUNT; i++) {
        nodes.push({
            x: Math.random() * canvasW,
            y: Math.random() * canvasH,
            vx: (Math.random() - 0.5) * BASE_SPEED,
            vy: (Math.random() - 0.5) * BASE_SPEED
        });
    }
}
function animate() {
    ctx.clearRect(0, 0, canvasW, canvasH);
    for (var i = 0; i < NODE_COUNT; i++) {
        var ni = nodes[i];
        for (var j = i + 1; j < NODE_COUNT; j++) {
            var nj = nodes[j], dx = ni.x - nj.x, dy = ni.y - nj.y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MAX_DISTANCE) {
                var alpha = 1 - dist / MAX_DISTANCE;
                ctx.strokeStyle = "rgba(255, 255, 255, ".concat(alpha.toFixed(3), ")");
                ctx.lineWidth = IS_MOBILE ? 0.8 : 1;
                ctx.beginPath();
                ctx.moveTo(ni.x, ni.y);
                ctx.lineTo(nj.x, nj.y);
                ctx.stroke();
            }
        }
    }
    ctx.fillStyle = 'white';
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var node = nodes_1[_i];
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
(function () {
    var resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            resize();
            initNodes();
        }, 150);
    });
    resize();
    initNodes();
    animate();
})();
