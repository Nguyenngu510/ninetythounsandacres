# ⚔️ Ninety Thousand Acres — Chín Vạn Mẫu (React + TypeScript + Vite)

Web game chiến thuật – quản lý lấy bối cảnh Tam Quốc, đồ họa pixel 2D chibi.
Vòng lặp cốt lõi: **Nội trị (xây thành) → Chuẩn bị quân → Xuất chinh chiếm đất → Nhận tài nguyên → Phát triển**.

## 🚀 Chạy dự án

```bash
cd app
npm install
npm run dev      # mở http://localhost:5173
```

Lệnh khác:

```bash
npm run build    # kiểm tra TypeScript + build production vào dist/
npm run preview  # chạy thử bản build
npm run smoke    # smoke test engine: xây → tick → huấn luyện → chiếm ô → nhận tài nguyên
```

## 📁 Cấu trúc thư mục

```
app/
├── index.html              # entry HTML (font pixel: Press Start 2P + VT323)
└── src/
    ├── engine/             # LOGIC GAME — tách biệt hoàn toàn khỏi UI
    │   ├── types.ts        #   kiểu dữ liệu dùng chung
    │   ├── config.ts       #   mock data: 5 Võ Tướng, 5 binh chủng, 6 công trình
    │   ├── map.ts          #   sinh bản đồ 16×12 ô (deterministic theo seed server)
    │   ├── engine.ts       #   tick 1s, sản xuất, xây/nâng cấp, auto-battle, chiếm đóng
    │   └── smoke.ts        #   smoke test engine (npm run smoke)
    ├── store/
    │   └── gameStore.ts    # Zustand — cầu nối UI ↔ engine, lưu localStorage
    ├── assets/
    │   └── sprites.ts      # pixel art chibi vẽ thủ tục bằng canvas (lính/tướng/công trình/ô đất)
    ├── components/         # Sprite, ResourceBar, NavBar, Toasts, ConfirmModal
    └── screens/            # 6 màn hình game
        ├── LoginScreen.tsx     # (1) Đăng nhập + chọn server
        ├── CityScreen.tsx      # (2) Thành chính / Nội trị
        ├── WorldMapScreen.tsx  # (3) Bản đồ thế giới (canvas pan/zoom, fog of war)
        ├── BattleScreen.tsx    # (4) Chuẩn bị đội hình & chiến đấu auto-battler
        ├── ArmyScreen.tsx      # (5) Quân đội & Anh hùng
        └── AllianceScreen.tsx  # (6) Liên minh & ngoại giao (mock)
```

## 🎮 Hướng dẫn chơi nhanh (demo loop)

1. **Đăng nhập** (tạo tài khoản mock bất kỳ) → chọn server → vào game
2. **Nội trị**: click ô trống → xây **Kho Lương / Nhà Kho** trước → click công trình để nâng cấp; hàng đợi xây có nút đẩy nhanh bằng vàng; phím `B` mở xây nhanh
3. **Quân đội**: tuyển lính trong tab Quân đội (cần Doanh Trại), nâng cấp tướng bằng 🖼️ Bức họa (thắng trận nhận)
4. **Bản đồ** (`M`): kéo chuột/lăn chuột/WASD để xem, click ô có 🔴 quân cướp **kề lãnh thổ** → ⚔️ Chiếm đóng
5. **Chiến đấu**: kéo quân vào bàn cờ 4×2 (tiền tuyến Khiên/Thương, hậu tuyến Cung/Nỏ), phím `A` tự xếp → Bắt đầu → xem trận auto theo vòng → thắng thì chiếm ô + nhận rương tài nguyên
6. Ô đất chiếm được sản xuất tài nguyên mỗi phút — quay lại thành phát triển tiếp

## ⚖️ Luật chơi đã cài đặt

- **Chuỗi khắc chế**: Thương → Kỵ → Khiên → Cung → Thương (Nỏ khắc Khiên), sát thương ×1.5
- **Lệnh Chinh Phạt**: tối đa 5, hồi 1 lệnh/phút, mỗi lần xuất chinh tốn 1
- **Sương mù chiến tranh**: chỉ thấy ô trong bán kính 2 ô quanh lãnh thổ của bạn
- **Hòa bình server mới**: ô của người chơi không bị chiếm trong thời gian hòa bình (demo: 3 phút; thật: 3 ngày)
- **Trần tài nguyên**: tràn kho sẽ mất phần thừa — nâng Kho Lương/Nhà Kho
- **Trùm cướp**: ô cấp 5 do Lữ Bố thủ lĩnh
- Tick game chạy **mỗi giây** trong engine (tách khỏi UI — sẵn sàng chuyển lên server)

## 🧩 Nâng cấp lên multiplayer thật

Engine đã tách biệt: khi có backend (Node.js + Express + Socket.IO + Redis + PostgreSQL), chuyển các hàm trong `src/engine/engine.ts` thành API handler, thay action trong `store/gameStore.ts` bằng lời gọi API/WebSocket — các màn hình render không cần đổi.

## 📦 Mock data đi kèm

- **5 Võ Tướng**: Lữ Bố, Quan Vũ, Triệu Vân, Trương Phi, Hoàng Trung (kỹ năng theo vòng + Thao lược mở khóa cấp 5)
- **5 binh chủng**: Thương, Khiên, Cung, Nỏ, Kỵ
- **6 công trình**: Thành Chính, Kho Lương, Nhà Kho, Doanh Trại, Bệnh Viện, Xưởng Rèn
- **192 ô bản đồ** 16×12: ruộng/rừng/mỏ đá/mỏ sắt/đất trống/trại cướp cấp 1–5
