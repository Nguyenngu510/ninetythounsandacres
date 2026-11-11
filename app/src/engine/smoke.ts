// ================== SMOKE TEST ENGINE (chạy: npm run smoke) ==================
// Kiểm tra vòng lặp cốt lõi: xây → tick → huấn luyện → xuất chinh chiếm ô → nhận tài nguyên
import { createInitialState, startConstruction, tickState, trainUnits, launchAttack, bLevel } from './engine';
import { CITY_X, CITY_Y, MAP_W } from './map';
import type { GameState, UnitKey } from './types';

function assert(cond: boolean, msg: string) {
  if (!cond) { console.error('SMOKE FAIL:', msg); process.exit(1); }
}

const st: GameState = createInitialState('tester', 's1');
console.log('init: res =', JSON.stringify(st.res), 'army =', JSON.stringify(st.army));

// 1. Xây Kho Lương ở ô trống đầu tiên
const empty = st.slots.find(s => !s.building)!;
const r1 = startConstruction(st, empty.id, 'granary');
assert(r1.ok, 'xây Kho Lương thất bại: ' + (r1.error ?? ''));
for (let i = 0; i < 12; i++) tickState(st, 1);
assert(bLevel(st, 'granary') === 1, 'Kho Lương chưa hoàn thành sau 12s');
console.log('xây Kho Lương ok — trần lương mới:', 500 + 800);

// 2. Xây Doanh Trại rồi mới huấn luyện được
const empty2 = st.slots.find(s => !s.building)!;
const rb = startConstruction(st, empty2.id, 'barracks');
assert(rb.ok, 'xây Doanh Trại thất bại: ' + (rb.error ?? ''));
for (let i = 0; i < 10; i++) tickState(st, 1);
assert(bLevel(st, 'barracks') === 1, 'Doanh Trại chưa hoàn thành');

// 3. Huấn luyện thêm thương binh
const r2 = trainUnits(st, 'spear', 5);
assert(r2.ok, 'tuyển binh thất bại: ' + (r2.error ?? ''));
for (let i = 0; i < 12; i++) tickState(st, 1);
assert(st.army.spear >= 20, 'quân chưa về doanh');
console.log('huấn luyện ok — spear =', st.army.spear);

// 4. Đánh ô cướp cấp 1 kề thành (ép 1 ô kề thành thành trại cướp để test chắc chắn)
const adj = st.tiles.find(t => Math.abs(t.x - CITY_X) + Math.abs(t.y - CITY_Y) === 1)!;
adj.type = 'bandit';
adj.owner = 'bandit';
adj.level = 1;
adj.discovered = true;
adj.garrison = { spear: 5, shield: 2, archer: 2, crossbow: 0, cav: 0 };
const formation: (UnitKey | null)[] = ['shield', 'shield', 'spear', 'spear', 'archer', 'archer', null, null];
const out = launchAttack(st, adj.id, formation, 'guanyu');
assert(out.ok, 'xuất chinh lỗi: ' + (out.ok ? '' : out.error));
if (out.ok) {
  console.log('trận đấu:', out.result.win ? 'THẮNG' : 'THUA',
    '| vòng =', out.result.rounds.length,
    '| loot =', JSON.stringify(out.result.loot),
    '| tổn thất =', JSON.stringify(out.result.losses));
  assert(out.result.win, 'đội khởi đầu phải thắng ô cướp cấp 1');
  assert((adj.owner as string) === 'player', 'ô chưa được chiếm dù thắng');
  assert(st.wins === 1 && st.paintings >= 4, 'chưa nhận thưởng thắng trận');
  assert(st.tokens === 4, 'chưa trừ lệnh chinh phạt');
}

// 5. Sương mù mở rộng sau khi chiếm ô mới
const fogged = st.tiles.filter(t => t.discovered).length;
assert(fogged > 15, 'sương mù không mở rộng');
console.log('chiếm ô + mở sương mù ok — ô đã khám phá:', fogged);

console.log('SMOKE TEST OK');
