// ================== SINH BẢN ĐỒ THẾ GIỚI (deterministic theo seed server) ==================
import type { Tile, TileType, UnitKey } from './types';

export const MAP_W = 16;
export const MAP_H = 12;
export const TS = 56; // kích thước 1 ô (world px)
export const CITY_X = 8;
export const CITY_Y = 6;
export const CITY_TILE_ID = CITY_Y * MAP_W + CITY_X;

/** RNG deterministic (mulberry32) — mỗi server 1 seed nên bản đồ giống nhau cho mọi người */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Quân cướp trú phòng theo cấp ô — cấp 1 vừa sức đội khởi đầu, cấp 5 cần đội mạnh */
function garrisonFor(level: number, rnd: () => number): Partial<Record<UnitKey, number>> {
  const s = level;
  return {
    spear: 3 + Math.round(s * 2.2 + rnd() * 2),
    shield: 1 + Math.round(s * 1.2 + rnd()),
    archer: 1 + Math.round(s * 1.1 + rnd()),
    crossbow: level >= 3 ? Math.round(s * 0.6) : 0,
    cav: level >= 2 ? Math.round(s * 0.8 + rnd()) : 0,
  };
}

export function genMap(seed = 20240901): Tile[] {
  const rnd = mulberry32(seed);
  const tiles: Tile[] = [];
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const id = y * MAP_W + x;
      if (x === CITY_X && y === CITY_Y) {
        tiles.push({ id, x, y, type: 'city', level: 0, owner: 'player', discovered: true, garrison: {} });
        continue;
      }
      const dist = Math.abs(x - CITY_X) + Math.abs(y - CITY_Y);
      const r = rnd();
      let type: TileType = 'plain';
      if (r < 0.22) type = 'crop';
      else if (r < 0.42) type = 'forest';
      else if (r < 0.58) type = 'stone';
      else if (r < 0.68) type = 'iron';
      else if (r > 0.86) type = 'bandit';
      // cấp ô tăng dần theo khoảng cách khỏi thành — khuyến khích mở rộng hình xoắn ốc
      const level = Math.min(5, Math.max(1, 1 + Math.floor(dist / 4) + (rnd() < 0.3 ? 1 : 0)));
      tiles.push({
        id, x, y, type, level,
        owner: type === 'bandit' ? 'bandit' : 'neutral',
        // sương mù: chỉ vùng quanh thành chính được trinh sát sẵn
        discovered: Math.max(Math.abs(x - CITY_X), Math.abs(y - CITY_Y)) <= 2,
        garrison: type === 'bandit' ? garrisonFor(level, rnd) : {},
      });
    }
  }
  return tiles;
}
