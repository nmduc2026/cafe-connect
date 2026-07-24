# 02 — Admin Prompts (A01–A75)

> Viewport: **1440 × 1024** (desktop). Dán `00_base_prompt.md` §A trước mỗi prompt.
> Ưu tiên sinh trước: **A03, A20, A21, A30, A34, A40, A43, A50**.

---

## Khối shell dùng chung — dán vào mọi prompt admin

```text
KHUNG ADMIN CHUẨN (mọi màn admin đều có, chỉ khác vùng nội dung):

Sidebar trái cố định rộng 248px, nền #FFFDFC, viền phải #E8DCCF:
- Trên cùng: chữ "cafe-connect" 17px semibold màu #6A3E28, padding 20px.
- Danh sách mục, mỗi mục cao 44px, bo 12px, có icon 20px bên trái, chữ 15px:
  "Tổng quan", "Menu" (có mục con thụt vào: "Danh mục", "Món", "Nhóm tùy chọn"),
  "Bàn & QR", "Đơn hàng", "Báo cáo", "Nhân viên".
- Mục đang chọn: nền #FFF0E4, chữ và icon #D9682B, có vạch đứng 3px màu #D9682B ở mép trái.
- Mục thường: chữ #75655B, không nền.
- Đáy sidebar: avatar tròn 32px chữ cái "Đ", tên "Nguyễn Minh Đức" 14px, dưới là "Quản trị" 12px #9C8C81.

Header trên cùng vùng nội dung, cao 64px, nền #FBF7F1, viền dưới #E8DCCF:
- Trái: tiêu đề trang 24px bold #35251D, dưới có breadcrumb 13px #9C8C81 nếu cần.
- Phải: icon chuông thông báo có badge số đỏ, đồng hồ "13:18 · 22/07/2026" 13px #75655B.

Vùng nội dung: nền #FBF7F1, padding 32px, nội dung tối đa rộng 1600px.
```

---

## A01 — Login ⭐ P0

```text
Màn 1440×1024 — trang đăng nhập, KHÔNG có sidebar.

Bố cục chia đôi:
- Nửa trái (58%): ảnh thật quầy pha chế quán cafe Việt — máy pha espresso, ly sứ, bình thủy tinh,
  ánh sáng ban ngày ấm, tông kem nâu sáng. Phủ nhẹ để không chói. Trên ảnh có chữ trắng ở góc dưới:
  "cafe-connect" 30px bold, dưới là "Gọi món qua QR cho quán cafe Việt" 17px.
- Nửa phải (42%): nền #FBF7F1, card đăng nhập căn giữa rộng 400px, nền #FFFDFC, bo 16px, viền #E8DCCF, padding 32px:
  - Tiêu đề "Đăng nhập" 30px bold #35251D.
  - Phụ đề 15px #75655B: "Dành cho chủ quán và nhân viên."
  - Trường "Email": nhãn 14px semibold, input cao 44px bo 8px viền #E8DCCF, giá trị "admin@demo.com".
  - Trường "Mật khẩu": input cao 44px với chấm tròn ẩn mật khẩu và icon con mắt bên phải.
  - Hàng: checkbox "Ghi nhớ đăng nhập" bên trái 14px.
  - Nút đặc tràn ngang cao 48px nền #D9682B chữ trắng "Đăng nhập".
  - Link chữ căn giữa 14px #75655B: "Điền tài khoản demo".
```

## A02 — Login Loading

```text
Giống A01 nhưng nút "Đăng nhập" ở trạng thái loading: nền #BE5520, có vòng xoay trắng bên trái chữ "Đang đăng nhập...".
Hai input bị mờ nhẹ và khóa. Không có thông báo lỗi.
```

## A03 — Dashboard ⭐ P0

```text
[Dán khối shell admin] Sidebar: mục "Tổng quan" đang chọn. Tiêu đề trang "Tổng quan".

Hàng 4 thẻ số liệu, chia đều, mỗi thẻ nền #FFFDFC bo 16px viền #E8DCCF padding 20px:
1) "Doanh thu hôm nay" 14px #75655B / "2.480.000đ" 30px bold #35251D / dòng nhỏ xanh #3E8E53 "▲ 12% so với hôm qua".
2) "Đơn hôm nay" / "37" / "▲ 5 đơn".
3) "Bàn đang dùng" / "2 / 6" / chữ #75655B "Bàn 3, Bàn 5".
4) "Giá trị TB mỗi bàn" / "67.000đ" / "▼ 3%" màu #C44B45.

Dưới đó chia hai cột (60% / 40%), khe 24px:

Cột trái — card "Doanh thu 7 ngày qua" nền #FFFDFC bo 16px:
- Biểu đồ cột dọc, 7 cột màu #D9682B bo góc trên 4px, cao thấp khác nhau,
  nhãn trục dưới "16/7 ... 22/07", lưới ngang rất nhạt #E8DCCF, trục tiền bên trái dạng "0 / 1tr / 2tr / 3tr".

Cột phải — card "Đơn đang xử lý":
- 4 dòng, mỗi dòng: tên bàn 15px semibold bên trái, badge trạng thái bên phải.
  "Bàn 5 · Đơn #021" → badge "Đã nhận" nền #EAF2F7 chữ #477A9E.
  "Bàn 3 · Đơn #018" → badge "Đang làm" nền #FFF4DE chữ #C98222.
  "Bàn 8 · Đơn #020" → badge "Đang làm".
  "Bàn 5 · Đơn #015" → badge "Sẵn sàng" nền #EAF5EC chữ #3E8E53.
- Link chữ "Xem tất cả đơn" màu #D9682B dưới cùng.

Hàng cuối — card "Món bán chạy hôm nay": danh sách 5 dòng có ảnh món tròn 32px,
tên món, và thanh tiến trình ngang màu #D9682B thể hiện số lượng, kèm số bên phải:
Cà phê sữa đá 24 · Cà phê đen đá 19 · Bạc xỉu đá 15 · Trà đào cam sả 11 · Croissant bơ 8.
```

## A10 — Category List

