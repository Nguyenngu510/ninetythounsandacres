// ================== ZUSTAND STORE — CẦU NỐI UI ↔ ENGINE ==================
// UI chỉ gọi action trong store; store gọi engine tính toán rồi cập nhật state.
// Bản demo mô phỏng "server" phía client; khi có backend thật chỉ cần thay các
// action này bằng lời gọi API + WebSocket, phần render giữ nguyên.
import { create } from 'zustand';
import {
  createInitialState, launchAttack, speedUp, startConstruction, startUpgrade, tickState, trainUnits,
  updateFog,
} from '../engine/engine';
import { HERO_MAX_LEVEL, HEROES, UNITS } from '../engine/config';
import type {
  BattleResult, BuildingKey, GameState, HeroKey, Tile, UnitKey,
} from '../engine/types';

export interface ServerInfo {
  id: string;
  name: string;
  status: 'new' | 'busy' | 'maint';
  players: number;
}

export interface Toast { id: number; msg: string; kind: 'info' | 'good' | 'bad' }
export interface ConfirmState { title: string; text: string; onOk: () => void }
export interface ChatMsg { who: string; text: string; me: boolean }

export type Screen = 'login' | 'city' | 'map' | 'battle' | 'army' | 'alliance';

const SERVERS: ServerInfo[] = [
  { id: 's1', name: 'S1 · Quan Vũ', status: 'new', players: 128 },
  { id: 's2', name: 'S2 · Lữ Bố', status: 'busy', players: 873 },
  { id: 's3', name: 'S3 · Hồ Điệp', status: 'maint', players: 0 },
];

const ACC_KEY = 'nta-accounts';
const saveKeyOf = (server: string) => `nta-save-${server}`;

interface Accounts { [user: string]: string }

function readAccounts(): Accounts {
  try { return JSON.parse(localStorage.getItem(ACC_KEY) ?? '{}') as Accounts; } catch { return {}; }
}

function persist(state: GameState | null, serverId: string | null) {
  if (!state || !serverId) return;
  try { localStorage.setItem(saveKeyOf(serverId), JSON.stringify(state)); } catch { /* đầy bộ nhớ */ }
}

let toastId = 1;

interface Store {
  screen: Screen;
  account: string;
  serverId: string | null;
  state: GameState | null;
  servers: ServerInfo[];
  selectedSlot: number | null;   // ô thành đang chọn (panel xây/nâng cấp)
  target: Tile | null;           // ô bản đồ chuẩn bị tấn công
  battle: BattleResult | null;   // kết quả trận đang phát lại
  confirm: ConfirmState | null;
  toasts: Toast[];
  allianceChat: ChatMsg[];

  toast: (msg: string, kind?: Toast['kind']) => void;
  signup: (acc: string, pw: string) => boolean;
  login: (acc: string, pw: string) => boolean;
  enterServer: (id: string) => void;
  logout: () => void;
  setScreen: (s: Screen) => void;
  selectSlot: (id: number | null) => void;
  resetSave: () => void;

  tick: () => void;
  build: (slotId: number, key: BuildingKey) => void;
  upgrade: (slotId: number) => void;
  speedUpJob: (jobId: string) => void;
  train: (unit: UnitKey, n: number) => void;

  setTarget: (t: Tile) => void;
  launch: (tileId: number, formation: (UnitKey | null)[], hero: HeroKey | null) => void;
  finishBattle: () => void;

  recruitHero: (key: HeroKey) => void;
  upgradeHero: (key: HeroKey) => void;
  setActiveHero: (key: HeroKey) => void;
  garrisonTo: (squadIdx: number, unit: UnitKey, delta: number) => void;
  autoGarrison: () => void;

  joinAlliance: (name: string) => void;
  donateAlliance: () => void;
  sendChat: (text: string) => void;

  askConfirm: (c: ConfirmState) => void;
  closeConfirm: () => void;
}

