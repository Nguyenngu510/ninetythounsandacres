import { useState } from 'react';
import { useGame } from '../store/gameStore';
import { HEROES, HERO_KEYS, HERO_MAX_LEVEL, STRAT_UNLOCK_LEVEL, UNITS, UNIT_KEYS } from '../engine/config';
import { bLevel, costStr, unitReq } from '../engine/engine';
import { drawHeroSprite } from '../assets/sprites';
import Sprite from '../components/Sprite';
import ResourceBar from '../components/ResourceBar';
import NavBar from '../components/NavBar';
import type { HeroKey, UnitKey } from '../engine/types';

/** MÀN HÌNH 5: QUÂN ĐỘI & ANH HÙNG — huấn luyện, đội phòng thủ, quản lý tướng */
export default function ArmyScreen() {
  const [tab, setTab] = useState<'army' | 'heroes'>('army');
  return (
    <div className="max-w-6xl mx-auto px-3 pb-6">
      <ResourceBar />
      <div className="flex gap-2 mt-4 mb-3">
        <button className={`btn ${tab === 'army' ? 'btn-gold' : ''}`} onClick={() => setTab('army')}>⚔️ QUÂN ĐỘI</button>
        <button className={`btn ${tab === 'heroes' ? 'btn-gold' : ''}`} onClick={() => setTab('heroes')}>🎖️ ANH HÙNG</button>
      </div>
      {tab === 'army' ? <ArmyTab /> : <HeroesTab />}
      <NavBar />
    </div>
  );
}

