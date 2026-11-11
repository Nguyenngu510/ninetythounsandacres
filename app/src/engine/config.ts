// ================== MOCK DATA: BINH CHỦNG, CÔNG TRÌNH, VÕ TƯỚNG ==================
import type { BuildingKey, HeroKey, ResourceKey, UnitKey } from './types';

export const RES_INFO: Record<ResourceKey, { name: string; icon: string }> = {
  food: { name: 'Lương thực', icon: '🌾' },
  wood: { name: 'Gỗ', icon: '🪵' },
  stone: { name: 'Đá', icon: '🪨' },
  gold: { name: 'Vàng', icon: '💰' },
  iron: { name: 'Sắt', icon: '⛓️' },
};

export interface UnitDef {
  name: string;
  icon: string;
  atk: number;
  hp: number;
  cost: Partial<Record<ResourceKey, number>>;
  time: number; // giây / 1 quân
  ranged: boolean;
  desc: string;
}

export const UNIT_KEYS: UnitKey[] = ['spear', 'shield', 'archer', 'crossbow', 'cav'];

// Chuỗi khắc chế: Thương → Kỵ → Khiên → Cung → Thương (Nỏ khắc Khiên)
export const COUNTERS: Record<UnitKey, UnitKey[]> = {
  spear: ['cav'],
  cav: ['shield', 'crossbow'],
  shield: ['archer'],
  archer: ['spear'],
  crossbow: ['shield'],
};
export const COUNTER_MUL = 1.5;

export const UNITS: Record<UnitKey, UnitDef> = {
  spear: { name: 'Thương Binh', icon: '🔱', atk: 10, hp: 35, cost: { food: 50, wood: 30 }, time: 2, ranged: false, desc: 'Tiền tuyến rẻ, khắc Kỵ Binh' },
  shield: { name: 'Khiên Binh', icon: '🛡️', atk: 6, hp: 60, cost: { food: 60, wood: 40, iron: 10 }, time: 3, ranged: false, desc: 'Áo giáp dày, khắc Cung Thủ' },
  archer: { name: 'Cung Thủ', icon: '🏹', atk: 14, hp: 22, cost: { food: 60, wood: 50 }, time: 3, ranged: true, desc: 'Hậu tuyến, khắc Thương Binh' },
  crossbow: { name: 'Nỏ Thủ', icon: '🎯', atk: 18, hp: 18, cost: { food: 70, wood: 40, iron: 15 }, time: 4, ranged: true, desc: 'Đạn xuyên giáp, khắc Khiên Binh' },
  cav: { name: 'Kỵ Binh', icon: '🐎', atk: 20, hp: 40, cost: { food: 100, iron: 20 }, time: 5, ranged: false, desc: 'Đánh phá sườn, khắc Khiên & Nỏ' },
};

export interface BuildingDef {
  name: string;
  icon: string;
  max: number;
  desc: (level: number) => string;
  baseCost: Partial<Record<ResourceKey, number>>;
  costMul: number;
  baseTime: number; // giây xây cấp 1 (demo cho nhanh; thực tế tính bằng phút/giờ)
  timeMul: number;
}

export const BUILDING_KEYS: BuildingKey[] = ['keep', 'granary', 'warehouse', 'barracks', 'hospital', 'forge'];

export const BUILDINGS: Record<BuildingKey, BuildingDef> = {
  keep: {
    name: 'Thành Chính', icon: '🏰', max: 5,
    desc: l => `Trung tâm đế quốc. Mở giới hạn cấp công trình khác (tối đa ${l}). +${2 * l}💰/phút`,
    baseCost: { wood: 120, stone: 80 }, costMul: 1.7, baseTime: 10, timeMul: 1.6,
  },
  granary: {
    name: 'Kho Lương', icon: '🌾', max: 5,
    desc: l => `Trần lương ${500 + 800 * l}, +${8 * (l + 1)}🌾/phút`,
    baseCost: { wood: 80, stone: 30 }, costMul: 1.6, baseTime: 6, timeMul: 1.5,
  },
  warehouse: {
    name: 'Nhà Kho', icon: '📦', max: 5,
    desc: l => `Trần gỗ/đá/sắt ${400 + 600 * l}, +${6 * l}🪵/phút`,
    baseCost: { wood: 60, stone: 60 }, costMul: 1.6, baseTime: 6, timeMul: 1.5,
  },
  barracks: {
    name: 'Doanh Trại', icon: '⚔️', max: 5,
    desc: l => `Tuyển binh (Cung lv${2}, Nỏ lv${3}, Kỵ lv${4}). +${10 * l}% công toàn quân`,
    baseCost: { wood: 100, food: 60 }, costMul: 1.65, baseTime: 8, timeMul: 1.55,
  },
  hospital: {
    name: 'Bệnh Viện', icon: '⛑️', max: 5,
    desc: l => `Giảm ${6 * l}% tổn thất quân sau mỗi trận`,
    baseCost: { wood: 90, stone: 50 }, costMul: 1.6, baseTime: 7, timeMul: 1.5,
  },
  forge: {
    name: 'Xưởng Rèn', icon: '🔨', max: 5,
    desc: l => `+${5 * l}% công toàn quân, +${4 * l}⛓️/phút`,
    baseCost: { wood: 80, stone: 70 }, costMul: 1.65, baseTime: 9, timeMul: 1.5,
  },
};

