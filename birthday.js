// ==========================================================================
// BIRTHDAY CELEBRATION LOGIC - FOR ANKITA ✨🎂
// Ultra-Premium Canvas Particle Engine, Interactive Cake & Celebratory Chimes
// ==========================================================================

(function() {
    'use strict';

    // --- State Variables ---
    let canvas, ctx;
    let width, height, dpr;
    let animationFrameId = null;
    let particles = [];
    let fireworks = [];
    let ambientStars = [];
    let isCandleLit = true;
    let audioCtx = null;
    let isOverlayOpen = false;

    // Birthday Wish Data for Orbs
    const bdayWishes = [
        {
            icon: "🌟",
            title: "Endless Joy & Radiant Smiles",
            text: "May this upcoming year surround you with effortless laughter, pure genuine warmth, and people who appreciate and celebrate you every single day. Keep shining your brilliant light!"
        },
        {
            icon: "💫",
            title: "Big Dreams & Unstoppable Growth",
            text: "May every goal, dream, and ambition you’ve quietly held in your heart gain momentum and turn into reality this year. You have immense talent, intellect, and grace to achieve anything!"
        },
        {
            icon: "🌿",
            title: "Peace, Serenity & Good Health",
            text: "Wishing you slow, beautiful mornings, peaceful evenings, quiet moments of pride in how far you’ve come, and great health to conquer everything ahead. May your heart always feel light."
        },
        {
            icon: "💖",
            title: "Everything You Truly Deserve",
            text: "To Ankita: You are wonderful, unique, and deeply special. May your birthday mark the beginning of your happiest, most vibrant, and most fulfilling chapter yet!"
        }
    ];

    // Vibrant & Premium Celebration Palette
    const colors = [
        '#FFD700', '#FFA500', '#FF69B4', '#BA68C8',
        '#64B5F6', '#4DD0E1', '#81C784', '#FF8A80',
        '#FFF9C4', '#F48FB1', '#E1BEE7', '#FFE082'
    ];

    // ==========================================================================
    // WEB AUDIO HARMONIC CELEBRATORY CHIME (No External File Needed)
    // ==========================================================================
    function playCelebratoryChime() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            if (!audioCtx) {
                audioCtx = new AudioContext();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const now = audioCtx.currentTime;
            // Pentatonic celebration notes: E5, G#5, B5, E6, G#6
            const freqs = [659.25, 830.61, 987.77, 1318.51, 1661.22];

            freqs.forEach((freq, index) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + index * 0.08);

                // Sparkling vibrato
                gain.gain.setValueAtTime(0, now + index * 0.08);
                gain.gain.linearRampToValueAtTime(0.25, now + index * 0.08 + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 1.8);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(now + index * 0.08);
                osc.stop(now + index * 0.08 + 1.9);
            });
        } catch (e) {
            console.log("Audio fanfare note:", e);
        }
    }

    // Mini Pop Sound for Balloons
    function playPopChime() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            if (!audioCtx) audioCtx = new AudioContext();
            if (audioCtx.state === 'suspended') audioCtx.resume();

            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.13);
        } catch (e) {}
    }

    // ==========================================================================
    // CANVAS PARTICLE & FIREWORK CLASSES
    // ==========================================================================

    // Confetti Ribbon / Foil Particle
    class Confetti {
        constructor(x, y, isExplosion = false) {
            this.x = x !== undefined ? x : Math.random() * width;
            this.y = y !== undefined ? y : -20;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.size = Math.random() * 8 + 6;
            this.tilt = Math.random() * 10 - 10;
            this.tiltAngle = Math.random() * Math.PI * 2;
            this.tiltAngleInc = Math.random() * 0.08 + 0.04;
            
            if (isExplosion) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 14 + 6;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed - 5;
                this.gravity = 0.28;
                this.drag = 0.94;
            } else {
                this.vx = Math.random() * 3 - 1.5;
                this.vy = Math.random() * 3.5 + 2.5;
                this.gravity = 0.08;
                this.drag = 0.99;
            }

            this.opacity = 1;
            this.decay = Math.random() * 0.008 + 0.003;
            this.shape = Math.random() > 0.3 ? 'rect' : 'circle';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= this.drag;
            this.vy = (this.vy + this.gravity) * this.drag;
            this.tiltAngle += this.tiltAngleInc;
            this.tilt = Math.sin(this.tiltAngle) * 12;

            if (this.y > height + 20) {
                this.opacity -= 0.05;
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.opacity);
            ctx.fillStyle = this.color;
            ctx.translate(this.x + this.tilt, this.y);
            ctx.rotate(this.tiltAngle);

            if (this.shape === 'rect') {
                ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    // Firework Rocket & Shimmering Burst
    class Firework {
        constructor(targetX, targetY, customColor) {
            this.x = targetX || Math.random() * (width * 0.8) + (width * 0.1);
            this.y = height + 10;
            this.targetY = targetY || Math.random() * (height * 0.45) + (height * 0.12);
            this.targetX = this.x + (Math.random() * 60 - 30);
            this.speed = Math.random() * 4 + 11;
            this.color = customColor || colors[Math.floor(Math.random() * colors.length)];
            this.sparks = [];
            this.exploded = false;
            this.dead = false;
            this.trail = [];
        }

        update() {
            if (!this.exploded) {
                this.trail.push({ x: this.x, y: this.y, alpha: 1 });
                if (this.trail.length > 7) this.trail.shift();

                const dy = this.targetY - this.y;
                const dx = this.targetX - this.x;
                this.y -= this.speed;
                this.x += dx * 0.05;

                if (this.y <= this.targetY) {
                    this.explode();
                }
            } else {
                for (let i = this.sparks.length - 1; i >= 0; i--) {
                    const spark = this.sparks[i];
                    spark.x += spark.vx;
                    spark.y += spark.vy;
                    spark.vy += spark.gravity;
                    spark.vx *= spark.friction;
                    spark.vy *= spark.friction;
                    spark.alpha -= spark.decay;
                    if (spark.alpha <= 0) {
                        this.sparks.splice(i, 1);
                    }
                }
                if (this.sparks.length === 0) {
                    this.dead = true;
                }
            }

            // Trail decay
            for (let i = 0; i < this.trail.length; i++) {
                this.trail[i].alpha -= 0.12;
            }
        }

        explode() {
            this.exploded = true;
            const count = Math.floor(Math.random() * 50) + 75;
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.2);
                const velocity = Math.random() * 8 + 2;
                this.sparks.push({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(angle) * velocity,
                    vy: Math.sin(angle) * velocity,
                    gravity: 0.14,
                    friction: 0.95,
                    alpha: 1,
                    decay: Math.random() * 0.015 + 0.008,
                    color: Math.random() > 0.4 ? this.color : '#FFFFFF',
                    size: Math.random() * 2.8 + 1.2
                });
            }
        }

        draw(ctx) {
            ctx.save();
            if (!this.exploded) {
                // Draw rocket ascent trail
                ctx.lineWidth = 2.5;
                for (let i = 0; i < this.trail.length; i++) {
                    const pt = this.trail[i];
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 230, 150, ${Math.max(0, pt.alpha)})`;
                    ctx.fill();
                }

                ctx.beginPath();
                ctx.arc(this.x, this.y, 3.5, 0, Math.PI * 2);
                ctx.fillStyle = '#FFFFFF';
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 15;
                ctx.fill();
            } else {
                // Draw fireworks burst
                for (let i = 0; i < this.sparks.length; i++) {
                    const s = this.sparks[i];
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                    ctx.fillStyle = s.color;
                    ctx.shadowColor = s.color;
                    ctx.shadowBlur = 8;
                    ctx.globalAlpha = Math.max(0, s.alpha);
                    ctx.fill();
                }
            }
            ctx.restore();
        }
    }

    // Ambient Starlight Background
    function initAmbientStars() {
        ambientStars = [];
        const count = 55;
        for (let i = 0; i < count; i++) {
            ambientStars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5 + 0.5,
                alpha: Math.random(),
                speed: Math.random() * 0.02 + 0.01
            });
        }
    }

    // ==========================================================================
    // ENGINE RUN LOOP
    // ==========================================================================
    function setupCanvas() {
        canvas = document.getElementById('birthday-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        dpr = window.devicePixelRatio || 1;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            initAmbientStars();
        };

        window.addEventListener('resize', resize);
        resize();
    }

    function loop() {
        if (!isOverlayOpen) {
            animationFrameId = requestAnimationFrame(loop);
            return;
        }

        ctx.clearRect(0, 0, width, height);

        // 1. Draw Ambient Stars
        ctx.save();
        for (let i = 0; i < ambientStars.length; i++) {
            const s = ambientStars[i];
            s.alpha += s.speed;
            const a = Math.abs(Math.sin(s.alpha));
            ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.8})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // 2. Update and Draw Fireworks
        for (let i = fireworks.length - 1; i >= 0; i--) {
            const fw = fireworks[i];
            fw.update();
            fw.draw(ctx);
            if (fw.dead) {
                fireworks.splice(i, 1);
            }
        }

        // 3. Update and Draw Confetti
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw(ctx);
            if (p.opacity <= 0) {
                particles.splice(i, 1);
            }
        }

        // Periodic gentle celebratory confetti drift if candle blown
        if (!isCandleLit && Math.random() < 0.25 && particles.length < 180) {
            particles.push(new Confetti());
        }

        animationFrameId = requestAnimationFrame(loop);
    }

    // ==========================================================================
    // CELEBRATION TRIGGERS & INTERACTIONS
    // ==========================================================================

    // Massive Confetti & Firework Salvo
    function launchGrandCelebration() {
        playCelebratoryChime();

        // 1. Firework cluster from multiple launch angles
        const fireworkCount = 7;
        for (let i = 0; i < fireworkCount; i++) {
            setTimeout(() => {
                if (!isOverlayOpen) return;
                const tx = width * (0.15 + 0.7 * (i / (fireworkCount - 1))) + (Math.random() * 40 - 20);
                const ty = height * 0.18 + Math.random() * (height * 0.25);
                fireworks.push(new Firework(tx, ty));
            }, i * 320);
        }

        // 2. Confetti Explosion originating from center / cake
        const cakeElem = document.getElementById('bday-cake-scene');
        let cakeRect = { left: width / 2, top: height / 2 };
        if (cakeElem) {
            cakeRect = cakeElem.getBoundingClientRect();
        }
        const originX = cakeRect.left + (cakeRect.width ? cakeRect.width / 2 : 0);
        const originY = cakeRect.top + (cakeRect.height ? cakeRect.height / 3 : 0);

        for (let i = 0; i < 140; i++) {
            particles.push(new Confetti(originX, originY, true));
        }

        // Show Toast Notification
        showToast("🌟 Wish Granted! May all your dreams come true! 🎂");
    }

    // Toast helper
    function showToast(msg) {
        const toast = document.getElementById('bday-toast');
        if (toast) {
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3800);
        }
    }

    // Blow Candle Action
    window.blowBirthdayCandle = function() {
        if (!isCandleLit) return;
        isCandleLit = false;

        // Visual extinction of flame
        const flame = document.getElementById('bday-flame');
        const smoke = document.getElementById('bday-smoke');
        const blowBtn = document.getElementById('bday-blow-btn');
        const postActions = document.getElementById('bday-post-actions');
        const bdayTitle = document.getElementById('bday-main-title');
        const bdaySubtitle = document.getElementById('bday-subtitle-text');

        if (flame) flame.classList.add('blown');
        if (smoke) smoke.classList.add('puffing');

        if (blowBtn) {
            blowBtn.style.display = 'none';
        }
        if (postActions) {
            postActions.classList.add('visible');
        }

        if (bdayTitle) {
            bdayTitle.innerHTML = "🎉 Happy Birthday, Ankita! 🎂";
        }
        if (bdaySubtitle) {
            bdaySubtitle.innerHTML = "✨ All your wishes are on their way to coming true! ✨";
        }

        // Trigger the grand salute!
        launchGrandCelebration();
    };

    // Relight Candle Action
    window.relightCandle = function() {
        isCandleLit = true;
        const flame = document.getElementById('bday-flame');
        const smoke = document.getElementById('bday-smoke');
        const blowBtn = document.getElementById('bday-blow-btn');
        const postActions = document.getElementById('bday-post-actions');

        if (flame) flame.classList.remove('blown');
        if (smoke) smoke.classList.remove('puffing');

        if (blowBtn) {
            blowBtn.style.display = 'inline-flex';
            blowBtn.innerHTML = `<span>Make Another Wish 🌬️</span>`;
        }
        if (postActions) {
            postActions.classList.remove('visible');
        }

        showToast("🕯️ Candle relit! Close your eyes and make another wish!");
    };

    // Shower Extra Sparkles
    window.showerMoreSparkles = function() {
        playCelebratoryChime();
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const tx = Math.random() * (width * 0.8) + width * 0.1;
                const ty = Math.random() * (height * 0.35) + height * 0.15;
                fireworks.push(new Firework(tx, ty));
            }, i * 250);
        }
        for (let i = 0; i < 80; i++) {
            particles.push(new Confetti(Math.random() * width, -10, false));
        }
    };

    // Open Wish Modal
    window.openWishModal = function(index) {
        const wish = bdayWishes[index];
        if (!wish) return;

        playPopChime();
        const modal = document.getElementById('bday-wish-modal');
        const iconElem = document.getElementById('bday-modal-icon');
        const titleElem = document.getElementById('bday-modal-title');
        const textElem = document.getElementById('bday-modal-text');

        if (iconElem) iconElem.textContent = wish.icon;
        if (titleElem) titleElem.textContent = wish.title;
        if (textElem) textElem.textContent = wish.text;

        if (modal) modal.classList.add('active');
    };

    window.closeWishModal = function() {
        const modal = document.getElementById('bday-wish-modal');
        if (modal) modal.classList.remove('active');
    };

    // Balloon Pop
    window.popBalloon = function(elem, event) {
        if (event) event.stopPropagation();
        playPopChime();

        const rect = elem.getBoundingClientRect();
        const bx = rect.left + rect.width / 2;
        const by = rect.top + rect.height / 2;

        // Mini firework burst at balloon location
        fireworks.push(new Firework(bx, by));

        elem.style.transform = 'scale(0)';
        elem.style.opacity = '0';
        setTimeout(() => {
            elem.style.transform = '';
            elem.style.opacity = '1';
        }, 5000);
    };

    // ==========================================================================
    // OVERLAY LIFECYCLE & TRANSITIONS
    // ==========================================================================

    window.openBirthdayOverlay = function() {
        const overlay = document.getElementById('birthday-celebration-overlay');
        const floatingBtn = document.getElementById('bday-floating-replay');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.classList.add('active');
            isOverlayOpen = true;
        }
        if (floatingBtn) {
            floatingBtn.style.display = 'none';
        }
        // Launch welcoming sparks
        setTimeout(() => {
            if (isOverlayOpen && fireworks.length === 0) {
                fireworks.push(new Firework(width * 0.3, height * 0.25));
                setTimeout(() => {
                    fireworks.push(new Firework(width * 0.7, height * 0.22));
                }, 400);
            }
        }, 600);
    };

    window.enterScrapbookFromBirthday = function() {
        const overlay = document.getElementById('birthday-celebration-overlay');
        const floatingBtn = document.getElementById('bday-floating-replay');
        const screen1 = document.getElementById('screen-1');

        if (overlay) {
            overlay.classList.remove('active');
            overlay.classList.add('hidden');
            isOverlayOpen = false;
        }

        // Make floating badge visible so she can replay anytime
        if (floatingBtn) {
            floatingBtn.style.display = 'inline-flex';
        }

        // Activate Screen 1
        if (screen1) {
            screen1.classList.remove('hidden');
            screen1.classList.add('active');
        }
    };

    // ==========================================================================
    // INITIALIZATION ON DOM READY
    // ==========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        setupCanvas();
        loop();

        // Hook into music start overlay so entering reveals the birthday celebration
        const originalStartExperience = window.startExperience;
        window.startExperience = function() {
            if (typeof originalStartExperience === 'function') {
                originalStartExperience();
            }
            // Open the Grand Birthday Celebration!
            setTimeout(() => {
                openBirthdayOverlay();
            }, 600);
        };
    });

})();
