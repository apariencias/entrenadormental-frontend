/**
 * flow-field.js — Entrenador Mental / La Calma de Mamá
 * Breathing Gold Flow Field — v2 (evolved)
 *
 * Filosofía de diseño somático:
 *  - ~560 partículas (vs 3 000 original) — densidad intencional, no ruido
 *  - Velocidad global oscila en ciclo de 8 s (0.785 rad/s) — inhala / exhala
 *  - Profundidad Z simulada: near = brillante + rápida, far = tenue + lenta
 *  - Ruido por octavas de seno: movimiento orgánico sin libraries externas
 *  - Retina-ready: usa devicePixelRatio, lógica en px CSS
 */
(function () {
    'use strict';
  
    document.addEventListener('DOMContentLoaded', () => {
      const canvas = document.getElementById('flow-canvas');
      if (!canvas) return;
  
      const ctx = canvas.getContext('2d');
      let W, H, particles = [];
      let raf;
      const t0 = performance.now();
  
      /* ─── Pseudo-Perlin: tres octavas de seno/coseno entrelazadas ──────── */
      function noise(x, y, t) {
        return (
          Math.sin(x * 0.85 + t * 0.26) * Math.cos(y * 0.62 + t * 0.18) +
          Math.sin(x * 1.32 + y * 0.88 + t * 0.12) * 0.48 +
          Math.cos(x * 0.41 - y * 1.05 + t * 0.08) * 0.28
        ) / 1.76;
      }
  
      /* ─── Resize con soporte DPR ────────────────────────────────────────── */
      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap 2× para perf
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width  = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.width  = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // resetea + escala, sin acumulación
      }
  
      /* ─── Construir partículas ──────────────────────────────────────────── */
      function buildParticles() {
        particles = [];
        // Densidad proporcional al área, techo conservador para móviles
        const count = Math.min(560, Math.round((W * H) / 3400));
        for (let i = 0; i < count; i++) {
          const z = Math.random();        // 0 = lejana, 1 = cercana
          particles.push({
            x:           Math.random() * W,
            y:           Math.random() * H,
            z,
            size:        0.35 + z * 1.55,  // near = más grande
            baseOpacity: 0.06 + z * 0.44,  // near = más visible
            speed:       0.20 + z * 0.75,  // near = más rápida
            phase:       Math.random() * Math.PI * 2,     // fase individual de pulso
            hueShift:    (Math.random() - 0.5) * 9        // variación sutil de tono dorado
          });
        }
      }
  
      /* ─── Loop de dibujo ────────────────────────────────────────────────── */
      function draw() {
        const t = (performance.now() - t0) / 1000;
  
        // Respiración: velocidad oscila en ciclo de 8 s — diseño somático
        const breath = 0.68 + Math.sin(t * 0.785) * 0.32;
  
        // Trail suave: fondo semi-transparente preserva la "estela" de cada partícula
        ctx.fillStyle = 'rgba(10,10,10,0.15)';
        ctx.fillRect(0, 0, W, H);
  
        for (const p of particles) {
          // Ángulo del campo de flujo vía noise
          const angle = noise(p.x / 230, p.y / 230, t) * Math.PI * 2.65;
  
          // Movimiento — leve sesgo vertical para que el flujo "caiga con gracia"
          p.x += Math.cos(angle) * p.speed * breath;
          p.y += Math.sin(angle) * p.speed * breath * 0.66;
  
          // Wrap de bordes
          if (p.x < -4) p.x = W + 4;
          else if (p.x > W + 4) p.x = -4;
          if (p.y < -4) p.y = H + 4;
          else if (p.y > H + 4) p.y = -4;
  
          // Opacidad pulsante — cada partícula respira en su propia fase
          const o = p.baseOpacity * (0.60 + Math.sin(t * 0.82 + p.phase) * 0.40);
  
          // Paleta dorada: hue 43–51, saturación/luminosidad varían con profundidad
          const h = 44 + p.hueShift;
          const s = 46 + p.z * 20;
          const l = 48 + p.z * 18;
  
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${h.toFixed(1)},${s.toFixed(1)}%,${l.toFixed(1)}%,${o.toFixed(3)})`;
          ctx.fill();
        }
  
        raf = requestAnimationFrame(draw);
      }
  
      /* ─── Init ──────────────────────────────────────────────────────────── */
      function init() {
        if (raf) cancelAnimationFrame(raf);
        resize();
        buildParticles();
        draw();
      }
  
      init();
  
      // Debounce resize para evitar rebuilds en cada px de redimensión
      let _resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(_resizeTimer);
        _resizeTimer = setTimeout(init, 180);
      }, { passive: true });
    });
  })();