import { BALANCE_CONFIG } from '../config/balanceConfig.js';
import { CONTROLS_CONFIG } from '../config/controlsConfig.js';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { Bot } from '../entities/bot.js';
import { Particle } from '../entities/particles.js';
import { Player } from '../entities/player.js';
import { renderGame } from '../render/renderer.js';
import { SoundManager } from '../systems/audioSystem.js';
import { findNearestBot, updateBots } from '../systems/botSystem.js';
import { shootProjectile, shootRocket, updateProjectiles, updateRockets } from '../systems/combatSystem.js';
import { applyCollisionDamage } from '../systems/collisionSystem.js';
import { resetJoystick, resizeCanvas, updateResponsiveUi, updateViewportInsets } from '../systems/mobileSystem.js';
import { applyTrapDamage, applyZoneDamage, createSafeZone, createTrap, updateSafeZone } from '../systems/zoneSystem.js';
import { clamp } from '../utils/math.js';
import { normalize } from '../utils/geometry.js';
import { rand } from '../utils/random.js';
import { showHud, updateHud } from '../ui/hud.js';
import { showMenu } from '../ui/menu.js';
import { showMobileControls } from '../ui/mobileControls.js';
import { showResult, updateResultScreen } from '../ui/resultScreen.js';
import { applyCameraZoom, updateCamera } from './camera.js';
import { bindInput } from './input.js';
import { startLoop } from './loop.js';
import { createGameState } from './state.js';

// ==================================================
// MAIN GAME ORCHESTRATOR
// ==================================================

export class Game {
  constructor(dom) {
    this.dom = dom;
    this.canvas = dom.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundManager();

    Object.assign(this, createGameState(this.canvas));

    bindInput(this);
    resizeCanvas(this);
    updateResponsiveUi(this);
    updateViewportInsets();
    showMobileControls(this.dom, this.isTouchDevice);
    startLoop(this);
  }

  applyCameraZoom() {
    applyCameraZoom(this);
  }

  applyMovement(entity, dirX, dirY, speed, dt) {
    entity.x += dirX * speed * dt;
    entity.y += dirY * speed * dt;
    entity.x = clamp(entity.x, entity.radius, GAME_CONFIG.worldSize - entity.radius);
    entity.y = clamp(entity.y, entity.radius, GAME_CONFIG.worldSize - entity.radius);
  }

  start() {
    // ==================================================
    // MATCH RESET AND SPAWN SETUP
    // ==================================================

    this.state = 'playing';
    this.elapsed = 0;
    this.lastSurvived = 0;
    this.resultReason = 'lose';
    this.dashQueued = false;
    this.lastTime = 0;

    const center = GAME_CONFIG.worldSize / 2;
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
    resetJoystick(this);
    this.touchPoints.clear();
    this.pinch.active = false;
    this.userZoom = 1;
    this.applyCameraZoom();

    this.safeZone = createSafeZone(center, center);

    for (let index = 0; index < GAME_CONFIG.startingBots; index += 1) {
      let bx = center + rand(-360, 360);
      let by = center + rand(-360, 360);
      if (Math.hypot(bx - this.player.x, by - this.player.y) < 110) {
        bx += rand(120, 200);
        by += rand(120, 200);
      }
      this.bots.push(new Bot(bx, by));
    }

    for (let index = 0; index < GAME_CONFIG.trapCount; index += 1) {
      this.traps.push(
        createTrap(rand(220, GAME_CONFIG.worldSize - 220), rand(220, GAME_CONFIG.worldSize - 220))
      );
    }

    showMenu(this.dom, false);
    showResult(this.dom, false);
    showHud(this.dom, true);
    updateHud(this);
  }

  endMatch(win, reason) {
    this.state = 'result';
    this.resultReason = reason;
    this.lastSurvived = this.elapsed;
    showHud(this.dom, false);
    showResult(this.dom, true);
    updateResultScreen(this, win, reason);
  }

