/**
 * flow-field.js  v3  — "Quantum Field"
 * Perlin noise flow field with:
 *   • Breathing (global speed pulses)
 *   • 3D depth (z → scale + alpha)
 *   • Light connections between nearby particles
 *   • Occasional fast "light ray" particles
 */
(function () {
    'use strict';

    /* ── PERLIN NOISE ── */
    class Perlin {
        constructor(seed = 12345) {
            const p = Array.from({ length: 256 }, (_, i) => i);
            let s = seed;
            const rng = () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
            for (let i = 255; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
            this.perm = new Uint8Array(512);
            for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
        }
        _f(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
        _l(a, b, t) { return a + t * (b - a); }
        _g(h, x, y) { switch (h & 3) { case 0: return x + y; case 1: return -x + y; case 2: return x - y; default: return -x - y; } }
        noise(x, y) {
            const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
            x -= Math.floor(x); y -= Math.floor(y);
            const u = this._f(x), v = this._f(y);
            const aa = this.perm[X] + Y, ab = this.perm[X] + Y + 1,
                  ba = this.perm[X + 1] + Y, bb = this.perm[X + 1] + Y + 1;
            return this._l(
                this._l(this._g(this.perm[aa], x, y),   this._g(this.perm[ba], x - 1, y),   u),
                this._l(this._g(this.perm[ab], x, y-1), this._g(this.perm[bb], x - 1, y-1), u),
                v
            );
        }
    }

    /* ── CONFIG ── */
    const isMobile = window.innerWidth <= 768;
    const CFG = {
        count:         isMobile ? 350 : 750,
        noiseScale:    0.0022,
        noiseSpeed:    0.00015,
        baseSpeed:     1.4,
        breathPeriod:  8,          // seconds for one breath cycle
        breathAmp:     0.35,       // ± fraction of baseSpeed
        trailFade:     0.93,
        resetChance:   0.003,
        connDist:      100,        // px threshold for connections
        connAlpha:     0.12,       // max alpha of connection lines
        connEvery:     3,          // check connections every N frames
        lineWidth:     isMobile ? 0.75 : 1.0,
        zRange:        1.0,        // z from -zRange to +zRange
        // Light rays
        rayInterval:   [2500, 5000],  // ms range between rays
        rayCount:      isMobile ? 1 : 2,
        // Gold palette
        colors: [
            'rgba(249,231,159,',  // #F9E79F
            'rgba(241,196,15,',   // #F1C40F
            'rgba(214,137,16,',   // #D68910
            'rgba(255,215,0,',    // #FFD700
            'rgba(255,165,0,',    // #FFA500
        ],
    };

    /* ── SETUP ── */
    const canvas = document.getElementById('flow-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const perlin = new Perlin();

    let W, H, particles;
    let timeOffset = 0;
    let frameCount = 0;
    let rafId;
    let rays = [];          // active light rays
    let nextRayTime = 0;

    function resize() {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
        if (particles) particles.forEach(p => resetParticle(p, true));
    }

    /* ── REGULAR PARTICLE ── */
    function createParticle() { const p = {}; resetParticle(p, true); return p; }

    function resetParticle(p, init) {
        p.x  = Math.random() * W;
        p.y  = init ? Math.random() * H : (Math.random() < 0.5 ? -4 : Math.random() * H);
        p.px = p.x; p.py = p.y;
        p.z  = (Math.random() * 2 - 1) * CFG.zRange;          // depth -1..+1
        p.life    = Math.random();
        p.maxLife = 0.55 + Math.random() * 0.45;
        p.speed   = CFG.baseSpeed * (0.5 + Math.random() * 0.8);
        p.colorIdx = Math.floor(Math.random() * CFG.colors.length);
    }

    /* ── LIGHT RAY ── */
    function spawnRay() {
        const fromEdge = Math.random() < 0.5;
        const r = {
            x:  fromEdge ? -10 : Math.random() * W,
            y:  fromEdge ? Math.random() * H : -10,
            px: 0, py: 0,
            angle: Math.PI * 0.25 + (Math.random() - 0.5) * 0.4,
            speed: CFG.baseSpeed * (6 + Math.random() * 5),
            alpha: 0.8 + Math.random() * 0.2,
            life:  0,
            maxLife: 0.5 + Math.random() * 0.3,
            width: 1.5 + Math.random() * 2,
        };
        r.px = r.x; r.py = r.y;
        rays.push(r);
    }

    function scheduleRay() {
        const delay = CFG.rayInterval[0] + Math.random() * (CFG.rayInterval[1] - CFG.rayInterval[0]);
        nextRayTime = performance.now() + delay;
    }

    /* ── INIT ── */
    function init() {
        resize();
        particles = Array.from({ length: CFG.count }, createParticle);
        scheduleRay();
    }

    /* ── DRAW ── */
    function draw(timestamp) {
        rafId = requestAnimationFrame(draw);
        timeOffset += CFG.noiseSpeed;
        frameCount++;

        // Breathing multiplier: 1 ± breathAmp, smooth sine
        const breath = 1 + CFG.breathAmp * Math.sin((timestamp / 1000) * (Math.PI * 2 / CFG.breathPeriod));

        // Fade trail
        ctx.fillStyle = `rgba(10,10,10,${1 - CFG.trailFade})`;
        ctx.fillRect(0, 0, W, H);

        /* ─ Connection pass (every N frames) ─ */
        if (frameCount % CFG.connEvery === 0) {
            ctx.save();
            ctx.lineWidth = 0.5;
            const nearFront = particles.filter(p => p.z > 0.2);
            const limit = Math.min(nearFront.length, 120);  // cap for performance
            for (let i = 0; i < limit; i++) {
                const a = nearFront[i];
                for (let j = i + 1; j < limit; j++) {
                    const b = nearFront[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < CFG.connDist) {
                        const alpha = CFG.connAlpha * (1 - dist / CFG.connDist);
                        ctx.strokeStyle = `rgba(241,196,15,${alpha})`;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }
            ctx.restore();
        }

        /* ─ Regular particles ─ */
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // depth → scale 0.4..1.6, alpha 0.18..0.85
            const depth  = (p.z + CFG.zRange) / (2 * CFG.zRange);  // 0..1
            const scale  = 0.4 + depth * 1.2;
            const alpha  = 0.18 + depth * 0.67;

            const nx    = p.x * CFG.noiseScale;
            const ny    = p.y * CFG.noiseScale;
            const angle = perlin.noise(nx + timeOffset, ny + timeOffset) * Math.PI * 4;

            p.px = p.x; p.py = p.y;
            const spd = p.speed * breath;
            p.x += Math.cos(angle) * spd;
            p.y += Math.sin(angle) * spd;

            ctx.lineWidth = CFG.lineWidth * scale;
            ctx.strokeStyle = CFG.colors[p.colorIdx] + alpha + ')';
            ctx.beginPath();
            ctx.moveTo(p.px, p.py);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();

            p.life += 0.004;
            if (p.x < -4 || p.x > W + 4 || p.y < -4 || p.y > H + 4 || p.life > p.maxLife || Math.random() < CFG.resetChance) {
                resetParticle(p, false);
            }
        }

        /* ─ Light rays ─ */
        if (timestamp > nextRayTime) {
            for (let k = 0; k < CFG.rayCount; k++) spawnRay();
            scheduleRay();
        }
        for (let r = rays.length - 1; r >= 0; r--) {
            const ray = rays[r];
            ray.px = ray.x; ray.py = ray.y;
            ray.x += Math.cos(ray.angle) * ray.speed;
            ray.y += Math.sin(ray.angle) * ray.speed;
            const fade = Math.max(0, 1 - ray.life / ray.maxLife);
            ctx.save();
            ctx.lineWidth = ray.width;
            ctx.strokeStyle = `rgba(249,231,159,${ray.alpha * fade})`;
            ctx.shadowColor  = `rgba(241,196,15,${0.8 * fade})`;
            ctx.shadowBlur   = 12;
            ctx.beginPath();
            ctx.moveTo(ray.px, ray.py);
            ctx.lineTo(ray.x, ray.y);
            ctx.stroke();
            ctx.restore();
            ray.life += 0.018;
            if (ray.life >= ray.maxLife || ray.x > W + 50 || ray.y > H + 50) {
                rays.splice(r, 1);
            }
        }
    }

    /* ── LIFECYCLE ── */
    init();
    requestAnimationFrame(draw);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(rafId);
            rafId = undefined;
            return;
        }
        // Evita arrancar múltiples loops si el navegador dispara eventos repetidos.
        if (!rafId) rafId = requestAnimationFrame(draw);
    });
})();