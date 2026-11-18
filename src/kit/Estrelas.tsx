import { useEffect, useRef } from 'react';

/* Fundo da página: pontinhos amarelos que piscam e se ligam como constelação
   (a mesma ideia da home da Prompta, na cor do Vô Prompo). Reage ao mouse. */
type Ponto = { x: number; y: number; vx: number; vy: number; r: number; f: number; laranja: boolean };

export default function Estrelas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const parado = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };
    let w = 0;
    let h = 0;
    let pts: Ponto[] = [];
    let raf = 0;

    const montar = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(150, Math.max(45, (w * h) / 9000)));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.5 + 0.5,
        f: Math.random() * Math.PI * 2,
        laranja: Math.random() < 0.18,
      }));
    };

    const desenhar = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const desvio = (window.scrollY * 0.06) % h;

      for (const p of pts) {
        if (!parado) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10;
          if (p.y > h + 10) p.y = -10;
        }
      }

      const yOf = (p: Ponto) => {
        let y = p.y - desvio;
        if (y < -10) y += h + 20;
        return y;
      };

      // linhas de constelação
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const ay = yOf(a);
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const by = yOf(b);
          const dx = a.x - b.x;
          const dy = ay - by;
          const d2 = dx * dx + dy * dy;
          if (d2 > 110 * 110) continue;
          const mx = (a.x + b.x) / 2 - mouse.x;
          const my = (ay + by) / 2 - mouse.y;
          const perto = Math.max(0, 1 - Math.sqrt(mx * mx + my * my) / 200);
          const alfa = (1 - Math.sqrt(d2) / 110) * (0.07 + perto * 0.45);
          if (alfa < 0.01) continue;
          ctx.strokeStyle = `rgba(255, 194, 42, ${alfa.toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, ay);
          ctx.lineTo(b.x, by);
          ctx.stroke();
        }
      }

      // pontos
      for (const p of pts) {
        const y = yOf(p);
        const pisca = parado ? 0.8 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.0016 + p.f));
        const mx = p.x - mouse.x;
        const my = y - mouse.y;
        const perto = Math.max(0, 1 - Math.sqrt(mx * mx + my * my) / 160);
        const cor = p.laranja ? '255, 140, 40' : '255, 205, 70';
        ctx.fillStyle = `rgba(${cor}, ${(0.12 * pisca + perto * 0.2).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, y, p.r * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${cor}, ${Math.min(1, pisca + perto).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (t: number) => {
      desenhar(t);
      raf = requestAnimationFrame(loop);
    };

    const mover = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const sair = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    montar();
    if (parado) {
      desenhar(0);
    } else {
      raf = requestAnimationFrame(loop);
    }
    window.addEventListener('resize', montar);
    window.addEventListener('pointermove', mover, { passive: true });
    document.addEventListener('pointerleave', sair);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', montar);
      window.removeEventListener('pointermove', mover);
      document.removeEventListener('pointerleave', sair);
    };
  }, []);

  return (
    <>
      <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />
      <div aria-hidden="true" className="planta pointer-events-none fixed inset-0 -z-10" />
    </>
  );
}