  updatePlayer(dt) {
    // ==================================================
    // PLAYER MOVEMENT AND ACTIONS
    // ==================================================

    const player = this.player;
    if (!player?.alive) return;

    const up = CONTROLS_CONFIG.moveUp.some((key) => this.keys[key]);
    const down = CONTROLS_CONFIG.moveDown.some((key) => this.keys[key]);
    const left = CONTROLS_CONFIG.moveLeft.some((key) => this.keys[key]);
    const right = CONTROLS_CONFIG.moveRight.some((key) => this.keys[key]);

    let dirX = this.touchMove.active ? this.touchMove.x : 0;
    let dirY = this.touchMove.active ? this.touchMove.y : 0;

    if (up) dirY -= 1;
    if (down) dirY += 1;
    if (left) dirX -= 1;
    if (right) dirX += 1;

    const moveDirection = normalize(dirX, dirY);
    dirX = moveDirection.x;
    dirY = moveDirection.y;

    if (Math.abs(dirX) > 0.01 || Math.abs(dirY) > 0.01) {
      player.lastDirX = dirX;
      player.lastDirY = dirY;
    }

    if (this.mouse.active) {
      const worldMouseX = this.mouse.x / this.camera.zoom + this.camera.x;
      const worldMouseY = this.mouse.y / this.camera.zoom + this.camera.y;
      const aimDirection = normalize(worldMouseX - player.x, worldMouseY - player.y);
      if (aimDirection.length > 10) {
        player.lastDirX = aimDirection.x;
        player.lastDirY = aimDirection.y;
      }
    }

    if (this.isTouchDevice) {
      const target = findNearestBot(this, player.x, player.y);
      if (target) {
        const aimDirection = normalize(target.x - player.x, target.y - player.y);
        if (aimDirection.length > 0) {
          player.lastDirX = aimDirection.x;
          player.lastDirY = aimDirection.y;
        }
      }
    }

    if (this.dashQueued && player.dashCooldown <= 0) {
      player.dashCooldown = BALANCE_CONFIG.playerDashCooldown;
      player.dashTimer = BALANCE_CONFIG.playerDashDuration;
      this.spawnDashParticles(player.x, player.y, player.lastDirX, player.lastDirY, '#88f7ff', 26);
      this.sound.dash();
    }
    this.dashQueued = false;

    if (player.dashCooldown > 0) player.dashCooldown -= dt;
    if (player.dashTimer > 0) player.dashTimer -= dt;
    if (player.shootCooldown > 0) player.shootCooldown -= dt;
    if (player.rocketCooldown > 0) player.rocketCooldown -= dt;

    if ((this.shootQueued || this.mouseDown) && player.shootCooldown <= 0) {
      shootProjectile(this, player);
    }
    if ((this.rocketQueued || this.rightMouseDown) && player.rocketCooldown <= 0) {
      shootRocket(this, player);
    }
    this.shootQueued = false;
    this.rocketQueued = false;

    const speed = player.dashTimer > 0 ? BALANCE_CONFIG.playerDashSpeed : BALANCE_CONFIG.playerSpeed;
    const moveX =
      Math.abs(dirX) > 0.01 || Math.abs(dirY) > 0.01
        ? dirX
        : player.lastDirX * (player.dashTimer > 0 ? 1 : 0);
    const moveY =
      Math.abs(dirX) > 0.01 || Math.abs(dirY) > 0.01
        ? dirY
        : player.lastDirY * (player.dashTimer > 0 ? 1 : 0);

    this.applyMovement(player, moveX, moveY, speed, dt);

    if (player.dashTimer > 0) {
      this.spawnDashParticles(player.x, player.y, -player.lastDirX, -player.lastDirY, '#5ce9ff', 2);
    }
  }

  spawnDashParticles(x, y, dirX, dirY, color, amount) {
    for (let index = 0; index < amount; index += 1) {
      const spreadX = rand(-1.2, 1.2) - dirX * rand(0.8, 2.4);
      const spreadY = rand(-1.2, 1.2) - dirY * rand(0.8, 2.4);
      this.particles.push(
        new Particle(x, y, spreadX * 140, spreadY * 140, rand(0.12, 0.34), rand(2, 5), color)
      );
    }
  }

  spawnHitSparks(x, y, dirX, dirY) {
    for (let index = 0; index < 14; index += 1) {
      const sx = rand(-1.4, 1.4) + dirX * rand(0.2, 1.8);
      const sy = rand(-1.4, 1.4) + dirY * rand(0.2, 1.8);
      const color = Math.random() > 0.45 ? '#ffd774' : '#ff9f55';
      this.particles.push(
        new Particle(x, y, sx * 170, sy * 170, rand(0.12, 0.28), rand(1.8, 3.8), color)
      );
    }
  }

  updateParticles(dt) {
    for (const particle of this.particles) particle.update(dt);
    this.particles = this.particles.filter((particle) => particle.life > 0);
  }

  updateExplosions(dt) {
    for (const explosion of this.explosions) explosion.update(dt);
    this.explosions = this.explosions.filter((explosion) => explosion.life > 0);
  }

  checkEndConditions() {
    const aliveBots = this.bots.filter((bot) => bot.alive).length;

    if (!this.player.alive) {
      this.endMatch(false, 'death');
      return;
    }

    if (aliveBots <= 0) {
      this.endMatch(true, 'win');
      return;
    }

    if (this.elapsed >= GAME_CONFIG.matchDuration) {
      this.endMatch(false, 'timeout');
    }
  }

  update(dt) {
    if (this.state !== 'playing') return;

    this.elapsed += dt;
    updateSafeZone(this, dt);
    this.updatePlayer(dt);
    updateBots(this, dt);
    updateProjectiles(this, dt);
    updateRockets(this, dt);
    applyCollisionDamage(this, dt);
    applyTrapDamage(this, dt);
    applyZoneDamage(this, dt);
    this.updateExplosions(dt);
    this.updateParticles(dt);
    updateCamera(this);
    updateHud(this);
    this.checkEndConditions();
  }

  render() {
    renderGame(this);
  }
}