```text
[Shell admin] Sidebar: "Menu > Danh mục" đang chọn. Tiêu đề "Danh mục", breadcrumb "Menu / Danh mục".
Góc phải header vùng nội dung: nút đặc #D9682B chữ trắng cao 40px bo 12px "+ Thêm danh mục".

Bảng nền #FFFDFC bo 16px viền #E8DCCF, không có đường kẻ dọc:
- Hàng tiêu đề nền #FAF4EC, chữ 13px semibold #75655B: "" (ô tay kéo) | "Tên danh mục" | "Số món" | "Thứ tự" | "Hiển thị" | "" (thao tác).
- 6 hàng dữ liệu, mỗi hàng cao 56px, viền dưới #E8DCCF rất nhạt:
  icon 6 chấm kéo-thả màu #9C8C81 | tên 15px | số món | số thứ tự | công tắc bật (nền #3E8E53, núm trắng) | icon bút chì và icon thùng rác màu #75655B.
- Dữ liệu: "Cà phê" 4 món thứ tự 1 · "Trà" 2 món thứ tự 2 · "Bánh" 2 món thứ tự 3 ·
  "Đá xay" 0 món thứ tự 4 · "Nước ép" 0 món thứ tự 5 · "Topping" 0 món thứ tự 6.
- Hàng "Đá xay" đang được rê chuột: nền #FAF4EC.
```

## A11 / A12 — Create / Edit Category (dialog)

```text
[Shell admin, màn A10 phía sau bị phủ tối 40%]
Dialog căn giữa rộng 480px, nền #FFFDFC, bo 16px, shadow vừa, padding 24px:
- Tiêu đề "Thêm danh mục" (A12: "Sửa danh mục") 20px bold, nút X ở góc phải.
- Trường "Tên danh mục *": input cao 44px bo 8px, A11 để trống với placeholder "Ví dụ: Cà phê"; A12 điền sẵn "Trà".
- Trường "Thứ tự hiển thị": input số nhỏ, giá trị "2".
- Hàng công tắc: "Hiển thị cho khách" với công tắc bật màu #3E8E53.
- Chân dialog kẻ ngang trên, hai nút căn phải: nút chữ #75655B "Hủy", nút đặc #D9682B chữ trắng "Lưu".
```

## A13 — Delete Category Confirm

```text
[Shell admin, nền phủ tối 40%]
Dialog căn giữa rộng 440px nền #FFFDFC bo 16px padding 24px:
- Icon tròn 48px nền #FBECEB với dấu chấm than #C44B45.
- Tiêu đề "Xóa danh mục Đá xay?" 20px bold.
- Nội dung 15px #75655B: "Danh mục này chưa có món nào. Thao tác không thể hoàn tác."
- Hai nút căn phải: nút chữ "Hủy", nút đặc nền #C44B45 chữ trắng "Xóa".
```

## A14 — Category Empty State

```text
[Shell admin] Bảng danh mục rỗng: card lớn nền #FFFDFC bo 16px, nội dung căn giữa, padding dọc 64px:
- Minh họa nhẹ: hình vẽ đường nét mảnh một tấm bảng menu giấy kem, tông #D7C4B3, cao 140px.
- Tiêu đề "Chưa có danh mục nào" 24px bold.
- Mô tả 15px #75655B căn giữa: "Tạo danh mục đầu tiên để bắt đầu dựng menu cho quán."
- Nút đặc #D9682B "+ Thêm danh mục".
```

## A20 — Menu Item List ⭐ P0

```text
[Shell admin] Sidebar: "Menu > Món" đang chọn. Tiêu đề "Món", breadcrumb "Menu / Món".
Nút đặc #D9682B góc phải "+ Thêm món".

Thanh lọc nền #F6EEE4 bo 12px padding 12px, các thành phần cùng hàng:
- Ô tìm kiếm rộng 280px có icon kính lúp, placeholder "Tìm theo tên món".
- Dropdown "Tất cả danh mục".
- Dropdown "Tất cả trạng thái".
- Bên phải: chữ 13px #75655B "8 món".

Bảng nền #FFFDFC bo 16px viền #E8DCCF:
Cột: "Ảnh" | "Tên món" | "Danh mục" | "Giá" | "Còn hàng" | "Thao tác".
8 hàng cao 64px:
- Ảnh món vuông 44px bo 8px.
- Tên 15px semibold #35251D, dưới là mô tả ngắn 12px #9C8C81 cắt gọn.
- Danh mục dạng pill nhỏ nền #F6EEE4 chữ #75655B.
- Giá 15px bold, canh phải.
- Cột còn hàng là công tắc: bật (#3E8E53) cho 7 món, TẮT (xám #A89E97) cho "Trà sen vàng" — hàng này toàn bộ chữ chuyển #A89E97 và ảnh giảm bão hòa.
- Thao tác: icon bút chì, icon nhân bản, icon thùng rác.
Dữ liệu 8 món theo bảng chuẩn (Cà phê đen đá 29.000đ ... Tiramisu 45.000đ).

Chân bảng: "Hiển thị 1–8 trong 8 món" bên trái, nút phân trang bên phải.
```

## A21 — Create Menu Item ⭐ P0

