// ================== SPRITE PIXEL CHIBI — VẼ THỦ TỤC BẰNG CANVAS ==================
// Toàn bộ hình ảnh là pixel art vẽ bằng code (không cần file ảnh), có thể thay
// bằng ảnh thật sau này: chỉ cần đổi các hàm dưới thành drawImage.
import type { BuildingKey, HeroKey, TileType, UnitKey } from '../engine/types';

type G = CanvasRenderingContext2D;

export function px(g: G, x: number, y: number, w: number, h: number, c: string) {
  g.fillStyle = c;
  g.fillRect(x, y, w, h);
}

const OUT = '#1a1208';
const SKIN = '#f0c8a0';

// ---------- LÍNH CHIBI (khung 12x14 điểm) ----------
export function drawUnitSprite(
  g: G, key: UnitKey, X: number, Y: number, s: number,
  team: 'player' | 'enemy', t = 0, pose: 'idle' | 'attack' | 'dead' = 'idle',
) {
  const armor = team === 'player' ? '#3f7ec2' : '#c25138';
  const armorD = team === 'player' ? '#22507f' : '#7d2c1c';
  if (pose === 'dead') {
    px(g, X, Y + 11 * s, 11 * s, 3 * s, armorD); // thân nằm
    px(g, X + 8 * s, Y + 10 * s, 3 * s, 3 * s, SKIN); // đầu
    return;
  }
  const bob = pose === 'idle' ? Math.round(Math.sin(t * 4) * 0.6) : 0;
  const lunge = pose === 'attack' ? -2 : 0;
  const x = X, y = Y + bob * s + lunge * s;
  // chân
  px(g, x + 3 * s, y + 11 * s, 2 * s, 3 * s, '#3a2a16');
  px(g, x + 7 * s, y + 11 * s, 2 * s, 3 * s, '#3a2a16');
  // thân (giáp đội)
  px(g, x + 3 * s, y + 6 * s, 6 * s, 5 * s, armor);
  px(g, x + 3 * s, y + 9 * s, 6 * s, 2 * s, armorD); // đai
  // đầu + mũ
  px(g, x + 3 * s, y, 6 * s, 6 * s, SKIN);
  px(g, x + 3 * s, y, 6 * s, 2 * s, armorD); // mũ
  px(g, x + 5 * s, y - 1 * s, 2 * s, 1 * s, team === 'player' ? '#ffd75e' : '#ff9e5e'); // chuôi mũ
  // mắt
  px(g, x + 4 * s, y + 3 * s, 1 * s, 1 * s, OUT);
  px(g, x + 7 * s, y + 3 * s, 1 * s, 1 * s, OUT);
  // vũ khí theo binh chủng
  if (key === 'spear') {
    px(g, x + 10 * s, y - 1 * s + (pose === 'attack' ? -1 * s : 0), 1 * s, 13 * s, '#8a6a3a');
    px(g, x + 10 * s, y - 3 * s + (pose === 'attack' ? -1 * s : 0), 1 * s, 2 * s, '#d8d8d8');
  } else if (key === 'shield') {
    px(g, x + 9 * s, y + 5 * s, 3 * s, 6 * s, '#6e4c2c');
    px(g, x + 10 * s, y + 7 * s, 1 * s, 2 * s, '#ffd75e');
  } else if (key === 'archer') {
    px(g, x + 10 * s, y + 3 * s, 1 * s, 8 * s, '#8a6a3a');
    px(g, x + 9 * s, y + 4 * s, 1 * s, 1 * s, '#d8d8d8');
    px(g, x + 9 * s, y + 9 * s, 1 * s, 1 * s, '#d8d8d8');
  } else if (key === 'crossbow') {
    px(g, x + 9 * s, y + 6 * s, 4 * s, 1 * s, '#5a3a1a');
    px(g, x + 10 * s, y + 5 * s, 1 * s, 3 * s, '#8a6a3a');
  } else if (key === 'cav') {
    // ngựa dưới thân lính
    px(g, x - 1 * s, y + 9 * s, 12 * s, 4 * s, '#6e4c2c');
    px(g, x + 9 * s, y + 6 * s, 3 * s, 4 * s, '#6e4c2c'); // đầu ngựa
    px(g, x, y + 13 * s, 1 * s, 2 * s, '#3a2a16');
    px(g, x + 9 * s, y + 13 * s, 1 * s, 2 * s, '#3a2a16');
  }
}

