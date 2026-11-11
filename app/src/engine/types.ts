// ================== KIỂU DỮ LIỆU CHUNG CỦA GAME ==================
// Toàn bộ logic quan trọng (tài nguyên, xây dựng, chiến đấu) nằm trong /engine
// và chạy tập trung — UI chỉ gửi input và render.

export type ResourceKey = 'food' | 'wood' | 'stone' | 'gold' | 'iron';
export type UnitKey = 'spear' | 'shield' | 'archer' | 'crossbow' | 'cav';
export type HeroKey = 'lubu' | 'guanyu' | 'zhaoyun' | 'zhangfei' | 'huangzhong';
export type BuildingKey = 'keep' | 'granary' | 'warehouse' | 'barracks' | 'hospital' | 'forge';
export type TileType = 'city' | 'plain' | 'crop' | 'forest' | 'stone' | 'iron' | 'bandit';
export type Owner = 'player' | 'bandit' | 'neutral';

export type Resources = Record<ResourceKey, number>;
export type UnitStack = Record<UnitKey, number>;

/** Một ô đất trên bản đồ thế giới */
export interface Tile {
  id: number;
  x: number;
  y: number;
  type: TileType;
  level: number; // cấp 1..5 — càng cao tài nguyên càng nhiều, địch càng mạnh
  owner: Owner;
  discovered: boolean; // đã trinh sát (sương mù chiến tranh)
  garrison: Partial<Record<UnitKey, number>>; // quân địch trú phòng
}

/** Một ô đất trong thành chính */
export interface CitySlot {
  id: number;
  x: number;
  y: number;
  building: { key: BuildingKey; level: number } | null;
}

/** Công trình đang xây trong hàng đợi */
export interface ConstructionJob {
  id: string;
  slotId: number;
  key: BuildingKey;
  targetLevel: number;
  remaining: number; // giây còn lại
  total: number;
}

/** Đơn huấn luyện quân đang chạy */
export interface TrainingJob {
  id: string;
  unit: UnitKey;
  count: number;
  remaining: number;
}

export interface HeroState {
  key: HeroKey;
  owned: boolean;
  level: number;
  active: boolean; // đang là chủ tướng xuất chinh
}

/** 1 vòng đấu trong trận auto-battler */
export interface BattleRound {
  round: number;
  text: string;
  dmgA: number;
  dmgB: number;
  hpA: number; // tỉ lệ máu còn lại 0..1
  hpB: number;
}

export interface BattleResult {
  win: boolean;
  rounds: BattleRound[];
  loot: Resources; // rương tài nguyên nhận khi thắng
  losses: UnitStack; // quân đã hy sinh
  deployed: UnitStack; // quân đã xuất trận
  tileId: number;
}

/** Toàn bộ trạng thái ván chơi của 1 tài khoản trên 1 server */
export interface GameState {
  account: string;
  serverId: string;
  res: Resources;
  slots: CitySlot[];
  constructions: ConstructionJob[];
  training: TrainingJob[];
  tiles: Tile[];
  army: UnitStack; // quân tự do trong doanh
  defense?: UnitStack[]; // tối đa 5 đội phòng thủ (dùng cho PVP sau này)
  heroes: HeroState[];
  paintings: number; // Bức họa — nguyên liệu nâng cấp tướng
  tokens: number; // Lệnh Chinh Phạt (tối đa 5)
  tokenAcc: number; // bộ đếm hồi lệnh
  alliance: { joined: string | null; tech: number };
  peaceUntil: number; // thời điểm kết thúc hòa bình mới mở server (giây epoch)
  wins: number;
  losses: number;
  lastTick: number; // giây (epoch) — mốc tick cuối
}
