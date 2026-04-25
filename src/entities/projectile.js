import { BALANCE_CONFIG } from '../config/balanceConfig.js';
import { GAME_CONFIG } from '../config/gameConfig.js';

// ==================================================
// PROJECTILE ENTITY
// ==================================================

export class Projectile {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = BALANCE_CONFIG.projectileRadius;
    this.life = BALANCE_CONFIG.projectileLifetime;
    this.alive = true;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0) this.alive = false;
    if (
      this.x < 0 ||
      this.x > GAME_CONFIG.worldSize ||
      this.y < 0 ||
      this.y > GAME_CONFIG.worldSize
    ) {
      this.alive = false;
    }
  }
}