// ---------- VÕ TƯỚNG CHIBI (khung 14x18 điểm, có choàng + vũ khí riêng) ----------
const HERO_STYLE: Record<HeroKey, { robe: string; robeD: string; cape: string; weapon: string }> = {
  guanyu: { robe: '#2f7a3a', robeD: '#1d5326', cape: '#1d5326', weapon: 'blade' },
  lubu: { robe: '#8a2f4a', robeD: '#5c1d31', cape: '#c23a3a', weapon: 'halberd' },
  zhaoyun: { robe: '#5a7a9a', robeD: '#3a5570', cape: '#cfd8e0', weapon: 'spear' },
  zhangfei: { robe: '#3a3a44', robeD: '#24242c', cape: '#24242c', weapon: 'halberd' },
  huangzhong: { robe: '#8a6a2f', robeD: '#5c471d', cape: '#5c471d', weapon: 'bow' },
};

export function drawHeroSprite(
  g: G, key: HeroKey, X: number, Y: number, s: number,
  t = 0, pose: 'idle' | 'attack' | 'dead' = 'idle',
) {
  const st = HERO_STYLE[key];
  if (pose === 'dead') {
    px(g, X, Y + 14 * s, 13 * s, 3 * s, st.robeD);
    px(g, X + 9 * s, Y + 13 * s, 4 * s, 4 * s, SKIN);
    return;
  }
  const bob = pose === 'idle' ? Math.round(Math.sin(t * 3) * 0.6) : 0;
  const lunge = pose === 'attack' ? -3 : 0;
  const x = X, y = Y + bob * s + lunge * s;
  // chân
  px(g, x + 4 * s, y + 14 * s, 2 * s, 4 * s, '#241a10');
  px(g, x + 8 * s, y + 14 * s, 2 * s, 4 * s, '#241a10');
  // choàng
  px(g, x + 2 * s, y + 5 * s, 10 * s, 9 * s, st.cape);
  // thân
  px(g, x + 3 * s, y + 7 * s, 8 * s, 7 * s, st.robe);
  px(g, x + 3 * s, y + 12 * s, 8 * s, 2 * s, st.robeD);
  // đầu
  px(g, x + 4 * s, y, 6 * s, 7 * s, SKIN);
  px(g, x + 4 * s, y, 6 * s, 2 * s, st.robeD); // mũ
  px(g, x + 5 * s, y + 4 * s, 1 * s, 1 * s, OUT); // mắt
  px(g, x + 8 * s, y + 4 * s, 1 * s, 1 * s, OUT);
  if (key === 'guanyu') px(g, x + 4 * s, y + 5 * s, 6 * s, 2 * s, '#3a2a16'); // râu dài
  if (key === 'zhangfei') px(g, x + 4 * s, y + 5 * s, 6 * s, 3 * s, '#241a10');
  // vũ khí
  if (st.weapon === 'blade') {
    px(g, x + 12 * s, y - 2 * s, 1 * s, 16 * s, '#2f7a3a');
    px(g, x + 13 * s, y - 2 * s, 1 * s, 14 * s, '#d8e8d8');
  } else if (st.weapon === 'halberd') {
    px(g, x + 12 * s, y - 2 * s, 1 * s, 17 * s, '#5a3a1a');
    px(g, x + 11 * s, y - 4 * s, 3 * s, 2 * s, '#d8d8d8');
  } else if (st.weapon === 'spear') {
    px(g, x + 12 * s, y - 1 * s, 1 * s, 16 * s, '#7a7a8a');
    px(g, x + 12 * s, y - 3 * s, 1 * s, 2 * s, '#e8e8f0');
  } else if (st.weapon === 'bow') {
    px(g, x + 12 * s, y + 3 * s, 1 * s, 10 * s, '#8a6a3a');
    px(g, x + 11 * s, y + 4 * s, 1 * s, 1 * s, '#d8d8d8');
    px(g, x + 11 * s, y + 11 * s, 1 * s, 1 * s, '#d8d8d8');
  }
  // lông vũ SSR
  if (key === 'lubu') px(g, x + 6 * s, y - 2 * s, 2 * s, 2 * s, '#e04a4a');
}

