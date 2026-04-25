import { GAME_CONFIG } from '../config/gameConfig.js';
import { Particle } from '../entities/particles.js';
import { renderGame } from '../render/renderer.js';
import { SoundManager } from '../systems/audioSystem.js';
import { updateBots } from '../systems/botSystem.js';
import { updateProjectiles, updateRockets } from '../systems/combatSystem.js';
import { applyCollisionDamage } from '../systems/collisionSystem.js';
import { resizeCanvas, updateResponsiveUi, updateViewportInsets } from '../systems/mobileSystem.js';
import { applyTrapDamage, applyZoneDamage, updateSafeZone } from '../systems/zoneSystem.js';
import { clamp } from '../utils/math.js';
import { rand } from '../utils/random.js';
import { showMobileControls } from '../ui/mobileControls.js';
import { applyCameraZoom, updateCamera } from './camera.js';
import { bindInput } from './input.js';
import { startLoop } from './loop.js';
import { createGameState } from './state.js';
import { updatePlayer } from '../systems/playerSystem.js';
import { startMatch } from '../systems/spawnSystem.js';
import { checkEndConditions } from '../systems/matchSystem.js';
import { updateHud } from '../ui/hud.js';

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
    startMatch(this);
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

  update(dt) {
    if (this.state !== 'playing') return;

    this.elapsed += dt;
    updateSafeZone(this, dt);
    updatePlayer(this, dt);
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
    checkEndConditions(this);
  }

  render() {
    renderGame(this);
  }
}
