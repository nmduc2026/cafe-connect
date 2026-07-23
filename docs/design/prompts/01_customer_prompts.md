# 01 — Customer Prompts (C01–C23)

> Viewport: **390 × 844** (mobile). Dán `00_base_prompt.md` §A trước mỗi prompt.
> Ưu tiên sinh trước: **C03, C05, C08, C12, C19** — 5 màn này đủ dựng demo và quay video.

---

## C01 — QR Entry

```text
Màn hình mobile 390×844. Khách vừa quét QR ở bàn, app đang xác nhận bàn.

Nền kem #FBF7F1, nội dung căn giữa theo chiều dọc, rất tối giản.
- Logo chữ "cafe-connect" màu nâu #6A3E28, cỡ lớn, đặt trên cùng phần nội dung.
- Bên dưới: minh họa nhỏ một tấm thẻ QR giấy đặt trên mặt bàn gỗ sáng, phong cách ảnh thật, bo góc 20px, chiều cao khoảng 200px.
- Tiêu đề: "Chào bạn đến Bàn 5" — 26px bold, nâu #35251D.
- Phụ đề: "Đang mở phiên gọi món cho bàn của bạn..." — 15px, #75655B.
- Một vòng xoay loading nhỏ màu terracotta #D9682B dưới phụ đề.
- Không có nút bấm. Không có thanh điều hướng.
Cảm giác: sạch, ấm, chờ trong 1–2 giây.
```

## C02 — Session Loading (skeleton)

```text
Màn hình mobile 390×844, trạng thái đang tải menu.

- Header trên cùng: chữ "cafe-connect" bên trái, badge pill "Bàn 5" nền #FFF0E4 chữ #D9682B bên phải.
- Dưới header: một khối skeleton bo góc 20px cao 140px (vị trí ảnh hero).
- Hàng skeleton pill ngang: 5 khối bo tròn hoàn toàn, rộng khác nhau (vị trí tab danh mục).
- 4 thẻ skeleton dạng card bo góc 16px, mỗi thẻ có ô vuông skeleton bên trái 88×88px và 3 vạch skeleton bên phải dài ngắn khác nhau.
- Toàn bộ skeleton màu #EEE9E4 trên nền #FBF7F1, viền rất nhạt #E8DCCF.
- Không có chữ thật nào ngoài header.
Không dùng hiệu ứng shimmer sáng chói, chỉ khối xám ấm phẳng.
```

## C03 — Menu Home ⭐ P0

```text
Màn hình mobile 390×844 — màn chính của khách sau khi quét QR. Đây là ảnh quan trọng nhất.

BỐ CỤC TỪ TRÊN XUỐNG:

1) Header dính trên cùng, nền trắng ấm #FFFDFC, viền dưới #E8DCCF, cao 56px:
   - Trái: chữ "cafe-connect" 17px semibold màu #6A3E28.
   - Phải: badge pill "Bàn 5" nền #FFF0E4, chữ #D9682B 14px medium; cạnh đó là link chữ nhỏ "Theo dõi đơn" 14px màu #75655B.

2) Hero bo góc 20px, cao khoảng 130px, lề ngang 16px:
   - Ảnh thật: mặt bàn gỗ sáng nhìn từ trên xuống, một ly cà phê sữa đá và vài hạt cà phê rang, ánh sáng ban ngày tự nhiên, tông kem ấm.
   - Phủ lớp gradient tối rất nhẹ ở đáy để chữ đọc được (KHÔNG phủ nâu đậm).
   - Chữ trắng đè lên: "Chào bạn tại Bàn 5" 20px bold, dòng dưới "Chọn món yêu thích, quầy pha chế sẽ nhận đơn ngay." 14px.

3) Tab danh mục, cuộn ngang, dính dưới header:
   "Cà phê" (đang chọn: nền #D9682B, chữ trắng, bo tròn hoàn toàn) · "Trà" · "Bánh" · "Đá xay" · "Nước ép" (chưa chọn: nền #FFFDFC, chữ #75655B, viền #E8DCCF).

4) Lưới món 2 cột, khe hở 12px, lề ngang 16px. Mỗi thẻ nền #FFFDFC, bo góc 16px, viền #E8DCCF, shadow rất nhẹ:
   - Ảnh món vuông trên cùng, bo góc trên 16px.
   - Tên món 15px semibold #35251D.
   - Mô tả 1 dòng 12px #9C8C81, cắt bằng dấu ba chấm.
   - Hàng dưới cùng: giá 17px bold #35251D bên trái, nút tròn dấu cộng 36px nền #D9682B chữ trắng bên phải.
   4 món hiển thị: "Cà phê đen đá 29.000đ", "Cà phê sữa đá 35.000đ", "Bạc xỉu đá 35.000đ", "Cà phê muối 39.000đ".

5) Thanh hành động dính đáy, nền #FFFDFC, viền trên #E8DCCF, shadow nhẹ hướng lên, có chừa safe area:
   - Vì giỏ đang trống: hai nút cạnh nhau, mỗi nút cao 48px, bo góc 12px.
   - Trái: nút viền "Gọi phục vụ" — viền #D7C4B3, chữ #35251D, có icon chuông.
   - Phải: nút "Xem giỏ · 0 món" trạng thái mờ disabled — nền #EEE9E4, chữ #A89E97.

Toàn màn nền #FBF7F1. Thoáng, dễ đọc bằng một tay, giá tiền nổi bật.
```

