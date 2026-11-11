# ⚔️ Chín Vạn Mẫu — Chiến Thuật Tam Quốc (Pixel Web Game)

Game web pixel chiến thuật lấy cảm hứng từ **Ninety Thousand Acres (Chín Vạn Mẫu)**: bắt đầu từ 1 mẫu đất, xây thành, tuyển quân và **chinh phạt từng ô đất** trên bản đồ cho đến khi thống lĩnh 90.000 mẫu.

Toàn bộ trong một file `index.html` — không cần cài đặt, không cần build.

## ▶️ Chơi

Mở `index.html` bằng trình duyệt, hoặc bật GitHub Pages:

- `Settings → Pages → Source: Deploy from a branch → main / (root) → Save`
- Chơi tại: `https://nguyenngu510.github.io/ninetythounsandacres/`

Bản nông trại cũ vẫn còn ở `farm.html`.

## 🎯 Mục tiêu

Chiếm các ô đất quanh chủ thành (mỗi ô = 1.000 mẫu) cho đến khi đạt **90.000 mẫu**. Quân cướp sẽ **đánh thành vào ban đêm** — hãy luôn giữ quân trong doanh!

## 🏛️ Thành phố

| Công trình | Tác dụng |
|---|---|
| 🏯 Chủ Thành | Nâng giới hạn cấp các công trình khác, tăng máu thành |
| 🌾 Lương Thảo | Tăng trần tài nguyên 🌾 |
| 📦 Kho Vật Tư | Tăng trần 🪵 và 🪨 |
| 🔱 Doanh Trại | Tuyển Lính Mác, +10%/cấp tấn công toàn quân |
| 🏹 Trường Cung | Tuyển Cung Thủ |
| 🐎 Chuồng Ngựa | Tuyển Kỵ Binh |
| 🗼 Tiểu Lâu | +15%/cấp phòng thủ thành |

## ⚔️ Quân đội & hệ khắc chế

| Quân | Khắc chế | Ghi chú |
|---|---|---|
| 🔱 Lính Mác | ⟶ Kỵ Binh | Rẻ, nền tảng đội hình |
| 🏹 Cung Thủ | ⟶ Lính Mác | Sát thương cao, mỏng |
| 🐎 Kỵ Binh | ⟶ Cung Thủ | Mạnh nhưng đắt |

Tương khắc gây **x1.5 sát thương**. Hãy xem quân địch trên ô đất rồi chọn đội hình phù hợp!

## 🗺️ Chinh phạt

1. Ô đất chỉ tấn công được khi **kề lãnh thổ** của bạn
2. Mỗi cuộc tấn công tốn **1 Lệnh Chinh Phạt** (hồi 1 lệnh/phút, tối đa 5, mua thêm 25🪙)
3. Trận đấu tự động diễn ra theo vòng — xem log từng vòng sát thương
4. Ô càng cao cấp quân cướp càng mạnh — nâng cấp rồi hãy thử cấp 3+!

## 🌙 Quân cướp đánh thành

Định kỳ quân cướp tấn công chủ thành. Quân trong doanh + Tiểu Lâu sẽ chống trả. Thất bại = mất quân và máu thành; máu thành về 0 = thua game.

## ⌨️ Phím tắt

- `C` — Thành phố · `A` — Quân đội · `Esc` — đóng bảng
- Tiến trình tự lưu vào trình duyệt (localStorage)
