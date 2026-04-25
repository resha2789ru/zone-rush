import { GAME_CONFIG } from '../config/gameConfig.js';
import { Bot } from '../entities/bot.js';
import { Player } from '../entities/player.js';
import { createSafeZone, createTrap } from './zoneSystem.js';
import { resetJoystick } from './mobileSystem.js';
import { rand } from '../utils/random.js';
import { showHud, updateHud } from '../ui/hud.js';
import { showMenu } from '../ui/menu.js';
import { showResult } from '../ui/resultScreen.js';

// ==================================================
// MATCH SETUP AND SPAWNING
// ==================================================

export function startMatch(game) {
  game.state = 'playing';
  game.elapsed = 0;
  game.lastSurvived = 0;
  game.resultReason = 'lose';
  game.dashQueued = false;
  game.lastTime = 0;

  const center = GAME_CONFIG.worldSize / 2;
  game.player = new Player(center + rand(-80, 80), center + rand(-80, 80));
  game.bots = [];
  game.traps = [];
  game.particles = [];
  game.projectiles = [];
  game.rockets = [];
  game.explosions = [];
  game.shootQueued = false;
  game.mouseDown = false;
  game.rocketQueued = false;
  game.rightMouseDown = false;
  resetJoystick(game);
  game.touchPoints.clear();
  game.pinch.active = false;
  game.userZoom = 1;
  game.applyCameraZoom();

  game.safeZone = createSafeZone(center, center);

  for (let index = 0; index < GAME_CONFIG.startingBots; index += 1) {
    let bx = center + rand(-360, 360);
    let by = center + rand(-360, 360);
    if (Math.hypot(bx - game.player.x, by - game.player.y) < 110) {
      bx += rand(120, 200);
      by += rand(120, 200);
    }
    game.bots.push(new Bot(bx, by));
  }

  for (let index = 0; index < GAME_CONFIG.trapCount; index += 1) {
    game.traps.push(
      createTrap(rand(220, GAME_CONFIG.worldSize - 220), rand(220, GAME_CONFIG.worldSize - 220))
    );
  }

  showMenu(game.dom, false);
  showResult(game.dom, false);
  showHud(game.dom, true);
  updateHud(game);
}