```text
[Shell admin] Tiêu đề "Thêm món", breadcrumb "Menu / Món / Thêm món".

Bố cục hai cột (65% / 35%), khe 24px:

CỘT TRÁI — các card xếp dọc, mỗi card nền #FFFDFC bo 16px viền #E8DCCF padding 24px:

Card "Thông tin cơ bản":
- "Tên món *" input cao 44px, giá trị "Cà phê muối".
- "Mô tả" textarea 3 dòng, giá trị "Cà phê phin đậm vị phủ lớp kem muối béo nhẹ."
- Hàng hai cột: "Giá bán *" input có hậu tố "đ" giá trị "39.000"; "Danh mục *" dropdown giá trị "Cà phê".
- Hàng công tắc: "Còn hàng" bật màu #3E8E53.

Card "Ảnh món":
- Vùng kéo thả bo 12px viền đứt nét #D7C4B3 nền #FAF4EC cao 180px,
  đang hiển thị ảnh xem trước ly cà phê muối bo 8px, kèm nút X nhỏ góc trên phải ảnh.
- Chữ hướng dẫn 13px #9C8C81: "PNG, JPG hoặc WEBP · tối đa 2MB".

Card "Nhóm tùy chọn":
- Nhóm 1 nền #FAF4EC bo 12px padding 16px: hàng đầu "Đường" 15px semibold + pill "Chọn một" + pill đỏ nhạt "Bắt buộc" + icon xóa.
  Bên trong 3 dòng lựa chọn, mỗi dòng có input tên và input phụ thu: "Bình thường +0đ", "Ít ngọt +0đ", "Không đường +0đ".
  Link chữ #D9682B "+ Thêm lựa chọn".
- Nhóm 2 tương tự: "Đá" — "Bình thường", "Ít đá", "Không đá".
- Nhóm 3: "Thêm topping" + pill "Chọn nhiều" — "Thêm shot cà phê +10.000đ", "Trân châu +8.000đ".
- Nút viền tràn ngang "+ Thêm nhóm tùy chọn".

CỘT PHẢI — card "Xem trước" dính khi cuộn:
- Chữ nhỏ #9C8C81 "Khách sẽ thấy như thế này".
- Mô phỏng thẻ món của khách: nền #FFFDFC bo 16px viền #E8DCCF, ảnh vuông trên, tên "Cà phê muối",
  mô tả 1 dòng, giá "39.000đ" bold, nút tròn cộng #D9682B.

Thanh hành động dính đáy vùng nội dung, nền #FFFDFC viền trên #E8DCCF:
nút chữ "Hủy" và nút đặc #D9682B "Lưu món" căn phải.
```

## A22 — Edit Menu Item

```text
Giống A21 nhưng: tiêu đề "Sửa món", dữ liệu điền sẵn của "Cà phê sữa đá" giá 35.000đ,
ảnh xem trước là ly cà phê sữa đá, và có thêm nút chữ màu #C44B45 "Xóa món" ở góc trái thanh đáy.
```

## A23 — Delete Menu Item Confirm

```text
[Shell admin, nền phủ tối 40%]
Dialog rộng 440px: icon tròn #FBECEB dấu chấm than #C44B45; tiêu đề "Xóa món Cà phê muối?";
nội dung "Món sẽ bị ẩn khỏi menu. Các đơn cũ vẫn giữ nguyên tên và giá đã lưu.";
nút chữ "Hủy" + nút đặc #C44B45 "Xóa món".
```

## A24 — Availability Toggle (optimistic)

```text
Giống A20 nhưng đang thao tác trên hàng "Trà đào cam sả":
- Công tắc của hàng này đang ở giữa hành trình chuyển, có vòng xoay nhỏ chồng lên núm.
- Cả hàng có nền #FAF4EC.
- Toast góc phải dưới màn hình: nền #EAF5EC viền #3E8E53 bo 12px, icon tích,
  chữ "Đã cập nhật: Trà đào cam sả hết hàng", kèm nút chữ "Hoàn tác" màu #D9682B.
```

## A25 — Upload Image state

```text
Giống A21 nhưng card "Ảnh món" đang tải lên:
- Vùng kéo thả hiển thị thanh tiến trình ngang màu #D9682B ở mức 60%, bo tròn, trên nền #EEE9E4.
- Chữ 13px #75655B: "Đang tải lên... 60%" và tên file "ca-phe-muoi.webp".
- Nút chữ nhỏ #C44B45 "Hủy tải lên".
```

## A26 — Option Group Editor (mở rộng)

```text
[Shell admin] Tiêu đề "Nhóm tùy chọn", breadcrumb "Menu / Nhóm tùy chọn".
Card lớn nền #FFFDFC bo 16px:
- Nhóm "Đường" đang mở rộng: hàng tiêu đề có icon mũi tên xuống, tên nhóm, pill "Chọn một", pill "Bắt buộc",
  hai ô số nhỏ "Chọn tối thiểu 1" và "Chọn tối đa 1", icon kéo thả và icon xóa.
- Bên trong: bảng 3 lựa chọn, mỗi dòng có icon kéo, input tên, input phụ thu có hậu tố "đ", icon xóa.
- Nhóm "Đá" và "Thêm topping" ở trạng thái thu gọn: chỉ một hàng có mũi tên phải, tên nhóm, và chữ tóm tắt #9C8C81 ("3 lựa chọn" / "2 lựa chọn").
- Chữ nhỏ #9C8C81 dưới cùng: "Nhóm tùy chọn được gán cho từng món ở màn Sửa món."
```

## A27 — Copy Option Group

```text
[Shell admin, nền phủ tối 40%]
Dialog rộng 520px nền #FFFDFC bo 16px:
- Tiêu đề "Sao chép nhóm tùy chọn" 20px bold.
- Chữ 15px #75655B: "Chọn món để sao chép nhóm Đường, Đá sang."
- Ô tìm kiếm có icon kính lúp.
- Danh sách món có checkbox, mỗi dòng cao 48px với ảnh tròn 32px và tên món:
  "Cà phê đen đá" (đã tích), "Bạc xỉu đá" (đã tích), "Cà phê muối" (chưa), "Trà đào cam sả" (chưa).
- Chữ #9C8C81: "Đã chọn 2 món".
- Nút "Hủy" + nút đặc #D9682B "Sao chép".
```

## A28 — Menu Item Preview

```text
[Shell admin, nền phủ tối 40%]
Dialog rộng 420px mô phỏng khung nhìn khách: nền #FBF7F1 bo 16px, bên trong là bản dựng thu nhỏ
của bottom sheet chi tiết món (giống C05): ảnh món, tên "Cà phê sữa đá", giá "35.000đ" màu #D9682B,
mô tả, các nhóm tùy chọn radio, nút đáy "Thêm vào giỏ · 35.000đ".
Trên đầu dialog có dải nhỏ nền #F6EEE4 chữ 13px #75655B: "Xem trước — đây là giao diện khách nhìn thấy".
```

