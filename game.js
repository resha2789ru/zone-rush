(() => {
  const app = document.getElementById('app');
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const hud = document.getElementById('hud');
  const menu = document.getElementById('menu');
  const result = document.getElementById('result');
  const mobileControls = document.getElementById('mobileControls');
  const joystick = document.getElementById('joystick');
  const joystickKnob = document.getElementById('joystickKnob');
  const dashBtn = document.getElementById('dashBtn');
  const shootBtn = document.getElementById('shootBtn');
  const rocketBtn = document.getElementById('rocketBtn');

  const playBtn = document.getElementById('playBtn');
  const playAgainBtn = document.getElementById('playAgainBtn');

  const hpBar = document.getElementById('hpBar');
  const hpText = document.getElementById('hpText');
  const playersLeft = document.getElementById('playersLeft');
  const timerText = document.getElementById('timer');
  const dashText = document.getElementById('dash');
  const shootText = document.getElementById('shoot');
  const rocketText = document.getElementById('rocket');
  const rocketCdBar = document.getElementById('rocketCdBar');

  const resultTitle = document.getElementById('resultTitle');
  const resultText = document.getElementById('resultText');

  const WORLD_SIZE = 2200;
  const MAX_MATCH_TIME = 180;
  const BOT_COUNT = 10;

  const PLAYER_RADIUS = 15;
  const BOT_RADIUS = 13;

  const PLAYER_SPEED = 240;
  const PLAYER_DASH_SPEED = 620;
  const PLAYER_DASH_DURATION = 0.18;
  const PLAYER_DASH_COOLDOWN = 2.5;
  const PLAYER_SHOOT_COOLDOWN = 0.2;
  const PLAYER_ROCKET_COOLDOWN = 1.6;

  const PROJECTILE_SPEED = 840;
  const PROJECTILE_DAMAGE = 24;
  const PROJECTILE_RADIUS = 4;
  const PROJECTILE_LIFETIME = 1.1;
  const ROCKET_SPEED = 520;
  const ROCKET_DIRECT_DAMAGE = 9999;
  const ROCKET_BLAST_DAMAGE = 62;
  const ROCKET_BLAST_RADIUS = 120;
  const ROCKET_RADIUS = 7;
  const ROCKET_LIFETIME = 1.6;

  const BOT_MIN_SPEED = 120;
  const BOT_MAX_SPEED = 165;
  const BOT_MAX_HP = 120;

  const MAX_HP = 100;

  const ZONE_START_RADIUS = 930;
  const ZONE_MIN_RADIUS = 120;
  const ZONE_SHRINK_RATE = (ZONE_START_RADIUS - ZONE_MIN_RADIUS) / MAX_MATCH_TIME;

  const TRAP_COUNT = 6;
  const TRAP_RADIUS = 28;
  const MIN_USER_ZOOM = 0.78;
  const MAX_USER_ZOOM = 1.45;

  const keys = Object.create(null);
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const rand = (min, max) => Math.random() * (max - min) + min;

  class SoundManager {
    constructor() {
      this.context = null;
      this.master = null;
      this.enabled = false;
    }

    unlock() {
      if (!window.AudioContext && !window.webkitAudioContext) return;
      if (!this.context) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioCtx();
        this.master = this.context.createGain();
        this.master.gain.value = 0.16;
        this.master.connect(this.context.destination);
      }

      if (this.context.state === 'suspended') this.context.resume();
      this.enabled = true;
    }

    beep({
      type = 'sine',
      frequency = 440,
      endFrequency = frequency,
      duration = 0.12,
      volume = 0.4,
      attack = 0.005,
      release = 0.08,
      detune = 0,
      noise = false,
    }) {
      if (!this.enabled || !this.context || !this.master) return;

      const now = this.context.currentTime;
      const gain = this.context.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(volume, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);
      gain.connect(this.master);

      if (noise) {
        const buffer = this.context.createBuffer(1, this.context.sampleRate * (duration + release), this.context.sampleRate);
        const channel = buffer.getChannelData(0);
        for (let i = 0; i < channel.length; i += 1) channel[i] = (Math.random() * 2 - 1) * 0.7;
        const source = this.context.createBufferSource();
        const filter = this.context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(frequency, now);
        filter.Q.value = 0.6;
        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gain);
        source.start(now);
        source.stop(now + duration + release);
        return;
      }

      const oscillator = this.context.createOscillator();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), now + duration);
      oscillator.detune.value = detune;
      oscillator.connect(gain);
      oscillator.start(now);
      oscillator.stop(now + duration + release);
    }

    shoot() {
      this.beep({ type: 'square', frequency: 720, endFrequency: 420, duration: 0.06, volume: 0.16, release: 0.04 });
    }

    rocket() {
      this.beep({ type: 'sawtooth', frequency: 240, endFrequency: 110, duration: 0.18, volume: 0.22, release: 0.08 });
    }

    dash() {
      this.beep({ type: 'triangle', frequency: 360, endFrequency: 720, duration: 0.08, volume: 0.14, release: 0.05 });
    }

    hit() {
      this.beep({ frequency: 1600, duration: 0.045, volume: 0.12, release: 0.03, noise: true });
    }

    explosion() {
      this.beep({ frequency: 180, duration: 0.14, volume: 0.26, release: 0.14, noise: true });
      this.beep({ type: 'triangle', frequency: 120, endFrequency: 55, duration: 0.22, volume: 0.18, release: 0.16 });
    }
  }

  class Particle {
    constructor(x, y, vx, vy, life, size, color) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.life = life;
      this.maxLife = life;
      this.size = size;
      this.color = color;
    }

    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx *= 0.97;
      this.vy *= 0.97;
      this.life -= dt;
    }

    draw(ctx, camera) {
      if (this.life <= 0) return;
      const alpha = this.life / this.maxLife;
      const sx = this.x - camera.x;
      const sy = this.y - camera.y;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(sx, sy, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class Projectile {
    constructor(x, y, vx, vy) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.radius = PROJECTILE_RADIUS;
      this.life = PROJECTILE_LIFETIME;
      this.alive = true;
    }

    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.life -= dt;
      if (this.life <= 0) this.alive = false;
      if (this.x < 0 || this.x > WORLD_SIZE || this.y < 0 || this.y > WORLD_SIZE) this.alive = false;
    }
  }

  class Rocket {
    constructor(x, y, vx, vy) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.radius = ROCKET_RADIUS;
      this.life = ROCKET_LIFETIME;
      this.alive = true;
    }

    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.life -= dt;
      if (this.life <= 0) this.alive = false;
      if (this.x < 0 || this.x > WORLD_SIZE || this.y < 0 || this.y > WORLD_SIZE) this.alive = false;
    }
  }

  class Explosion {
    constructor(x, y, radius) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.life = 0.34;
      this.maxLife = 0.34;
    }

    update(dt) {
      this.life -= dt;
    }

    draw(ctx, camera) {
      if (this.life <= 0) return;
      const sx = this.x - camera.x;
      const sy = this.y - camera.y;
      const t = 1 - this.life / this.maxLife;
      const currentRadius = this.radius * (0.35 + t * 0.8);
      const alpha = 1 - t;
      ctx.save();
      ctx.globalAlpha = alpha * 0.95;
      ctx.fillStyle = '#ff9e5c';
      ctx.beginPath();
      ctx.arc(sx, sy, currentRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#ffe3ae';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sx, sy, currentRadius * 0.75, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  class Entity {
    constructor(x, y, radius, color) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.maxHp = MAX_HP;
      this.hp = MAX_HP;
      this.alive = true;
      this.vx = 0;
      this.vy = 0;
    }

    takeDamage(amount) {
      if (!this.alive) return;
      this.hp -= amount;
      if (this.hp <= 0) {
        this.hp = 0;
        this.alive = false;
      }
    }
  }

  class Player extends Entity {
    constructor(x, y) {
      super(x, y, PLAYER_RADIUS, '#62f6ff');
      this.lastDirX = 1;
      this.lastDirY = 0;
      this.dashCooldown = 0;
      this.dashTimer = 0;
      this.shootCooldown = 0;
      this.rocketCooldown = 0;
    }
  }

  class Bot extends Entity {
    constructor(x, y) {
      super(x, y, BOT_RADIUS, '#ff71c6');
      this.maxHp = BOT_MAX_HP;
      this.hp = BOT_MAX_HP;
      this.speed = rand(BOT_MIN_SPEED, BOT_MAX_SPEED);
      this.aiTimer = 0;
      this.targetX = rand(-1, 1);
      this.targetY = rand(-1, 1);
      this.lastDirX = 0;
      this.lastDirY = 1;
    }

    chooseDirection() {
      this.aiTimer = rand(0.4, 1.2);
      this.targetX = rand(-1, 1);
      this.targetY = rand(-1, 1);
      const len = Math.hypot(this.targetX, this.targetY) || 1;
      this.targetX /= len;
      this.targetY /= len;
    }
  }

  class SafeZone {
    constructor(centerX, centerY) {
      this.centerX = centerX;
      this.centerY = centerY;
      this.radius = ZONE_START_RADIUS;
    }

    update(dt) {
      this.radius = Math.max(ZONE_MIN_RADIUS, this.radius - ZONE_SHRINK_RATE * dt);
    }

    getProgress() {
      return 1 - (this.radius - ZONE_MIN_RADIUS) / (ZONE_START_RADIUS - ZONE_MIN_RADIUS);
    }
  }

  class Trap {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = TRAP_RADIUS;
      this.phase = rand(0, Math.PI * 2);
    }
  }

  class Game {
    constructor() {
      this.state = 'menu';
      this.player = null;
      this.bots = [];
      this.safeZone = null;
      this.traps = [];
      this.particles = [];
      this.projectiles = [];
      this.rockets = [];
      this.explosions = [];
      this.sound = new SoundManager();

      this.camera = { x: 0, y: 0, zoom: 1 };
      this.baseZoom = 1;
      this.userZoom = 1;
      this.mouse = { x: canvas.width * 0.5, y: canvas.height * 0.5, active: false };
      this.touchMove = { active: false, x: 0, y: 0, pointerId: null };
      this.touchPoints = new Map();
      this.pinch = { active: false, startDistance: 0, startZoom: 1 };
      this.elapsed = 0;
      this.lastTime = 0;
      this.dashQueued = false;
      this.shootQueued = false;
      this.mouseDown = false;
      this.rocketQueued = false;
      this.rightMouseDown = false;
      this.resultReason = 'lose';
      this.lastSurvived = 0;

      this.bindEvents();
      this.resizeCanvas();
      this.updateResponsiveUi();
      this.updateViewportInsets();
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }

    bindEvents() {
      window.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
          event.preventDefault();
          this.sound.unlock();
          if (!event.repeat) this.dashQueued = true;
        }
        if (event.code === 'KeyF') {
          event.preventDefault();
          this.sound.unlock();
          if (!event.repeat) this.shootQueued = true;
        }
        keys[event.key.toLowerCase()] = true;
      });

      window.addEventListener('keyup', (event) => {
        keys[event.key.toLowerCase()] = false;
      });

      canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        this.mouse.x = (event.clientX - rect.left) * (canvas.width / rect.width);
        this.mouse.y = (event.clientY - rect.top) * (canvas.height / rect.height);
        this.mouse.active = true;
      });

      canvas.addEventListener('mousedown', (event) => {
        this.sound.unlock();
        if (event.button === 0) {
          this.mouseDown = true;
          this.shootQueued = true;
        }
        if (event.button === 2) {
          event.preventDefault();
          this.rightMouseDown = true;
          this.rocketQueued = true;
        }
      });

      window.addEventListener('mouseup', (event) => {
        if (event.button === 0) this.mouseDown = false;
        if (event.button === 2) this.rightMouseDown = false;
      });

      canvas.addEventListener('contextmenu', (event) => {
        event.preventDefault();
      });

      canvas.addEventListener('pointerdown', (event) => {
        if (!isTouchDevice || event.pointerType !== 'touch') return;
        this.handleCanvasTouchPointer(event);
      });

      canvas.addEventListener('pointermove', (event) => {
        if (!isTouchDevice || event.pointerType !== 'touch') return;
        this.handleCanvasTouchPointer(event);
      });

      canvas.addEventListener('pointerup', (event) => {
        if (!isTouchDevice || event.pointerType !== 'touch') return;
        this.releaseCanvasTouchPointer(event);
      });

      canvas.addEventListener('pointercancel', (event) => {
        if (!isTouchDevice || event.pointerType !== 'touch') return;
        this.releaseCanvasTouchPointer(event);
      });

      app.addEventListener(
        'touchstart',
        (event) => {
          if (!isTouchDevice || event.touches.length < 2) return;
          this.handleAppPinchTouch(event);
        },
        { passive: false }
      );

      app.addEventListener(
        'touchmove',
        (event) => {
          if (!isTouchDevice || event.touches.length < 2) return;
          this.handleAppPinchTouch(event);
        },
        { passive: false }
      );

      app.addEventListener(
        'touchend',
        () => {
          if (!isTouchDevice) return;
          this.handleAppPinchEnd();
        },
        { passive: false }
      );

      app.addEventListener(
        'touchcancel',
        () => {
          if (!isTouchDevice) return;
          this.handleAppPinchEnd();
        },
        { passive: false }
      );

      app.addEventListener(
        'gesturestart',
        (event) => {
          if (!isTouchDevice) return;
          event.preventDefault();
        },
        { passive: false }
      );

      app.addEventListener(
        'gesturechange',
        (event) => {
          if (!isTouchDevice) return;
          event.preventDefault();
        },
        { passive: false }
      );

      app.addEventListener(
        'gestureend',
        (event) => {
          if (!isTouchDevice) return;
          event.preventDefault();
        },
        { passive: false }
      );

      joystick.addEventListener('pointerdown', (event) => {
        if (!isTouchDevice) return;
        event.preventDefault();
        this.sound.unlock();
        this.touchMove.pointerId = event.pointerId;
        this.touchMove.active = true;
        joystick.setPointerCapture(event.pointerId);
        this.updateJoystickFromEvent(event);
      });

      joystick.addEventListener('pointermove', (event) => {
        if (!isTouchDevice || !this.touchMove.active || event.pointerId !== this.touchMove.pointerId) return;
        event.preventDefault();
        this.updateJoystickFromEvent(event);
      });

      joystick.addEventListener('pointerup', (event) => {
        if (!isTouchDevice || event.pointerId !== this.touchMove.pointerId) return;
        this.resetJoystick();
      });

      joystick.addEventListener('pointercancel', (event) => {
        if (!isTouchDevice || event.pointerId !== this.touchMove.pointerId) return;
        this.resetJoystick();
      });

      dashBtn.addEventListener('pointerdown', (event) => {
        if (!isTouchDevice) return;
        event.preventDefault();
        this.sound.unlock();
        this.dashQueued = true;
      });

      shootBtn.addEventListener('pointerdown', (event) => {
        if (!isTouchDevice) return;
        event.preventDefault();
        this.sound.unlock();
        this.shootQueued = true;
      });

      rocketBtn.addEventListener('pointerdown', (event) => {
        if (!isTouchDevice) return;
        event.preventDefault();
        this.sound.unlock();
        this.rocketQueued = true;
      });

      window.addEventListener('resize', () => {
        this.resizeCanvas();
        this.updateResponsiveUi();
        this.updateViewportInsets();
      });

      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => this.updateViewportInsets());
        window.visualViewport.addEventListener('scroll', () => this.updateViewportInsets());
      }

      playBtn.addEventListener('click', () => {
        this.sound.unlock();
        this.start();
      });
      playAgainBtn.addEventListener('click', () => {
        this.sound.unlock();
        this.start();
      });
    }

    updateResponsiveUi() {
      mobileControls.classList.toggle('active', isTouchDevice);
      this.baseZoom = isTouchDevice && canvas.height > canvas.width ? 0.96 : 1;
      this.applyCameraZoom();
    }

    applyCameraZoom() {
      this.userZoom = clamp(this.userZoom, MIN_USER_ZOOM, MAX_USER_ZOOM);
      this.camera.zoom = this.baseZoom * this.userZoom;
    }

    updateViewportInsets() {
      const rootStyle = document.documentElement.style;
      const viewport = window.visualViewport;

      if (!viewport) {
        rootStyle.setProperty('--browser-ui-top', '0px');
        rootStyle.setProperty('--browser-ui-bottom', '0px');
        rootStyle.setProperty('--app-height', `${window.innerHeight}px`);
        return;
      }

      const topInset = Math.max(0, Math.round(viewport.offsetTop));
      const bottomInset = Math.max(
        0,
        Math.round(window.innerHeight - viewport.height - viewport.offsetTop)
      );

      rootStyle.setProperty('--browser-ui-top', `${topInset}px`);
      rootStyle.setProperty('--browser-ui-bottom', `${bottomInset}px`);
      rootStyle.setProperty('--app-height', `${Math.round(viewport.height)}px`);
    }

    resizeCanvas() {
      const rect = app.getBoundingClientRect();
      const nextWidth = Math.max(320, Math.round(rect.width));
      const nextHeight = Math.max(180, Math.round(rect.height));

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
        this.mouse.x = canvas.width * 0.5;
        this.mouse.y = canvas.height * 0.5;
      }
    }

    updateJoystickFromEvent(event) {
      const rect = joystick.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let dx = event.clientX - centerX;
      let dy = event.clientY - centerY;
      const maxRadius = rect.width * 0.32;
      const dist = Math.hypot(dx, dy);
      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }

      this.touchMove.x = dx / maxRadius;
      this.touchMove.y = dy / maxRadius;
      joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }

    resetJoystick() {
      this.touchMove.active = false;
      this.touchMove.pointerId = null;
      this.touchMove.x = 0;
      this.touchMove.y = 0;
      joystickKnob.style.transform = 'translate(-50%, -50%)';
    }

    getCanvasTouchPosition(event) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }

    getTouchDistance() {
      const points = Array.from(this.touchPoints.values());
      if (points.length < 2) return 0;
      const [a, b] = points;
      return Math.hypot(a.x - b.x, a.y - b.y);
    }

    getDistanceFromTouches(touches) {
      if (!touches || touches.length < 2) return 0;
      const rect = canvas.getBoundingClientRect();
      const ax = touches[0].clientX - rect.left;
      const ay = touches[0].clientY - rect.top;
      const bx = touches[1].clientX - rect.left;
      const by = touches[1].clientY - rect.top;
      return Math.hypot(ax - bx, ay - by);
    }

    handleCanvasTouchPointer(event) {
      event.preventDefault();
      this.sound.unlock();
      this.touchPoints.set(event.pointerId, this.getCanvasTouchPosition(event));

      if (this.touchPoints.size >= 2) {
        const distance = this.getTouchDistance();
        if (!this.pinch.active) {
          this.pinch.active = true;
          this.pinch.startDistance = distance || 1;
          this.pinch.startZoom = this.userZoom;
        } else if (distance > 0) {
          this.userZoom = clamp(
            this.pinch.startZoom * (distance / this.pinch.startDistance),
            MIN_USER_ZOOM,
            MAX_USER_ZOOM
          );
          this.applyCameraZoom();
        }
      }
    }

    releaseCanvasTouchPointer(event) {
      this.touchPoints.delete(event.pointerId);
      if (this.touchPoints.size < 2) {
        this.pinch.active = false;
        this.pinch.startDistance = 0;
        this.pinch.startZoom = this.userZoom;
      }
    }

    handleAppPinchTouch(event) {
      event.preventDefault();
      this.sound.unlock();

      const distance = this.getDistanceFromTouches(event.touches);
      if (!distance) return;

      if (!this.pinch.active) {
        this.pinch.active = true;
        this.pinch.startDistance = distance;
        this.pinch.startZoom = this.userZoom;
        return;
      }

      this.userZoom = clamp(
        this.pinch.startZoom * (distance / this.pinch.startDistance),
        MIN_USER_ZOOM,
        MAX_USER_ZOOM
      );
      this.applyCameraZoom();
    }

    handleAppPinchEnd() {
      this.pinch.active = false;
      this.pinch.startDistance = 0;
      this.pinch.startZoom = this.userZoom;
    }

    start() {
      this.state = 'playing';
      this.elapsed = 0;
      this.lastSurvived = 0;
      this.resultReason = 'lose';
      this.dashQueued = false;

      const center = WORLD_SIZE / 2;
      this.player = new Player(center + rand(-80, 80), center + rand(-80, 80));
      this.bots = [];
      this.traps = [];
      this.particles = [];
      this.projectiles = [];
      this.rockets = [];
      this.explosions = [];
      this.shootQueued = false;
      this.mouseDown = false;
      this.rocketQueued = false;
      this.rightMouseDown = false;
      this.resetJoystick();
      this.touchPoints.clear();
      this.pinch.active = false;
      this.userZoom = 1;
      this.applyCameraZoom();

      this.safeZone = new SafeZone(center, center);

      for (let i = 0; i < BOT_COUNT; i += 1) {
        let bx = center + rand(-360, 360);
        let by = center + rand(-360, 360);
        if (Math.hypot(bx - this.player.x, by - this.player.y) < 110) {
          bx += rand(120, 200);
          by += rand(120, 200);
        }
        this.bots.push(new Bot(bx, by));
      }

      for (let i = 0; i < TRAP_COUNT; i += 1) {
        this.traps.push(new Trap(rand(220, WORLD_SIZE - 220), rand(220, WORLD_SIZE - 220)));
      }

      this.showMenu(false);
      this.showResult(false);
      this.showHud(true);
      this.updateHud();
    }

    showMenu(visible) {
      menu.classList.toggle('visible', visible);
      menu.classList.toggle('hidden', !visible);
    }

    showResult(visible) {
      result.classList.toggle('visible', visible);
      result.classList.toggle('hidden', !visible);
    }

    showHud(visible) {
      hud.classList.toggle('hidden', !visible);
    }

    endMatch(win, reason) {
      this.state = 'result';
      this.resultReason = reason;
      this.lastSurvived = this.elapsed;
      this.showHud(false);
      this.showResult(true);

      if (win) {
        resultTitle.textContent = 'Victory';
        resultText.textContent = `You outlasted everyone in ${this.formatTime(this.lastSurvived)}.`;
      } else if (reason === 'timeout') {
        resultTitle.textContent = 'Time Up';
        resultText.textContent = `Match ended at ${this.formatTime(MAX_MATCH_TIME)}. Try to eliminate all bots faster.`;
      } else {
        resultTitle.textContent = 'Defeat';
        resultText.textContent = `You survived ${this.formatTime(this.lastSurvived)}.`;
      }
    }

    formatTime(totalSeconds) {
      const seconds = Math.max(0, Math.floor(totalSeconds));
      const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
      const ss = String(seconds % 60).padStart(2, '0');
      return `${mm}:${ss}`;
    }

    applyMovement(entity, dirX, dirY, speed, dt) {
      entity.x += dirX * speed * dt;
      entity.y += dirY * speed * dt;

      entity.x = clamp(entity.x, entity.radius, WORLD_SIZE - entity.radius);
      entity.y = clamp(entity.y, entity.radius, WORLD_SIZE - entity.radius);
    }

    updatePlayer(dt) {
      const player = this.player;
      if (!player.alive) return;

      const up = keys.w || keys.arrowup;
      const down = keys.s || keys.arrowdown;
      const left = keys.a || keys.arrowleft;
      const right = keys.d || keys.arrowright;

      let dirX = this.touchMove.active ? this.touchMove.x : 0;
      let dirY = this.touchMove.active ? this.touchMove.y : 0;

      if (up) dirY -= 1;
      if (down) dirY += 1;
      if (left) dirX -= 1;
      if (right) dirX += 1;

      const len = Math.hypot(dirX, dirY) || 1;
      dirX /= len;
      dirY /= len;

      if (Math.abs(dirX) > 0.01 || Math.abs(dirY) > 0.01) {
        player.lastDirX = dirX;
        player.lastDirY = dirY;
      }

      if (this.mouse.active) {
        const worldMouseX = this.mouse.x / this.camera.zoom + this.camera.x;
        const worldMouseY = this.mouse.y / this.camera.zoom + this.camera.y;
        const aimX = worldMouseX - player.x;
        const aimY = worldMouseY - player.y;
        const aimLen = Math.hypot(aimX, aimY);
        if (aimLen > 10) {
          player.lastDirX = aimX / aimLen;
          player.lastDirY = aimY / aimLen;
        }
      }

      if (isTouchDevice) {
        const target = this.findNearestBot(player.x, player.y);
        if (target) {
          const aimX = target.x - player.x;
          const aimY = target.y - player.y;
          const aimLen = Math.hypot(aimX, aimY);
          if (aimLen > 0) {
            player.lastDirX = aimX / aimLen;
            player.lastDirY = aimY / aimLen;
          }
        }
      }

      if (this.dashQueued && player.dashCooldown <= 0) {
        player.dashCooldown = PLAYER_DASH_COOLDOWN;
        player.dashTimer = PLAYER_DASH_DURATION;
        this.spawnDashParticles(player.x, player.y, player.lastDirX, player.lastDirY, '#88f7ff', 26);
        this.sound.dash();
      }
      this.dashQueued = false;

      if (player.dashCooldown > 0) player.dashCooldown -= dt;
      if (player.dashTimer > 0) player.dashTimer -= dt;
      if (player.shootCooldown > 0) player.shootCooldown -= dt;
      if (player.rocketCooldown > 0) player.rocketCooldown -= dt;

      if ((this.shootQueued || this.mouseDown) && player.shootCooldown <= 0) {
        this.shootProjectile(player);
      }
      if ((this.rocketQueued || this.rightMouseDown) && player.rocketCooldown <= 0) {
        this.shootRocket(player);
      }
      this.shootQueued = false;
      this.rocketQueued = false;

      const speed = player.dashTimer > 0 ? PLAYER_DASH_SPEED : PLAYER_SPEED;
      const moveX = Math.abs(dirX) > 0.01 || Math.abs(dirY) > 0.01 ? dirX : player.lastDirX * (player.dashTimer > 0 ? 1 : 0);
      const moveY = Math.abs(dirX) > 0.01 || Math.abs(dirY) > 0.01 ? dirY : player.lastDirY * (player.dashTimer > 0 ? 1 : 0);

      this.applyMovement(player, moveX, moveY, speed, dt);

      if (player.dashTimer > 0) {
        this.spawnDashParticles(player.x, player.y, -player.lastDirX, -player.lastDirY, '#5ce9ff', 2);
      }
    }

    findNearestBot(x, y) {
      let nearest = null;
      let bestDist = Infinity;
      for (const bot of this.bots) {
        if (!bot.alive) continue;
        const dist = Math.hypot(bot.x - x, bot.y - y);
        if (dist < bestDist) {
          bestDist = dist;
          nearest = bot;
        }
      }
      return nearest;
    }

    shootProjectile(player) {
      player.shootCooldown = PLAYER_SHOOT_COOLDOWN;
      const muzzleDistance = player.radius + 8;
      const bulletX = player.x + player.lastDirX * muzzleDistance;
      const bulletY = player.y + player.lastDirY * muzzleDistance;
      const vx = player.lastDirX * PROJECTILE_SPEED;
      const vy = player.lastDirY * PROJECTILE_SPEED;

      this.projectiles.push(new Projectile(bulletX, bulletY, vx, vy));
      this.spawnDashParticles(bulletX, bulletY, player.lastDirX, player.lastDirY, '#b5fdff', 5);
      this.sound.shoot();
    }

    shootRocket(player) {
      player.rocketCooldown = PLAYER_ROCKET_COOLDOWN;
      const muzzleDistance = player.radius + 12;
      const rocketX = player.x + player.lastDirX * muzzleDistance;
      const rocketY = player.y + player.lastDirY * muzzleDistance;
      const vx = player.lastDirX * ROCKET_SPEED;
      const vy = player.lastDirY * ROCKET_SPEED;

      this.rockets.push(new Rocket(rocketX, rocketY, vx, vy));
      this.spawnDashParticles(rocketX, rocketY, -player.lastDirX, -player.lastDirY, '#ffb36c', 10);
      this.sound.rocket();
    }

    updateBots(dt) {
      for (const bot of this.bots) {
        if (!bot.alive) continue;

        bot.aiTimer -= dt;
        if (bot.aiTimer <= 0) bot.chooseDirection();

        const toCenterX = this.safeZone.centerX - bot.x;
        const toCenterY = this.safeZone.centerY - bot.y;
        const distToCenter = Math.hypot(toCenterX, toCenterY);

        let dirX = bot.targetX;
        let dirY = bot.targetY;

        const panicDistance = this.safeZone.radius * 0.76;
        if (distToCenter > panicDistance) {
          const len = distToCenter || 1;
          dirX = toCenterX / len;
          dirY = toCenterY / len;
        }

        bot.lastDirX = dirX;
        bot.lastDirY = dirY;

        this.applyMovement(bot, dirX, dirY, bot.speed, dt);
      }
    }

    updateParticles(dt) {
      for (const p of this.particles) p.update(dt);
      this.particles = this.particles.filter((p) => p.life > 0);
    }

    updateProjectiles(dt) {
      for (const projectile of this.projectiles) {
        if (!projectile.alive) continue;
        projectile.update(dt);

        for (const bot of this.bots) {
          if (!bot.alive || !projectile.alive) continue;
          const dx = bot.x - projectile.x;
          const dy = bot.y - projectile.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= bot.radius + projectile.radius) {
            bot.takeDamage(PROJECTILE_DAMAGE);
            projectile.alive = false;
            this.spawnHitSparks(projectile.x, projectile.y, dx / (dist || 1), dy / (dist || 1));
            this.sound.hit();
          }
        }
      }

      this.projectiles = this.projectiles.filter((projectile) => projectile.alive);
    }

    explodeRocket(x, y) {
      this.explosions.push(new Explosion(x, y, ROCKET_BLAST_RADIUS));
      this.spawnDashParticles(x, y, 0, 0, '#ff9d54', 36);
      this.spawnDashParticles(x, y, 0, 0, '#ffe0a8', 24);
      this.sound.explosion();

      for (const bot of this.bots) {
        if (!bot.alive) continue;
        const dist = Math.hypot(bot.x - x, bot.y - y);
        if (dist <= ROCKET_BLAST_RADIUS) {
          const factor = 1 - dist / ROCKET_BLAST_RADIUS;
          bot.takeDamage(ROCKET_BLAST_DAMAGE * factor);
        }
      }
    }

    updateRockets(dt) {
      for (const rocket of this.rockets) {
        if (!rocket.alive) continue;
        rocket.update(dt);

        const len = Math.hypot(rocket.vx, rocket.vy) || 1;
        const dirX = rocket.vx / len;
        const dirY = rocket.vy / len;
        this.spawnDashParticles(
          rocket.x - dirX * 10,
          rocket.y - dirY * 10,
          -dirX,
          -dirY,
          Math.random() > 0.45 ? '#ff9b48' : '#ffdba4',
          2
        );

        if (!rocket.alive) {
          this.explodeRocket(rocket.x, rocket.y);
          continue;
        }

        for (const bot of this.bots) {
          if (!bot.alive || !rocket.alive) continue;
          const dx = bot.x - rocket.x;
          const dy = bot.y - rocket.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= bot.radius + rocket.radius) {
            bot.takeDamage(ROCKET_DIRECT_DAMAGE);
            rocket.alive = false;
            this.explodeRocket(rocket.x, rocket.y);
          }
        }
      }

      this.rockets = this.rockets.filter((rocket) => rocket.alive);
    }

    updateExplosions(dt) {
      for (const explosion of this.explosions) explosion.update(dt);
      this.explosions = this.explosions.filter((explosion) => explosion.life > 0);
    }

    spawnDashParticles(x, y, dirX, dirY, color, amount) {
      for (let i = 0; i < amount; i += 1) {
        const spreadX = rand(-1.2, 1.2) - dirX * rand(0.8, 2.4);
        const spreadY = rand(-1.2, 1.2) - dirY * rand(0.8, 2.4);
        this.particles.push(new Particle(x, y, spreadX * 140, spreadY * 140, rand(0.12, 0.34), rand(2, 5), color));
      }
    }

    spawnHitSparks(x, y, dirX, dirY) {
      for (let i = 0; i < 14; i += 1) {
        const sx = rand(-1.4, 1.4) + dirX * rand(0.2, 1.8);
        const sy = rand(-1.4, 1.4) + dirY * rand(0.2, 1.8);
        const color = Math.random() > 0.45 ? '#ffd774' : '#ff9f55';
        this.particles.push(new Particle(x, y, sx * 170, sy * 170, rand(0.12, 0.28), rand(1.8, 3.8), color));
      }
    }

    applyZoneDamage(dt) {
      const progress = this.safeZone.getProgress();
      const zoneDamagePerSecond = 7 + progress * 15;

      const entities = [this.player, ...this.bots];
      for (const entity of entities) {
        if (!entity.alive) continue;

        const dist = Math.hypot(entity.x - this.safeZone.centerX, entity.y - this.safeZone.centerY);
        const outside = dist > this.safeZone.radius - entity.radius;
        if (outside) entity.takeDamage(zoneDamagePerSecond * dt);
      }
    }

    applyTrapDamage(dt) {
      const entities = [this.player, ...this.bots];
      const trapDamage = 22;

      for (const trap of this.traps) {
        for (const entity of entities) {
          if (!entity.alive) continue;
          const dist = Math.hypot(entity.x - trap.x, entity.y - trap.y);
          if (dist < trap.radius + entity.radius) {
            entity.takeDamage(trapDamage * dt);
          }
        }
      }
    }

    applyCollisionDamage(dt) {
      if (!this.player.alive) return;
      const damagePerSecond = 10;

      for (const bot of this.bots) {
        if (!bot.alive) continue;

        const dx = bot.x - this.player.x;
        const dy = bot.y - this.player.y;
        const dist = Math.hypot(dx, dy) || 1;
        const minDist = bot.radius + this.player.radius;

        if (dist < minDist) {
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          this.player.x -= nx * overlap * 0.5;
          this.player.y -= ny * overlap * 0.5;
          bot.x += nx * overlap * 0.5;
          bot.y += ny * overlap * 0.5;

          this.player.takeDamage(damagePerSecond * dt);
          bot.takeDamage(damagePerSecond * 0.75 * dt);

          this.spawnDashParticles((this.player.x + bot.x) * 0.5, (this.player.y + bot.y) * 0.5, nx, ny, '#ff9d7b', 1);
        }
      }
    }

    updateCamera() {
      if (!this.player) return;
      const viewWidth = canvas.width / this.camera.zoom;
      const viewHeight = canvas.height / this.camera.zoom;
      const halfW = viewWidth / 2;
      const halfH = viewHeight / 2;
      this.camera.x = clamp(this.player.x - halfW, 0, Math.max(0, WORLD_SIZE - viewWidth));
      this.camera.y = clamp(this.player.y - halfH, 0, Math.max(0, WORLD_SIZE - viewHeight));
    }

    updateHud() {
      if (!this.player) return;
      const aliveBots = this.bots.filter((b) => b.alive).length;
      const totalAlive = aliveBots + (this.player.alive ? 1 : 0);

      hpBar.style.width = `${this.player.hp}%`;
      hpText.textContent = `${Math.ceil(this.player.hp)}`;
      playersLeft.textContent = `${totalAlive}`;
      timerText.textContent = this.formatTime(Math.min(this.elapsed, MAX_MATCH_TIME));

      if (this.player.dashCooldown <= 0) {
        dashText.textContent = 'Ready';
        dashText.style.color = '#76ffbe';
      } else {
        dashText.textContent = `${this.player.dashCooldown.toFixed(1)}s`;
        dashText.style.color = '#ffd56e';
      }

      if (this.player.shootCooldown <= 0) {
        shootText.textContent = 'Ready';
        shootText.style.color = '#7ef5ff';
      } else {
        shootText.textContent = `${this.player.shootCooldown.toFixed(1)}s`;
        shootText.style.color = '#ffd56e';
      }

      if (this.player.rocketCooldown <= 0) {
        rocketText.textContent = 'Ready';
        rocketText.style.color = '#ffa86c';
      } else {
        rocketText.textContent = `${this.player.rocketCooldown.toFixed(1)}s`;
        rocketText.style.color = '#ffd56e';
      }

      const rocketReadyRatio = clamp(1 - this.player.rocketCooldown / PLAYER_ROCKET_COOLDOWN, 0, 1);
      rocketCdBar.style.width = `${rocketReadyRatio * 100}%`;
    }

    checkEndConditions() {
      const aliveBots = this.bots.filter((b) => b.alive).length;

      if (!this.player.alive) {
        this.endMatch(false, 'death');
        return;
      }

      if (aliveBots <= 0) {
        this.endMatch(true, 'win');
        return;
      }

      if (this.elapsed >= MAX_MATCH_TIME) {
        this.endMatch(false, 'timeout');
      }
    }

    update(dt) {
      if (this.state !== 'playing') return;

      this.elapsed += dt;
      this.safeZone.update(dt);

      this.updatePlayer(dt);
      this.updateBots(dt);
      this.updateProjectiles(dt);
      this.updateRockets(dt);
      this.applyCollisionDamage(dt);
      this.applyTrapDamage(dt);
      this.applyZoneDamage(dt);
      this.updateExplosions(dt);
      this.updateParticles(dt);
      this.updateCamera();
      this.updateHud();
      this.checkEndConditions();
    }

    drawBackground() {
      const viewWidth = canvas.width / this.camera.zoom;
      const viewHeight = canvas.height / this.camera.zoom;
      const grad = ctx.createLinearGradient(0, 0, viewWidth, viewHeight);
      grad.addColorStop(0, '#090f24');
      grad.addColorStop(0.5, '#0b1734');
      grad.addColorStop(1, '#080c1a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, viewWidth, viewHeight);

      const gridSize = 70;
      const startX = -((this.camera.x % gridSize) + gridSize);
      const startY = -((this.camera.y % gridSize) + gridSize);

      ctx.save();
      ctx.strokeStyle = 'rgba(78, 246, 255, 0.08)';
      ctx.lineWidth = 1;

      for (let x = startX; x < viewWidth + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, viewHeight);
        ctx.stroke();
      }

      for (let y = startY; y < viewHeight + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(viewWidth, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawMapBounds() {
      const x = -this.camera.x;
      const y = -this.camera.y;
      ctx.save();
      ctx.strokeStyle = 'rgba(120, 170, 255, 0.35)';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, WORLD_SIZE, WORLD_SIZE);
      ctx.restore();
    }

    drawDangerZone() {
      const viewWidth = canvas.width / this.camera.zoom;
      const viewHeight = canvas.height / this.camera.zoom;
      const sx = this.safeZone.centerX - this.camera.x;
      const sy = this.safeZone.centerY - this.camera.y;
      const pulse = 0.08 + 0.05 * Math.sin(performance.now() / 260);

      ctx.save();
      ctx.fillStyle = `rgba(255, 45, 98, ${0.14 + pulse})`;
      ctx.beginPath();
      ctx.rect(0, 0, viewWidth, viewHeight);
      ctx.arc(sx, sy, this.safeZone.radius, 0, Math.PI * 2, true);
      ctx.fill('evenodd');

      ctx.strokeStyle = 'rgba(255, 112, 152, 0.95)';
      ctx.shadowColor = '#ff4a7f';
      ctx.shadowBlur = 16;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(sx, sy, this.safeZone.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    drawTrap(trap) {
      const sx = trap.x - this.camera.x;
      const sy = trap.y - this.camera.y;
      const pulse = 1 + Math.sin(performance.now() / 260 + trap.phase) * 0.14;

      ctx.save();
      ctx.shadowColor = '#ff7a3f';
      ctx.shadowBlur = 14;
      ctx.fillStyle = 'rgba(255, 124, 61, 0.74)';
      ctx.beginPath();
      ctx.arc(sx, sy, trap.radius * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 235, 178, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, trap.radius * 0.66 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    drawEntity(entity, isPlayer = false) {
      if (!entity.alive) return;
      const sx = entity.x - this.camera.x;
      const sy = entity.y - this.camera.y;
      const dirX = (isPlayer ? this.player.lastDirX : entity.lastDirX) || 0;
      const dirY = (isPlayer ? this.player.lastDirY : entity.lastDirY) || 1;
      const angle = Math.atan2(dirY, dirX) + Math.PI / 2;
      const bodyColor = isPlayer ? '#6df3ff' : '#ff7acb';
      const armorColor = isPlayer ? '#163a56' : '#5a2553';
      const glowColor = isPlayer ? '#67f4ff' : '#ff77cf';
      const renderRadius = entity.radius * (isTouchDevice ? 1.16 : 1.08);

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle);
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = isPlayer ? 18 : 12;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
      ctx.beginPath();
      ctx.ellipse(0, renderRadius * 0.8, renderRadius * 0.9, renderRadius * 0.56, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = armorColor;
      ctx.beginPath();
      ctx.ellipse(0, renderRadius * 0.12, renderRadius * 0.82, renderRadius * 1.02, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(0, renderRadius * 0.1, renderRadius * 0.56, renderRadius * 0.76, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = armorColor;
      ctx.beginPath();
      ctx.arc(-renderRadius * 0.55, renderRadius * 0.02, renderRadius * 0.22, 0, Math.PI * 2);
      ctx.arc(renderRadius * 0.55, renderRadius * 0.02, renderRadius * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffd7b5';
      ctx.beginPath();
      ctx.arc(0, -renderRadius * 0.76, renderRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#f5fbff';
      ctx.lineWidth = isTouchDevice ? 3.8 : 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -renderRadius * 0.04);
      ctx.lineTo(0, -renderRadius * 1.28);
      ctx.stroke();

      if (isPlayer) {
        ctx.strokeStyle = '#9efcff';
        ctx.lineWidth = isTouchDevice ? 4.2 : 3.4;
        ctx.beginPath();
        ctx.moveTo(0, -renderRadius * 1.28);
        ctx.lineTo(0, -renderRadius * 1.62);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, renderRadius * 0.92, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      if (!isPlayer) {
        const hpRatio = clamp(entity.hp / entity.maxHp, 0, 1);
        const barW = 28;
        const barH = 5;
        const barX = sx - barW * 0.5;
        const barY = sy - renderRadius - 16;

        ctx.save();
        ctx.fillStyle = 'rgba(4, 10, 24, 0.85)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = hpRatio > 0.45 ? '#6eff9d' : hpRatio > 0.2 ? '#ffd773' : '#ff6f7c';
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
        ctx.strokeStyle = 'rgba(180, 226, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);
        ctx.restore();
      }
    }

    drawProjectile(projectile) {
      const sx = projectile.x - this.camera.x;
      const sy = projectile.y - this.camera.y;
      ctx.save();
      ctx.shadowColor = '#92f8ff';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#d8feff';
      ctx.beginPath();
      ctx.arc(sx, sy, projectile.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawRocket(rocket) {
      const sx = rocket.x - this.camera.x;
      const sy = rocket.y - this.camera.y;
      const angle = Math.atan2(rocket.vy, rocket.vx);
      const pulse = 0.8 + Math.sin(performance.now() / 80) * 0.2;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle);

      ctx.shadowColor = '#ffb366';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ffc988';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-8, -4.5);
      ctx.lineTo(-8, 4.5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ff6f5f';
      ctx.beginPath();
      ctx.moveTo(-8, -3.2);
      ctx.lineTo(-14 - pulse * 4, 0);
      ctx.lineTo(-8, 3.2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    drawMatch() {
      ctx.save();
      ctx.scale(this.camera.zoom, this.camera.zoom);

      this.drawBackground();
      this.drawMapBounds();

      for (const trap of this.traps) this.drawTrap(trap);

      this.drawDangerZone();

      for (const projectile of this.projectiles) this.drawProjectile(projectile);
      for (const rocket of this.rockets) this.drawRocket(rocket);
      for (const bot of this.bots) this.drawEntity(bot, false);
      this.drawEntity(this.player, true);
      for (const explosion of this.explosions) explosion.draw(ctx, this.camera);

      for (const p of this.particles) p.draw(ctx, this.camera);
      ctx.restore();
    }

    drawMenuBackground() {
      this.drawBackground();
      const t = performance.now() / 1000;
      ctx.save();
      ctx.strokeStyle = 'rgba(78, 246, 255, 0.25)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(canvas.width * 0.5, canvas.height * 0.5, 180 + Math.sin(t * 1.4) * 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    render() {
      if (this.state === 'playing' || this.state === 'result') {
        this.drawMatch();
      } else {
        this.drawMenuBackground();
      }
    }

    loop(time) {
      if (!this.lastTime) this.lastTime = time;
      const dt = Math.min(0.033, (time - this.lastTime) / 1000);
      this.lastTime = time;

      this.update(dt);
      this.render();
      requestAnimationFrame(this.loop);
    }
  }

  const game = new Game();
  game.showMenu(true);
  game.showHud(false);
  game.showResult(false);
})();
