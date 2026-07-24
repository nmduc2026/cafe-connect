# 03 — Staff Prompts (S01–S45)

> Viewport: **1024 × 768** (tablet quầy). Dán `00_base_prompt.md` §A trước mỗi prompt.
>
> ⚠️ **Staff KHÔNG có app riêng.** Mọi màn dưới đây là **AdminLayout ở chế độ quyền nhân viên**:
> cùng shell, cùng route `/admin/*`, chỉ khác sidebar còn 2 mục. Đừng vẽ giao diện thứ tư.
>
> Ưu tiên sinh trước: **S02, S10, S21, S24, S27**.

---

## Khối shell Staff — dán vào mọi prompt trong file này

```text
KHUNG STAFF CHUẨN (là AdminLayout thu gọn theo quyền, viewport 1024×768):

Sidebar trái cố định 248px, nền #FFFDFC, viền phải #E8DCCF:
- Trên cùng: "cafe-connect" 17px semibold #6A3E28.
- CHỈ CÓ HAI MỤC (vì tài khoản nhân viên không có quyền menu/bàn/báo cáo/nhân viên):
  "Đơn hàng" (đang chọn: nền #FFF0E4, chữ và icon #D9682B, vạch đứng 3px #D9682B mép trái)
  "Lịch sử"  (thường: chữ #75655B)
- Sidebar trông thoáng, phần dưới trống — đây là chủ ý, KHÔNG thêm mục nào khác.
- Đáy sidebar: avatar tròn 32px chữ "M" nền #EAF2F7 chữ #477A9E, tên "Mai Anh" 14px, dưới là "Nhân viên" 12px #9C8C81.

Header cao 64px, nền #FBF7F1, viền dưới #E8DCCF:
- Trái: tiêu đề trang 24px bold #35251D.
- Phải: icon chuông có badge tròn đỏ số "2" (rất quan trọng với nhân viên),
  đồng hồ "13:18 · 22/07/2026" 13px #75655B, avatar nhỏ.

Vùng nội dung nền #FBF7F1, padding 24px.
Vì dùng trên tablet cảm ứng: mọi nút cao tối thiểu 44px, nút chính cao 48px, chữ không nhỏ hơn 14px.
```

---

## S01 — Staff Login

```text
Màn 1024×768 — trang đăng nhập, KHÔNG sidebar. Dùng chung trang đăng nhập với admin.

Bố cục chia đôi:
- Trái (55%): ảnh thật quầy thu ngân quán cafe Việt — máy tính bảng đặt trên quầy gỗ sáng, ly cà phê,
  ánh sáng ban ngày ấm. Chữ trắng góc dưới: "cafe-connect" 30px bold + "Khu vực nhân viên" 17px.
- Phải (45%): nền #FBF7F1, card 380px nền #FFFDFC bo 16px viền #E8DCCF padding 32px:
  - "Đăng nhập" 30px bold.
  - Phụ đề #75655B "Dành cho nhân viên phục vụ và thu ngân."
  - Input "Email" giá trị "maianh@demo.com"; input "Mật khẩu" dạng chấm ẩn.
  - Checkbox "Ghi nhớ đăng nhập".
  - Nút đặc #D9682B cao 48px tràn ngang "Đăng nhập".
```

## S02 — Staff Dashboard ⭐ P0