## C04 — Category Browse (tab Trà)

```text
Giống C03 nhưng tab "Trà" đang được chọn (nền #D9682B chữ trắng), tab "Cà phê" trở về trạng thái thường.

Lưới hiển thị 2 món:
- "Trà đào cam sả" 45.000đ — bình thường, ảnh trà đào lát cam sả trong ly cao.
- "Trà sen vàng" 42.000đ — TRẠNG THÁI HẾT HÀNG: ảnh giảm bão hòa và làm mờ nhẹ, phủ nhãn pill "Hết hàng" nền #EEE9E4 chữ #A89E97 ở góc trên ảnh, tên và giá chuyển màu xám #A89E97, nút cộng bị disabled màu xám không bấm được.

Thanh đáy: giỏ đang có 2 món, tổng 64.000đ — nút phải đổi thành nút đặc nền #D9682B chữ trắng "Xem giỏ · 2 món · 64.000đ".
```

## C05 — Product Detail ⭐ P0

```text
Màn hình mobile 390×844 — bottom sheet chi tiết món, kéo lên che khoảng 88% chiều cao.

- Nền phía sau là menu bị làm tối nhẹ (lớp phủ đen 40%).
- Sheet nền #FFFDFC, bo góc trên 20px, có thanh kéo nhỏ màu #E8DCCF ở giữa mép trên.

Nội dung trong sheet:
1) Ảnh món tràn ngang, cao 200px: ly cà phê sữa đá trên bàn gỗ sáng, ánh sáng tự nhiên.
2) Tên "Cà phê sữa đá" 24px bold #35251D; giá "35.000đ" 20px bold màu #D9682B.
3) Mô tả 15px #75655B: "Cà phê phin đậm vị hòa cùng sữa đặc, thêm đá mát lạnh."
4) Nhóm tùy chọn "Đường" — nhãn 15px semibold kèm chữ nhỏ đỏ "Bắt buộc":
   3 lựa chọn dạng hàng có nút radio tròn: "Bình thường" (đang chọn — viền #D9682B, chấm trong màu #D9682B), "Ít ngọt", "Không đường". Mỗi hàng cao tối thiểu 48px, viền dưới nhạt.
5) Nhóm tùy chọn "Đá": "Bình thường" (đang chọn), "Ít đá", "Không đá".
6) Nhóm "Thêm topping" kèm chữ "Chọn nhiều" — các ô vuông checkbox: "Thêm shot cà phê +10.000đ", "Trân châu +8.000đ".
7) Ô ghi chú: input viền #E8DCCF bo 8px, placeholder "Ghi chú cho quầy pha chế (không bắt buộc)".
8) Bộ đếm số lượng: nút trừ tròn, số "1" 20px bold ở giữa, nút cộng tròn — cả hai 44×44px viền #D7C4B3.

Dính đáy sheet: nút đặc tràn ngang cao 52px, nền #D9682B, chữ trắng 15px semibold: "Thêm vào giỏ · 35.000đ".
```

## C06 — Product Validation Error

