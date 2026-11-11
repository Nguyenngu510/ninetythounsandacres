import { useEffect } from 'react';
import { useGame } from './store/gameStore';
import LoginScreen from './screens/LoginScreen';
import CityScreen from './screens/CityScreen';
import WorldMapScreen from './screens/WorldMapScreen';
import BattleScreen from './screens/BattleScreen';
import ArmyScreen from './screens/ArmyScreen';
import AllianceScreen from './screens/AllianceScreen';
import Toasts from './components/Toasts';
import ConfirmModal from './components/ConfirmModal';

export default function App() {
  const screen = useGame(s => s.screen);
  const hasState = useGame(s => !!s.state);

  // Vòng lặp game: tick mỗi giây — cộng tài nguyên, xử lý hàng đợi xây dựng/huấn luyện
  useEffect(() => {
    const iv = setInterval(() => useGame.getState().tick(), 1000);
    return () => clearInterval(iv);
  }, []);

  // Phím tắt toàn cục: B = xây dựng, M = bản đồ
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const s = useGame.getState();
      if (!s.state) return;
      if (e.key === 'b' || e.key === 'B') {
        s.setScreen('city');
        const empty = s.state.slots.find(sl => !sl.building && !s.state!.constructions.some(j => j.slotId === sl.id));
        if (empty) s.selectSlot(empty.id);
      }
      if (e.key === 'm' || e.key === 'M') s.setScreen('map');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!hasState || screen === 'login') return <LoginScreen />;

  return (
    <div className="min-h-screen py-3">
      {screen === 'city' && <CityScreen />}
      {screen === 'map' && <WorldMapScreen />}
      {screen === 'battle' && <BattleScreen />}
      {screen === 'army' && <ArmyScreen />}
      {screen === 'alliance' && <AllianceScreen />}
      <Toasts />
      <ConfirmModal />
    </div>
  );
}
