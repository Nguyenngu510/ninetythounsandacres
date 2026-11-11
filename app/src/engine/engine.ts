// ================== GAME ENGINE — TOÀN BỘ LOGIC QUAN TRỌNG CHẠY Ở ĐÂY ==================
// Thiết kế tách biệt UI: engine nhận state + input, trả kết quả. Khi có backend thật,
// các hàm này chuyển thẳng thành API handler chạy trên server, UI chỉ gửi input + render.

import {
  BUILDINGS, buildCost, buildTime, COUNTERS, COUNTER_MUL, HEROES, RES_INFO,
  STRAT_UNLOCK_LEVEL, UNITS, UNIT_KEYS,
} from './config';
import { genMap } from './map';
import type {
  BattleResult, BattleRound, BuildingKey, GameState, HeroKey, ResourceKey, Resources, Tile, UnitKey,
} from './types';

export function emptyUnits(): Record<UnitKey, number> {
  return { spear: 0, shield: 0, archer: 0, crossbow: 0, cav: 0 };
}

function seedOfServer(serverId: string): number {
  let h = 0;
  for (let i = 0; i < serverId.length; i++) h = (h * 31 + serverId.charCodeAt(i)) | 0;
  return 20240901 + h;
}

export function createInitialState(account: string, serverId: string): GameState {
  const slots: import('./types').CitySlot[] = [];
  for (let i = 0; i < 16; i++) slots.push({ id: i, x: i % 4, y: Math.floor(i / 4), building: null });
  slots[5].building = { key: 'keep', level: 1 }; // Thành chính dựng sẵn giữa thành
  return {
    account,
    serverId,
    res: { food: 600, wood: 600, stone: 400, gold: 200, iron: 100 },
    slots,
    constructions: [],
    training: [],
    tiles: genMap(seedOfServer(serverId)),
    army: { spear: 15, shield: 8, archer: 6, crossbow: 0, cav: 0 },
    heroes: [
      { key: 'guanyu', owned: true, level: 1, active: true },
      { key: 'lubu', owned: false, level: 1, active: false },
      { key: 'zhaoyun', owned: false, level: 1, active: false },
      { key: 'zhangfei', owned: false, level: 1, active: false },
      { key: 'huangzhong', owned: false, level: 1, active: false },
    ],
    paintings: 3,
    tokens: 5,
    tokenAcc: 0,
    alliance: { joined: null, tech: 0 },
    // Luật server mới: 3 ngày hòa bình không ai chiếm thành của nhau.
    // Demo rút còn 3 phút; quân cướp không thuộc diện hòa bình nên vẫn đánh được.
    peaceUntil: Math.floor(Date.now() / 1000) + 180,
    wins: 0,
    losses: 0,
    lastTick: Math.floor(Date.now() / 1000),
  };
}

// ---------- tra cứu ----------
export function bLevel(state: GameState, key: BuildingKey): number {
  let lvl = 0;
  for (const s of state.slots) if (s.building && s.building.key === key) lvl = Math.max(lvl, s.building.level);
  return lvl;
}

export function capsOf(state: GameState): Partial<Record<ResourceKey, number>> {
  return {
    food: 500 + 800 * bLevel(state, 'granary'),
    wood: 400 + 600 * bLevel(state, 'warehouse'),
    stone: 400 + 600 * bLevel(state, 'warehouse'),
    iron: 400 + 600 * bLevel(state, 'warehouse'),
    // vàng không trần
  };
}

/** Tốc sản xuất theo giây — từ công trình trong thành + các ô đất đã chiếm */
export function ratesPerSec(state: GameState): Partial<Record<ResourceKey, number>> {
  const r: Partial<Record<ResourceKey, number>> = {};
  const add = (k: ResourceKey, perMin: number) => { r[k] = (r[k] ?? 0) + perMin / 60; };
  add('food', 8 * (bLevel(state, 'granary') + 1));
  add('wood', 6 * bLevel(state, 'warehouse'));
  add('iron', 4 * bLevel(state, 'forge'));
  add('gold', 2 * bLevel(state, 'keep'));
  for (const t of state.tiles) {
    if (t.owner !== 'player') continue;
    if (t.type === 'crop') add('food', 6 * t.level);
    if (t.type === 'forest') add('wood', 5 * t.level);
    if (t.type === 'stone') add('stone', 4 * t.level);
    if (t.type === 'iron') add('iron', 3 * t.level);
  }
  return r;
}

export function canAfford(state: GameState, cost: Partial<Record<ResourceKey, number>>): boolean {
  for (const k of Object.keys(cost) as ResourceKey[]) if (state.res[k] < (cost[k] ?? 0)) return false;
  return true;
}

