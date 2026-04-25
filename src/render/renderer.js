import { drawBackground, drawDangerZone, drawMapBounds, drawTrap } from './drawArena.js';
import { drawEntity, drawProjectile, drawRocket } from './drawEntities.js';
import { drawExplosions, drawParticles } from './drawEffects.js';
import { drawMenuBackgroundDecorations } from './drawHud.js';

// ==================================================
// FRAME RENDERER
// ==================================================

export function renderGame(game) {
  if (game.state === 'playing' || game.state === 'result') {
    game.ctx.save();
    game.ctx.scale(game.camera.zoom, game.camera.zoom);
    drawBackground(game);
    drawMapBounds(game);

    for (const trap of game.traps) drawTrap(game, trap);
    drawDangerZone(game);
    for (const projectile of game.projectiles) drawProjectile(game, projectile);
    for (const rocket of game.rockets) drawRocket(game, rocket);
    for (const bot of game.bots) drawEntity(game, bot, false);
    drawEntity(game, game.player, true);
    drawExplosions(game);
    drawParticles(game);
    game.ctx.restore();
    return;
  }

  drawBackground(game);
  drawMenuBackgroundDecorations(game);
}