## A30 — Table List ⭐ P0

```text
[Shell admin] Sidebar: "Bàn & QR" đang chọn. Tiêu đề "Bàn & QR".
Góc phải: nút viền "In toàn bộ QR" và nút đặc #D9682B "+ Thêm bàn".

Lưới thẻ bàn 3 cột, khe 20px. Mỗi thẻ nền #FFFDFC bo 16px viền #E8DCCF padding 20px:
- Hàng đầu: tên bàn 20px bold #35251D bên trái; badge trạng thái bên phải.
- Dòng "Sức chứa: 4 khách" 14px #75655B.
- Ô xem trước mã QR: hình vuông 96px nền trắng viền #E8DCCF bo 8px chứa hoa văn mã QR đen trắng.
- Hàng nút dưới cùng: nút viền nhỏ "Tải PNG", nút viền nhỏ "Mở như khách", icon ba chấm.

6 thẻ:
- Bàn 1 — badge "Trống" nền #EAF5EC chữ #3E8E53 — có QR.
- Bàn 2 — "Trống" — có QR.
- Bàn 3 — badge "Đang dùng" nền #FFF0E4 chữ #D9682B — có QR — dưới thẻ thêm dòng nhỏ "Phiên M3XQ7B · 78.000đ".
- Bàn 4 — "Trống" — CHƯA CÓ QR: thay ô QR bằng khung viền đứt nét #D7C4B3 nền #FAF4EC chứa icon QR mờ và chữ #9C8C81 "Chưa sinh mã", nút chính của thẻ là nút đặc #D9682B "Sinh mã QR".
- Bàn 5 — "Đang dùng" — có QR — "Phiên A7K2QX · 131.000đ".
- Bàn 6 — "Trống" — có QR.
```

## A31 / A32 — Create / Edit Table

```text
[Shell admin, nền phủ tối 40%]
Dialog rộng 440px nền #FFFDFC bo 16px padding 24px:
- Tiêu đề "Thêm bàn" (A32: "Sửa Bàn 5") 20px bold.
- "Tên bàn *": input cao 44px, giá trị "Bàn 7" (A32: "Bàn 5").
- "Sức chứa": input số, giá trị "4", có hậu tố chữ "khách".
- A32 thêm khối chỉ đọc nền #FAF4EC bo 12px: "Mã QR hiện tại" + chuỗi token cắt gọn "demo-table-5" + nút chữ #C44B45 "Sinh lại mã".
- Nút "Hủy" + nút đặc #D9682B "Lưu".
```

## A33 — Delete Table Confirm

```text
[Shell admin, phủ tối 40%] Dialog 440px: icon #FBECEB chấm than #C44B45;
tiêu đề "Xóa Bàn 4?"; nội dung "Mã QR của bàn sẽ ngừng hoạt động ngay. Không thể hoàn tác.";
nút "Hủy" + nút đặc #C44B45 "Xóa bàn".
```

## A34 — QR Preview ⭐ P0

```text
[Shell admin, nền phủ tối 40%]
Drawer trượt từ phải rộng 480px, cao toàn màn, nền #FFFDFC, viền trái #E8DCCF, padding 32px:
- Nút X góc trên phải.
- Tiêu đề "Mã QR — Bàn 5" 24px bold.
- Khối in thử căn giữa: thẻ giấy kem #FAF4EC bo 16px viền #E8DCCF padding 24px, mô phỏng tấm QR sẽ dán lên bàn:
  · chữ "cafe-connect" 17px bold #6A3E28 trên cùng
  · mã QR đen trắng vuông 200px trên nền trắng
  · chữ "BÀN 5" 24px bold #35251D
  · chữ nhỏ #75655B "Quét để xem menu và gọi món"
- Dòng thông tin: "Đường dẫn" 13px #9C8C81 và chuỗi "demo.cafe-connect.vn/t/demo-table-5" 13px trong ô nền #FAF4EC bo 8px kèm icon copy.
- Nút xếp dọc: nút đặc #D9682B "Tải ảnh PNG"; nút viền "In thẻ QR"; nút viền "Mở như khách";
  cuối cùng là nút chữ #C44B45 "Sinh lại mã QR".
```

## A35 — Generate QR (loading)

```text
Giống A30 nhưng thẻ "Bàn 4" đang sinh mã:
- Ô QR của thẻ hiển thị vòng xoay #D9682B và chữ 13px #75655B "Đang sinh mã...".
- Nút của thẻ chuyển disabled màu xám.
- Các thẻ khác giữ nguyên bình thường.
```

## A36 — Regenerate QR Confirm

```text
[Shell admin, phủ tối 40%] Dialog 460px:
- Icon tròn #FFF4DE dấu chấm than #C98222.
- Tiêu đề "Sinh lại mã QR cho Bàn 5?" 20px bold.
- Nội dung 15px #75655B: "Mã QR cũ đang dán trên bàn sẽ ngừng hoạt động ngay lập tức. Bạn cần in và dán lại mã mới."
- Dải cảnh báo nền #FFF4DE viền #C98222 bo 12px: "Bàn 5 đang có khách ngồi (phiên A7K2QX)."
- Nút "Hủy" + nút đặc #C98222 chữ trắng "Vẫn sinh lại".
```

## A37 — Download / Print QR

```text
[Shell admin] Tiêu đề "In mã QR", breadcrumb "Bàn & QR / In".
Vùng nội dung nền #F6EEE4, hiển thị bản xem trước trang giấy A4 dọc căn giữa (tỉ lệ đúng, nền trắng, shadow nhẹ):
- Trên trang: lưới 2×3 gồm 6 thẻ QR, mỗi thẻ có chữ "cafe-connect", mã QR vuông, tên bàn "BÀN 1"..."BÀN 6", và dòng "Quét để gọi món".
- Đường cắt nét đứt mảnh màu xám giữa các thẻ.
Bên phải là panel tùy chọn nền #FFFDFC bo 16px rộng 280px:
- "Khổ giấy": dropdown "A4".
- "Số thẻ mỗi trang": dropdown "6".
- Checkbox "Hiện đường cắt" đã tích.
- Nút đặc #D9682B "In" và nút viền "Tải PDF".
```