```text
[Dán khối shell Staff] Tiêu đề trang "Đơn hàng", cạnh đó badge nhỏ chấm xanh nhấp nháy "Trực tiếp".

Hàng 3 thẻ số liệu gọn, chia đều, mỗi thẻ nền #FFFDFC bo 16px viền #E8DCCF padding 16px:
- "Bàn đang phục vụ" 14px #75655B / "3" 30px bold.
- "Yêu cầu đang chờ" / "2" 30px bold màu #D9682B — thẻ này có viền #D9682B để hút mắt.
- "Tổng đang mở" / "273.000đ" 30px bold.

Nhãn section "Cần xử lý ngay" 17px semibold, có badge tròn đỏ "2".
Hai thẻ yêu cầu xếp ngang, mỗi thẻ nền #FFFDFC bo 16px, viền trái dày 4px theo mức ưu tiên:

Thẻ 1 (viền trái #D9682B):
- Hàng đầu: icon hóa đơn trong ô tròn #FFF0E4; "Bàn 5" 20px bold; badge "Thanh toán" nền #FFF0E4 chữ #D9682B.
- "131.000đ" 24px bold #35251D.
- "Phiên A7K2QX · yêu cầu lúc 13:34 · 2 phút trước" 13px #9C8C81.
- Hai nút cao 44px: nút đặc #D9682B "Thu tiền", nút viền "Xem phiên".

Thẻ 2 (viền trái #C98222):
- icon chuông trong ô tròn #FFF4DE; "Bàn 3" 20px bold; badge "Gọi phục vụ" nền #FFF4DE chữ #C98222.
- Chữ 15px #35251D: "Lý do: Thêm đá".
- "13:32 · 4 phút trước" 13px #9C8C81.
- Hai nút: nút đặc #C98222 "Đã nhận", nút viền "Xem phiên".

Nhãn section "Bàn đang mở" 17px semibold.
Lưới 3 thẻ bàn: mỗi thẻ nền #FFFDFC bo 16px padding 16px —
"Bàn 3" badge "Đang dùng" · "M3XQ7B · 13:05" · "1 đơn · 78.000đ" · nút viền tràn ngang "Chi tiết".
"Bàn 5" tương tự · "A7K2QX · 13:10" · "2 đơn · 131.000đ".
"Bàn 8" · "K9WR4T · 13:18" · "1 đơn · 64.000đ".
```

## S10 — Request Inbox ⭐ P0

```text
[Khối shell Staff, nền bị phủ tối 40%]
Drawer trượt từ phải rộng 420px, cao toàn màn, nền #FFFDFC, padding 24px — đây là panel của icon chuông:

- Hàng tiêu đề: "Yêu cầu từ khách" 20px bold + badge tròn đỏ "2"; nút X góc phải.
- Chữ nhỏ #9C8C81: "Yêu cầu hiện trong phiên làm việc này, không lưu lịch sử."
- Hai tab nhỏ: "Đang chờ (2)" đang chọn (gạch chân #D9682B) · "Đã xử lý (3)".

Danh sách thẻ yêu cầu xếp dọc cách nhau 12px:

1) Ưu tiên cao — nền #FFF0E4 bo 12px viền trái 4px #D9682B:
   icon hóa đơn tròn; "Bàn 5 · Yêu cầu thanh toán" 15px semibold;
   "131.000đ · phiên A7K2QX" 13px #75655B; "13:34 · 2 phút trước" 12px #9C8C81.
   Hai nút nhỏ cao 40px: nút đặc #D9682B "Thu tiền" + nút viền "Đã nhận".

2) Ưu tiên thường — nền #FFF4DE bo 12px viền trái 4px #C98222:
   icon chuông; "Bàn 3 · Gọi phục vụ"; "Lý do: Thêm đá"; "13:32 · 4 phút trước".
   Nút đặc #C98222 "Đã nhận" + nút viền "Xem phiên".

3–5) Đã xử lý — nền #FFFDFC viền #E8DCCF, chữ mờ hơn, có icon tích nhỏ #3E8E53 và chữ "Đã xử lý" #9C8C81:
   "Bàn 8 · Gọi phục vụ · 13:20" · "Bàn 2 · Thanh toán · 12:58" · "Bàn 1 · Gọi phục vụ · 12:41".
```

## S11 — Staff Call Detail

