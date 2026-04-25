import { GAME_CONFIG } from '../config/gameConfig.js';
import { showHud } from '../ui/hud.js';
import { showResult, updateResultScreen } from '../ui/resultScreen.js';

// ==================================================
// MATCH ENDING AND WIN/LOSE RULES
// ==================================================

export function endMatch(game, win, reason) {
  game.state = 'result';
  game.resultReason = reason;
  game.lastSurvived = game.elapsed;
  showHud(game.dom, false);
  showResult(game.dom, true);
  updateResultScreen(game, win, reason);
}

export function checkEndConditions(game) {
  const aliveBots = game.bots.filter((bot) => bot.alive).length;

  if (!game.player.alive) {
    endMatch(game, false, 'death');
    return;
  }

  if (aliveBots <= 0) {
    endMatch(game, true, 'win');
    return;
  }

  if (game.elapsed >= GAME_CONFIG.matchDuration) {
    endMatch(game, false, 'timeout');
  }
}
