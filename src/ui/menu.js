// ==================================================
// MAIN MENU UI
// ==================================================

export function showMenu(dom, visible) {
  dom.menu.classList.toggle('visible', visible);
  dom.menu.classList.toggle('hidden', !visible);
}