```text
[Khối shell Staff, phủ tối 40%]
Drawer phải 420px nền #FFFDFC padding 24px:
- Nút mũi tên quay lại + tiêu đề "Chi tiết yêu cầu" 20px bold.
- Khối nổi bật nền #FFF4DE bo 16px padding 20px căn giữa:
  icon chuông tròn 56px nền trắng màu #C98222; "Bàn 3" 30px bold; badge "Gọi phục vụ" chữ #C98222.
- Các dòng nhãn/giá trị: "Lý do" – "Thêm đá" · "Thời gian" – "13:32 (4 phút trước)" · "Phiên" – "M3XQ7B" · "Tổng phiên" – "78.000đ".
- Card nhỏ "Món đang có": "2 × Trà đào cam sả" với badge "Đang làm".
- Nút xếp dọc cao 48px: nút đặc #C98222 "Đã nhận yêu cầu"; nút viền "Mở phiên bàn".
- Chữ nhỏ #9C8C81 dưới cùng: "Đánh dấu đã nhận chỉ ẩn yêu cầu trên máy này."
```

## S12 — Acknowledge Staff Call

```text
Giống S11 nhưng vừa bấm xác nhận:
- Nút "Đã nhận yêu cầu" chuyển thành trạng thái thành công: nền #EAF5EC, viền #3E8E53, chữ #3E8E53,
  có icon tích, chữ đổi thành "Đã nhận lúc 13:36", không bấm được nữa.
- Khối nổi bật trên cùng đổi nền từ #FFF4DE sang #EAF5EC, badge đổi thành "Đã xử lý" chữ #3E8E53.
- Toast góc phải dưới: nền #EAF5EC viền #3E8E53, "Đã đánh dấu xử lý yêu cầu của Bàn 3".
```

## S13 — Bill Request Detail

```text
[Khối shell Staff, phủ tối 40%]
Drawer phải 420px:
- Tiêu đề "Chi tiết yêu cầu" + nút quay lại.
- Khối nổi bật nền #FFF0E4 bo 16px căn giữa: icon hóa đơn tròn 56px màu #D9682B;
  "Bàn 5" 30px bold; "131.000đ" 36px bold #35251D; badge "Yêu cầu thanh toán".
- Dòng: "Phiên" – "A7K2QX" · "Mở lúc" – "13:10" · "Yêu cầu lúc" – "13:34" · "Số món" – "4".
- Card "Tóm tắt hóa đơn" nền #FAF4EC bo 12px: 4 dòng món với giá bên phải, kẻ ngang, "Tổng 131.000đ" bold.
- Nút xếp dọc cao 48px: nút đặc #D9682B "Thu tiền ngay"; nút viền "Mở phiên bàn".
```

## S14 — Open Session from Request

```text
Chuyển tiếp từ S13 sang màn chi tiết phiên: giống S21 nhưng có thêm
dải nhắc trên cùng vùng nội dung: nền #FFF0E4 viền #D9682B bo 12px, icon hóa đơn,
chữ 14px #35251D "Khách đã yêu cầu thanh toán lúc 13:34" và nút chữ #D9682B "Thu tiền" ở cuối dải.
```

## S20 — Active Session List

```text
[Khối shell Staff] Tiêu đề "Đơn hàng". Tab "Đang mở (3)" đang chọn · "Lịch sử".

Vì là tablet 1024px: lưới thẻ 2 cột (không phải 3 như admin desktop), khe 16px.
Mỗi thẻ nền #FFFDFC bo 16px viền #E8DCCF padding 20px, các nút bên trong cao 44px:

Thẻ "Bàn 5" — viền #D9682B 2px vì có yêu cầu:
- "Bàn 5" 24px bold; badge "Yêu cầu thanh toán" nền #FFF0E4 chữ #D9682B.
- "A7K2QX · mở 13:10 · 8 phút" 13px #9C8C81.
- 4 dòng món gọn có chấm trạng thái màu.
- Kẻ ngang; "Tổng" trái — "131.000đ" 24px bold phải.
- Nút đặc #D9682B tràn ngang "Thu tiền" + nút viền "Chi tiết".

Thẻ "Bàn 3": badge "Gọi phục vụ" nền #FFF4DE; "M3XQ7B · mở 13:05";
"2 × Trà đào cam sả" chấm cam; Tổng 78.000đ; nút "Thu tiền" + "Chi tiết".

Thẻ "Bàn 8": không badge; "K9WR4T · mở 13:18"; "3 món"; Tổng 64.000đ.

Thẻ trống thứ tư: khung viền đứt nét #D7C4B3 nền #FAF4EC bo 16px, căn giữa,
icon bàn mờ và chữ #9C8C81 "3 bàn khác đang trống".
```

