import { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/gameStore';
import { CITY_X, CITY_Y, MAP_H, MAP_W, TS } from '../engine/map';
import { isAdjacentToOwned, ratesPerSec } from '../engine/engine';
import { UNITS, UNIT_KEYS } from '../engine/config';
import { drawTileIcon } from '../assets/sprites';
import ResourceBar from '../components/ResourceBar';
import NavBar from '../components/NavBar';
import type { GameState, Tile } from '../engine/types';

const TILE_NAMES: Record<string, string> = {
  city: 'Thành Chính', plain: 'Đất Trống', crop: 'Ô Lương Điền', forest: 'Rừng Gỗ',
  stone: 'Mỏ Đá', iron: 'Mỏ Sắt', bandit: 'Trại Quân Cướp',
};

const TILE_BG: Record<string, string> = {
  city: '#4a5a3a', plain: '#3d5a2a', crop: '#5a6a2a', forest: '#2f4a24',
  stone: '#4a4a42', iron: '#3a3a42', bandit: '#5a3a28',
};

/** MÀN HÌNH 3: BẢN ĐỒ THẾ GIỚI — canvas pan/zoom, sương mù, chiếm đóng */
export default function WorldMapScreen() {
  const st = useGame(s => s.state);
  const setScreen = useGame(s => s.setScreen);
  const setTarget = useGame(s => s.setTarget);
  const askConfirm = useGame(s => s.askConfirm);
  const [selected, setSelected] = useState<number | null>(null);
  const [filters, setFilters] = useState({ res: false, enemy: false, plain: false });
  const [zoomLabel, setZoomLabel] = useState(120);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cam = useRef({ x: (CITY_X + 0.5) * TS, y: (CITY_Y + 0.5) * TS, zoom: 1.2 });
  const keys = useRef(new Set<string>());
  const drag = useRef<{ sx: number; sy: number; cx: number; cy: number; moved: boolean } | null>(null);
  const hover = useRef<{ x: number; y: number } | null>(null);
  // refs để vòng vẽ rAF luôn đọc giá trị mới mà không cần khởi động lại loop
  const stRef = useRef(st); stRef.current = st;
  const selRef = useRef(selected); selRef.current = selected;
  const filtersRef = useRef(filters); filtersRef.current = filters;

  // ---- vòng vẽ requestAnimationFrame: camera + render ----
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const g = cv.getContext('2d');
    if (!g) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      // di chuyển camera mượt bằng WASD / mũi tên
      const sp = 340 * dt / cam.current.zoom;
      const k = keys.current;
      if (k.has('w') || k.has('arrowup')) cam.current.y -= sp;
      if (k.has('s') || k.has('arrowdown')) cam.current.y += sp;
      if (k.has('a') || k.has('arrowleft')) cam.current.x -= sp;
      if (k.has('d') || k.has('arrowright')) cam.current.x += sp;
      clampCam();
      drawMap(g, cv, stRef.current!, cam.current, selRef.current, filtersRef.current, hover.current, now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const kd = (e: KeyboardEvent) => keys.current.add(e.key.toLowerCase());
    const ku = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);

  function clampCam() {
    const c = cam.current;
    c.x = Math.max(0, Math.min(MAP_W * TS, c.x));
    c.y = Math.max(0, Math.min(MAP_H * TS, c.y));
    c.zoom = Math.max(0.6, Math.min(2.4, c.zoom));
  }

  function toTile(e: { clientX: number; clientY: number }): Tile | null {
    const cv = canvasRef.current;
    if (!cv) return null;
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (cv.width / rect.width);
    const my = (e.clientY - rect.top) * (cv.height / rect.height);
    const wx = (mx - cv.width / 2) / cam.current.zoom + cam.current.x;
    const wy = (my - cv.height / 2) / cam.current.zoom + cam.current.y;
    const tx = Math.floor(wx / TS), ty = Math.floor(wy / TS);
    const s = stRef.current;
    if (!s || tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return null;
    return s.tiles[ty * MAP_W + tx] ?? null;
  }

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { sx: e.clientX, sy: e.clientY, cx: cam.current.x, cy: cam.current.y, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const t = toTile(e);
    hover.current = t ? { x: t.x, y: t.y } : null;
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (Math.abs(dx) + Math.abs(dy) > 5) d.moved = true; // vượt ngưỡng → tính là kéo camera
    if (d.moved) {
      const cv = canvasRef.current!;
      const rect = cv.getBoundingClientRect();
      const scale = cv.width / rect.width;
      cam.current.x = d.cx - (dx * scale) / cam.current.zoom;
      cam.current.y = d.cy - (dy * scale) / cam.current.zoom;
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) {
      const t = toTile(e);
      setSelected(t ? t.id : null);
    }
  };

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const cv = canvasRef.current!;
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (cv.width / rect.width);
    const my = (e.clientY - rect.top) * (cv.height / rect.height);
    const old = cam.current.zoom;
    const nz = Math.min(2.4, Math.max(0.6, old * (e.deltaY < 0 ? 1.12 : 0.89)));
    // giữ điểm dưới con trỏ đứng yên khi zoom
    cam.current.x += (mx - cv.width / 2) * (1 / old - 1 / nz);
    cam.current.y += (my - cv.height / 2) * (1 / old - 1 / nz);
    cam.current.zoom = nz;
    setZoomLabel(Math.round(nz * 100));
  }

  const goCenter = () => {
    cam.current.x = (CITY_X + 0.5) * TS;
    cam.current.y = (CITY_Y + 0.5) * TS;
  };

  if (!st) return null;
  const tile = selected != null ? st.tiles.find(t => t.id === selected) ?? null : null;
  const attackable = (t: Tile) =>
    t.type === 'bandit' && t.discovered && isAdjacentToOwned(st, t) && st.tokens > 0;

  const goCapture = (t: Tile) => {
    askConfirm({
      title: '⚔️ CHIẾM ĐÓNG',
      text: `Xuất chinh chiếm ${TILE_NAMES[t.type]} (cấp ${t.level}) ở (${t.x},${t.y})? Tốn 1 🎟️ Lệnh Chinh Phạt.`,
      onOk: () => { setTarget(t); setScreen('battle'); },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 pb-6">
      <ResourceBar />
      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        <div className="flex-1">
          <h2 className="font-pixel text-gold text-sm mb-2">🗺️ BẢN ĐỒ THẾ GIỚI</h2>
          <canvas
            ref={canvasRef}
            width={960}
            height={600}
            className="w-full pixel-border touch-none cursor-grab active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={() => { drag.current = null; hover.current = null; }}
            onWheel={onWheel}
          />
          <div className="flex gap-2 flex-wrap items-center mt-2">
            <span className="font-body text-lg opacity-70">
              Kéo chuột di chuyển · lăn chuột zoom · WASD/mũi tên · click ô để xem · {zoomLabel}%
            </span>
            <button className="btn text-[8px]" onClick={goCenter}>🎯 VỀ THÀNH</button>
            <button className={`btn text-[8px] ${filters.res ? 'btn-gold' : ''}`} onClick={() => setFilters(f => ({ ...f, res: !f.res }))}>🌾 TÀI NGUYÊN</button>
            <button className={`btn text-[8px] ${filters.enemy ? 'btn-gold' : ''}`} onClick={() => setFilters(f => ({ ...f, enemy: !f.enemy }))}>⚔️ ĐỊCH</button>
            <button className={`btn text-[8px] ${filters.plain ? 'btn-gold' : ''}`} onClick={() => setFilters(f => ({ ...f, plain: !f.plain }))}>⬜ TRỐNG</button>
          </div>
        </div>

        {/* Panel thông tin ô đất (khi click) */}
        <div className="w-full lg:w-80">
          <div className="pixel-border bg-panel p-4 min-h-[300px]">
            <h3 className="font-pixel text-[10px] text-gold mb-3">📌 THÔNG TIN Ô ĐẤT</h3>
            {!tile && <p className="font-body text-lg opacity-70">Click vào một ô trên bản đồ để xem chi tiết.</p>}
            {tile && (
              <div>
                <b className="font-body text-2xl">{TILE_NAMES[tile.type]}{tile.level > 0 ? ` — Cấp ${tile.level}` : ''}</b>
                <div className="font-body text-lg opacity-70">Tọa độ ({tile.x}, {tile.y})</div>
                <div className="font-body text-lg mt-1">
                  Chủ: {tile.owner === 'player' ? '🟢 Lãnh thổ của bạn' : tile.owner === 'bandit' ? '🔴 Quân cướp' : '⚪ Tranh chấp'}
                </div>

                {!tile.discovered && (
                  <p className="font-body text-lg mt-2 opacity-80">🌫️ Sương mù che phủ — tiến gần lãnh thổ để trinh sát.</p>
                )}

                {tile.discovered && tile.owner === 'bandit' && (
                  <div className="mt-2">
                    <b className="font-body text-xl">Quân trú phòng:</b>
                    <div className="font-body text-lg">
                      {UNIT_KEYS.filter(k => (tile.garrison[k] ?? 0) > 0).map(k => (
                        <span key={k} className="mr-3" title={UNITS[k].desc}>{UNITS[k].icon} ×{tile.garrison[k]}</span>
                      ))}
                    </div>
                  </div>
                )}

                {tile.discovered && tile.owner === 'player' && tile.type !== 'city' && (
                  <p className="font-body text-lg mt-2 text-green-300">
                    Đang sản xuất tài nguyên cho bạn mỗi phút.
                  </p>
                )}

                {tile.owner === 'bandit' && (
                  <div className="mt-3">
                    <button className="btn btn-red w-full" disabled={!attackable(tile)} onClick={() => goCapture(tile)}>
                      ⚔️ CHIẾM ĐÓNG
                    </button>
                    {!attackable(tile) && (
                      <p className="font-body text-base opacity-70 mt-1">
                        {st.tokens < 1
                          ? 'Hết Lệnh Chinh Phạt (hồi 1 lệnh/phút).'
                          : !tile.discovered
                            ? 'Cần trinh sát trước.'
                            : !isAdjacentToOwned(st, tile)
                              ? 'Chỉ đánh được ô kề lãnh thổ của bạn.'
                              : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <NavBar />
    </div>
  );
}

// ----------------- VẼ BẢN ĐỒ -----------------
function drawMap(
  g: CanvasRenderingContext2D, cv: HTMLCanvasElement, st: GameState,
  cam: { x: number; y: number; zoom: number },
  selected: number | null,
  filters: { res: boolean; enemy: boolean; plain: boolean },
  hover: { x: number; y: number } | null,
  now: number,
) {
  const W = cv.width, H = cv.height;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#141d10';
  g.fillRect(0, 0, W, H);
  const z = cam.zoom;
  const s = TS * z;

  for (const t of st.tiles) {
    const sx = (t.x * TS - cam.x) * z + W / 2;
    const sy = (t.y * TS - cam.y) * z + H / 2;
    if (sx < -s || sy < -s || sx > W || sy > H) continue; // cull ô ngoài màn hình
    g.fillStyle = TILE_BG[t.type] ?? '#3d5a2a';
    g.fillRect(sx, sy, s, s);
    g.strokeStyle = 'rgba(20,12,4,.4)';
    g.lineWidth = 1;
    g.strokeRect(sx + 0.5, sy + 0.5, s - 1, s - 1);
    if (t.discovered) {
      drawTileIcon(g, t.type, sx + s * 0.25, sy + s * 0.2, s / 18);
      if (t.type === 'bandit') {
        g.fillStyle = '#c23a3a';
        g.fillRect(sx + s - 14, sy + 2, 12, 12);
        g.fillStyle = '#fff';
        g.font = 'bold 10px monospace';
        g.textAlign = 'center';
        g.fillText(String(t.level), sx + s - 8, sy + 11);
      }
      if (t.owner === 'player' && t.type !== 'city') {
        g.strokeStyle = '#4d8a2b';
        g.lineWidth = 3;
        g.strokeRect(sx + 1.5, sy + 1.5, s - 3, s - 3); // viền lãnh thổ
      }
    } else {
      // sương mù chiến tranh
      g.fillStyle = 'rgba(10,14,8,.92)';
      g.fillRect(sx, sy, s, s);
      g.fillStyle = 'rgba(200,200,180,.25)';
      g.font = `${Math.round(s * 0.4)}px monospace`;
      g.textAlign = 'center';
      g.fillText('?', sx + s / 2, sy + s * 0.62);
    }
    // highlight theo bộ lọc
    const isRes = t.discovered && ['crop', 'forest', 'stone', 'iron'].includes(t.type);
    const isEnemy = t.discovered && t.type === 'bandit';
    const isPlain = t.discovered && t.type === 'plain' && t.owner !== 'player';
    const hl = (filters.res && isRes) || (filters.enemy && isEnemy) || (filters.plain && isPlain);
    if (hl) {
      g.strokeStyle = Math.floor(now / 300) % 2 ? '#ffd75e' : '#a8821e';
      g.lineWidth = 3;
      g.strokeRect(sx + 2, sy + 2, s - 4, s - 4);
    }
    if (hover && hover.x === t.x && hover.y === t.y) {
      g.strokeStyle = 'rgba(245,230,200,.7)';
      g.lineWidth = 2;
      g.strokeRect(sx + 1, sy + 1, s - 2, s - 2);
    }
    if (selected === t.id) {
      g.strokeStyle = '#ffd75e';
      g.lineWidth = 4;
      g.strokeRect(sx + 2, sy + 2, s - 4, s - 4);
    }
  }
  // cờ trên thành người chơi
  const ct = st.tiles.find(t => t.type === 'city');
  if (ct) {
    const sx = (ct.x * TS + TS / 2 - cam.x) * z + W / 2;
    const sy = (ct.y * TS - cam.y) * z + H / 2;
    g.fillStyle = '#ffd75e';
    g.font = `${Math.round(s * 0.4)}px monospace`;
    g.textAlign = 'center';
    g.fillText('🏰', sx, sy - s * 0.15);
  }
}
