/**
 * flow-field.js
 * "Golden Flow Field" — Canvas 2D background animation.
 * Hundreds of golden particles flow through a Perlin noise vector field,
 * creating organic, ever-changing patterns that visualize infinite possibility.
 */

(function () {
    'use strict';

    /* ─────────────── PERLIN NOISE ─────────────── */
    class Perlin {
        constructor (seed) {
            const p = Array.from({ length: 256 }, (_, i) => i);
            // Fisher-Yates shuffle with a deterministic seed
            let s = seed || 12345;
            const rng = () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
            for (let i = 255; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                [p[i], p[j]] = [p[j], p[i]];
            }
            this.perm = new Uint8Array(512);
            for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
        }

        _fade (t) { return t * t * t * (t * (t * 6 - 15) + 10); }
        _lerp (a, b, t) { return a + t * (b - a); }
        _grad (h, x, y) {
            switch (h & 3) {
                case 0:  return  x + y;
                case 1:  return -x + y;
                case 2:  return  x - y;
                default: return -x - y;
            }
        }

        noise (x, y) {
            const X = Math.floor(x) & 255;
            const Y = Math.floor(y) & 255;
            x -= Math.floor(x);
            y -= Math.floor(y);
            const u = this._fade(x);
            const v = this._fade(y);
            const aa = this.perm[X]     + Y;
            const ab = this.perm[X]     + Y + 1;
            const ba = this.perm[X + 1] + Y;
            const bb = this.perm[X + 1] + Y + 1;
            return this._lerp(
                this._lerp(this._grad(this.perm[aa], x,     y    ),
                           this._grad(this.perm[ba], x - 1, y    ), u),
                this._lerp(this._grad(this.perm[ab], x,     y - 1),
                           this._grad(this.perm[bb], x - 1, y - 1), u),
                v
            );
        }
    }

    /* ─────────────── CONFIG ─────────────── */
    const CFG = {
        particleCount: window.innerWidth <= 768 ? 400 : 800,
        noiseScale:    0.0025,    // how "zoomed out" the noise field is
        noiseSpeed:    0.00018,   // how fast the field evolves over time
        speed:         1.5,       // base particle speed
        trailLength:   0.92,      // fade factor per frame (higher = longer trail)
        resetChance:   0.0035,    // probability a particle resets each frame
        colors: [                 // gold palette with varying opacity
            'rgba(251, 191, 36,  0.55)',
            'rgba(252, 211, 77,  0.40)',
            'rgba(245, 158, 11,  0.35)',
            'rgba(251, 191, 36,  0.25)',
            'rgba(253, 230, 138, 0.20)',
        ],
        lineWidth: window.innerWidth <= 768 ? 0.8 : 1.0,
    };

    /* ─────────────── SETUP ─────────────── */
    const canvas = document.getElementById('flow-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const perlin = new Perlin();

    let W, H, particles;
    let timeOffset = 0;
    let rafId;

    function resize () {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
        // Re-seed particles on resize so the canvas stays populated
        if (particles) particles.forEach(p => resetParticle(p));
    }

    /* ─────────────── PARTICLE ─────────────── */
    function createParticle () {
        const p = {};
        resetParticle(p, true);
        return p;
    }

    function resetParticle (p, init) {
        p.x    = Math.random() * W;
        p.y    = init ? Math.random() * H : (Math.random() < 0.5 ? Math.random() * 10 : Math.random() * H);
        p.px   = p.x;   // previous x (for line drawing)
        p.py   = p.y;
        p.life = Math.random(); // normalised 0-1
        p.maxLife = 0.6 + Math.random() * 0.4;
        p.color = CFG.colors[Math.floor(Math.random() * CFG.colors.length)];
        p.speed = CFG.speed * (0.6 + Math.random() * 0.8);
    }

    /* ─────────────── INIT ─────────────── */
    function init () {
        resize();
        particles = Array.from({ length: CFG.particleCount }, createParticle);
    }

    /* ─────────────── DRAW LOOP ─────────────── */
    function draw () {
        rafId = requestAnimationFrame(draw);
        timeOffset += CFG.noiseSpeed;

        // Fade previous frame — creates the "trail" effect
        ctx.fillStyle = `rgba(10, 10, 10, ${1 - CFG.trailLength})`;
        ctx.fillRect(0, 0, W, H);

        ctx.lineWidth = CFG.lineWidth;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Sample noise to get a flow angle
            const nx    = p.x * CFG.noiseScale;
            const ny    = p.y * CFG.noiseScale;
            const angle = perlin.noise(nx + timeOffset, ny + timeOffset) * Math.PI * 4;

            p.px = p.x;
            p.py = p.y;
            p.x += Math.cos(angle) * p.speed;
            p.y += Math.sin(angle) * p.speed;

            // Draw the micro-segment
            ctx.beginPath();
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.px, p.py);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();

            // Reset if out of bounds or life expired
            p.life += 0.004;
            if (
                p.x < -2 || p.x > W + 2 ||
                p.y < -2 || p.y > H + 2 ||
                p.life > p.maxLife ||
                Math.random() < CFG.resetChance
            ) {
                resetParticle(p, false);
            }
        }
    }

    /* ─────────────── LIFECYCLE ─────────────── */
    init();
    draw();

    // Handle resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    }, { passive: true });

    // Pause when tab is hidden (battery & CPU friendly)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(rafId);
        } else {
            draw();
        }
    });

})();