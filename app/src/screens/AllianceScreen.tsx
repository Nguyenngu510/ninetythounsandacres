import { useState } from 'react';
import { useGame } from '../store/gameStore';
import ResourceBar from '../components/ResourceBar';
import NavBar from '../components/NavBar';

/** Mock danh sách liên minh — khi có backend sẽ lấy từ API */
const ALLIANCES = [
  { name: 'Thao Thiết Thiên Hạ', members: 42, level: 7, desc: 'Liên minh top 1 — chuyên chiến dịch lớn' },
  { name: 'Ngũ Hổ Tướng', members: 35, level: 5, desc: 'Gia đình thân thiện, giúp nhau phát triển' },
  { name: '赤 Tân Thủ', members: 58, level: 3, desc: 'Dành cho người mới, dạy chơi tận tình' },
  { name: 'Phượng Hoàng Lửa', members: 21, level: 4, desc: 'Cân bằng nội trị & chinh chiến' },
];

/** MÀN HÌNH 6: LIÊN MINH & NGOẠI GIAO (mock — chat nội bộ) */
export default function AllianceScreen() {
  const st = useGame(s => s.state)!;
  const joinAlliance = useGame(s => s.joinAlliance);
  const donateAlliance = useGame(s => s.donateAlliance);
  const sendChat = useGame(s => s.sendChat);
  const chat = useGame(s => s.allianceChat);
  const [msg, setMsg] = useState('');

  const joined = st.alliance.joined;

  return (
    <div className="max-w-4xl mx-auto px-3 pb-6">
      <ResourceBar />
      <h2 className="font-pixel text-gold text-sm mt-4 mb-3">🤝 LIÊN MINH & NGOẠI GIAO</h2>

      {!joined ? (
        <div className="space-y-2">
          {ALLIANCES.map(a => (
            <div key={a.name} className="pixel-border bg-panel p-3 flex items-center gap-3">
              <div className="flex-1">
                <b className="font-body text-xl">{a.name}</b>
                <small className="block font-body text-base opacity-70">{a.desc}</small>
              </div>
              <span className="font-body text-lg opacity-80">👥 {a.members} · Lv{a.level}</span>
              <button className="btn btn-green text-[8px]" onClick={() => joinAlliance(a.name)}>GIA NHẬP</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="pixel-border bg-panel p-4 md:col-span-2">
            <h3 className="font-pixel text-[10px] text-gold mb-2">💬 CHAT NỘI BỘ — {joined}</h3>
            <div className="bg-ink border-2 border-panelLight p-2 h-64 overflow-auto mb-2">
              {chat.length === 0 && <p className="font-body text-lg opacity-50">Chưa có tin nhắn nào.</p>}
              {chat.map((m, i) => (
                <div key={i} className={`font-body text-lg ${m.me ? 'text-gold' : 'text-parchment'}`}>
                  <b>{m.who}:</b> {m.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-ink border-2 border-panelLight px-2 py-1 font-body text-xl outline-none focus:border-gold"
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { sendChat(msg); setMsg(''); } }}
                placeholder="Gõ tin nhắn..."
              />
              <button className="btn btn-green text-[8px]" onClick={() => { sendChat(msg); setMsg(''); }}>GỬI</button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="pixel-border bg-panel p-4">
              <h3 className="font-pixel text-[10px] text-gold mb-2">🔬 CÔNG NGHỆ LM</h3>
              <p className="font-body text-xl">Điểm công nghệ: <b className="text-gold">{st.alliance.tech}</b></p>
              <p className="font-body text-base opacity-70">Mỗi 10 điểm = +1% công toàn quân (tối đa +20%).</p>
              <button className="btn btn-gold w-full text-[8px] mt-2" disabled={st.res.food < 100} onClick={donateAlliance}>
                🎁 ĐÓNG GÓP 100🌾 → +10 ĐIỂM
              </button>
            </div>
            <div className="pixel-border bg-panel p-4">
              <h3 className="font-pixel text-[10px] text-gold mb-2">🗺️ LÃNH THỔ LM</h3>
              <p className="font-body text-lg opacity-70">Bản đồ lãnh thổ liên minh sẽ mở khi có nhiều người chơi thật trên server.</p>
            </div>
          </div>
        </div>
      )}
      <NavBar />
    </div>
  );
}