## A38 — Table Permission Denied

```text
[Shell admin nhưng sidebar CHỈ có 2 mục "Đơn hàng" và "Lịch sử" — đây là tài khoản nhân viên]
Vùng nội dung căn giữa: icon tròn 96px nền #EEE9E4 với hình ổ khóa #A89E97;
tiêu đề "Bạn không có quyền truy cập" 24px bold; mô tả 15px #75655B "Mục Bàn & QR chỉ dành cho chủ quán.";
nút viền "Về trang đơn hàng".
```

## A40 — Live Orders ⭐ P0

```text
[Shell admin] Sidebar: "Đơn hàng" đang chọn. Tiêu đề "Đơn hàng", có badge nhỏ xanh nhấp nháy kèm chữ "Trực tiếp".
Header phải: icon chuông có badge đỏ số "2".

Hàng tab: "Đang mở (3)" đang chọn (gạch chân #D9682B) · "Hôm nay" · "Lịch sử".

Lưới thẻ phiên bàn 3 cột, khe 20px. Mỗi thẻ nền #FFFDFC bo 16px viền #E8DCCF padding 20px:

Thẻ "Bàn 5" — NỔI BẬT vì có yêu cầu thanh toán: viền #D9682B nét 2px.
- Hàng đầu: "Bàn 5" 20px bold; badge "Yêu cầu thanh toán" nền #FFF0E4 chữ #D9682B có icon hóa đơn.
- Dòng nhỏ #9C8C81: "Phiên A7K2QX · mở 13:10 · 8 phút trước".
- Danh sách món gọn, mỗi dòng có tên + chấm trạng thái màu:
  "1 × Cà phê đen đá" chấm xanh lá · "1 × Cà phê sữa đá" chấm xanh lá ·
  "1 × Bạc xỉu đá" chấm cam · "1 × Croissant bơ" chấm xanh dương.
- Kẻ ngang, dòng "Tổng" 15px #75655B trái — "131.000đ" 20px bold phải.
- Hai nút: nút đặc #D9682B "Thanh toán", nút viền "Chi tiết".

Thẻ "Bàn 3": badge "Gọi phục vụ" nền #FFF4DE chữ #C98222 có icon chuông; "M3XQ7B · mở 13:05";
"2 × Trà đào cam sả" chấm xanh dương; Tổng 78.000đ; nút "Thanh toán" + "Chi tiết".

Thẻ "Bàn 8": không badge; "K9WR4T · mở 13:18"; "8 món" gọn; Tổng 64.000đ; badge nhỏ "Đang làm".
```

## A41 — Order Detail

```text
[Shell admin, nền phủ tối 40%]
Drawer phải rộng 520px nền #FFFDFC padding 32px:
- Nút X góc trên; tiêu đề "Đơn #015" 24px bold; badge "Sẵn sàng" nền #EAF5EC chữ #3E8E53.
- Hàng thông tin dạng nhãn/giá trị: "Bàn" – "Bàn 5" · "Phiên" – "A7K2QX" · "Đặt lúc" – "13:15 22/07/2026" · "Chờ" – "3 phút".
- Nhãn "Các món":
  3 card món nền #FAF4EC bo 12px, mỗi card: tên món 15px semibold + "× 1", dòng tùy chọn 13px #9C8C81,
  giá bên phải, badge trạng thái nhỏ.
  Card "Croissant bơ" có thêm ghi chú trong ô nền #FFF4DE bo 8px chữ nghiêng: "Hâm nóng giúp mình".
- Kẻ ngang; "Tổng đơn" 17px bold trái — "99.000đ" 20px bold phải.
- Dải nhỏ #EAF2F7 chữ 13px #477A9E: "Trạng thái món do quầy pha chế cập nhật."
```

## A42 — Session Detail

```text
[Shell admin] Tiêu đề "Phiên A7K2QX", breadcrumb "Đơn hàng / Bàn 5 / A7K2QX".
Bố cục hai cột (65% / 35%):

Trái — card "Các đơn trong phiên" nền #FFFDFC bo 16px:
- Nhóm "Đơn #015 · 13:15" với 3 dòng món có badge trạng thái và giá.
- Nhóm "Đơn #021 · 13:28" với 1 dòng "Croissant bơ" badge "Đã nhận".
- Mỗi nhóm có tổng phụ căn phải: 99.000đ và 32.000đ.

Phải — card "Thanh toán" dính khi cuộn:
- "Bàn 5" 20px bold, badge "Đang mở" nền #EAF5EC.
- Các dòng: "Mở lúc" – "13:10" · "Số món" – "4" · "Số đơn" – "2".
- Kẻ ngang; "Tổng cộng" 17px bold — "131.000đ" 30px bold #35251D.
- Dải nền #FFF0E4 viền #D9682B chữ 13px: "Khách đã yêu cầu thanh toán lúc 13:34".
- Nút xếp dọc: nút đặc #D9682B "Xác nhận thanh toán"; nút viền "In tạm tính"; nút chữ #C44B45 "Hủy phiên".
```

## A43 — Confirm Cash Payment ⭐ P0

```text
[Shell admin, nền phủ tối 40%]
Dialog căn giữa rộng 520px nền #FFFDFC bo 16px padding 32px:
- Tiêu đề "Xác nhận thanh toán" 24px bold; dưới là "Bàn 5 · Phiên A7K2QX" 14px #9C8C81.
- Khối tổng tiền nền #F6EEE4 bo 12px căn giữa: chữ "Tổng cần thu" 14px #75655B và "131.000đ" 36px bold #35251D.
- Nhãn "Hình thức thanh toán": ba nút chọn dạng ô ngang chia đều, cao 56px, bo 12px, mỗi ô có icon trên chữ dưới:
  "Tiền mặt" ĐANG CHỌN (viền #D9682B 2px, nền #FFF0E4, chữ #D9682B) · "Chuyển khoản" · "Đã trả online" (ô này mờ disabled).
- Trường "Khách đưa": input lớn cao 52px chữ 20px bold, giá trị "150.000".
- Hàng chip gợi ý nhanh: "131.000đ" "150.000đ" "200.000đ" "500.000đ" — chip thứ hai đang chọn.
- Khối tiền thối nền #EAF5EC bo 12px: "Tiền thối lại" 15px trái — "19.000đ" 24px bold #3E8E53 phải.
- Checkbox đã tích: "Đóng phiên bàn sau khi thanh toán" kèm chữ nhỏ #9C8C81 "Bàn 5 sẽ trở về trạng thái trống".
- Chân dialog: nút chữ "Hủy" + nút đặc #D9682B cao 48px "Xác nhận đã thu 131.000đ".
```

