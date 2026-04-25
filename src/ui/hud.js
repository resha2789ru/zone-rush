import { BALANCE_CONFIG } from '../config/balanceConfig.js';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { clamp } from '../utils/math.js';

// ==================================================
// HUD UI
// ==================================================

export function showHud(dom, visible) {
  dom.hud.classList.toggle('hidden', !visible);
}

export function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function updateHud(game) {
  if (!game.player) return;

  const aliveBots = game.bots.filter((bot) => bot.alive).length;
  const totalAlive = aliveBots + (game.player.alive ? 1 : 0);

  game.dom.hpBar.style.width = `${game.player.hp}%`;
  game.dom.hpText.textContent = `${Math.ceil(game.player.hp)}`;
  game.dom.playersLeft.textContent = `${totalAlive}`;
  game.dom.timerText.textContent = formatTime(Math.min(game.elapsed, GAME_CONFIG.matchDuration));

  if (game.player.dashCooldown <= 0) {
    game.dom.dashText.textContent = 'Ready';
    game.dom.dashText.style.color = '#76ffbe';
  } else {
    game.dom.dashText.textContent = `${game.player.dashCooldown.toFixed(1)}s`;
    game.dom.dashText.style.color = '#ffd56e';
  }

  if (game.player.shootCooldown <= 0) {
    game.dom.shootText.textContent = 'Ready';
    game.dom.shootText.style.color = '#7ef5ff';
  } else {
    game.dom.shootText.textContent = `${game.player.shootCooldown.toFixed(1)}s`;
    game.dom.shootText.style.color = '#ffd56e';
  }

  if (game.player.rocketCooldown <= 0) {
    game.dom.rocketText.textContent = 'Ready';
    game.dom.rocketText.style.color = '#ffa86c';
  } else {
    game.dom.rocketText.textContent = `${game.player.rocketCooldown.toFixed(1)}s`;
    game.dom.rocketText.style.color = '#ffd56e';
  }

  const rocketReadyRatio = clamp(
    1 - game.player.rocketCooldown / BALANCE_CONFIG.playerRocketCooldown,
    0,
    1
  );
  game.dom.rocketCdBar.style.width = `${rocketReadyRatio * 100}%`;
}