export function pay(state: GameState, cost: Partial<Record<ResourceKey, number>>): void {
  for (const k of Object.keys(cost) as ResourceKey[]) state.res[k] -= cost[k] ?? 0;
}

export function addRes(state: GameState, res: Partial<Record<ResourceKey, number>>): void {
  const caps = capsOf(state);
  for (const k of Object.keys(res) as ResourceKey[]) {
    state.res[k] = Math.min(caps[k] ?? Infinity, state.res[k] + (res[k] ?? 0));
  }
}

export function costStr(cost: Partial<Record<ResourceKey, number>>): string {
  return (Object.keys(cost) as ResourceKey[])
    .filter(k => (cost[k] ?? 0) > 0)
    .map(k => `${cost[k]} ${RES_INFO[k].icon}`)
    .join(' · ');
}

// ---------- tick mỗi giây: tài nguyên + hàng đợi ----------
export function tickState(state: GameState, dt: number): string[] {
  const events: string[] = [];
  const rates = ratesPerSec(state);
  const caps = capsOf(state);
  for (const k of Object.keys(rates) as ResourceKey[]) {
    state.res[k] = Math.min(caps[k] ?? Infinity, state.res[k] + (rates[k] ?? 0) * dt);
  }
  // hoàn thành công trình
  const doneC = state.constructions.filter(j => j.remaining - dt <= 0);
  state.constructions = state.constructions.filter(j => j.remaining - dt > 0);
  for (const j of doneC) {
    const slot = state.slots.find(s => s.id === j.slotId);
    if (slot) slot.building = { key: j.key, level: j.targetLevel };
    events.push(`🏗️ ${BUILDINGS[j.key].name} cấp ${j.targetLevel} hoàn thành!`);
  }
  for (const j of state.constructions) j.remaining -= dt;
  // hoàn thành huấn luyện
  const doneT = state.training.filter(j => j.remaining - dt <= 0);
  state.training = state.training.filter(j => j.remaining - dt > 0);
  for (const j of doneT) {
    state.army[j.unit] += j.count;
    events.push(`⚔️ +${j.count} ${UNITS[j.unit].name} về doanh!`);
  }
  for (const j of state.training) j.remaining -= dt;
  // hồi Lệnh Chinh Phạt: 1 lệnh/60s, tối đa 5
  state.tokenAcc = Math.min(60, state.tokenAcc + dt);
  while (state.tokenAcc >= 60 && state.tokens < 5) {
    state.tokens += 1;
    state.tokenAcc -= 60;
    events.push('🎟️ +1 Lệnh Chinh Phạt');
  }
  state.lastTick += dt;
  return events;
}

// ---------- xây / nâng cấp / huấn luyện ----------
export interface OpResult { ok: boolean; error?: string }

export function startConstruction(state: GameState, slotId: number, key: BuildingKey): OpResult {
  const slot = state.slots.find(s => s.id === slotId);
  if (!slot) return { ok: false, error: 'Ô không tồn tại' };
  if (slot.building) return { ok: false, error: 'Ô này đã có công trình' };
  const cost = buildCost(key, 1);
  if (!canAfford(state, cost)) return { ok: false, error: 'Không đủ tài nguyên: ' + costStr(cost) };
  pay(state, cost);
  const dur = buildTime(key, 1);
  state.constructions.push({
    id: 'c' + Date.now() + Math.floor(Math.random() * 999),
    slotId, key, targetLevel: 1, remaining: dur, total: dur,
  });
  return { ok: true };
}

export function startUpgrade(state: GameState, slotId: number): OpResult {
  const slot = state.slots.find(s => s.id === slotId);
  if (!slot || !slot.building) return { ok: false, error: 'Không có công trình' };
  const { key, level } = slot.building;
  const B = BUILDINGS[key];
  if (level >= B.max) return { ok: false, error: '✔ Đã đạt cấp tối đa' };
  // công trình khác không được vượt cấp Thành Chính
  if (key !== 'keep' && level + 1 > bLevel(state, 'keep')) {
    return { ok: false, error: '🔒 Cần nâng Thành Chính trước!' };
  }
  const cost = buildCost(key, level + 1);
  if (!canAfford(state, cost)) return { ok: false, error: 'Không đủ tài nguyên: ' + costStr(cost) };
  pay(state, cost);
  const dur = buildTime(key, level + 1);
  state.constructions.push({
    id: 'c' + Date.now() + Math.floor(Math.random() * 999),
    slotId, key, targetLevel: level + 1, remaining: dur, total: dur,
  });
  return { ok: true };
}

