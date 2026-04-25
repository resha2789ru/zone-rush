// ==================================================
// MAIN MENU UI
// ==================================================

export function showMenu(dom, visible) {
  dom.menu.classList.toggle('visible', visible);
  dom.menu.classList.toggle('hidden', !visible);
}

export function updateMenuProfile(dom, profile) {
  if (!profile) return;
  if (dom.nicknameInput && dom.nicknameInput.value !== profile.nickname) {
    dom.nicknameInput.value = profile.nickname;
  }
  if (dom.menuPlayerId) dom.menuPlayerId.textContent = profile.playerId;
  if (dom.menuBestScore) dom.menuBestScore.textContent = `${profile.bestScore || 0}`;
}
