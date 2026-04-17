/**
 * flow-field.js — Entrenador Mental / La Calma de Mamá
 * Breathing Gold Flow Field — v3 (scroll-proof)
 *
 * Filosofía de diseño somático:
 *  - ~560 partículas — densidad intencional, no ruido
 *  - Velocidad global oscila en ciclo de 8 s — inhala / exhala
 *  - Profundidad Z simulada: near = brillante + rápida, far = tenue + lenta
 *  - Ruido por octavas de seno: movimiento orgánico sin libraries externas
 *  - Retina-ready: devicePixelRatio, lógica en px CSS
 *  - Resistente a pausas por scroll móvil (delta time + reinicio automático)
 */
(function () {
    'use strict';
  
    document.addEventListener('DOMContentLoaded', () => {
      const canvas = document.getElementById('flow-canvas');
      if (!canvas) return;
  
      const ctx = canvas.getContext('2d');
      let W, H, particles = [];
      let raf;
      let lastTimestamp = 0;
      const MAX_DELTA_MS = 200; // Si el delta supera esto, asumimos pausa y reiniciamos suavemente
  
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
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width  = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.width  = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
  
      /* ─── Construir partículas ──────────────────────────────────────────── */
      function buildParticles() {
        particles = [];
        const count = Math.min(560, Math.round((W * H) / 3400));
        for (let i = 0; i < count; i++) {
          const z = Math.random();
          particles.push({
            x:           Math.random() * W,
            y:           Math.random() * H,
            z,
            size:        0.35 + z * 1.55,
            baseOpacity: 0.06 + z * 0.44,
            speed:       0.20 + z * 0.75,
            phase:       Math.random() * Math.PI * 2,
            hueShift:    (Math.random() - 0.5) * 9
          });
        }
      }
  
      /* ─── Reinicio suave tras pausa (scroll) ────────────────────────────── */
      function softResetAfterPause() {
        // No reiniciamos posiciones completamente, solo aseguramos que no haya saltos bruscos
        // El delta time ya se encarga de normalizar el movimiento.
        // Podemos ajustar ligeramente las fases para evitar patrones estáticos tras la pausa.
        for (const p of particles) {
          p.phase = (p.phase + 0.01) % (Math.PI * 2);
        }
      }
  
      /* ─── Loop de dibujo con delta time controlado ──────────────────────── */
      function draw(now) {
        raf = requestAnimationFrame(draw);
  
        // Inicializar timestamp en el primer frame
        if (!lastTimestamp) {
          lastTimestamp = now;
          return;
        }
  
        // Calcular delta time en segundos, cap al máximo para evitar saltos
        let deltaMs = now - lastTimestamp;
        if (deltaMs > MAX_DELTA_MS) {
          // Probable pausa por scroll o cambio de pestaña
          deltaMs = 16.67; // Asumir ~60fps para evitar salto
          softResetAfterPause();
        }
        const deltaSec = deltaMs / 1000;
        lastTimestamp = now;
  
        // El tiempo global sigue usando performance.now para el ruido continuo,
        // pero el movimiento de partículas escala con deltaSec para mantener velocidad constante.
        const t = performance.now() / 1000;
  
        // Respiración: ciclo de 8s
        const breath = 0.68 + Math.sin(t * 0.785) * 0.32;
  
        // Trail
        ctx.fillStyle = 'rgba(10,10,10,0.15)';
        ctx.fillRect(0, 0, W, H);
  
        for (const p of particles) {
          const angle = noise(p.x / 230, p.y / 230, t) * Math.PI * 2.65;
  
          // Movimiento con velocidad base * delta * factor de respiración
          // Factor de escala para mantener la velocidad visual similar a la versión original
          const moveFactor = deltaSec * 60; // Normalizado a 60fps
          p.x += Math.cos(angle) * p.speed * breath * moveFactor;
          p.y += Math.sin(angle) * p.speed * breath * 0.66 * moveFactor;
  
          // Wrap
          if (p.x < -4) p.x = W + 4;
          else if (p.x > W + 4) p.x = -4;
          if (p.y < -4) p.y = H + 4;
          else if (p.y > H + 4) p.y = -4;
  
          const o = p.baseOpacity * (0.60 + Math.sin(t * 0.82 + p.phase) * 0.40);
          const h = 44 + p.hueShift;
          const s = 46 + p.z * 20;
          const l = 48 + p.z * 18;
  
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${h.toFixed(1)},${s.toFixed(1)}%,${l.toFixed(1)}%,${o.toFixed(3)})`;
          ctx.fill();
        }
      }
  
      /* ─── Iniciar el loop correctamente ─────────────────────────────────── */
      function startLoop() {
        if (raf) cancelAnimationFrame(raf);
        lastTimestamp = 0; // Reiniciar timestamp para que el primer frame no calcule delta enorme
        raf = requestAnimationFrame(draw);
      }
  
      /* ─── Init completo ─────────────────────────────────────────────────── */
      function init() {
        resize();
        buildParticles();
        startLoop();
      }
  
      init();
  
      // Debounce resize
      let _resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(_resizeTimer);
        _resizeTimer = setTimeout(init, 180);
      }, { passive: true });
  
      // Manejo de visibilidad: pausar el loop cuando la pestaña no está visible
      // y reanudar con reinicio suave
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (raf) {
            cancelAnimationFrame(raf);
            raf = null;
          }
        } else {
          if (!raf) {
            lastTimestamp = 0; // Fuerza reinicio de delta
            softResetAfterPause();
            raf = requestAnimationFrame(draw);
          }
        }
      });
    });
  })();