export function speedUp(state: GameState, jobId: string): OpResult {
  const job = state.constructions.find(j => j.id === jobId);
  if (!job) return { ok: false, error: 'Không tìm thấy công trình đang xây' };
  const cost = Math.max(1, Math.ceil(job.remaining));
  if (state.res.gold < cost) return { ok: false, error: `Cần ${cost}💰 để đẩy nhanh` };
  state.res.gold -= cost;
  const slot = state.slots.find(s => s.id === job.slotId);
  if (slot) slot.building = { key: job.key, level: job.targetLevel };
  state.constructions = state.constructions.filter(j => j.id !== jobId);
  return { ok: true };
}

export function unitReq(unit: UnitKey): number {
  return unit === 'spear' || unit === 'shield' ? 1 : unit === 'archer' ? 2 : unit === 'crossbow' ? 3 : 4;
}

export function trainUnits(state: GameState, unit: UnitKey, n: number): OpResult {
  const U = UNITS[unit];
  if (bLevel(state, 'barracks') < unitReq(unit)) {
    return { ok: false, error: `🔒 Cần Doanh Trại cấp ${unitReq(unit)} trước!` };
  }
  const cost: Partial<Record<ResourceKey, number>> = {};
  for (const k of Object.keys(U.cost) as ResourceKey[]) cost[k] = (U.cost[k] ?? 0) * n;
  if (!canAfford(state, cost)) return { ok: false, error: 'Không đủ tài nguyên: ' + costStr(cost) };
  pay(state, cost);
  const dur = U.time * n;
  state.training.push({
    id: 't' + Date.now() + Math.floor(Math.random() * 999),
    unit, count: n, remaining: dur,
  });
  return { ok: true };
}

// ---------- chiến đấu (turn-based auto-battler) ----------
function counterMul(u: UnitKey, enemy: Record<UnitKey, number>): number {
  for (const c of COUNTERS[u]) if ((enemy[c] ?? 0) > 0) return COUNTER_MUL;
  return 1;
}

function hpPool(u: Record<UnitKey, number>): number {
  // quân tầm xa nấp sau tuyến nên bền hơn → cộng thêm 15% máu hiệu dụng
  return UNIT_KEYS.reduce((s, k) => s + u[k] * UNITS[k].hp * (UNITS[k].ranged ? 1.15 : 1), 0);
}

function baseDmg(u: Record<UnitKey, number>, enemy: Record<UnitKey, number>): number {
  return UNIT_KEYS.reduce((s, k) => s + u[k] * UNITS[k].atk * counterMul(k, enemy), 0);
}

interface CoreResult { win: boolean; rounds: BattleRound[]; aliveFrac: number }

function simulateBattleCore(
  atk: Record<UnitKey, number>, atkHero: HeroKey | null, atkStrat: boolean, heroLevel: number,
  def: Record<UnitKey, number>, defHero: HeroKey | null,
  tile: Tile,
): CoreResult {
  const A = { ...emptyUnits(), ...atk };
  const D = { ...emptyUnits(), ...def };
  const hA = atkHero ? HEROES[atkHero] : null;
  const hB = defHero ? HEROES[defHero] : null;
  let hpA = hpPool(A), hpB = hpPool(D);
  const hpA0 = hpA, hpB0 = hpB;
  const rounds: BattleRound[] = [];
  let win = false;
  for (let r = 1; r <= 12; r++) {
    let dmgA = baseDmg(A, D);
    let dmgB = baseDmg(D, A);
    if (hA) {
      dmgA *= hA.atkMul ?? 1;
      if (hA.skill.round === r && hA.skill.mul) dmgA *= hA.skill.mul;
      // Thao lược mở khóa ở cấp 5 — buff toàn đội
      if (atkStrat && heroLevel >= STRAT_UNLOCK_LEVEL) dmgA *= hA.strat.atkMul;
      if (hA.passiveDebuff) dmgB *= hA.passiveDebuff;
    }
    if (hB) {
      dmgB *= hB.atkMul ?? 1;
      if (hB.skill.round === r && hB.skill.mul) dmgB *= hB.skill.mul;
      if (hB.passiveDebuff) dmgA *= hB.passiveDebuff;
    }
    // địa hình: ô cấp cao giúp quân trú phòng mạnh hơn
    dmgB *= 1 + tile.level * 0.03;
    hpA -= dmgB;
    hpB -= dmgA;
    if (hA && hA.skill.round === r && hA.skill.heal) hpA = Math.min(hpA0, hpA + hpA0 * hA.skill.heal);
    const fA = Math.max(0, hpA / hpA0), fB = Math.max(0, hpB / hpB0);
    rounds.push({
      round: r,
      text: `Vòng ${r}: ta gây ${Math.round(dmgA)} — địch gây ${Math.round(dmgB)}`,
      dmgA: Math.round(dmgA), dmgB: Math.round(dmgB), hpA: fA, hpB: fB,
    });
    if (hpB <= 0) { win = true; break; }
    if (hpA <= 0) { win = false; break; }
  }
  if (hpA > 0 && hpB > 0) win = hpA / hpA0 > hpB / hpB0; // hết 12 vòng: bên còn máu nhiều hơn thắng
  return { win, rounds, aliveFrac: Math.max(0, hpA / hpA0) };
}

