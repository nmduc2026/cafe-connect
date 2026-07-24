# 00 — Base Prompt (dán trước MỌI prompt màn hình)

> Đây là khối style dùng chung. Mỗi lần sinh ảnh: **dán nguyên khối này, rồi dán prompt màn hình bên dưới nó.**
> Không sửa khối này giữa chừng — nếu sửa, toàn bộ ảnh đã sinh sẽ lệch phong cách với ảnh mới.

---

## A. Khối style chung — copy nguyên văn

```text
Bạn đang tạo mockup UI high-fidelity cho "cafe-connect", một web app gọi món qua QR
cho quán cafe Việt. Đây là ảnh giao diện sản phẩm thật, KHÔNG phải landing page,
KHÔNG phải poster marketing, KHÔNG phải ảnh chụp thiết bị trong bối cảnh.
Xuất ảnh phẳng, đúng khung viewport, như ảnh chụp màn hình thật.

NGÔN NGỮ: Toàn bộ chữ trong giao diện là TIẾNG VIỆT CÓ DẤU, chính tả chuẩn.
Không dùng chữ giả (lorem ipsum), không dùng tiếng Anh trừ tên thương hiệu "cafe-connect".

PHONG CÁCH: Cafe Việt hiện đại — sáng, ấm, sạch, thoáng, chuyên nghiệp.
Cảm giác như menu giấy kem ở quán cafe đẹp, nhưng là app dùng được thật.

BẢNG MÀU (dùng đúng mã hex, không tự đổi):
- Nền chính:        #FBF7F1  (kem sáng)
- Nền phụ/section:  #F6EEE4
- Card/dialog:      #FFFDFC  (trắng ấm)
- Card phụ:         #FAF4EC
- Chữ chính:        #35251D  (nâu espresso, không phải đen)
- Chữ phụ:          #75655B
- Chữ mờ/metadata:  #9C8C81
- Viền:             #E8DCCF
- Viền đậm/focus:   #D7C4B3
- Màu hành động:    #D9682B  (terracotta — CTA, tab active, nút thêm)
- Hành động hover:  #BE5520
- Nền badge chính:  #FFF0E4
- Logo/heading:     #6A3E28  (nâu đậm)
- Thành công:       #3E8E53  / nền #EAF5EC
- Cảnh báo:         #C98222  / nền #FFF4DE
- Thông tin:        #477A9E  / nền #EAF2F7
- Nguy hiểm/hủy:    #C44B45  / nền #FBECEB
- Disabled:         #A89E97  / nền #EEE9E4

TYPOGRAPHY:
- Font: Be Vietnam Pro (fallback Inter). Hỗ trợ đầy đủ dấu tiếng Việt.
- Tiêu đề trang 30/38 bold, tiêu đề section 24/32 bold, heading card 20/28 semibold.
- Nội dung 15/23 regular, metadata 14/20, badge/hint 12/18 medium.
- Không có chữ nhỏ hơn 12px.
- GIÁ TIỀN là thông tin nổi bật: weight 650–700, dùng chữ số đều nhau (tabular).
- Định dạng tiền Việt: "29.000đ" — dấu chấm ngăn nghìn, chữ "đ" thường liền sau.
- Không viết HOA TOÀN BỘ cho đoạn văn hoặc nút.

HÌNH KHỐI:
- Bo góc: input 8px, button 12px, card/dialog 16px, hero/bottom-sheet 20px, pill/tab/badge bo tròn hoàn toàn.
- Shadow rất nhẹ, ám nâu xám, KHÔNG dùng bóng đen đậm.
- Giãn cách theo bội số 4px: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- Vùng chạm tối thiểu 44×44px.

TRẠNG THÁI MÓN — luôn đi kèm cả icon lẫn chữ, không dùng mỗi màu:
- "Đã nhận"    → xanh dương #477A9E, nền #EAF2F7
- "Đang làm"   → cam vàng #C98222, nền #FFF4DE
- "Sẵn sàng"   → xanh lá #3E8E53, nền #EAF5EC
- "Đã phục vụ" → xanh lá nhạt, sắc độ trung tính hơn
- "Đã hủy"     → đỏ #C44B45, nền #FBECEB
- "Hết hàng"   → xám #A89E97, ảnh món bị làm mờ + giảm bão hòa

ẢNH MÓN: ảnh thật, ánh sáng tự nhiên ban ngày, nền bàn gỗ sáng hoặc mặt đá sáng,
món nhận biết rõ ràng, không tối, không blur mạnh, phong cách nhất quán giữa các món.

TUYỆT ĐỐI KHÔNG:
- Giao diện tối (dark mode), hoặc mảng nâu đậm phủ diện tích lớn.
- Gradient tím/xanh dương, gradient cầu vồng.
- Orb, bokeh, hạt sáng, hình trang trí kiểu landing page SaaS.
- Glassmorphism, hiệu ứng kính mờ nặng.
- Card lồng trong card nhiều tầng.
- Khung điện thoại/laptop bao quanh, tay người cầm máy, bàn làm việc phía sau.
- Watermark, chữ ký, logo hãng khác.
- Biểu tượng cờ, chữ Hán/Nhật/Hàn.
```