```text
Giống C05 nhưng nhóm "Đường" chưa chọn gì và người dùng đã bấm thêm vào giỏ.

- Nhóm "Đường" có viền đỏ #C44B45 bao quanh khu vực, nền nhóm chuyển #FBECEB rất nhạt.
- Dưới nhóm hiện dòng chữ đỏ #C44B45 13px kèm icon cảnh báo tròn: "Vui lòng chọn mức đường".
- Sheet đã tự cuộn tới nhóm lỗi.
- Nút đáy vẫn màu #D9682B nhưng nhóm lỗi là điểm nhìn chính.
```

## C07 — Added to Cart (toast)

```text
Giống C03 (menu đang mở), có thêm:
- Toast trượt lên từ đáy, đặt ngay TRÊN thanh hành động dính đáy, lề ngang 16px:
  nền #EAF5EC, viền #3E8E53, bo góc 12px, có icon dấu tích tròn xanh #3E8E53,
  chữ #35251D 14px: "Đã thêm Cà phê sữa đá vào giỏ".
- Thanh đáy cập nhật: nút phải đặc nền #D9682B chữ trắng "Xem giỏ · 1 món · 35.000đ".
- Thẻ món "Cà phê sữa đá" trong lưới có viền sáng nhẹ màu #D9682B trong khoảnh khắc vừa thêm.
```

## C08 — Cart ⭐ P0

```text
Màn hình mobile 390×844 — giỏ hàng.

Header: nút mũi tên quay lại bên trái, tiêu đề "Giỏ hàng" 17px semibold ở giữa, badge "Bàn 5" bên phải.

Danh sách 3 dòng món, mỗi dòng là card nền #FFFDFC bo 16px viền #E8DCCF, lề ngang 16px, cách nhau 12px:
1) Ảnh vuông 64px bo 8px bên trái.
2) Giữa: tên món 15px semibold; dòng tùy chọn 12px #9C8C81; giá 15px bold #35251D.
3) Phải: bộ đếm số lượng nhỏ gọn (trừ / số / cộng), mỗi nút 32px bo tròn viền #D7C4B3.

Nội dung:
- "Cà phê đen đá" · "Ít đá · Không đường" · 29.000đ · SL 1
- "Cà phê sữa đá" · "Bình thường · Ít ngọt" · 35.000đ · SL 1
- "Bạc xỉu đá" · "Bình thường · Ít đá" · 35.000đ · SL 1

Dưới danh sách: ô ghi chú cho cả đơn, viền #E8DCCF bo 8px, placeholder "Ghi chú chung cho đơn này".

Khối tổng tiền: nền #F6EEE4 bo 16px, lề ngang 16px:
- Dòng "Tạm tính" 15px #75655B bên trái — "99.000đ" bên phải.
- Đường kẻ nhạt.
- Dòng "Tổng cộng" 17px bold — "99.000đ" 20px bold #35251D.

Dính đáy: nút đặc tràn ngang cao 52px nền #D9682B chữ trắng "Gọi món · 99.000đ".
Trên nút có link chữ nhỏ căn giữa "Thêm món khác" màu #75655B.
```

## C09 — Order Review

```text
Giống C08 nhưng ở bước xác nhận cuối:
- Bộ đếm số lượng bị ẩn, mỗi dòng chỉ hiện "× 1" màu #75655B — danh sách ở chế độ chỉ đọc.
- Trên khối tổng tiền có dải thông báo nền #EAF2F7 viền #477A9E bo 12px, icon thông tin, chữ 13px:
  "Đơn sẽ được gửi tới quầy pha chế ngay. Bạn có thể gọi thêm sau."
- Nút đáy: "Xác nhận gọi món · 99.000đ".
```

## C10 — Order Submitting

```text
Giống C09 nhưng đang gửi đơn:
- Nút đáy chuyển sang trạng thái loading: vẫn nền #D9682B nhưng có vòng xoay trắng nhỏ bên trái chữ "Đang gửi đơn...", nút không bấm được.
- Toàn bộ danh sách phía trên mờ đi còn 60% và không tương tác được.
- Không có lớp phủ toàn màn hình.
```

## C11 — Order Success

