import { BALANCE_CONFIG } from '../config/balanceConfig.js';

// ==================================================
// BASE ENTITY TYPES
// ==================================================

export class Entity {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.maxHp = BALANCE_CONFIG.playerMaxHp;
    this.hp = BALANCE_CONFIG.playerMaxHp;
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

// ==================================================
// PLAYER ENTITY
// ==================================================

export class Player extends Entity {
  constructor(x, y) {
    super(x, y, BALANCE_CONFIG.playerRadius, '#62f6ff');
    this.lastDirX = 1;
    this.lastDirY = 0;
    this.dashCooldown = 0;
    this.dashTimer = 0;
    this.shootCooldown = 0;
    this.rocketCooldown = 0;
  }
}