## A44 — Confirm Bank Transfer

```text
Giống A43 nhưng ô "Chuyển khoản" đang được chọn:
- Bỏ trường "Khách đưa", chip gợi ý và khối tiền thối.
- Thay bằng khối nền #FAF4EC bo 12px hiển thị thông tin nhận tiền:
  "Ngân hàng" – "Vietcombank" · "Số tài khoản" – "0123456789" · "Chủ tài khoản" – "QUAN CAFE CONNECT",
  cạnh đó là mã QR chuyển khoản vuông 120px trên nền trắng.
- Trường "Mã giao dịch (không bắt buộc)": input cao 44px, placeholder "6 số cuối biến động số dư".
- Nút xác nhận: "Xác nhận đã nhận 131.000đ".
```

## A45 — Close Session Confirm

```text
[Shell admin, phủ tối 40%] Dialog 460px:
- Icon tròn 48px nền #EAF5EC dấu tích #3E8E53.
- Tiêu đề "Đóng phiên Bàn 5?" 20px bold.
- Nội dung 15px #75655B: "Phiên đã thanh toán đủ 131.000đ. Bàn 5 sẽ trở về trạng thái trống và mã QR sẵn sàng cho khách mới."
- Nút "Hủy" + nút đặc #3E8E53 chữ trắng "Đóng phiên".
```

## A46 — Order History

```text
[Shell admin] Tiêu đề "Đơn hàng", tab "Lịch sử" đang chọn.
Thanh lọc nền #F6EEE4 bo 12px: bộ chọn khoảng ngày "22/07/2026 – 22/07/2026" có icon lịch,
dropdown "Tất cả bàn", dropdown "Tất cả hình thức", nút viền "Xuất Excel" bên phải.

Hàng 3 thẻ tóm tắt nhỏ: "Số phiên: 18" · "Doanh thu: 2.480.000đ" · "TB mỗi bàn: 67.000đ".

Bảng nền #FFFDFC bo 16px:
Cột: "Phiên" | "Bàn" | "Mở" | "Đóng" | "Số món" | "Hình thức" | "Tổng" | "Trạng thái".
6 hàng, ví dụ:
"A7K2QX" | "Bàn 5" | "13:10" | "13:40" | "4" | pill "Tiền mặt" | "131.000đ" | badge "Đã thanh toán" nền #EAF5EC.
"M3XQ7B" | "Bàn 3" | "13:05" | "13:35" | "2" | pill "VNPay" | "78.000đ" | badge "Đã thanh toán".
"K9WR4T" | "Bàn 8" | "12:40" | "13:12" | "3" | pill "Chuyển khoản" | "64.000đ" | badge "Đã thanh toán".
Thêm 3 hàng tương tự. Cột tổng canh phải, chữ bold.
```

## A47 — Order Filter / Export

```text
Giống A46 nhưng bộ lọc đang mở dạng popover dưới nút lọc:
panel nền #FFFDFC bo 16px shadow vừa rộng 320px, chứa nhóm checkbox "Hình thức thanh toán"
(Tiền mặt đã tích, Chuyển khoản đã tích, VNPay chưa), nhóm radio "Trạng thái" (Tất cả / Đã thanh toán / Đã hủy),
và hai nút dưới: nút chữ "Đặt lại" + nút đặc #D9682B "Áp dụng".
```

## A48 — Order Empty State

```text
[Shell admin] Vùng bảng thay bằng card lớn căn giữa padding dọc 64px:
- Minh họa nét mảnh: tấm biên nhận giấy trống, tông #D7C4B3, cao 140px.
- Tiêu đề "Chưa có đơn nào hôm nay" 24px bold.
- Mô tả #75655B: "Đơn của khách sẽ hiện ở đây ngay khi có người quét mã QR."
- Nút viền "Xem lịch sử".
```

## A50 — Reports Overview ⭐ P0

```text
[Shell admin] Sidebar: "Báo cáo" đang chọn. Tiêu đề "Báo cáo".
Hàng chọn khoảng thời gian: nhóm nút phân đoạn "Hôm nay" (đang chọn, nền #D9682B chữ trắng) · "7 ngày" · "30 ngày" · "Tùy chọn",
bên phải là nút viền "Xuất báo cáo".

Hàng 4 thẻ số liệu (giống A03 nhưng nhấn mạnh doanh thu):
"Doanh thu" 2.480.000đ ▲12% · "Số phiên" 18 ▲3 · "Số món bán" 64 ▲9 · "TB mỗi bàn" 67.000đ ▼3%.

Hai cột (60/40):
- Trái: card "Doanh thu theo giờ" — biểu đồ đường mượt màu #D9682B trên lưới nhạt, có vùng tô dưới đường
  màu #FFF0E4, trục X từ "07:00" đến "22:00", đỉnh rõ ở 9:00 và 15:00. Có chấm tròn tại các điểm dữ liệu.
- Phải: card "Cơ cấu doanh thu theo danh mục" — biểu đồ tròn dạng vành khuyên với 3 phần:
  Cà phê 62% (#D9682B), Trà 24% (#C98222), Bánh 14% (#3E8E53). Giữa vành khuyên ghi "2.480.000đ".
  Chú giải xếp dọc bên dưới với chấm màu, tên và phần trăm.

Hàng cuối, hai cột:
- Card "Món bán chạy": bảng 5 dòng có hạng số, ảnh món tròn 28px, tên, số lượng, doanh thu.
- Card "Khung giờ cao điểm": biểu đồ cột ngang, 4 dòng "09:00–10:00", "11:00–12:00", "15:00–16:00", "19:00–20:00",
  thanh màu #D9682B độ dài khác nhau, số đơn ở cuối thanh.
```

