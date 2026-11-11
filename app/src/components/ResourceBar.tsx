import { useGame } from '../store/gameStore';
import { RES_INFO } from '../engine/config';
import { bLevel } from '../engine/engine';
import type { ResourceKey } from '../engine/types';

/** Top bar tài nguyên: dạng current/max, tooltip giải thích khi hover */
export default function ResourceBar() {
  const st = useGame(s => s.state);
  const serverId = useGame(s => s.serverId);
  const logout = useGame(s => s.logout);
  const resetSave = useGame(s => s.resetSave);
  if (!st) return null;
  const keys: ResourceKey[] = ['food', 'wood', 'stone', 'gold', 'iron'];
  const capFood = 500 + 800 * bLevel(st, 'granary');
  const capMat = 400 + 600 * bLevel(st, 'warehouse');
  return (
    <div className="flex items-center gap-2 flex-wrap bg-panel px-3 py-2 pixel-border">
      {keys.map(k => {
        const cap = k === 'gold' ? Infinity : k === 'food' ? capFood : capMat;
        const full = st.res[k] >= cap;
        return (
          <div
            key={k}
            title={`${RES_INFO[k].name}: ${Math.floor(st.res[k])}/${cap === Infinity ? '∞' : cap} — nâng Kho Lương/Nhà Kho để tăng trần`}
            className={`px-2 py-1 bg-ink border-2 border-panelLight font-body text-lg ${full ? 'text-red-400' : 'text-parchment'}`}
          >
            {RES_INFO[k].icon} {Math.floor(st.res[k])}
            <span className="opacity-60">/{cap === Infinity ? '∞' : cap}</span>
          </div>
        );
      })}
      <div title="Lệnh Chinh Phạt — mỗi lần xuất chinh tốn 1 lệnh, hồi 1 lệnh/phút" className="px-2 py-1 bg-ink border-2 border-panelLight font-body text-lg">
        🎟️ {st.tokens}/5
      </div>
      <div title="Bức họa — dùng nâng cấp Võ Tướng (thắng trận để nhận)" className="px-2 py-1 bg-ink border-2 border-panelLight font-body text-lg">
        🖼️ {st.paintings}
      </div>
      <div className="ml-auto font-body text-lg opacity-80">
        {st.account} @ {serverId} · Thắng {st.wins}/Thua {st.losses}
      </div>
      <button className="btn text-[8px]" onClick={resetSave} title="Chơi lại từ đầu trên server này">↺</button>
      <button className="btn btn-red text-[8px]" onClick={logout}>Thoát</button>
    </div>
  );
}