## S21 — Session Detail ⭐ P0

```text
[Khối shell Staff] Tiêu đề "Bàn 5", breadcrumb "Đơn hàng / Bàn 5".

Bố cục hai cột (60% / 40%), khe 20px:

CỘT TRÁI — card "Các đơn trong phiên" nền #FFFDFC bo 16px padding 20px:
- Nhóm "Đơn #015 · 13:15" nhãn 14px semibold #75655B:
  3 dòng món, mỗi dòng nền #FAF4EC bo 12px padding 12px:
  · "Cà phê đen đá × 1" 15px semibold, dòng dưới "Ít đá · Không đường" 13px #9C8C81,
    giá "29.000đ" bên phải, badge "Đã phục vụ" tông xanh trung tính.
  · "Cà phê sữa đá × 1" · "Bình thường · Ít ngọt" · 35.000đ · badge "Sẵn sàng" nền #EAF5EC chữ #3E8E53.
  · "Bạc xỉu đá × 1" · "Bình thường · Ít đá" · 35.000đ · badge "Đang làm" nền #FFF4DE chữ #C98222.
  Tổng phụ căn phải: "99.000đ".
- Nhóm "Đơn #021 · 13:28":
  · "Croissant bơ × 1" · ghi chú trong ô nền #FFF4DE bo 8px chữ nghiêng "Hâm nóng giúp mình" · 32.000đ · badge "Đã nhận".
  Tổng phụ "32.000đ".
- Chữ nhỏ #9C8C81 cuối card: "Trạng thái món do quầy pha chế cập nhật — nhân viên chỉ theo dõi."
  (KHÔNG vẽ nút đổi trạng thái món ở đây.)

CỘT PHẢI — card "Thanh toán" dính khi cuộn, nền #FFFDFC bo 16px padding 20px:
- "Bàn 5" 24px bold; badge "Đang mở" nền #EAF5EC chữ #3E8E53.
- Dòng nhãn/giá trị: "Phiên" – "A7K2QX" · "Mở lúc" – "13:10" · "Số đơn" – "2" · "Số món" – "4".
- Kẻ ngang; "Tổng cộng" 17px bold trái — "131.000đ" 30px bold #35251D phải.
- Dải nền #FFF0E4 viền #D9682B bo 12px chữ 13px: "Khách đã yêu cầu thanh toán lúc 13:34".
- Nút xếp dọc cao 48px: nút đặc #D9682B "Xác nhận thanh toán"; nút viền "In tạm tính".
```

## S22 — Order Detail

```text
[Khối shell Staff, phủ tối 40%]
Drawer phải 460px nền #FFFDFC padding 24px:
- Tiêu đề "Đơn #015" 24px bold; badge "Sẵn sàng" nền #EAF5EC.
- Dòng: "Bàn" – "Bàn 5" · "Phiên" – "A7K2QX" · "Đặt lúc" – "13:15" · "Chờ" – "3 phút".
- 3 card món giống mô tả trong S21 cột trái, kèm ảnh món vuông 48px bo 8px bên trái mỗi card.
- Kẻ ngang; "Tổng đơn" 17px bold — "99.000đ" 24px bold.
- Nút viền tràn ngang cao 44px "Xem cả phiên".
```

## S23 — Payment Method Selection

```text
[Khối shell Staff, phủ tối 40%]
Dialog căn giữa rộng 560px nền #FFFDFC bo 16px padding 32px:
- Tiêu đề "Chọn hình thức thanh toán" 24px bold; dưới "Bàn 5 · Phiên A7K2QX" 14px #9C8C81.
- Khối tổng nền #F6EEE4 bo 12px căn giữa: "Tổng cần thu" 14px #75655B + "131.000đ" 36px bold.
- Ba thẻ chọn xếp dọc, mỗi thẻ cao 72px bo 12px, icon vuông bên trái, tiêu đề + mô tả giữa, radio phải:
  1) "Tiền mặt" · "Khách trả tại quầy" — ĐANG CHỌN: viền #D9682B 2px, nền #FFF0E4.
  2) "Chuyển khoản" · "Xác nhận sau khi thấy tiền về".
  3) "Đã thanh toán online" · "Khách trả qua VNPay" — trạng thái mờ disabled, có chữ nhỏ #9C8C81 "Chưa có giao dịch".
- Nút chữ "Hủy" + nút đặc #D9682B cao 48px "Tiếp tục".
```

