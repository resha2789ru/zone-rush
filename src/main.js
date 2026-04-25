import { Game } from './core/game.js';
import { showHud } from './ui/hud.js';
import { showMenu } from './ui/menu.js';
import { showResult } from './ui/resultScreen.js';

// ==================================================
// APPLICATION BOOTSTRAP
// ==================================================

function getDomRefs() {
  return {
    app: document.getElementById('app'),
    canvas: document.getElementById('gameCanvas'),
    hud: document.getElementById('hud'),
    menu: document.getElementById('menu'),
    result: document.getElementById('result'),
    mobileControls: document.getElementById('mobileControls'),
    joystick: document.getElementById('joystick'),
    joystickKnob: document.getElementById('joystickKnob'),
    dashBtn: document.getElementById('dashBtn'),
    shootBtn: document.getElementById('shootBtn'),
    rocketBtn: document.getElementById('rocketBtn'),
    playBtn: document.getElementById('playBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    nicknameInput: document.getElementById('nicknameInput'),
    menuPlayerId: document.getElementById('menuPlayerId'),
    menuBestScore: document.getElementById('menuBestScore'),
    menuLeaderboardStatus: document.getElementById('menuLeaderboardStatus'),
    menuLeaderboard: document.getElementById('menuLeaderboard'),
    hpBar: document.getElementById('hpBar'),
    hpText: document.getElementById('hpText'),
    playersLeft: document.getElementById('playersLeft'),
    timerText: document.getElementById('timer'),
    dashText: document.getElementById('dash'),
    shootText: document.getElementById('shoot'),
    rocketText: document.getElementById('rocket'),
    rocketCdBar: document.getElementById('rocketCdBar'),
    resultTitle: document.getElementById('resultTitle'),
    resultText: document.getElementById('resultText'),
    resultScore: document.getElementById('resultScore'),
    resultBest: document.getElementById('resultBest'),
    resultSaveStatus: document.getElementById('resultSaveStatus'),
    resultStatsTable: document.getElementById('resultStatsTable'),
    resultLeaderboardStatus: document.getElementById('resultLeaderboardStatus'),
    resultLeaderboard: document.getElementById('resultLeaderboard'),
  };
}

const dom = getDomRefs();
const game = new Game(dom);
showMenu(dom, true);
showHud(dom, false);
showResult(dom, false);

window.zoneRushGame = game;
