// ==================================================
// GAME LOOP
// ==================================================

export function startLoop(game) {
  const step = (time) => {
    if (!game.lastTime) game.lastTime = time;
    const dt = Math.min(0.033, (time - game.lastTime) / 1000);
    game.lastTime = time;
    game.update(dt);
    game.render();
    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}
