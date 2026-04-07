import { useEffect, useRef } from "react";

export default function Confetti({ active, color1 = "#EF4444", color2 = "#EAB308" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [color1, color2, "#3B82F6", "#10B981", "#F59E0B", "#EC4899"];
    const particles = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 300,
        y: canvas.height / 2 - 100,
        vx: (Math.random() - 0.5) * 15,
        vy: Math.random() * -12 - 3,
        w: Math.random() * 10 + 4,
        h: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        opacity: 1,
      });
    }

    let animId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        if (p.opacity <= 0) return;
        alive = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.vx *= 0.99;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height) p.opacity -= 0.02;
        if (p.opacity < 0) p.opacity = 0;
      });

      if (alive) animId = requestAnimationFrame(draw);
    }
    draw();

    return () => cancelAnimationFrame(animId);
  }, [active, color1, color2]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}