## S24 — Cash Payment ⭐ P0

```text
[Khối shell Staff, phủ tối 40%]
Dialog căn giữa rộng 560px nền #FFFDFC bo 16px padding 32px — tối ưu cho cảm ứng, nút và chữ to:

- Tiêu đề "Thanh toán tiền mặt" 24px bold; "Bàn 5 · Phiên A7K2QX" 14px #9C8C81.
- Khối tổng nền #F6EEE4 bo 12px căn giữa padding 20px:
  "Tổng cần thu" 14px #75655B; "131.000đ" 36px bold #35251D.
- Nhãn "Khách đưa" 15px semibold; input rất lớn cao 60px, chữ 30px bold căn phải, viền #D7C4B3 bo 12px,
  giá trị "150.000" kèm hậu tố "đ".
- Hàng 4 chip gợi ý nhanh, mỗi chip cao 48px bo 12px chia đều:
  "131.000đ" · "150.000đ" (ĐANG CHỌN: nền #FFF0E4 viền #D9682B chữ #D9682B) · "200.000đ" · "500.000đ".
- Khối tiền thối nền #EAF5EC bo 12px padding 20px:
  "Tiền thối lại" 17px trái — "19.000đ" 30px bold #3E8E53 phải.
- Checkbox lớn đã tích: "Đóng phiên bàn sau khi thu tiền" 15px,
  chữ nhỏ #9C8C81 bên dưới "Bàn 5 trở về trạng thái trống, mã QR sẵn sàng cho khách mới".
- Chân dialog: nút chữ "Hủy" + nút đặc #D9682B cao 52px "Xác nhận đã thu 131.000đ".
```

## S25 — Bank Transfer Payment

```text
Giống S24 nhưng cho chuyển khoản:
- Tiêu đề "Thanh toán chuyển khoản".
- Thay input "Khách đưa", chip gợi ý và khối tiền thối bằng:
  Khối thông tin nhận tiền nền #FAF4EC bo 12px padding 20px, chia hai phần:
  · Trái: các dòng "Ngân hàng" – "Vietcombank" · "Số tài khoản" – "0123456789" (có icon copy) ·
    "Chủ tài khoản" – "QUAN CAFE CONNECT" · "Nội dung" – "A7K2QX BAN5" (có icon copy).
  · Phải: mã QR chuyển khoản vuông 140px trên nền trắng bo 8px, dưới có chữ nhỏ #9C8C81 "Khách quét để chuyển".
- Trường "Mã giao dịch (không bắt buộc)": input cao 48px placeholder "6 số cuối biến động số dư".
- Dải nhắc nền #FFF4DE viền #C98222 chữ 13px: "Chỉ xác nhận khi bạn đã thấy tiền về tài khoản."
- Nút đặc #D9682B "Xác nhận đã nhận 131.000đ".
```

## S26 — Payment Confirmation (đang xử lý)

```text
Giống S24 nhưng đang gửi:
- Toàn bộ trường trong dialog mờ 60% và khóa.
- Nút chính chuyển loading: nền #BE5520, vòng xoay trắng, chữ "Đang ghi nhận thanh toán...".
- Không có lớp phủ thêm, không đóng được dialog.
```

## S27 — Close Session ⭐ P0