export function buildCost(key: BuildingKey, targetLevel: number): Partial<Record<ResourceKey, number>> {
  const B = BUILDINGS[key];
  const out: Partial<Record<ResourceKey, number>> = {};
  for (const k of Object.keys(B.baseCost) as ResourceKey[]) {
    out[k] = Math.round((B.baseCost[k] ?? 0) * Math.pow(B.costMul, targetLevel - 1));
  }
  return out;
}

export function buildTime(key: BuildingKey, targetLevel: number): number {
  const B = BUILDINGS[key];
  return Math.round(B.baseTime * Math.pow(B.timeMul, targetLevel - 1));
}

// ================== VÕ TƯỚNG (5 tướng mock) ==================
export interface HeroDef {
  name: string;
  title: string;
  quality: 'SSR' | 'SR';
  atkMul?: number;      // nội tại tăng công
  takenMul?: number;    // nội tại giảm sát thương nhận vào
  rangedMul?: number;   // nội tại tăng công quân tầm xa
  passiveDebuff?: number; // làm yếu đội địch
  skill: { name: string; round: number; mul?: number; heal?: number; debuff?: number; desc: string };
  strat: { name: string; desc: string; atkMul: number }; // Thao lược — mở khóa cấp 5
  cost: { gold: number };
}

export const HERO_KEYS: HeroKey[] = ['lubu', 'guanyu', 'zhaoyun', 'zhangfei', 'huangzhong'];
export const STRAT_UNLOCK_LEVEL = 5;
export const HERO_MAX_LEVEL = 10;

export const HEROES: Record<HeroKey, HeroDef> = {
  lubu: {
    name: 'Lữ Bố', title: 'Phi Tướng', quality: 'SSR', atkMul: 1.2,
    skill: { name: 'Phương Thiên Họa Kích', round: 2, mul: 2.0, desc: 'Vòng 2: gấp đôi sát thương' },
    strat: { name: 'Thiên Hạ Vô Song', desc: '+15% công toàn đội', atkMul: 1.15 },
    cost: { gold: 800 },
  },
  guanyu: {
    name: 'Quan Vũ', title: 'Võ Thánh', quality: 'SSR', atkMul: 1.15,
    skill: { name: 'Thanh Long Trảm', round: 2, mul: 2.2, desc: 'Vòng 2: ×2.2 sát thương' },
    strat: { name: 'Nghĩa Bạc Vân Thiên', desc: '+10% công toàn đội', atkMul: 1.1 },
    cost: { gold: 600 },
  },
  zhaoyun: {
    name: 'Triệu Vân', title: 'Thường Thắng', quality: 'SR', takenMul: 0.8,
    skill: { name: 'Long Đởm', round: 2, heal: 0.15, desc: 'Vòng 2: hồi 15% máu đội' },
    strat: { name: 'Nhất Thân Thị Đảm', desc: '+10% công toàn đội', atkMul: 1.1 },
    cost: { gold: 400 },
  },
  zhangfei: {
    name: 'Trương Phi', title: 'Yễm Hổ', quality: 'SR', passiveDebuff: 0.75,
    skill: { name: 'Hổ Khiếu', round: 2, debuff: 0.75, desc: 'Vòng 2: địch yếu đi 25%' },
    strat: { name: 'Đương Dương Kỷ Địch', desc: '+10% công toàn đội', atkMul: 1.1 },
    cost: { gold: 350 },
  },
  huangzhong: {
    name: 'Hoàng Trung', title: 'Lão Tướng', quality: 'SR', rangedMul: 1.25,
    skill: { name: 'Bách Bộ Xuyên Dương', round: 1, mul: 1.8, desc: 'Vòng 1: ×1.8 sát thương' },
    strat: { name: 'Lão Đương Ích Tráng', desc: '+10% công toàn đội', atkMul: 1.1 },
    cost: { gold: 350 },
  },
};
