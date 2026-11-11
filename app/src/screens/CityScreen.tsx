import { useGame } from '../store/gameStore';
import { BUILDINGS, BUILDING_KEYS, buildCost, UNITS } from '../engine/config';
import { canAfford, costStr } from '../engine/engine';
import type { BuildingKey, GameState } from '../engine/types';
import { drawBuildingSprite } from '../assets/sprites';
import Sprite from '../components/Sprite';
import ResourceBar from '../components/ResourceBar';
import NavBar from '../components/NavBar';

/** MÀN HÌNH 2: THÀNH CHÍNH / NỘI TRỊ — lưới ô đất, xây & nâng cấp công trình */
export default function CityScreen() {
  const st = useGame(s => s.state);
  const selectedSlot = useGame(s => s.selectedSlot);
  const selectSlot = useGame(s => s.selectSlot);
  const build = useGame(s => s.build);
  const upgrade = useGame(s => s.upgrade);
  const speedUpJob = useGame(s => s.speedUpJob);
  const askConfirm = useGame(s => s.askConfirm);
  if (!st) return null;

  const slot = st.slots.find(s => s.id === selectedSlot) ?? null;
  const keepLvl = bLevelMax(st, 'keep');

  const doBuild = (key: BuildingKey) => {
    if (!slot) return;
    build(slot.id, key);
  };

  const doUpgrade = () => {
    if (!slot || !slot.building) return;
    const next = slot.building.level + 1;
    // modal xác nhận trước nâng cấp lớn (từ cấp 3 trở lên)
    if (next >= 3) {
      askConfirm({
        title: '⬆️ NÂNG CẤP LỚN',
        text: `Nâng ${BUILDINGS[slot.building.key].name} lên cấp ${next}? Sẽ tốn ${costStr(buildCost(slot.building.key, next))}.`,
        onOk: () => upgrade(slot.id),
      });
    } else upgrade(slot.id);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 pb-6">
      <ResourceBar />
      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        {/* Lưới thành: 4x4 ô đất, Thành Chính dựng sẵn ở giữa */}
        <div className="flex-1">
          <h2 className="font-pixel text-gold text-sm mb-3">🏰 THÀNH CHÍNH — NỘI TRỊ</h2>
          <div className="inline-grid grid-cols-4 gap-2 bg-[#241a10] p-3 pixel-border">
            {st.slots.map(sl => (
              <button
                key={sl.id}
                onClick={() => selectSlot(selectedSlot === sl.id ? null : sl.id)}
                title={sl.building ? `${BUILDINGS[sl.building.key].name} cấp ${sl.building.level}` : 'Ô đất trống — click để xây'}
                className={`relative w-[84px] h-[84px] sm:w-[104px] sm:h-[104px] flex items-center justify-center border-2 ${
                  selectedSlot === sl.id ? 'border-gold bg-[#4a3a20]' : 'border-panelLight bg-[#3d5a2a] hover:border-parchment'
                }`}
              >
                {sl.building ? (
                  <>
                    <Sprite
                      w={22} h={22} scale={4}
                      draw={g => drawBuildingSprite(g, sl.building!.key, sl.building!.level, 1, 1, 1)}
                    />
                    <span className="absolute bottom-0 right-1 font-body text-base text-gold">Lv{sl.building.level}</span>
                  </>
                ) : (
                  <span className={`text-3xl transition-opacity ${selectedSlot === sl.id ? 'opacity-70' : 'opacity-0 group-hover:opacity-70'}`}>➕</span>
                )}
              </button>
            ))}
          </div>
          <p className="font-body text-lg opacity-60 mt-2">
            Click ô trống để xây · click công trình để nâng cấp · phím <b>B</b> xây nhanh, <b>M</b> sang bản đồ
          </p>
        </div>

        {/* Panel phải: thông tin ô đang chọn + hàng đợi xây dựng */}
        <div className="w-full lg:w-96 space-y-4">
          <div className="pixel-border bg-panel p-4 min-h-[220px]">
            <h3 className="font-pixel text-[10px] text-gold mb-3">
              {slot ? (slot.building ? '🔧 CÔNG TRÌNH' : '🏗️ XÂY DỰNG') : '📌 CHỌN MỘT Ô ĐẤT'}
            </h3>
            {!slot && <p className="font-body text-lg opacity-70">Click vào một ô trong lưới thành để xây hoặc nâng cấp.</p>}

            {slot && !slot.building && (
              <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                {BUILDING_KEYS.map(key => {
                  const B = BUILDINGS[key];
                  const cost = buildCost(key, 1);
                  const afford = canAfford(st, cost);
                  return (
                    <div key={key} className="bg-ink border-2 border-panelLight p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl w-8 text-center">{B.icon}</span>
                        <div className="flex-1">
                          <b className="font-body text-xl">{B.name}</b>
                          <small className="block font-body text-base opacity-70">{B.desc(1)}</small>
                          <small className="block font-body text-base text-gold">{costStr(cost)}</small>
                        </div>
                        <button className="btn btn-green text-[8px]" disabled={!afford} onClick={() => doBuild(key)}>
                          XÂY
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {slot?.building && (() => {
              const B = BUILDINGS[slot.building.key];
              const lvl = slot.building.level;
              const maxed = lvl >= B.max;
              const gated = slot.building.key !== 'keep' && lvl + 1 > keepLvl;
              const cost = buildCost(slot.building.key, lvl + 1);
              return (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Sprite w={22} h={22} scale={3} draw={g => drawBuildingSprite(g, slot.building!.key, lvl, 1, 1, 1)} />
                    <div>
                      <b className="font-body text-2xl">{B.icon} {B.name}</b>
                      <div className="font-body text-lg text-gold">Cấp {lvl}/{B.max}</div>
                    </div>
                  </div>
                  <p className="font-body text-lg opacity-80 mb-3">{B.desc(Math.max(1, lvl))}</p>
                  {maxed ? (
                    <button className="btn w-full" disabled>✔ TỐI ĐA</button>
                  ) : gated ? (
                    <button className="btn w-full" disabled>🔒 NÂNG THÀNH CHÍNH TRƯỚC</button>
                  ) : (
                    <button className="btn btn-green w-full" onClick={doUpgrade}>
                      ⬆️ NÂNG CẤP — {costStr(cost)}
                    </button>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Hàng đợi xây dựng — engine tick mỗi giây, có thể đẩy nhanh bằng vàng */}
          <div className="pixel-border bg-panel p-4">
            <h3 className="font-pixel text-[10px] text-gold mb-2">⏳ HÀNG ĐỢI XÂY DỰNG</h3>
            {st.constructions.length === 0 && <p className="font-body text-lg opacity-60">Không có công trình nào đang xây.</p>}
            {st.constructions.map(j => (
              <div key={j.id} className="bg-ink border-2 border-panelLight p-2 mb-2">
                <div className="flex items-center justify-between font-body text-lg">
                  <span>{BUILDINGS[j.key].icon} {BUILDINGS[j.key].name} → Lv{j.targetLevel}</span>
                  <span className="text-gold">{Math.ceil(j.remaining)}s</span>
                </div>
                <div className="bg-[#241505] border border-panelLight h-3 mt-1">
                  <div className="bg-green-500 h-full" style={{ width: `${(1 - j.remaining / j.total) * 100}%` }} />
                </div>
                <button className="btn btn-gold text-[8px] mt-1" onClick={() => speedUpJob(j.id)}>
                  ⏩ ĐẨY NHANH ({Math.max(1, Math.ceil(j.remaining))}💰)
                </button>
              </div>
            ))}
            {st.training.map(j => (
              <div key={j.id} className="font-body text-lg flex justify-between opacity-90">
                <span>{UNITS[j.unit].icon} {UNITS[j.unit].name} ×{j.count}</span>
                <span className="text-gold">{Math.ceil(j.remaining)}s</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <NavBar />
    </div>
  );
}

function bLevelMax(st: GameState, key: BuildingKey): number {
  let lvl = 0;
  for (const s of st.slots) if (s.building && s.building.key === key) lvl = Math.max(lvl, s.building.level);
  return lvl;
}
