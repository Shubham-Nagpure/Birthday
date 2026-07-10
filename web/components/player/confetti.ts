/** Lightweight canvas confetti burst — used by the finale and the ask "yes". */
export function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = ["#E62D87", "#FFC93C", "#6C5CE7", "#00B894", "#FF7675"];
  const ps = Array.from({ length: 140 }, (_, k) => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    r: 4 + Math.random() * 6,
    c: colors[k % colors.length],
    vy: 2 + Math.random() * 3,
    vx: -1 + Math.random() * 2,
    a: Math.random() * 6,
  }));
  let t = 0;
  const loop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of ps) {
      p.y += p.vy; p.x += p.vx; p.a += 0.1;
      if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
      ctx.restore();
    }
    t++;
    if (t < 600) requestAnimationFrame(loop);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  loop();
}