// ---------- CÔNG TRÌNH (khung 20x20 điểm, đổi hình theo cấp) ----------
export function drawBuildingSprite(g: G, key: BuildingKey, level: number, X: number, Y: number, s: number) {
  const WOOD = '#6e4c2c', WOODD = '#4a3218', STONE = '#9a9a92', STONED = '#6b6b64';
  const GOLD = '#ffd75e', ROOF = '#a8442e';
  if (level >= 3) px(g, X, Y + 17 * s, 20 * s, 3 * s, STONED); // móng đá cấp 3+
  switch (key) {
    case 'keep':
      px(g, X + 2 * s, Y + 6 * s, 16 * s, 11 * s, STONE);
      px(g, X + 2 * s, Y + 6 * s, 16 * s, 1 * s, STONED);
      for (let i = 0; i < 4; i++) px(g, X + (2 + i * 4) * s, Y + 4 * s, 2 * s, 2 * s, STONE); // răng cưa
      px(g, X + 8 * s, Y + 12 * s, 4 * s, 5 * s, '#241a10'); // cửa
      px(g, X, Y + 2 * s, 3 * s, 15 * s, STONED); // tháp trái
      if (level >= 4) px(g, X + 17 * s, Y + 2 * s, 3 * s, 15 * s, STONED); // tháp phải cấp 4+
      if (level >= 2) {
        px(g, X + 9 * s, Y - 2 * s, 1 * s, 4 * s, WOODD);
        px(g, X + 10 * s, Y - 2 * s, 4 * s, 2 * s, level >= 5 ? GOLD : ROOF); // cờ
      }
      if (level >= 5) px(g, X + 2 * s, Y + 5 * s, 16 * s, 1 * s, GOLD);
      break;
    case 'granary':
      px(g, X + 3 * s, Y + 7 * s, 14 * s, 10 * s, '#b58a4a');
      px(g, X + 2 * s, Y + 4 * s, 16 * s, 3 * s, ROOF);
      px(g, X + 8 * s, Y + 12 * s, 4 * s, 5 * s, WOODD);
      px(g, X + 4 * s, Y + 9 * s, 3 * s, 3 * s, '#e0c890'); // bao lương
      px(g, X + 13 * s, Y + 9 * s, 3 * s, 3 * s, '#e0c890');
      if (level >= 2) px(g, X + 16 * s, Y + 2 * s, 1 * s, 5 * s, WOODD), px(g, X + 17 * s, Y + 2 * s, 3 * s, 2 * s, GOLD);
      if (level >= 5) px(g, X + 2 * s, Y + 3 * s, 16 * s, 1 * s, GOLD);
      break;
    case 'warehouse':
      px(g, X + 2 * s, Y + 9 * s, 7 * s, 8 * s, WOOD);
      px(g, X + 10 * s, Y + 6 * s, 8 * s, 11 * s, WOODD);
      px(g, X + 3 * s, Y + 11 * s, 5 * s, 1 * s, OUT);
      px(g, X + 11 * s, Y + 9 * s, 6 * s, 1 * s, OUT);
      px(g, X + 11 * s, Y + 13 * s, 6 * s, 1 * s, OUT);
      if (level >= 2) px(g, X + 4 * s, Y + 5 * s, 5 * s, 4 * s, '#8a6a3a'); // thùng thêm khi nâng cấp
      if (level >= 5) px(g, X + 10 * s, Y + 5 * s, 8 * s, 1 * s, GOLD);
      break;
    case 'barracks':
      px(g, X + 2 * s, Y + 9 * s, 16 * s, 8 * s, '#7a5a3a'); // lều
      px(g, X + 2 * s, Y + 9 * s, 16 * s, 2 * s, '#5c4429');
      px(g, X + 8 * s, Y + 13 * s, 4 * s, 4 * s, '#241a10');
      px(g, X + 19 * s, Y + 4 * s, 1 * s, 13 * s, WOODD); // giá thương
      px(g, X + 17 * s, Y + 6 * s, 1 * s, 11 * s, WOODD);
      if (level >= 2) px(g, X + 9 * s, Y + 5 * s, 2 * s, 4 * s, ROOF); // cờ lều
      if (level >= 5) px(g, X + 2 * s, Y + 8 * s, 16 * s, 1 * s, GOLD);
      break;
    case 'hospital':
      px(g, X + 3 * s, Y + 8 * s, 14 * s, 9 * s, '#e8e8e0');
      px(g, X + 3 * s, Y + 8 * s, 14 * s, 2 * s, '#c8c8c0');
      px(g, X + 9 * s, Y + 10 * s, 2 * s, 5 * s, '#c23a3a'); // chữ thập đỏ
      px(g, X + 7 * s, Y + 12 * s, 6 * s, 2 * s, '#c23a3a');
      if (level >= 3) px(g, X + 3 * s, Y + 17 * s, 14 * s, 1 * s, STONE);
      if (level >= 5) px(g, X + 9 * s, Y + 5 * s, 2 * s, 3 * s, GOLD);
      break;
    case 'forge':
      px(g, X + 3 * s, Y + 8 * s, 12 * s, 9 * s, '#4a4a52');
      px(g, X + 13 * s, Y + 3 * s, 3 * s, 14 * s, '#3a3a42'); // ống khói
      px(g, X + 5 * s, Y + 12 * s, 6 * s, 3 * s, '#6b6b64'); // đe
      if (level >= 2) px(g, X + 14 * s, Y + 1 * s, 2 * s, 2 * s, '#ffb05e'); // lửa lò
      if (level >= 4) px(g, X + 6 * s, Y + 10 * s, 2 * s, 2 * s, GOLD);
      if (level >= 5) px(g, X + 3 * s, Y + 7 * s, 12 * s, 1 * s, GOLD);
      break;
  }
}