```text
Màn hình mobile 390×844 — xác nhận đặt món thành công. Nền #FBF7F1, nội dung căn giữa.

- Minh họa: vòng tròn lớn 96px nền #EAF5EC, bên trong là dấu tích #3E8E53 nét dày.
- Tiêu đề "Đã gửi đơn tới quầy pha chế" 26px bold #35251D, căn giữa.
- Phụ đề 15px #75655B: "Đơn #015 · Bàn 5 · 3 món".
- Card tóm tắt nền #FFFDFC bo 16px viền #E8DCCF, lề ngang 16px, liệt kê 3 dòng gọn:
  "1 × Cà phê đen đá — 29.000đ", "1 × Cà phê sữa đá — 35.000đ", "1 × Bạc xỉu đá — 35.000đ",
  kẻ ngang rồi "Tổng 99.000đ" bold.
- Dòng chữ nhỏ #9C8C81 căn giữa: "Thời gian pha chế dự kiến 5–10 phút".

Hai nút xếp dọc, lề ngang 16px, cách nhau 12px:
- Nút đặc #D9682B chữ trắng cao 52px: "Theo dõi đơn".
- Nút viền #D7C4B3 chữ #35251D cao 52px: "Gọi thêm món".
```

## C12 — Order Tracking ⭐ P0

```text
Màn hình mobile 390×844 — khách theo dõi trạng thái món real-time. Ảnh này rất quan trọng cho video demo.

Header: nút quay lại, tiêu đề "Đơn của Bàn 5", badge nhỏ màu #3E8E53 có chấm tròn "Đang kết nối" bên phải.

Khối phiên nền #F6EEE4 bo 16px, lề ngang 16px:
- "Phiên A7K2QX · mở lúc 13:10" 13px #75655B.
- "Tổng tạm tính: 131.000đ" 20px bold #35251D.

NHÓM ĐƠN 1 — nhãn section "Đơn #015 · 13:15" 14px semibold #75655B.
Ba card món, mỗi card nền #FFFDFC bo 16px viền #E8DCCF, có ảnh món vuông 56px bên trái,
tên + tùy chọn ở giữa, badge trạng thái ở phải:
- "Cà phê đen đá" · "Ít đá · Không đường" → badge "Đã phục vụ" nền xanh lá nhạt trung tính, icon tích đôi.
- "Cà phê sữa đá" · "Bình thường · Ít ngọt" → badge "Sẵn sàng" nền #EAF5EC chữ #3E8E53, icon tích.
- "Bạc xỉu đá" · "Bình thường · Ít đá" → badge "Đang làm" nền #FFF4DE chữ #C98222, icon đồng hồ cát.

NHÓM ĐƠN 2 — nhãn "Đơn #021 · 13:28".
- "Croissant bơ" · ghi chú "Hâm nóng giúp mình" hiển thị dạng chữ nghiêng #9C8C81 → badge "Đã nhận" nền #EAF2F7 chữ #477A9E, icon biên nhận.

Dính đáy: hai nút cạnh nhau cao 48px —
- Trái: viền #D7C4B3, icon chuông, "Gọi phục vụ".
- Phải: đặc #D9682B chữ trắng, "Thanh toán · 131.000đ".
```

## C13 / C14 / C15 — biến thể trạng thái của C12

```text
C13 (Đang làm): giống C12 nhưng TẤT CẢ món của đơn #015 đều mang badge "Đang làm" nền #FFF4DE chữ #C98222.
C14 (Sẵn sàng): giống C12 nhưng cả 3 món đơn #015 mang badge "Sẵn sàng" nền #EAF5EC chữ #3E8E53,
   và có dải thông báo trên cùng danh sách: nền #EAF5EC viền #3E8E53, chữ "Món của bạn đã sẵn sàng, nhân viên đang mang ra".
C15 (Đã phục vụ): tất cả món mang badge "Đã phục vụ" tông xanh trung tính, card giảm độ tương phản nhẹ;
   nút đáy phải nổi bật hơn: "Thanh toán · 131.000đ".
```

## C16 — Add More Items

```text
Giống C03 (menu) nhưng có dải nhắc dính ngay dưới tab danh mục:
nền #FFF0E4, bo 12px, lề ngang 16px, chữ 13px #35251D kèm icon giỏ:
"Bạn đang có 4 món trong phiên này · 131.000đ".
Thanh đáy: nút phải "Xem giỏ · 0 món mới" ở trạng thái mờ, nút trái "Theo dõi đơn" viền.
```

