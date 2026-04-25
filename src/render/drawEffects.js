// ==================================================
// PARTICLE AND EXPLOSION RENDERING
// ==================================================

export function drawExplosions(game) {
  for (const explosion of game.explosions) {
    explosion.draw(game.ctx, game.camera);
  }
}

export function drawParticles(game) {
  for (const particle of game.particles) {
    particle.draw(game.ctx, game.camera);
  }
}