// ---------- ICON Ô ĐẤT TRÊN BẢN ĐỒ ----------
export function drawTileIcon(g: G, type: TileType, X: number, Y: number, s: number) {
  switch (type) {
    case 'plain':
      px(g, X + 3 * s, Y + 5 * s, 1 * s, 2 * s, '#5a8a3a');
      px(g, X + 8 * s, Y + 7 * s, 1 * s, 2 * s, '#5a8a3a');
      px(g, X + 13 * s, Y + 4 * s, 1 * s, 2 * s, '#5a8a3a');
      break;
    case 'crop':
      for (let i = 0; i < 3; i++) px(g, X + (3 + i * 4) * s, Y + (4 + (i % 2) * 3) * s, 2 * s, 5 * s, '#c8b23a');
      break;
    case 'forest':
      px(g, X + 4 * s, Y + 3 * s, 4 * s, 8 * s, '#2f6a2a');
      px(g, X + 11 * s, Y + 6 * s, 4 * s, 7 * s, '#3a7a34');
      px(g, X + 5 * s, Y + 11 * s, 2 * s, 3 * s, '#4a3218');
      px(g, X + 12 * s, Y + 13 * s, 2 * s, 2 * s, '#4a3218');
      break;
    case 'stone':
      px(g, X + 3 * s, Y + 8 * s, 6 * s, 5 * s, '#8a8a82');
      px(g, X + 10 * s, Y + 10 * s, 5 * s, 4 * s, '#6b6b64');
      px(g, X + 4 * s, Y + 8 * s, 2 * s, 1 * s, '#b0b0a8');
      break;
    case 'iron':
      px(g, X + 3 * s, Y + 8 * s, 6 * s, 5 * s, '#4a4a52');
      px(g, X + 10 * s, Y + 10 * s, 5 * s, 4 * s, '#3a3a42');
      px(g, X + 5 * s, Y + 9 * s, 1 * s, 1 * s, '#c8d8e8');
      break;
    case 'bandit':
      px(g, X + 4 * s, Y + 7 * s, 8 * s, 7 * s, '#5c4429'); // lều cướp
      px(g, X + 7 * s, Y + 4 * s, 1 * s, 10 * s, '#241a10');
      px(g, X + 8 * s, Y + 4 * s, 4 * s, 3 * s, '#c23a3a'); // cờ đỏ
      break;
    case 'city':
      px(g, X + 4 * s, Y + 6 * s, 10 * s, 9 * s, '#9a9a92');
      px(g, X + 2 * s, Y + 9 * s, 3 * s, 6 * s, '#6b6b64');
      px(g, X + 13 * s, Y + 9 * s, 3 * s, 6 * s, '#6b6b64');
      px(g, X + 8 * s, Y + 11 * s, 2 * s, 4 * s, '#241a10');
      px(g, X + 8 * s, Y + 1 * s, 1 * s, 5 * s, '#241a10');
      px(g, X + 9 * s, Y + 1 * s, 4 * s, 2 * s, '#ffd75e');
      break;
  }
}