export const useGame = create<Store>((set, get) => ({
  screen: 'login',
  account: '',
  serverId: null,
  state: null,
  servers: SERVERS,
  selectedSlot: null,
  target: null,
  battle: null,
  confirm: null,
  toasts: [],
  allianceChat: [],

  toast: (msg, kind = 'info') => {
    const id = toastId++;
    set(s => ({ toasts: [...s.toasts, { id, msg, kind }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3200);
  },

  signup: (acc, pw) => {
    const accs = readAccounts();
    if (!acc || !pw) { get().toast('Nhập đủ tên tài khoản và mật khẩu!', 'bad'); return false; }
    if (accs[acc]) { get().toast('Tài khoản đã tồn tại — hãy Đăng nhập', 'bad'); return false; }
    accs[acc] = pw;
    try { localStorage.setItem(ACC_KEY, JSON.stringify(accs)); } catch { /* ignore */ }
    get().toast(`👑 Tạo tài khoản ${acc} thành công — chọn server để vào game!`, 'good');
    return true;
  },

  login: (acc, pw) => {
    const accs = readAccounts();
    if (!accs[acc]) { get().toast('Tài khoản chưa tồn tại — hãy Tạo tài khoản', 'bad'); return false; }
    if (accs[acc] !== pw) { get().toast('Sai mật khẩu!', 'bad'); return false; }
    set({ account: acc });
    get().toast(`Chào mừng trở lại, ${acc}! Chọn server bên dưới.`, 'good');
    return true;
  },

  enterServer: (id) => {
    const sv = SERVERS.find(s => s.id === id);
    if (!sv) return;
    if (sv.status === 'maint') { get().toast('🔧 Server đang bảo trì!', 'bad'); return; }
    const account = get().account || 'Lãnh Chúa';
    let state: GameState;
    try {
      const raw = localStorage.getItem(saveKeyOf(id));
      const parsed = raw ? JSON.parse(raw) as GameState : null;
      state = parsed && parsed.tiles?.length ? parsed : createInitialState(account, id);
    } catch {
      state = createInitialState(account, id);
    }
    state.account = account;
    updateFog(state);
    set({ serverId: id, state, screen: 'city', selectedSlot: null, target: null, battle: null });
    get().toast(`🏰 Vào ${sv.name} — bắt đầu với 1 mẫu đất!`, 'good');
  },

  logout: () => set({ screen: 'login', account: '', serverId: null, state: null, battle: null, target: null }),

  setScreen: (s) => set({ screen: s, selectedSlot: s === 'city' ? get().selectedSlot : null }),

  selectSlot: (id) => set({ selectedSlot: id }),

  resetSave: () => {
    const { serverId } = get();
    if (!serverId) return;
    try { localStorage.removeItem(saveKeyOf(serverId)); } catch { /* ignore */ }
    const st = createInitialState(get().account || 'Lãnh Chúa', serverId);
    updateFog(st);
    set({ state: st, battle: null, target: null, screen: 'city' });
    get().toast('🔄 Đã tạo lại ván chơi mới', 'info');
  },

  // ---- tick 1 giây: engine tính toàn bộ, store chỉ phát toast ----
  tick: () => {
    const st = get().state;
    if (!st) return;
    const now = Date.now() / 1000;
    const dt = Math.min(5, now - st.lastTick);
    if (dt <= 0) return;
    const events = tickState(st, dt);
    persist(st, get().serverId);
    set({ state: { ...st } });
    for (const e of events) get().toast(e, 'good');
  },

  build: (slotId, key) => {
    const st = get().state;
    if (!st) return;
    const r = startConstruction(st, slotId, key);
    if (!r.ok) { get().toast('❌ ' + r.error, 'bad'); return; }
    persist(st, get().serverId);
    set({ state: { ...st }, selectedSlot: null });
    get().toast('🏗️ Bắt đầu xây ' + key + '!', 'good');
  },

  upgrade: (slotId) => {
    const st = get().state;
    if (!st) return;
    const r = startUpgrade(st, slotId);
    if (!r.ok) { get().toast('❌ ' + r.error, 'bad'); return; }
    persist(st, get().serverId);
    set({ state: { ...st }, selectedSlot: null });
    get().toast('⬆️ Đưa vào hàng đợi nâng cấp!', 'good');
  },

  speedUpJob: (jobId) => {
    const st = get().state;
    if (!st) return;
    const r = speedUp(st, jobId);
    if (!r.ok) { get().toast('❌ ' + r.error, 'bad'); return; }
    persist(st, get().serverId);
    set({ state: { ...st } });
    get().toast('⚡ Đẩy nhanh hoàn thành!', 'good');
  },

  train: (unit, n) => {
    const st = get().state;
    if (!st) return;
    const r = trainUnits(st, unit, n);
    if (!r.ok) { get().toast('❌ ' + r.error, 'bad'); return; }
    persist(st, get().serverId);
    set({ state: { ...st } });
    get().toast(`⚔️ Tuyển ${n} ${UNITS[unit].name}...`, 'good');
  },

  setTarget: (t) => set({ target: t }),

  launch: (tileId, formation, hero) => {
    const st = get().state;
    if (!st) return;
    const r = launchAttack(st, tileId, formation, hero);
    if (!r.ok) { get().toast('❌ ' + r.error, 'bad'); return; }
    persist(st, get().serverId);
    set({ state: { ...st }, battle: r.result });
    get().toast(r.result.win ? '🏆 CHIẾN THẮNG!' : '💀 THẤT TRẬN...', r.result.win ? 'good' : 'bad');
  },

  finishBattle: () => set({ battle: null, target: null, screen: 'map' }),

  recruitHero: (key) => {
    const st = get().state;
    if (!st) return;
    const H = HEROES[key];
    if (st.res.gold < H.cost.gold) { get().toast('❌ Không đủ vàng!', 'bad'); return; }
    st.res.gold -= H.cost.gold;
    st.heroes = st.heroes.map(h => (h.key === key ? { ...h, owned: true } : h));
    persist(st, get().serverId);
    set({ state: { ...st } });
    get().toast(`🎖️ ${H.name} gia nhập quân đội!`, 'good');
  },

  upgradeHero: (key) => {
    const st = get().state;
    if (!st) return;
    const h = st.heroes.find(x => x.key === key);
    if (!h || !h.owned) return;
    if (h.level >= HERO_MAX_LEVEL) { get().toast('✔ Tướng đã đạt cấp tối đa', 'info'); return; }
    const need = h.level + 1; // nâng cấp tốn Bức họa = cấp hiện tại + 1
    if (st.paintings < need) { get().toast(`❌ Cần ${need} 🖼️ Bức họa!`, 'bad'); return; }
    st.paintings -= need;
    st.heroes = st.heroes.map(x => (x.key === key ? { ...x, level: x.level + 1 } : x));
    persist(st, get().serverId);
    set({ state: { ...st } });
    get().toast(`⬆️ ${HEROES[key].name} lên cấp ${h.level + 1}!`, 'good');
  },

  setActiveHero: (key) => {
    const st = get().state;
    if (!st) return;
    st.heroes = st.heroes.map(h => ({ ...h, active: h.key === key && h.owned }));
    persist(st, get().serverId);
    set({ state: { ...st } });
    get().toast(`🎖️ ${HEROES[key].name} làm chủ tướng!`, 'good');
  },

  garrisonTo: (squadIdx, unit, delta) => {
    const st = get().state;
    if (!st) return;
    if (!st.defense) st.defense = [];
    const sq = st.defense[squadIdx] ?? (st.defense[squadIdx] = { spear: 0, shield: 0, archer: 0, crossbow: 0, cav: 0 });
    if (delta > 0 && st.army[unit] < 1) { get().toast('Không đủ quân trong doanh', 'bad'); return; }
    if (delta < 0 && sq[unit] < 1) return;
    sq[unit] += delta;
    st.army[unit] -= delta;
    persist(st, get().serverId);
    set({ state: { ...st } });
  },

  autoGarrison: () => {
    const st = get().state;
    if (!st) return;
    if (!st.defense) st.defense = [];
    // chia quân tự do vào 5 đội phòng thủ
    for (let i = 0; i < 5; i++) {
      const sq = st.defense[i] ?? (st.defense[i] = { spear: 0, shield: 0, archer: 0, crossbow: 0, cav: 0 });
      for (const k of Object.keys(st.army) as UnitKey[]) {
        const give = Math.floor(st.army[k] / (5 - i));
        sq[k] += give;
        st.army[k] -= give;
      }
    }
    persist(st, get().serverId);
    set({ state: { ...st } });
    get().toast('🛡️ Đã chia quân phòng thủ!', 'good');
  },

  joinAlliance: (name) => {
    const st = get().state;
    if (!st) return;
    st.alliance.joined = name;
    persist(st, get().serverId);
    set({ state: { ...st }, allianceChat: [{ who: 'Hệ thống', text: `Bạn đã gia nhập liên minh ${name}!`, me: false }] });
    get().toast(`🤝 Đã gia nhập ${name}!`, 'good');
  },

  donateAlliance: () => {
    const st = get().state;
    if (!st) return;
    if (st.res.food < 100) { get().toast('❌ Cần 100 🌾 để đóng góp', 'bad'); return; }
    st.res.food -= 100;
    st.alliance.tech += 10;
    persist(st, get().serverId);
    set({ state: { ...st } });
    get().toast('🎁 Đóng góp +10 điểm công nghệ liên minh!', 'good');
  },

  sendChat: (text) => {
    if (!text.trim()) return;
    const st = get().state;
    const nick = st?.account ?? 'Tôi';
    const bots = ['Quan Vũ', 'Triệu Vân', 'Hoàng Trung', 'Trương Phi'];
    const reply = bots[Math.floor(Math.random() * bots.length)] + ': Đồng ý! Cùng đánh chiếm thêm đất nhé.';
    set(s => ({ allianceChat: [...s.allianceChat, { who: nick, text, me: true }, { who: reply.split(':')[0], text: reply.split(':')[1], me: false }] }));
  },

  askConfirm: (c) => set({ confirm: c }),
  closeConfirm: () => set({ confirm: null }),
}));