## A51 — Revenue Detail

```text
[Shell admin] Tiêu đề "Doanh thu", breadcrumb "Báo cáo / Doanh thu".
- Bộ chọn ngày và nút xuất ở hàng trên.
- Card lớn "Doanh thu 30 ngày": biểu đồ cột dọc 30 cột màu #D9682B, một vài cột nhạt hơn (cuối tuần),
  có đường trung bình nét đứt màu #75655B nằm ngang, chú giải nhỏ.
- Bảng chi tiết bên dưới: cột "Ngày" | "Số phiên" | "Số món" | "Tiền mặt" | "Chuyển khoản" | "VNPay" | "Tổng".
  8 hàng, hàng cuối là dòng tổng nền #FAF4EC chữ bold.
```

## A52 — Top Items

```text
[Shell admin] Tiêu đề "Món bán chạy".
Bảng lớn nền #FFFDFC bo 16px:
Cột: "#" | "Ảnh" | "Món" | "Danh mục" | "Số lượng" | "Doanh thu" | "Tỉ trọng".
8 hàng theo menu chuẩn, cột "Tỉ trọng" là thanh tiến trình ngang màu #D9682B kèm phần trăm bên phải.
Hàng đầu (Cà phê sữa đá) có nền #FFF0E4 rất nhạt và số "1" trong huy hiệu tròn #D9682B chữ trắng.
```

## A53 — Peak Hours

```text
[Shell admin] Tiêu đề "Khung giờ cao điểm".
Card lớn chứa bản đồ nhiệt: lưới 7 hàng (Thứ 2 → Chủ nhật) × 16 cột (07:00 → 22:00).
Mỗi ô vuông bo 4px, màu chuyển từ #FBF7F1 (vắng) qua #FFF0E4, #F0A97A tới #D9682B (đông nhất).
Nhãn giờ ở trên, nhãn thứ bên trái, thang màu chú giải nhỏ dưới cùng từ "Vắng" tới "Đông".
Ô đậm nhất nằm ở Thứ 7 15:00 và Chủ nhật 09:00.
```

## A54 — Average Session Value

```text
[Shell admin] Tiêu đề "Giá trị trung bình mỗi bàn".
- Thẻ số lớn căn giữa card: "67.000đ" 36px bold, dưới là "▼ 3% so với tuần trước" màu #C44B45.
- Biểu đồ đường 30 ngày màu #477A9E trên lưới nhạt.
- Bảng phân bố: "Dưới 50.000đ" / "50.000–100.000đ" / "100.000–200.000đ" / "Trên 200.000đ",
  mỗi dòng có thanh ngang và số phiên.
```

## A55 — Report Empty State

```text
[Shell admin] Vùng nội dung: card lớn căn giữa —
minh họa nét mảnh hình biểu đồ cột trống tông #D7C4B3 cao 140px;
tiêu đề "Chưa có dữ liệu cho khoảng thời gian này" 24px bold;
mô tả #75655B "Chọn khoảng ngày khác hoặc chờ có đơn hàng đầu tiên.";
nút viền "Xem hôm nay".
```

## A60 — Staff List

```text
[Shell admin] Sidebar: "Nhân viên" đang chọn. Tiêu đề "Nhân viên".
Nút đặc #D9682B góc phải "+ Thêm nhân viên".

Bảng nền #FFFDFC bo 16px:
Cột: "Người dùng" | "Email" | "Vai trò" | "Trạng thái" | "Đăng nhập gần nhất" | "Thao tác".
3 hàng cao 64px:
- Avatar tròn 36px chữ "Đ" nền #FFF0E4 chữ #D9682B, tên "Nguyễn Minh Đức" 15px semibold + chữ nhỏ "Bạn" #9C8C81
  | "admin@demo.com" | pill "Quản trị" nền #FFF0E4 chữ #D9682B | badge "Hoạt động" xanh | "13:02 hôm nay" | icon bút chì (icon xóa bị mờ).
- Avatar "M", "Mai Anh" | "maianh@demo.com" | pill "Nhân viên" nền #EAF2F7 chữ #477A9E | badge "Hoạt động" | "12:45 hôm nay" | icon bút chì, icon thùng rác.
- Avatar "Q", "Quầy pha chế" | "barista@demo.com" | pill "Nhân viên" | badge "Hoạt động" | "07:10 hôm nay" | icon bút chì, icon thùng rác.
```

## A61 / A62 — Create / Edit Staff

```text
[Shell admin, phủ tối 40%]
Dialog rộng 520px nền #FFFDFC bo 16px padding 32px:
- Tiêu đề "Thêm nhân viên" (A62: "Sửa Mai Anh") 20px bold.
- "Họ tên *": input, giá trị "Mai Anh".
- "Email *": input, giá trị "maianh@demo.com".
- "Mật khẩu *": input ẩn có icon con mắt (A62 đổi thành link chữ #D9682B "Đặt lại mật khẩu").
- Nhãn "Vai trò": hai thẻ chọn ngang chia đều, cao 72px bo 12px, mỗi thẻ có tiêu đề và mô tả nhỏ:
  "Quản trị" – "Toàn quyền: menu, bàn, báo cáo, nhân viên" |
  "Nhân viên" – "Xem đơn, xác nhận thanh toán, đóng bàn" ĐANG CHỌN (viền #D9682B, nền #FFF0E4).
- Nút "Hủy" + nút đặc #D9682B "Lưu".
```

## A63 — Change Role / Permission

