// utils/xp.js
export function xpForLevel(lvl) {
  return Math.floor(100 * Math.pow(1.5, Math.max(0, lvl - 1)));
}