---

## B. Cách ghép prompt

```text
[Khối A ở trên]

---

[Prompt màn hình, ví dụ C03 trong 01_customer_prompts.md]
```

---

## C. Dữ liệu chuẩn — dùng đúng, không bịa thêm

Mọi màn hình phải dùng đúng dữ liệu này. Sai dữ liệu = ảnh không dùng được để dựng prototype.

### Menu 8 món

| ID | Tên | Giá | Danh mục | Trạng thái |
|---:|---|---:|---|---|
| 101 | Cà phê đen đá | 29.000đ | Cà phê | Còn hàng |
| 102 | Cà phê sữa đá | 35.000đ | Cà phê | Còn hàng |
| 103 | Bạc xỉu đá | 35.000đ | Cà phê | Còn hàng |
| 104 | Cà phê muối | 39.000đ | Cà phê | Còn hàng |
| 201 | Trà đào cam sả | 45.000đ | Trà | Còn hàng |
| 202 | Trà sen vàng | 42.000đ | Trà | **Hết hàng** |
| 301 | Croissant bơ | 32.000đ | Bánh | Còn hàng |
| 302 | Tiramisu | 45.000đ | Bánh | Còn hàng |

Danh mục đầy đủ: `Cà phê · Trà · Bánh · Đá xay · Nước ép · Topping`

### Bàn

| Bàn | Sức chứa | Trạng thái | QR |
|---|---:|---|---|
| Bàn 1 | 2 | Trống | Có |
| Bàn 2 | 4 | Trống | Có |
| Bàn 3 | 4 | Đang dùng | Có |
| Bàn 4 | 6 | Trống | **Chưa sinh** |
| Bàn 5 | 4 | Đang dùng | Có |
| Bàn 6 | 2 | Trống | Có |

### Phiên bàn chính — dùng cho hầu hết màn hình

```
Bàn 5 · mã phiên A7K2QX · mở lúc 13:10 · 22/07/2026
Đơn #015 (13:15) — Cà phê đen đá, Cà phê sữa đá, Bạc xỉu đá = 99.000đ
Đơn #021 (13:28) — Croissant bơ = 32.000đ
Tổng phiên: 131.000đ · chưa thanh toán · khách đã yêu cầu thanh toán
```

Phiên khác: `Bàn 3 · M3XQ7B · 13:05 · 1 đơn · 78.000đ` — `Bàn 8 · K9WR4T · 13:18 · 1 đơn · 64.000đ`

### Người dùng

```
Chủ quán:  Nguyễn Minh Đức · admin@demo.com   · vai trò Quản trị
Nhân viên: Mai Anh          · maianh@demo.com · vai trò Nhân viên
Pha chế:   Quầy pha chế     · barista@demo.com
```

### Thời gian chuẩn

Mọi đồng hồ/timestamp trên ảnh: **13:18 — 22/07/2026**. Định dạng ngày `dd/mm/yyyy`, giờ 24h.

---

## D. Viewport theo surface

| Surface | Kích thước ảnh | Ghi chú |
|---|---|---|
| Customer | **390 × 844** | Mobile-first. Có safe area dưới. |
| Customer desktop (tùy chọn) | 1280 × 900 | Content căn giữa max 1120px |
| Admin | **1440 × 1024** | Sidebar cố định 248px bên trái |
| Staff | **1024 × 768** | Cũng là AdminLayout, sidebar rút gọn còn 2 mục |
| KDS | **1440 × 1024** | Không sidebar, dùng trọn chiều rộng |

---

## E. Nhắc lại kiến trúc — tránh vẽ sai

- **Chỉ có 3 layout**: Customer (`/t/:qrToken`), Admin (`/admin`), KDS (`/kitchen`).
- **Staff KHÔNG có app riêng.** Nhân viên đăng nhập vào chính `/admin`, chỉ thấy sidebar 2 mục (`Đơn hàng`, `Lịch sử`). Khi prompt nói "màn Staff" nghĩa là **AdminLayout ở chế độ quyền nhân viên**, không phải giao diện thứ tư.
- KDS gọi là **"Quầy pha chế"** trên giao diện. Chữ "KDS"/"Kitchen" chỉ tồn tại trong code và URL, không hiện cho người dùng.
- Chỉ có 5 sự kiện real-time: order mới, đổi trạng thái món, gọi phục vụ, yêu cầu thanh toán, đóng phiên. Đừng vẽ thông báo ngoài 5 loại này.
