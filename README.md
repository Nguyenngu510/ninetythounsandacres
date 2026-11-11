# ⚔️ Chín Vạn Mẫu — Chiến Thuật Tam Quốc (Pixel Web Game)

Game web pixel chiến thuật lấy cảm hứng từ **Ninety Thousand Acres (Chín Vạn Mẫu)**: bắt đầu từ 1 mẫu đất, xây thành, tuyển quân, triệu võ tướng và **chinh phạt từng ô đất** trên bản đồ cho đến khi thống lĩnh 90.000 mẫu.

Toàn bộ trong một file `index.html` — không cần cài đặt, không cần build.

## ▶️ Chơi

Mở `index.html` bằng trình duyệt, hoặc bật GitHub Pages:

- `Settings → Pages → Source: Deploy from a branch → main / (root) → Save`
- Chơi tại: `https://nguyenngu510.github.io/ninetythounsandacres/`

Bản nông trại cũ vẫn còn ở `farm.html`.

## 🎖️ Phiên bản 3 — Đủ binh chủng, Võ Tướng & trận chiến animated

### 6 binh chủng

| Quân | Khắc chế | Đặc điểm |
|---|---|---|
| 🔱 Lính Mác | → Kỵ Binh | Rẻ, nền tảng đội hình |
| 🛡️ Lính Khiên | → Lính Mác | Máu dày (60), chặn đòn đánh — cần Doanh Trại cấp 2 |
| 🏹 Cung Thủ | → Lính Mác, Tượng Binh | Sát thương cao, bắn tầm xa |
| 🎯 Nỏ Thủ | → Lính Khiên, Tượng Binh | Xuyên giáp — cần Trường Cung cấp 2 |
| 🐎 Kỵ Binh | → Cung Thủ, Nỏ Thủ | Mạnh, hành quân nhanh x1.6 |
| 🐘 Tượng Binh | → Kỵ Binh, Lính Khiên | Khổng lồ 80 máu — cần Chuồng Ngựa cấp 3 |

Tương khắc gây **x1.5 sát thương**. Xem quân địch trên ô đất rồi chọn đội hình phù hợp!

### Võ Tướng & kỹ năng

Mở 🎖️ **VÕ TƯỚNG** (phím `H`) để tuyển tướng bằng 🪙 vàng. Tướng theo quân chinh phạt, tự động phòng thành, có nội tại + kỹ năng kích hoạt giữa trận:

| Tướng | Ngoại hiệu | Nội tại | Kỹ năng |
|---|---|---|---|
| 🐉 Quan Vũ | Vũ Thánh | +15% tấn công | **Thanh Long Trảm** (vòng 2): sát thương x2.2 |
| 🐆 Trương Phi | Yến Nhân | +10% tấn công | **Hống Tiếu** (vòng 2): địch -25% sức mạnh |
| 🕊️ Triệu Vân | Thần Vũ | -20% thương vong | **Long Đởm** (vòng 2): hồi 15% quân số |
| 🦅 Hoàng Trung | Bách Bộ | Cung/Nỏ +25% | **Bách Bộ Xuyên Dương** (vòng 1): sát thương x1.8 |
| 🔥 Lữ Bố | Phi Tướng | +20% tấn công | **Phương Thiên Họa Kích** (vòng 2): sát thương x2 |

Tướng có máu riêng: mất máu khi chiến đấu, hồi 3❤️/giây khi nhàn rỗi; tụt 0❤️ thì **bị thương nặng 2 phút** không thể xuất trận.

### Trận chiến animated

Khi hai quân giao tranh, một **chiến trường pixel** hiện ra ngay trong bảng trận đấu:

- Bộ binh **xung phong chém** theo từng vòng, kỵ binh xông lên nhanh hơn, tượng binh húc nặng nề
- Cung/Nỏ **bắn volley tên bay** qua chiến trường
- Số sát thương bay lên, tia chém trắng, máu văng, **màn hình rung** khi va chạm
- Lính nào hết máu **ngã xuống thành xác** và nằm lại chiến trường
- Võ tướng cắm trại giữa đội với thanh máu riêng — kỹ năng kích hoạt có **hiệu ứng chớp sáng vàng** + tên kỹ năng hiện to
- Log từng vòng chạy đồng bộ với hoạt ảnh

### Từ phiên bản 2

- Quân lính **hành quân thật** trên bản đồ (bước chân, bụi đường, kỵ binh nhanh hơn); quân cướp cũng hành quân đánh đêm
- **Click từng ô** xem chi tiết: chủ nhân là ai, quân gì bao nhiêu, sức mạnh ~bao nhiêu, trùm cướp ô cấp 4–5
- Thắng trận chọn **🚩 Ở lại trấn giữ** hoặc **🏠 Rút về doanh**; ô trống quân sẽ bị cướp chiếm
- Chu kỳ ngày/đêm, cờ phất, lúa đuổi trong gió

## 🎨 Tuỳ biến đồ hoạ (mới)

Game có **2 lớp đồ hoạ**: pixel art mặc định (vẽ bằng code, có sẵn) và **ảnh tuỳ biến của bạn** — ưu tiên ảnh tuỳ biến nếu có:

