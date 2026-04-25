import { BALANCE_CONFIG } from '../config/balanceConfig.js';
import { normalize } from '../utils/geometry.js';
import { rand } from '../utils/random.js';
import { Entity } from './player.js';

// ==================================================
// BOT ENTITY
// ==================================================

export class Bot extends Entity {
  constructor(x, y) {
    super(x, y, BALANCE_CONFIG.botRadius, '#ff71c6');
    this.maxHp = BALANCE_CONFIG.botMaxHp;
    this.hp = BALANCE_CONFIG.botMaxHp;
    this.speed = rand(BALANCE_CONFIG.botMinSpeed, BALANCE_CONFIG.botMaxSpeed);
    this.aiTimer = 0;
    this.targetX = rand(-1, 1);
    this.targetY = rand(-1, 1);
    this.lastDirX = 0;
    this.lastDirY = 1;
  }

  chooseDirection() {
    this.aiTimer = rand(0.4, 1.2);
    const direction = normalize(rand(-1, 1), rand(-1, 1));
    this.targetX = direction.x;
    this.targetY = direction.y;
  }
}
