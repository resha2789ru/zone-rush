import { distance, normalize } from '../utils/geometry.js';

// ==================================================
// BOT MOVEMENT AND TARGETING
// ==================================================

export function findNearestBot(game, x, y) {
  let nearest = null;
  let bestDistance = Infinity;

  for (const bot of game.bots) {
    if (!bot.alive) continue;
    const currentDistance = distance(x, y, bot.x, bot.y);
    if (currentDistance < bestDistance) {
      bestDistance = currentDistance;
      nearest = bot;
    }
  }

  return nearest;
}

export function updateBots(game, dt) {
  for (const bot of game.bots) {
    if (!bot.alive) continue;

    bot.aiTimer -= dt;
    if (bot.aiTimer <= 0) bot.chooseDirection();

    const toCenter = normalize(game.safeZone.centerX - bot.x, game.safeZone.centerY - bot.y);
    let dirX = bot.targetX;
    let dirY = bot.targetY;

    const panicDistance = game.safeZone.radius * 0.76;
    if (toCenter.length > panicDistance) {
      dirX = toCenter.x;
      dirY = toCenter.y;
    }

    bot.lastDirX = dirX;
    bot.lastDirY = dirY;
    game.applyMovement(bot, dirX, dirY, bot.speed, dt);
  }
}
