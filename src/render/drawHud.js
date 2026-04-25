// ==================================================
// SCREEN-SPACE DECORATION
// ==================================================

export function drawMenuBackgroundDecorations(game) {
  const time = performance.now() / 1000;
  game.ctx.save();
  game.ctx.strokeStyle = 'rgba(78, 246, 255, 0.25)';
  game.ctx.lineWidth = 3;
  game.ctx.beginPath();
  game.ctx.arc(
    game.canvas.width * 0.5,
    game.canvas.height * 0.5,
    180 + Math.sin(time * 1.4) * 16,
    0,
    Math.PI * 2
  );
  game.ctx.stroke();
  game.ctx.restore();
}