function ArmyTab() {
  const st = useGame(s => s.state)!;
  const train = useGame(s => s.train);
  const garrisonTo = useGame(s => s.garrisonTo);
  const autoGarrison = useGame(s => s.autoGarrison);
  const barracksLvl = bLevel(st, 'barracks');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Huấn luyện lính trong Doanh Trại */}
      <div className="pixel-border bg-panel p-4">
        <h3 className="font-pixel text-[10px] text-gold mb-3">🏋️ HUẤN LUYỆN (Doanh Trại Lv{barracksLvl})</h3>
        {UNIT_KEYS.map(k => {
          const U = UNITS[k];
          const req = unitReq(k);
          const locked = barracksLvl < req;
          return (
            <div key={k} className={`bg-ink border-2 border-panelLight p-2 mb-2 ${locked ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2 font-body text-lg">
                <span className="text-xl w-8 text-center">{U.icon}</span>
                <div className="flex-1">
                  <b>{U.name}</b> <small className="opacity-60">ATK {U.atk} · HP {U.hp} · {U.desc}</small>
                  <small className="block text-gold">{costStr(U.cost)} · {U.time}s/quân</small>
                </div>
                {[1, 5, 10].map(n => (
                  <button key={n} className="btn btn-green text-[8px]" disabled={locked} onClick={() => train(k, n)}>
                    +{n}
                  </button>
                ))}
                {locked && <span className="font-body text-base">🔒 Doanh Trại lv{req}</span>}
              </div>
            </div>
          );
        })}
        <p className="font-body text-lg opacity-70 mt-2">Quân trong doanh: {UNIT_KEYS.map(k => `${UNITS[k].icon}${st.army[k]}`).join(' ')}</p>
      </div>

      {/* Đội phòng thủ (tối đa 5 đội) */}
      <div className="pixel-border bg-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-pixel text-[10px] text-gold">🛡️ ĐỘI PHÒNG THỦ (tối đa 5)</h3>
          <button className="btn btn-gold text-[8px]" onClick={autoGarrison}>✨ CHIA TỰ ĐỘNG</button>
        </div>
        {(st.defense ?? []).length === 0 && (
          <p className="font-body text-lg opacity-60 mb-2">Chưa có đội phòng thủ — bấm "Chia tự động" hoặc gán thủ công bên dưới.</p>
        )}
        {(st.defense ?? []).map((sq, i) => (
          <div key={i} className="bg-ink border-2 border-panelLight p-2 mb-2">
            <b className="font-body text-lg">Đội {i + 1}:</b>{' '}
            <span className="font-body text-lg">
              {UNIT_KEYS.filter(k => sq[k] > 0).map(k => `${UNITS[k].icon}${sq[k]}`).join(' ') || '(trống)'}
            </span>
            <div className="flex gap-1 mt-1 flex-wrap">
              {UNIT_KEYS.map(k => (
                <span key={k} className="flex items-center gap-1">
                  <button className="btn text-[8px] px-1" onClick={() => garrisonTo(i, k, -1)}>−</button>
                  <span className="font-body text-base">{UNITS[k].icon}</span>
                  <button className="btn text-[8px] px-1" disabled={st.army[k] < 1} onClick={() => garrisonTo(i, k, 1)}>＋</button>
                </span>
              ))}
            </div>
          </div>
        ))}
        {(st.defense ?? []).length < 5 && (
          <button
            className="btn text-[8px]"
            onClick={() => useGame.setState(s => {
              if (!s.state) return {};
              const d = s.state.defense ?? [];
              return { state: { ...s.state, defense: [...d, { spear: 0, shield: 0, archer: 0, crossbow: 0, cav: 0 }] } };
            })}
          >
            ＋ THÊM ĐỘI
          </button>
        )}
        <p className="font-body text-base opacity-60 mt-2">* Đội phòng thủ sẽ tham gia PVP & thủ thành ở bản cập nhật sau.</p>
      </div>
    </div>
  );
}

function HeroesTab() {
  const st = useGame(s => s.state)!;
  const recruitHero = useGame(s => s.recruitHero);
  const upgradeHero = useGame(s => s.upgradeHero);
  const setActiveHero = useGame(s => s.setActiveHero);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {HERO_KEYS.map(k => {
        const H = HEROES[k];
        const h = st.heroes.find(x => x.key === k)!;
        const stratUnlocked = h.level >= STRAT_UNLOCK_LEVEL;
        return (
          <div key={k} className="pixel-border bg-panel p-4">
            <div className="flex items-center gap-3 mb-2">
              <Sprite w={14} h={18} scale={4} draw={g => drawHeroSprite(g, k, 0, 0, 1, 0, 'idle')} />
              <div>
                <b className="font-body text-2xl">{H.name}</b>
                <div className="font-body text-lg opacity-75">«{H.title}»</div>
                <span className={`font-body text-base px-1 ${H.quality === 'SSR' ? 'text-gold' : 'text-purple-300'}`}>
                  {H.quality === 'SSR' ? '⭐ SSR' : '⭐ SR'}
                </span>
              </div>
            </div>
            <p className="font-body text-lg">Cấp {h.level}/{HERO_MAX_LEVEL}</p>
            <p className="font-body text-base opacity-80">
              Nội tại:{' '}
              {H.atkMul ? `+${Math.round((H.atkMul - 1) * 100)}% công` : ''}
              {H.takenMul ? `giữ ${Math.round(H.takenMul * 100)}% sát thương nhận vào` : ''}
              {H.passiveDebuff ? `địch yếu đi ${Math.round((1 - H.passiveDebuff) * 100)}%` : ''}
              {H.rangedMul ? '+25% công quân tầm xa' : ''}
            </p>
            <p className="font-body text-base opacity-80 mt-1">
              Kỹ năng <b className="text-gold">{H.skill.name}</b> (vòng {H.skill.round}): {H.skill.desc}
            </p>
            <p className="font-body text-base mt-1">
              Thao lược <b className={stratUnlocked ? 'text-gold' : 'opacity-50'}>{H.strat.name}</b> — {H.strat.desc}
              {!stratUnlocked && <span className="opacity-60"> 🔒 cấp {STRAT_UNLOCK_LEVEL}</span>}
            </p>
            <div className="mt-3 space-y-2">
              {!h.owned ? (
                <button className="btn btn-gold w-full text-[8px]" disabled={st.res.gold < H.cost.gold} onClick={() => recruitHero(k)}>
                  🎖️ TUYỂN MỘ — {H.cost.gold}💰
                </button>
              ) : (
                <>
                  {!h.active && (
                    <button className="btn btn-green w-full text-[8px]" onClick={() => setActiveHero(k)}>LÀM CHỦ TƯỚNG</button>
                  )}
                  {h.active && <button className="btn w-full text-[8px]" disabled>✔ ĐANG LÀ CHỦ TƯỚNG</button>}
                  <button
                    className="btn w-full text-[8px]"
                    disabled={h.level >= HERO_MAX_LEVEL || st.paintings < h.level + 1}
                    onClick={() => upgradeHero(k)}
                  >
                    {h.level >= HERO_MAX_LEVEL ? '✔ CẤP TỐI ĐA' : `⬆️ NÂNG CẤP — ${h.level + 1}🖼️ (có ${st.paintings})`}
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