## C17 — Staff Call sheet

```text
Màn hình mobile 390×844, bottom sheet thấp (khoảng 40% chiều cao) chồng lên màn theo dõi đơn bị làm tối nhẹ.

Sheet nền #FFFDFC bo góc trên 20px:
- Thanh kéo #E8DCCF ở mép trên.
- Tiêu đề "Bạn cần hỗ trợ gì?" 20px bold #35251D.
- Phụ đề 14px #75655B: "Chọn nhanh để nhân viên biết mang gì ra bàn.".
- Lưới 2×2 các chip lớn, mỗi chip cao 56px bo 12px viền #D7C4B3 nền #FFFDFC, có icon nhỏ bên trái:
  "Thêm nước", "Thêm đá", "Dọn bàn", "Khác".
  Chip "Thêm đá" đang được chọn: nền #FFF0E4, viền #D9682B, chữ #D9682B.
- Nút đáy tràn ngang cao 52px nền #D9682B chữ trắng: "Gọi nhân viên".
```

## C18 — Bill Request confirm

```text
Màn hình mobile 390×844, dialog xác nhận căn giữa, nền sau bị phủ tối 40%.

Dialog nền #FFFDFC bo 16px, lề ngang 24px, padding 24px:
- Icon tròn 56px nền #FFF0E4 với biểu tượng hóa đơn màu #D9682B.
- Tiêu đề "Yêu cầu thanh toán?" 20px bold căn giữa.
- Nội dung 15px #75655B căn giữa: "Nhân viên sẽ mang hóa đơn tới Bàn 5. Tổng cộng 131.000đ."
- Hai nút xếp dọc cách nhau 8px: nút đặc #D9682B chữ trắng "Xác nhận"; nút chữ không viền #75655B "Để sau".
```

## C19 — Payment Method ⭐ P0

```text
Màn hình mobile 390×844 — chọn cách thanh toán.

Header: nút quay lại, tiêu đề "Thanh toán".

Khối hóa đơn nền #FFFDFC bo 16px viền #E8DCCF, lề ngang 16px:
- "Bàn 5 · Phiên A7K2QX" 13px #9C8C81.
- 4 dòng món cỡ nhỏ với giá bên phải: Cà phê đen đá 29.000đ · Cà phê sữa đá 35.000đ · Bạc xỉu đá 35.000đ · Croissant bơ 32.000đ.
- Kẻ ngang, rồi "Tổng cộng" 17px bold trái — "131.000đ" 24px bold #35251D phải.

Nhãn section "Chọn hình thức thanh toán" 15px semibold.
Ba thẻ lựa chọn xếp dọc, mỗi thẻ cao 72px, bo 16px, nền #FFFDFC, có icon vuông bo tròn bên trái, tiêu đề + mô tả ở giữa, nút radio bên phải:
1) "Thanh toán online" · "Qua VNPay — thẻ, QR ngân hàng" — ĐANG CHỌN: viền #D9682B nét 2px, nền #FFF0E4 rất nhạt, radio active màu #D9682B.
2) "Tiền mặt" · "Trả trực tiếp cho nhân viên" — viền #E8DCCF thường.
3) "Chuyển khoản" · "Nhân viên xác nhận tại quầy" — viền #E8DCCF thường.

Dính đáy: nút đặc tràn ngang cao 52px nền #D9682B chữ trắng "Thanh toán 131.000đ".
```

## C20 — VNPay Redirect

```text
Màn hình mobile 390×844, trạng thái chuyển hướng. Nền #FBF7F1, nội dung căn giữa dọc.

- Vòng xoay loading lớn 48px màu #D9682B.
- Tiêu đề "Đang chuyển đến VNPay..." 20px bold #35251D.
- Phụ đề 14px #75655B căn giữa: "Vui lòng không đóng trình duyệt hoặc bấm quay lại."
- Dòng chữ rất nhỏ #9C8C81 gần đáy: "Giao dịch 131.000đ · Bàn 5".
Không có nút. Không hiển thị logo hay thương hiệu VNPay (chỉ dùng chữ).
```

## C21 — Payment Pending

