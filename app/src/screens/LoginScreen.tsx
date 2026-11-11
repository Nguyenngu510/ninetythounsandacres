import { useState } from 'react';
import { useGame } from '../store/gameStore';

/** MÀN HÌNH 1: Đăng nhập & chọn server (mock — tài khoản lưu localStorage) */
export default function LoginScreen() {
  const servers = useGame(s => s.servers);
  const login = useGame(s => s.login);
  const signup = useGame(s => s.signup);
  const enterServer = useGame(s => s.enterServer);
  const [acc, setAcc] = useState('');
  const [pw, setPw] = useState('');

  const submit = () => login(acc.trim(), pw);
  const create = () => signup(acc.trim(), pw);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#2a3140] via-[#4a3a28] to-[#1a1208]">
      {/* mây trôi pixel */}
      <div className="cloud text-4xl opacity-70" style={{ top: '8%', animationDuration: '38s' }}>☁️</div>
      <div className="cloud text-2xl opacity-50" style={{ top: '18%', animationDuration: '55s', animationDelay: '-20s' }}>☁️</div>
      <div className="cloud text-5xl opacity-60" style={{ top: '5%', animationDuration: '70s', animationDelay: '-45s' }}>☁️</div>
      {/* cờ Tam Quốc bay */}
      <div className="flag absolute left-[12%] top-0 text-3xl">🚩</div>
      <div className="flag absolute right-[15%] top-0 text-3xl" style={{ animationDelay: '-0.6s' }}>🏳️</div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
        <h1 className="font-pixel text-gold text-center text-lg sm:text-2xl leading-relaxed drop-shadow-[0_3px_0_#150c04]">
          NINETY THOUSAND ACRES
        </h1>
        <p className="font-body text-center text-2xl mt-2 opacity-90">Chín Vạn Mẫu · Tam Quốc Chiến Thuật Pixel</p>

        <div className="pixel-border bg-panel p-5 mt-8">
          <h2 className="font-pixel text-xs text-gold mb-4">🔑 ĐĂNG NHẬP</h2>
          <label className="block font-body text-xl mb-1">Tên tài khoản</label>
          <input
            className="w-full bg-ink border-2 border-panelLight px-3 py-2 font-body text-xl mb-3 outline-none focus:border-gold"
            value={acc}
            onChange={e => setAcc(e.target.value)}
            placeholder="ví dụ: LanhChua001"
          />
          <label className="block font-body text-xl mb-1">Mật khẩu</label>
          <input
            type="password"
            className="w-full bg-ink border-2 border-panelLight px-3 py-2 font-body text-xl mb-4 outline-none focus:border-gold"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="••••••"
          />
          <div className="flex gap-3">
            <button className="btn btn-green flex-1" onClick={submit}>ĐĂNG NHẬP</button>
            <button className="btn flex-1" onClick={create}>TẠO TÀI KHOẢN</button>
          </div>
          <p className="font-body text-base opacity-60 mt-2">
            * Demo mock: tài khoản lưu trong localStorage của trình duyệt, không gửi đi đâu.
          </p>
        </div>

        <div className="pixel-border bg-panel p-5 mt-6">
          <h2 className="font-pixel text-xs text-gold mb-4">🌐 DANH SÁCH SERVER</h2>
          {servers.map(sv => (
            <div key={sv.id} className="flex items-center gap-3 bg-ink border-2 border-panelLight px-3 py-2 mb-2">
              <span className="font-body text-xl flex-1">{sv.name}</span>
              <span className={`font-body text-lg px-2 ${
                sv.status === 'new' ? 'text-green-400' : sv.status === 'busy' ? 'text-yellow-300' : 'text-gray-400'
              }`}>
                {sv.status === 'new' ? 'Mới' : sv.status === 'busy' ? 'Đông người' : 'Bảo trì'}
              </span>
              <span className="font-body text-lg opacity-60 w-16 text-right">{sv.players} người</span>
              <button
                className="btn btn-gold"
                disabled={sv.status === 'maint'}
                onClick={() => enterServer(sv.id)}
              >
                VÀO GAME
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
