import { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/gameStore';
import { HEROES, RES_INFO, UNITS, UNIT_KEYS } from '../engine/config';
import type { HeroKey, ResourceKey, UnitKey } from '../engine/types';
import { drawUnitSprite, drawHeroSprite, px } from '../assets/sprites';
import ResourceBar from '../components/ResourceBar';

/** MÀN HÌNH 4: CHUẨN BỊ ĐỘI HÌNH & CHIẾN ĐẤU (auto-battler theo vòng) */
export default function BattleScreen() {
  const st = useGame(s => s.state);
  const target = useGame(s => s.target);
  const battle = useGame(s => s.battle);
  const launch = useGame(s => s.launch);
  const finishBattle = useGame(s => s.finishBattle);
  const toast = useGame(s => s.toast);
  const [grid, setGrid] = useState<(UnitKey | null)[]>(Array(8).fill(null));
  const [selUnit, setSelUnit] = useState<UnitKey | null>(null);
  const [heroKey, setHeroKey] = useState<HeroKey | null>(null);

  // mặc định chọn chủ tướng đang active
  useEffect(() => {
    if (!st) return;
    const act = st.heroes.find(h => h.owned && h.active);
    if (act) setHeroKey(act.key);
  }, [st?.account]);

  if (!st || !target) return null;

  const used: Record<string, number> = {};
  grid.forEach(u => { if (u) used[u] = (used[u] ?? 0) + 1; });
  const available = (k: UnitKey) => st.army[k] - (used[k] ?? 0);

  const place = (idx: number, unit: UnitKey | null) => {
    setGrid(g => {
      const n = [...g];
      // gỡ quân cũ ở ô này (nếu có)
      n[idx] = unit;
      return n;
    });
  };

  const removeAt = (idx: number) => setGrid(g => { const n = [...g]; n[idx] = null; return n; });

  // click chip → chọn → click ô để đặt (thân thiện mobile); kéo-thả cho desktop
  const clickCell = (idx: number) => {
    if (grid[idx]) { removeAt(idx); return; }
    if (selUnit && available(selUnit) > 0) place(idx, selUnit);
  };

  // Phím A: tự xếp đội hình — tiền tuyến Khiên/Thương/Kỵ, hậu tuyến Nỏ/Cung
  const autoArrange = () => {
    const n: (UnitKey | null)[] = Array(8).fill(null);
    const frontPref: UnitKey[] = ['shield', 'spear', 'cav'];
    const backPref: UnitKey[] = ['crossbow', 'archer', 'spear', 'shield'];
    const pool: Record<string, number> = {};
    UNIT_KEYS.forEach(k => { pool[k] = st.army[k]; });
    let cell = 4; // hàng trước của người chơi là hàng dưới (index 4..7)
    for (const k of frontPref) {
      while (cell < 8 && pool[k] > 0) { n[cell++] = k; pool[k]--; }
    }
    cell = 0;
    for (const k of backPref) {
      while (cell < 4 && pool[k] > 0) { n[cell++] = k; pool[k]--; }
    }
    setGrid(n);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'a' || e.key === 'A') && !battle) autoArrange();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const start = () => {
    launch(target.id, grid, heroKey);
  };

  const enemyGrid = enemyFormation(target.garrison);

  return (
    <div className="max-w-6xl mx-auto px-3 pb-6">
      <ResourceBar />
      <h2 className="font-pixel text-gold text-sm mt-4 mb-3">⚔️ CHUẨN BỘ ĐỘI HÌNH</h2>
      <p className="font-body text-lg opacity-70 mb-3">
        Mục tiêu: ô ({target.x},{target.y}) · Kéo quân từ danh sách xuống bàn cờ (hoặc click chip → click ô) · <b>A</b> = tự xếp
      </p>

      {!battle ? (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Bàn cờ 4x2 hai bên */}
          <div className="flex-1">
            <div className="pixel-border bg-[#241a10] p-3">
              <div className="font-pixel text-[8px] text-red-300 mb-1">🔴 ĐỊCH (tự động)</div>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {enemyGrid.map((u, i) => (
                  <div key={i} className="h-16 bg-[#3a221a] border-2 border-[#7d2c1c] flex items-center justify-center">
                    {u && <SpriteMini unit={u} team="enemy" />}
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-dashed border-panelLight my-2" />
              <div className="font-pixel text-[8px] text-blue-300 mb-1">🔵 QUÂN CỦA BẠN (hàng dưới = tiền tuyến)</div>
              <div className="grid grid-cols-4 gap-1">
                {grid.map((u, i) => (
                  <div
                    key={i}
                    className={`h-16 border-2 flex items-center justify-center cursor-pointer ${
                      i < 4 ? 'bg-[#1a2a3a] border-[#1d4d7a]' : 'bg-[#1a3a2a] border-[#2c5218]'
                    } hover:border-gold`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const k = e.dataTransfer.getData('text/plain') as UnitKey; if (k && available(k) > 0) place(i, k); }}
                    onClick={() => clickCell(i)}
                  >
                    {u ? <SpriteMini unit={u} team="player" /> : <span className="opacity-30 font-body text-lg">＋</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Chọn chủ tướng */}
            <div className="pixel-border bg-panel p-3 mt-3">
              <div className="font-pixel text-[8px] text-gold mb-2">🎖️ CHỦ TƯỚNG</div>
              <div className="flex gap-2 flex-wrap">
                {st.heroes.filter(h => h.owned).map(h => (
                  <button
                    key={h.key}
                    className={`btn text-[8px] ${heroKey === h.key ? 'btn-gold' : ''}`}
                    onClick={() => setHeroKey(h.key)}
                    title={`${HEROES[h.key].skill.name}: ${HEROES[h.key].skill.desc}`}
                  >
                    {HEROES[h.key].name} Lv{h.level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Danh sách quân (roster) — kéo vào bàn cờ */}
          <div className="w-full lg:w-72">
            <div className="pixel-border bg-panel p-3">
              <div className="font-pixel text-[8px] text-gold mb-2">🎒 QUÂN TRONG DOANH</div>
              {UNIT_KEYS.map(k => (
                <div
                  key={k}
                  draggable={available(k) > 0}
                  onDragStart={e => e.dataTransfer.setData('text/plain', k)}
                  onClick={() => setSelUnit(k)}
                  title={UNITS[k].desc}
                  className={`flex items-center gap-2 bg-ink border-2 px-2 py-1 mb-1 cursor-grab ${
                    selUnit === k ? 'border-gold' : available(k) > 0 ? 'border-panelLight' : 'border-panelLight opacity-40'
                  }`}
                >
                  <span className="text-xl">{UNITS[k].icon}</span>
                  <span className="font-body text-lg flex-1">{UNITS[k].name}</span>
                  <span className="font-body text-lg text-gold">×{available(k)}</span>
                </div>
              ))}
              <button className="btn w-full mt-2 text-[8px]" onClick={autoArrange}>✨ TỰ XẾP (A)</button>
              <button className="btn btn-green w-full mt-2" onClick={start}>⚔️ BẮT ĐẦU CHIẾN ĐẤU</button>
            </div>
          </div>
        </div>
      ) : (
        <BattlePlayback />
      )}
    </div>
  );
}

// ---------- phát lại trận đấu trên canvas ----------
function BattlePlayback() {
  const battle = useGame(s => s.battle)!;
  const finishBattle = useGame(s => s.finishBattle);
  const [roundIdx, setRoundIdx] = useState(0);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const battleRef = useRef(battle); battleRef.current = battle;
  const idxRef = useRef(0); idxRef.current = roundIdx;
  const changeAt = useRef(performance.now());

  useEffect(() => {
    const iv = setInterval(() => {
      setRoundIdx(i => {
        const total = battleRef.current.rounds.length;
        if (i + 1 > total) { clearInterval(iv); return i; }
        if (i + 1 <= total) changeAt.current = performance.now();
        return i + 1;
      });
    }, 1100);
    return () => clearInterval(iv);
  }, []);

  // vòng vẽ
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const g = cv.getContext('2d');
    if (!g) return;
    let raf = 0;
    const loop = () => {
      drawBattle(g, cv, battleRef.current, idxRef.current, changeAt.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const done = roundIdx >= battle.rounds.length;
  const cur = battle.rounds[Math.min(roundIdx, battle.rounds.length) - 1];

  return (
    <div>
      <canvas ref={cvRef} width={480} height={260} className="w-full max-w-2xl pixel-border bg-[#141d10] block" />
      <div className="font-body text-xl mt-2 h-7">{cur ? cur.text : 'Chuẩn bị chiến đấu...'}</div>

      {done && (
        <div className="pixel-border bg-panel p-4 mt-3 max-w-2xl">
          <h3 className={`font-pixel text-sm mb-3 ${battle.win ? 'text-gold' : 'text-red-400'}`}>
            {battle.win ? '🏆 CHIẾN THẮNG!' : '💀 THẤT TRẬN'}
          </h3>
          {battle.win && (
            <p className="font-body text-xl mb-2">
              Rương tài nguyên:{' '}
              {(Object.keys(battle.loot) as ResourceKey[]).filter(k => battle.loot[k] > 0)
                .map(k => `${RES_INFO[k].icon} +${battle.loot[k]}`).join(' · ')}
            </p>
          )}
          <p className="font-body text-lg opacity-80 mb-3">
            Tổn thất:{' '}
            {UNIT_KEYS.filter(k => battle.losses[k] > 0)
              .map(k => `${UNITS[k].icon} -${battle.losses[k]}`).join(' · ') || 'Không có quân nào hy sinh'}
          </p>
          <button className="btn btn-gold" onClick={finishBattle}>🗺️ VỀ BẢN ĐỒ</button>
        </div>
      )}
    </div>
  );
}

function drawBattle(
  g: CanvasRenderingContext2D, cv: HTMLCanvasElement,
  battle: NonNullable<ReturnType<typeof useGame.getState>['battle']>,
  roundIdx: number, changeAt: number,
) {
  const W = cv.width, H = cv.height;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#141d10';
  g.fillRect(0, 0, W, H);
  // nền chiến trường
  g.fillStyle = '#2f4a24';
  g.fillRect(0, H * 0.2, W, H * 0.8);
  g.fillStyle = '#3d5a2a';
  for (let i = 0; i < 10; i++) g.fillRect((i * 53) % W, H * 0.25 + (i * 37) % (H * 0.7), 8, 3);

  const t = performance.now() / 1000;
  const sinceRound = performance.now() - changeAt;
  const cur = battle.rounds[Math.min(roundIdx, battle.rounds.length) - 1];
  const hpFracA = cur ? cur.hpA : 1;
  const hpFracB = cur ? cur.hpB : 1;

  // sprite địch (hàng trên) — quân chết dần từ cuối hàng
  const drawSide = (gridUnits: (UnitKey | null)[], team: 'player' | 'enemy', yBase: number, frac: number, isAtk: boolean) => {
    const n = gridUnits.filter(Boolean).length || 1;
    const aliveCount = Math.ceil(n * frac);
    let drawn = 0;
    gridUnits.forEach((u, i) => {
      if (!u) return;
      const idx = i;
      const dead = drawn >= aliveCount;
      const colX = 40 + (idx % 4) * 105;
      const rowY = yBase + Math.floor(idx / 4) * 40;
      const attacking = !dead && ((isAtk && sinceRound < 350) || (!isAtk && sinceRound >= 350 && sinceRound < 700));
      drawUnitSprite(g, u, colX, rowY, 2, team, t, dead ? 'dead' : attacking ? 'attack' : 'idle');
      drawn++;
    });
  };

  // đội hình giữ đơn giản: vẽ theo deployed
  const depA: (UnitKey | null)[] = [];
  UNIT_KEYS.forEach(k => { for (let i = 0; i < battle.deployed[k]; i++) depA.push(k); });
  while (depA.length < 8) depA.push(null);
  const depB: (UnitKey | null)[] = [];
  // địch: suy ra từ tổng quân mỗi bên qua rounds — hiển thị tối đa 8
  const enemyTotal = Math.min(8, Math.max(4, Math.round((battle.rounds[0]?.dmgB ?? 10) / 8)));
  for (let i = 0; i < enemyTotal; i++) depB.push('spear');
  while (depB.length < 8) depB.push(null);

  drawSide(depB, 'enemy', 24, hpFracB, false);
  drawSide(depA.slice(0, 8), 'player', H - 92, hpFracA, true);

  // chủ tướng giữa đội hình
  drawHeroSprite(g, 'guanyu', W / 2 - 14, H - 130, 2, t, sinceRound < 350 ? 'attack' : 'idle');

  // thanh máu
  px(g, 20, 12, 200, 10, '#241505');
  px(g, 22, 14, 196 * hpFracB, 6, hpFracB > 0.4 ? '#4d8a2b' : '#b0432e');
  px(g, W - 220, 12, 200, 10, '#241505');
  px(g, W - 218, 14, 196 * hpFracA, 6, hpFracA > 0.4 ? '#4d8a2b' : '#b0432e');
  g.fillStyle = '#f5e6c8';
  g.font = '10px monospace';
  g.textAlign = 'left';
  g.fillText('ĐỊCH', 22, 34);
  g.textAlign = 'right';
  g.fillText('TA', W - 22, 34);

  // số sát thương bay lên
  if (cur && sinceRound < 900) {
    const a = 1 - sinceRound / 900;
    g.globalAlpha = a;
    g.fillStyle = '#ffd75e';
    g.font = 'bold 14px monospace';
    g.textAlign = 'center';
    g.fillText(`-${cur.dmgA}`, W / 2 + 60, 60 - sinceRound * 0.03);
    g.fillStyle = '#ff9e8e';
    g.fillText(`-${cur.dmgB}`, W / 2 - 60, 60 - sinceRound * 0.03);
    g.globalAlpha = 1;
  }
}

function SpriteMini({ unit, team }: { unit: UnitKey; team: 'player' | 'enemy' }) {
  return (
    <canvas
      width={12}
      height={14}
      style={{ imageRendering: 'pixelated', width: 48, height: 56 }}
      ref={el => {
        if (!el) return;
        const g = el.getContext('2d');
        if (!g) return;
        g.clearRect(0, 0, 12, 14);
        drawUnitSprite(g, unit, 0, 0, 1, team, 0, 'idle');
      }}
    />
  );
}

/** Xếp đội hình địch: tiền tuyến cận chiến, hậu tuyến tầm xa */
function enemyFormation(g: Partial<Record<UnitKey, number>>): (UnitKey | null)[] {
  const pool: UnitKey[] = [];
  UNIT_KEYS.forEach(k => { for (let i = 0; i < (g[k] ?? 0); i++) pool.push(k); });
  const front = pool.filter(k => !UNITS[k].ranged).slice(0, 4);
  const back = pool.filter(k => UNITS[k].ranged).slice(0, 4);
  const order = [...front, ...back];
  return Array.from({ length: 8 }, (_, i) => order[i] ?? null);
}