```text
Màn hình mobile 390×844. Nền #FBF7F1, căn giữa.

- Vòng tròn 96px nền #FFF4DE, bên trong icon đồng hồ màu #C98222.
- Tiêu đề "Đang xác nhận thanh toán" 26px bold.
- Phụ đề 15px #75655B: "Ngân hàng đang xử lý. Việc này thường mất dưới một phút."
- Card nhỏ nền #FFFDFC bo 16px: "Bàn 5 · 131.000đ · 22/07/2026 13:18".
- Nút viền #D7C4B3 tràn ngang "Kiểm tra lại trạng thái".
```

## C22 — Payment Success

```text
Màn hình mobile 390×844. Nền #FBF7F1, căn giữa.

- Vòng tròn 96px nền #EAF5EC với dấu tích #3E8E53 nét dày.
- Tiêu đề "Thanh toán thành công" 26px bold #35251D.
- Số tiền lớn "131.000đ" 36px bold #3E8E53.
- Card biên nhận nền #FFFDFC bo 16px viền #E8DCCF, các dòng nhãn-giá trị 14px:
  "Bàn" – "Bàn 5" · "Phiên" – "A7K2QX" · "Hình thức" – "VNPay" · "Thời gian" – "22/07/2026 13:18".
- Dòng chữ #75655B căn giữa: "Cảm ơn bạn đã ghé cafe-connect!".
- Nút viền tràn ngang "Xong".
```

## C23 — Session Closed

```text
Màn hình mobile 390×844. Nền #FBF7F1, căn giữa.

- Minh họa nhẹ: ly cà phê đã uống hết đặt trên bàn gỗ sáng, phong cách ảnh thật, bo góc 20px, cao 180px, tông kem.
- Tiêu đề "Phiên bàn đã kết thúc" 26px bold.
- Phụ đề 15px #75655B căn giữa: "Bàn 5 đã được thanh toán và đóng phiên. Quét lại mã QR nếu bạn muốn gọi thêm."
- Card nhỏ mờ: "Phiên A7K2QX · Tổng 131.000đ · Đã thanh toán" với badge xanh "Đã thanh toán".
- Nút viền #D7C4B3 tràn ngang "Quét mã QR mới".
```

---

## Nhóm lỗi & rỗng (E01–E06) — dùng chung layout

```text
Màn hình mobile 390×844, nền #FBF7F1, nội dung căn giữa dọc, lề ngang 24px.
Cấu trúc chung: vòng tròn icon 96px → tiêu đề 24px bold → mô tả 15px #75655B căn giữa → nút hành động.

E01 Giỏ trống:      icon giỏ hàng, nền vòng tròn #F6EEE4, màu #9C8C81.
                    "Giỏ hàng đang trống" / "Chọn vài món ngon để bắt đầu nhé." / nút đặc #D9682B "Xem menu".
E02 QR không hợp lệ: icon mã QR gạch chéo, nền #FBECEB, màu #C44B45.
                    "Mã QR không hợp lệ" / "Bàn này đã ngừng phục vụ hoặc mã đã hết hạn. Nhờ nhân viên hỗ trợ giúp bạn nhé." / nút viền "Thử lại".
E03 Phiên hết hạn:  icon đồng hồ, nền #FFF4DE, màu #C98222.
                    "Phiên bàn đã hết hạn" / "Quét lại mã QR trên bàn để tiếp tục gọi món." / nút đặc "Quét lại".
E04 Món hết hàng:   icon ly gạch chéo, nền #EEE9E4, màu #A89E97.
                    "Món này vừa hết" / "Quầy pha chế vừa cập nhật. Bạn chọn món khác giúp mình nhé." / nút đặc "Quay lại menu".
E05 Thanh toán lỗi: icon chữ X, nền #FBECEB, màu #C44B45.
                    "Thanh toán không thành công" / "Giao dịch chưa được ghi nhận. Bạn thử lại hoặc thanh toán tiền mặt tại quầy." / nút đặc "Thử lại" + nút chữ "Chọn cách khác".
E06 Mất mạng:       icon wifi gạch chéo, nền #EAF2F7, màu #477A9E.
                    "Mất kết nối" / "Đang thử kết nối lại với quầy pha chế..." / nút viền "Tải lại".
```
