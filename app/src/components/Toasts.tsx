import { useGame } from '../store/gameStore';

/** Toast notification — hiện góc phải trên, tự tắt sau 3.2s */
export default function Toasts() {
  const toasts = useGame(s => s.toasts);
  return (
    <div className="fixed top-3 right-3 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pixel-border px-4 py-2 font-body text-lg max-w-xs ${
            t.kind === 'good' ? 'bg-[#2c5218] text-[#d8ffc0]' : t.kind === 'bad' ? 'bg-[#571c10] text-[#ffd0c0]' : 'bg-panel text-parchment'
          }`}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