```text
[Khối shell Staff, phủ tối 40%]
Dialog căn giữa rộng 480px nền #FFFDFC bo 16px padding 32px:
- Icon tròn 64px nền #EAF5EC với dấu tích #3E8E53 nét dày, căn giữa.
- Tiêu đề "Đóng phiên Bàn 5?" 24px bold căn giữa.
- Nội dung 15px #75655B căn giữa: "Đã thu đủ 131.000đ bằng tiền mặt. Bàn 5 sẽ trở về trạng thái trống."
- Card tóm tắt nền #FAF4EC bo 12px: "Phiên" – "A7K2QX" · "Số món" – "4" · "Hình thức" – "Tiền mặt" · "Tổng" – "131.000đ" bold.
- Hai nút chia đều cao 48px: nút viền "Để sau" + nút đặc #3E8E53 chữ trắng "Đóng phiên".
```

## S28 — Session Closed Success

```text
[Khối shell Staff] Vùng nội dung căn giữa dọc, không dialog:
- Vòng tròn 96px nền #EAF5EC dấu tích #3E8E53.
- Tiêu đề "Đã đóng phiên Bàn 5" 30px bold.
- "131.000đ" 36px bold #3E8E53.
- Card biên nhận nền #FFFDFC bo 16px viền #E8DCCF rộng tối đa 420px, các dòng nhãn/giá trị:
  "Phiên" – "A7K2QX" · "Bàn" – "Bàn 5" · "Hình thức" – "Tiền mặt" · "Thu lúc" – "13:40 22/07/2026" · "Số món" – "4".
- Hai nút ngang: nút đặc #D9682B "Về danh sách bàn" + nút viền "In biên nhận".
```

## S30 — Session History

```text
[Khối shell Staff] Sidebar: mục "Lịch sử" đang chọn. Tiêu đề "Lịch sử phiên".
Thanh lọc nền #F6EEE4 bo 12px: chọn ngày "22/07/2026", dropdown "Tất cả bàn", dropdown "Tất cả hình thức".
Hàng 2 thẻ nhỏ: "Số phiên hôm nay: 18" · "Tổng thu: 2.480.000đ".

Bảng nền #FFFDFC bo 16px (trên tablet nên các cột thưa, chữ 14px):
Cột: "Phiên" | "Bàn" | "Mở – Đóng" | "Món" | "Hình thức" | "Tổng" | "".
6 hàng cao 56px, ví dụ:
"A7K2QX" | "Bàn 5" | "13:10 – 13:40" | "4" | pill "Tiền mặt" | "131.000đ" bold | icon mũi tên phải.
"M3XQ7B" | "Bàn 3" | "13:05 – 13:35" | "2" | pill "VNPay" | "78.000đ" | mũi tên.
"K9WR4T" | "Bàn 8" | "12:40 – 13:12" | "3" | pill "Chuyển khoản" | "64.000đ" | mũi tên.
Thêm 3 hàng tương tự.
```

## S31 — Closed Session Detail

```text
[Khối shell Staff] Tiêu đề "Phiên A7K2QX", breadcrumb "Lịch sử / A7K2QX",
badge "Đã thanh toán" nền #EAF5EC chữ #3E8E53 cạnh tiêu đề.

Hai cột (60/40):
- Trái: card liệt kê 2 nhóm đơn giống S21 nhưng TẤT CẢ món đều badge "Đã phục vụ",
  toàn bộ ở chế độ chỉ đọc, không có nút thao tác.
- Phải: card "Biên nhận" nền #FFFDFC bo 16px:
  "Tổng cộng" – "131.000đ" 30px bold; các dòng "Hình thức" – "Tiền mặt" · "Khách đưa" – "150.000đ" ·
  "Tiền thối" – "19.000đ" · "Thu bởi" – "Mai Anh" · "Thời gian" – "13:40 22/07/2026".
  Nút viền tràn ngang "In lại biên nhận".
```

## S40 — Notifications drawer