```text
[Shell admin] Tiêu đề "Phân quyền — Mai Anh", breadcrumb "Nhân viên / Mai Anh / Phân quyền".
Card nền #FFFDFC bo 16px:
- Hàng đầu: avatar 48px, tên, email, pill vai trò "Nhân viên".
- Bảng quyền, mỗi dòng là một quyền có công tắc bên phải:
  "Xem đơn hàng" BẬT (#3E8E53) · "Cập nhật trạng thái món" BẬT · "Đóng phiên bàn" BẬT · "Ghi nhận thanh toán" BẬT ·
  "Quản lý menu" TẮT (xám) · "Quản lý bàn & QR" TẮT · "Xem báo cáo" TẮT · "Quản lý nhân viên" TẮT.
- Mỗi dòng có mô tả nhỏ #9C8C81 bên dưới tên quyền.
- Dải thông tin nền #EAF2F7 chữ #477A9E: "Vai trò Nhân viên có sẵn 4 quyền đầu. Bật thêm quyền sẽ tạo quyền riêng cho người này."
```

## A64 / A65 — Disable / Delete Staff

```text
A64 [phủ tối 40%] Dialog 440px: icon #FFF4DE chấm than #C98222;
    "Tạm khóa tài khoản Mai Anh?"; "Người này sẽ bị đăng xuất và không đăng nhập được cho tới khi bạn mở khóa.";
    nút "Hủy" + nút đặc #C98222 "Tạm khóa".
A65 [phủ tối 40%] Dialog 440px: icon #FBECEB chấm than #C44B45;
    "Xóa tài khoản Mai Anh?"; "Không thể hoàn tác. Lịch sử thao tác vẫn được giữ lại.";
    ô input xác nhận có nhãn "Gõ ĐỒNG Ý để xác nhận"; nút "Hủy" + nút đặc #C44B45 "Xóa tài khoản".
```

## A66 — Staff Permission Denied

```text
Giống A38 nhưng chữ: tiêu đề "Bạn không có quyền truy cập", mô tả "Mục Nhân viên chỉ dành cho chủ quán."
```

## A70 — Notifications drawer

```text
[Shell admin, nền phủ tối 40%]
Drawer phải rộng 400px nền #FFFDFC padding 24px:
- Tiêu đề "Thông báo" 20px bold, bên cạnh badge tròn đỏ "2"; góc phải nút chữ #D9682B "Đánh dấu đã đọc".
- Danh sách thẻ thông báo xếp dọc, cách nhau 12px:
  1) CHƯA ĐỌC: nền #FFF0E4 bo 12px, viền trái 3px #D9682B, icon hóa đơn tròn.
     "Bàn 5 yêu cầu thanh toán" 15px semibold; "Phiên A7K2QX · 131.000đ" 13px #75655B; "13:34 · 2 phút trước" 12px #9C8C81.
     Hai nút nhỏ: nút đặc #D9682B "Xử lý", nút chữ "Bỏ qua".
  2) CHƯA ĐỌC: nền #FFF4DE viền trái #C98222, icon chuông.
     "Bàn 3 gọi phục vụ" ; "Lý do: Thêm đá"; "13:32 · 4 phút trước". Nút "Xử lý" + "Bỏ qua".
  3) ĐÃ ĐỌC: nền #FFFDFC viền #E8DCCF, icon giỏ, chữ mờ hơn.
     "Đơn mới từ Bàn 8"; "3 món · 64.000đ"; "13:18".
  4) ĐÃ ĐỌC: "Bàn 2 đã đóng phiên"; "Đã thanh toán 45.000đ"; "12:58".
```

## A71 — Profile

```text
[Shell admin] Tiêu đề "Tài khoản của tôi".
Card nền #FFFDFC bo 16px rộng tối đa 640px:
- Avatar tròn 72px chữ "Đ" nền #FFF0E4 chữ #D9682B, cạnh đó nút viền nhỏ "Đổi ảnh".
- Trường "Họ tên": input giá trị "Nguyễn Minh Đức".
- Trường "Email": input giá trị "admin@demo.com" ở trạng thái chỉ đọc nền #FAF4EC.
- Pill vai trò "Quản trị".
- Kẻ ngang; section "Đổi mật khẩu" với 3 input: "Mật khẩu hiện tại", "Mật khẩu mới", "Nhập lại mật khẩu mới".
- Nút đặc #D9682B "Lưu thay đổi" căn phải.
```

## A72 — Logout confirm

```text
[Shell admin, phủ tối 40%] Dialog nhỏ 400px căn giữa:
- Tiêu đề "Đăng xuất?" 20px bold căn giữa.
- Nội dung #75655B căn giữa: "Bạn sẽ cần đăng nhập lại để vào trang quản trị."
- Hai nút xếp ngang chia đều: nút viền "Ở lại" + nút đặc #D9682B "Đăng xuất".
```

## A73 — Session Expired

```text
[Shell admin bị làm mờ và phủ tối 50%]
Dialog căn giữa 440px, không có nút X (không đóng được):
- Icon tròn #FFF4DE đồng hồ #C98222.
- Tiêu đề "Phiên đăng nhập đã hết hạn" 20px bold.
- Nội dung #75655B: "Vì lý do bảo mật, bạn cần đăng nhập lại để tiếp tục."
- Nút đặc #D9682B tràn ngang "Đăng nhập lại".
```

## A74 — Permission Denied (trang)

```text
[Shell admin] Vùng nội dung căn giữa dọc:
- Icon tròn 96px nền #EEE9E4 hình ổ khóa #A89E97.
- Tiêu đề "403 — Không có quyền truy cập" 30px bold.
- Mô tả #75655B: "Tài khoản của bạn không được phép mở trang này. Liên hệ chủ quán nếu bạn cần quyền."
- Hai nút: nút đặc #D9682B "Về trang chủ" + nút viền "Quay lại".
```

## A75 — Not Found

```text
[Shell admin] Vùng nội dung căn giữa:
- Minh họa nét mảnh: ly cà phê đổ nghiêng, tông #D7C4B3, cao 160px.
- Chữ "404" 36px bold #D7C4B3.
- Tiêu đề "Không tìm thấy trang" 30px bold #35251D.
- Mô tả #75655B: "Trang bạn tìm không tồn tại hoặc đã bị di chuyển."
- Nút đặc #D9682B "Về Tổng quan".
```
