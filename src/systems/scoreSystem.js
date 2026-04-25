import { clamp } from '../utils/math.js';

// ==================================================
// SCORE CALCULATION
// ==================================================

export function calculateScore({ survived_seconds = 0, kills = 0, damage_dealt = 0, win = false }) {
  const rawScore =
    survived_seconds * 10 +
    kills * 100 +
    damage_dealt * 1 +
    (win ? 1000 : 0);

  return clamp(Math.round(rawScore), 0, 100000);
}