```text
Giống S10 nhưng là drawer thông báo tổng hợp (không chỉ yêu cầu):
- Tiêu đề "Thông báo" + badge "2"; nút chữ #D9682B "Đánh dấu đã đọc".
- Xen kẽ 4 loại thẻ:
  · #FFF0E4 viền trái #D9682B — "Bàn 5 yêu cầu thanh toán · 131.000đ · 13:34".
  · #FFF4DE viền trái #C98222 — "Bàn 3 gọi phục vụ · Thêm đá · 13:32".
  · #EAF2F7 viền trái #477A9E, đã đọc — "Đơn mới từ Bàn 8 · 3 món · 13:18".
  · #EAF5EC viền trái #3E8E53, đã đọc — "Bàn 2 đã đóng phiên · 45.000đ · 12:58".
```

## S41 — Offline / Reconnecting

```text
[Khối shell Staff, màn S20 phía sau]
- Dải cảnh báo dính ngay dưới header, tràn ngang vùng nội dung: nền #FFF4DE, viền dưới #C98222,
  cao 44px, icon wifi gạch chéo #C98222, chữ 14px #35251D "Mất kết nối — đang thử kết nối lại...",
  bên phải là vòng xoay nhỏ #C98222 và nút chữ "Thử lại".
- Badge "Trực tiếp" ở header đổi thành chấm xám và chữ "Ngoại tuyến" #A89E97.
- Nội dung phía dưới mờ 70%, các nút thao tác chuyển disabled xám.
```

## S42 — Payment Conflict

```text
[Khối shell Staff, phủ tối 40%]
Dialog căn giữa 500px nền #FFFDFC bo 16px padding 32px:
- Icon tròn 56px nền #FFF4DE dấu chấm than #C98222.
- Tiêu đề "Phiên này vừa được thanh toán" 24px bold.
- Nội dung 15px #75655B: "Khách đã thanh toán 131.000đ qua VNPay lúc 13:38, ngay khi bạn đang nhập tiền mặt.
  Không cần thu thêm."
- Card nền #FAF4EC bo 12px: "Hình thức" – "VNPay" · "Mã giao dịch" – "VNP14882031" · "Thời gian" – "13:38".
- Nút đặc #D9682B tràn ngang cao 48px "Đã hiểu, làm mới phiên".
```

## S43 — Session Already Closed

```text
[Khối shell Staff, phủ tối 40%]
Dialog 460px: icon tròn #EAF2F7 chữ i màu #477A9E;
tiêu đề "Phiên đã được đóng" 24px bold;
nội dung "Đồng nghiệp khác vừa đóng phiên Bàn 5 lúc 13:40. Bàn hiện đang trống.";
nút đặc #D9682B tràn ngang "Về danh sách bàn".
```

## S44 — Permission Denied

```text
[Khối shell Staff] Vùng nội dung căn giữa dọc:
- Icon tròn 96px nền #EEE9E4 hình ổ khóa #A89E97.
- Tiêu đề "Bạn không có quyền truy cập" 30px bold.
- Mô tả #75655B căn giữa: "Mục này chỉ dành cho chủ quán. Tài khoản nhân viên chỉ xem được đơn hàng và lịch sử."
- Nút đặc #D9682B "Về trang Đơn hàng".
Lưu ý: sidebar vẫn chỉ có 2 mục — chính điều này giải thích vì sao có màn 403.
```

## S45 — Empty States

```text
[Khối shell Staff] Ba biến thể, cùng bố cục: card lớn nền #FFFDFC bo 16px,
nội dung căn giữa, padding dọc 64px, minh họa nét mảnh tông #D7C4B3 cao 140px.

a) Không có bàn nào đang mở:
   minh họa bàn cafe trống với ly úp; "Chưa có bàn nào đang phục vụ" 24px bold;
   "Khi khách quét mã QR, phiên bàn sẽ hiện ở đây."; nút viền "Xem lịch sử".

b) Không có yêu cầu (trong drawer S10):
   minh họa chuông nhỏ; "Không có yêu cầu nào đang chờ" 20px bold;
   "Yêu cầu gọi phục vụ và thanh toán sẽ hiện ở đây."

c) Lịch sử rỗng:
   minh họa biên nhận trống; "Chưa có phiên nào trong ngày này" 24px bold;
   "Chọn ngày khác để xem lịch sử."; nút viền "Xem hôm nay".
```
