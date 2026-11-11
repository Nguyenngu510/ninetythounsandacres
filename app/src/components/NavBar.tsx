import { useGame, type Screen } from '../store/gameStore';

const TABS: { key: Screen; label: string; hotkey: string }[] = [
  { key: 'city', label: '🏰 Nội trị', hotkey: 'B' },
  { key: 'map', label: '🗺️ Bản đồ', hotkey: 'M' },
  { key: 'army', label: '⚔️ Quân đội', hotkey: '' },
  { key: 'alliance', label: '🤝 Liên minh', hotkey: '' },
];

/** Thanh điều hướng dưới màn hình */
export default function NavBar() {
  const screen = useGame(s => s.screen);
  const setScreen = useGame(s => s.setScreen);
  return (
    <div className="flex gap-2 justify-center flex-wrap py-2">
      {TABS.map(t => (
        <button
          key={t.key}
          className={`btn ${screen === t.key ? 'btn-gold' : ''}`}
          onClick={() => setScreen(t.key)}
          title={t.hotkey ? `Phím tắt: ${t.hotkey}` : ''}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