- Mở 🎨 **HÌNH ẢNH** (phím `I`) → upload PNG trong suốt cho **từng quân lính** (6 loại) và **từng võ tướng** (5 tướng)
- Ảnh lưu tự động vào trình duyệt (localStorage), áp dụng ngay vào: chiến trường trận đấu, bản đồ hành quân, xác ngã, và bảng xem trước
- Khuyến nghị: PNG nền trong suốt, **32×32 hoặc 64×64**, nhân vật hướng mặt **sang phải**; ảnh to hơn sẽ được co về kích thước sprite (quân 16×18, tượng 26×22, tướng 20×26)
- Bấm ↺ để trả về pixel art mặc định cho từng nhân vật
- Cách thứ 2 cho lập trình viên: sửa khối `globalThis.GAME_ART` ở đầu `<script>` trong `index.html`, điền URL hoặc dataURL — phù hợp khi bạn muốn đóng gói sẵn bộ ảnh của riêng mình

Pixel art mặc định cũng đã nâng cấp: viền tối, bóng đổ, giáp 2 lớp, mũ sắt có lông cờ, vũ khí kim loại có điểm sáng — kỵ binh cưỡi ngựa đầy đủ, tượng binh có kiệu trên lưng.

## 🌐 Đấu Trường — Sảnh chờ ghép trận

Mở 🌐 **ĐẤU TRƯỜNG** (phím `P`) để vào sảnh chờ ghép trận PVP:

- **Đặt nickname** Lãnh Chúa, xem điểm **Danh Vọng** (ELO, khởi đầu 1000) và thắng/thua
- Bấm **🔍 TÌM TRẬN** — sảnh chờ hiển thị số người online, ghép đối thủ trong 2–5 giây
- Thấy trước **quân đội + Võ Tướng** của đối thủ rồi mới bấm ⚔️ **VÀO TRẬN!**
- Đối thủ có quân tương đương trình (nhân bản cấu trúc quân của bạn theo chênh lệch điểm), 35% mang võ tướng riêng — trận đấu có kỹ năng cả 2 bên
- Thắng: **+Danh Vọng** (ELO K=32) + cướp 💰 vàng. Thua: trừ điểm. Cooldown 30s giữa các trận
- **Bảng xếp hạng** 12 chiến binh theo danh vọng, chia bậc: 🥉 Đồng → 🥈 Bạc → 🥇 Vàng → 💎 Bạch Kim → 💠 Kim Cương → 👑 Cao Thủ
- Trận PVP **không mất quân thật** — giao hữu thuần túy, chỉ tính điểm

> 💡 Lưu ý: GitHub Pages là hosting tĩnh nên đối thủ là **người chơi mô phỏng** (AI cùng trải nghiệm sảnh chờ). Chơi online người-thật-với-người-thật cần server backend riêng.

## 🎯 Mục tiêu

Chiếm các ô đất quanh chủ thành (mỗi ô = 1.000 mẫu) cho đến khi đạt **90.000 mẫu**. Quân cướp sẽ **đánh thành vào ban đêm** — hãy luôn giữ quân trong doanh!

## 🏛️ Thành phố

| Công trình | Tác dụng |
|---|---|
| 🏰 Chủ Thành | Nâng giới hạn cấp các công trình khác, tăng máu thành |
| 🌾 Lương Thảo | Tăng trần tài nguyên 🌾 |
| 📦 Kho Vật Tư | Tăng trần 🪵 và 🪨 |
| 🔱 Doanh Trại | Tuyển Lính Mác (lv1), Lính Khiên (lv2), +10%/cấp tấn công |
| 🏹 Trường Cung | Tuyển Cung Thủ (lv1), Nỏ Thủ (lv2), +10%/cấp tấn công |
| 🐎 Chuồng Ngựa | Tuyển Kỵ Binh (lv1), Tượng Binh (lv3), +10%/cấp tấn công |
| 🗼 Tiểu Lâu | +15%/cấp phòng thủ thành |

## 🗺️ Chinh phạt

1. Ô đất chỉ tấn công được khi **kề lãnh thổ** của bạn
2. Mỗi cuộc tấn công tốn **1 Lệnh Chinh Phạt** (hồi 1 lệnh/phút, tối đa 5, mua thêm 25🪙)
3. Ô càng cao cấp quân cướp càng mạnh, ô cấp 4–5 có **trùm cướp** — cần đội quân khắc chế + võ tướng!
4. Nâng Doanh Trại/Trường Cung/Chuồng Ngựa để tăng tấn công toàn quân (áp dụng trong trận đấu thật)

## 🌙 Quân cướp đánh thành

Định kỳ quân cướp tấn công chủ thành. Quân trong doanh + Tiểu Lâu + Võ Tướng sẽ chống trả. Máu thành về 0 = thua game.

## ⌨️ Phím tắt

- `C` — Thành phố · `A` — Quân đội · `H` — Võ Tướng · `P` — Đấu Trường · `I` — Hình ảnh · `Esc` — đóng bảng
- Tiến trình tự lưu vào trình duyệt (localStorage)