export function lootFor(tile: Tile): Resources {
  const L = tile.level;
  const zero = { food: 0, wood: 0, stone: 0, gold: 0, iron: 0 };
  switch (tile.type) {
    case 'crop': return { ...zero, food: 120 * L, gold: 10 * L };
    case 'forest': return { ...zero, wood: 100 * L, gold: 8 * L };
    case 'stone': return { ...zero, stone: 90 * L, gold: 8 * L };
    case 'iron': return { ...zero, iron: 40 * L, gold: 10 * L };
    case 'bandit': return { ...zero, food: 40 * L, wood: 40 * L, gold: 30 * L };
    default: return zero;
  }
}

/** Ô kề lãnh thổ người chơi mới được tấn công */
export function isAdjacentToOwned(state: GameState, t: Tile): boolean {
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  return dirs.some(([dx, dy]) =>
    state.tiles.some(o => o.owner === 'player' && o.x === t.x + dx && o.y === t.y + dy));
}

/** Xóa sương mù quanh mọi lãnh thổ của người chơi (bán kính 2 ô) */
export function updateFog(state: GameState): void {
  const owned = state.tiles.filter(t => t.owner === 'player');
  for (const t of state.tiles) {
    if (t.discovered) continue;
    if (owned.some(o => Math.max(Math.abs(o.x - t.x), Math.abs(o.y - t.y)) <= 2)) t.discovered = true;
  }
}

export type AttackOutcome =
  | { ok: true; result: BattleResult }
  | { ok: false; error: string };

/** Xuất chinh: trừ quân + lệnh, mô phỏng trận, áp dụng kết quả (chiếm ô, rương, tổn thất) */
export function launchAttack(
  state: GameState, tileId: number, formation: (UnitKey | null)[], heroKey: HeroKey | null,
): AttackOutcome {
  const tile = state.tiles.find(t => t.id === tileId);
  if (!tile) return { ok: false, error: 'Ô không tồn tại' };
  if (tile.owner === 'player') return { ok: false, error: 'Ô này đã thuộc lãnh thổ của bạn' };
  if (!tile.discovered) return { ok: false, error: 'Chưa trinh sát ô này' };
  if (state.tokens < 1) return { ok: false, error: 'Hết Lệnh Chinh Phạt! Chờ hồi hoặc mua bằng vàng.' };

  const deployed = emptyUnits();
  for (const u of formation) if (u) deployed[u] += 1;
  if (UNIT_KEYS.every(k => deployed[k] === 0)) return { ok: false, error: 'Cần ít nhất 1 quân trên đội hình!' };
  for (const k of UNIT_KEYS) if (deployed[k] > state.army[k]) return { ok: false, error: `Không đủ ${UNITS[k].name}` };

  for (const k of UNIT_KEYS) state.army[k] -= deployed[k];
  state.tokens -= 1;

  const hero = heroKey && state.heroes.find(h => h.key === heroKey && h.owned) ? heroKey : null;
  const heroLvl = hero ? state.heroes.find(h => h.key === hero)!.level : 0;
  // trùm cướp (ô cấp 5) do Lữ Bố thủ lĩnh
  const defHero: HeroKey | null = tile.level >= 5 ? 'lubu' : null;
  const core = simulateBattleCore(
    deployed, hero, !!hero && heroLvl >= STRAT_UNLOCK_LEVEL, heroLvl,
    { ...emptyUnits(), ...tile.garrison }, defHero, tile,
  );

  // tổn thất giảm nhờ Bệnh Viện
  const hosp = 1 - 0.06 * bLevel(state, 'hospital');
  const losses = emptyUnits();
  for (const k of UNIT_KEYS) {
    const deaths = Math.min(deployed[k], Math.round(deployed[k] * (1 - core.aliveFrac) * hosp));
    losses[k] = deaths;
    state.army[k] += deployed[k] - deaths; // sống sót trở về doanh
  }

  const loot = lootFor(tile);
  if (core.win) {
    tile.owner = 'player';
    tile.garrison = {};
    updateFog(state);
    addRes(state, loot);
    state.paintings += 1;
    state.wins += 1;
  } else {
    state.losses += 1;
  }
  return {
    ok: true,
    result: { win: core.win, rounds: core.rounds, loot, losses, deployed, tileId },
  };
}
