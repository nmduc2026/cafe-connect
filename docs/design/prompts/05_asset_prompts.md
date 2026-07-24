# 05 — Asset Prompts (ảnh món, hero, minh họa)

> Đây là **ảnh rời** để nhét vào UI, không phải ảnh màn hình.
> Sinh nhóm này **TRƯỚC** các màn hình — có ảnh món thật rồi thì mockup mới không bị placeholder xám.
>
> Tên file và asset ID phải khớp `03_asset_library.md`. Không tạo asset không có ID.

---

## Khối style ảnh món — dán trước mọi prompt trong §1

```text
Ảnh sản phẩm đồ uống/đồ ăn cho menu số của quán cafe Việt.
Bố cục vuông 1:1, chủ thể chiếm khoảng 75% khung, căn giữa.
Ánh sáng ban ngày tự nhiên, dịu, đổ bóng mềm về một phía — KHÔNG dùng đèn flash gắt, KHÔNG bóng cứng.
Nền: mặt bàn gỗ sáng màu (gỗ sồi/tần bì) hoặc mặt đá kem nhạt, tông ấm #FBF7F1–#F6EEE4.
Đạo cụ tối giản và chỉ ở rìa khung: vài hạt cà phê rang, chiếc khăn vải lanh kem, một nhánh lá xanh nhỏ.
Góc chụp chếch 45 độ hoặc ngang tầm mắt (tùy món), lấy nét sắc ở chủ thể, hậu cảnh mờ nhẹ.
Màu sắc trung thực, hơi ấm, độ bão hòa vừa phải — không chỉnh màu quá rực, không tông lạnh xanh.
Trông như ảnh chụp thật của quán, KHÔNG phải ảnh 3D render, KHÔNG minh họa vẽ tay.
Không có chữ, không watermark, không logo, không bàn tay người, không mặt người.
Nền không được lộn xộn. Đầu ra: ảnh vuông, chất lượng cao, dùng được ở kích thước 400×400px.
```

---

## 1. Ảnh món (M101–M302) — 8 ảnh bắt buộc

```text
M101 · coffee-black-iced.webp · "Cà phê đen đá"
Ly thủy tinh cao trong suốt đựng cà phê đen đá Việt Nam, đá viên nổi rõ,
màu nâu đen sóng sánh, có lớp bọt mỏng trên mặt, thành ly đọng hơi nước lạnh.
Bên cạnh là phin cà phê nhôm nhỏ đặt trên đĩa lót.
```

```text
M102 · coffee-milk-iced.webp · "Cà phê sữa đá"
Ly thủy tinh cao đựng cà phê sữa đá Việt Nam, thấy rõ lớp chuyển màu từ nâu đậm ở dưới
lên be sữa ở trên, đá viên trong, thành ly đọng nước.
Bên cạnh có lon sữa đặc nhỏ và chiếc thìa dài.
```

```text
M103 · bac-xiu-iced.webp · "Bạc xỉu đá"
Ly thủy tinh cao đựng bạc xỉu đá — nhiều sữa hơn cà phê nên màu be sáng, kem nhạt,
có vệt cà phê nâu loang nhẹ chưa khuấy đều, đá viên trong.
Tông tổng thể sáng và mềm hơn M102.
```

```text
M104 · salted-coffee.webp · "Cà phê muối"
Ly thủy tinh cao đựng cà phê muối Việt Nam: lớp cà phê nâu đậm phía dưới,
lớp kem muối trắng ngà dày mịn phủ trên mặt, ranh giới hai lớp rõ ràng.
Rắc vài hạt muối biển nhỏ li ti trên lớp kem.
```

```text
M201 · peach-orange-lemongrass-tea.webp · "Trà đào cam sả"
Ly thủy tinh cao đựng trà đào cam sả màu hổ phách cam sáng, bên trong thấy rõ
lát đào vàng, lát cam mỏng và một cọng sả tươi cắm làm que khuấy, nhiều đá viên.
Bên cạnh có vài lát đào tươi.
```

```text
M202 · golden-lotus-tea.webp · "Trà sen vàng"
Ly thủy tinh cao đựng trà sen vàng màu vàng nhạt trong veo, có vài hạt sen trắng
và cánh hoa sen khô lắng dưới đáy ly, đá viên trong.
Bên cạnh đặt một bông sen nhỏ hoặc vài hạt sen khô.
```

```text
M301 · butter-croissant.webp · "Croissant bơ"
Một chiếc croissant bơ vàng óng, vỏ nhiều lớp giòn rõ vân, đặt trên đĩa sứ trắng
hoặc giấy nướng kem. Vài vụn bánh rơi bên cạnh. Chụp chếch 45 độ để thấy độ phồng và lớp vỏ.
```

```text
M302 · tiramisu.webp · "Tiramisu"
Một miếng tiramisu vuông trên đĩa sứ trắng nhỏ, thấy rõ các lớp bánh và kem mascarpone xen kẽ,
mặt trên phủ bột cacao nâu mịn. Cạnh cắt sắc nét. Có thìa nhỏ đặt bên cạnh.
```

### Biến thể "hết hàng" (không cần sinh riêng)

Không tạo ảnh riêng cho món hết hàng. Trong UI, dùng chính ảnh gốc rồi giảm bão hòa còn ~30%
và giảm độ sáng nhẹ — đã mô tả trong prompt màn hình.

---

## 2. Ảnh hero & bối cảnh (H001–H002, B001–B002)

```text
H001 · customer-menu-hero.webp · Hero cho màn menu khách
Ảnh ngang tỉ lệ 3:1, chụp từ trên xuống (flat lay) một góc bàn gỗ sáng trong quán cafe Việt:
một ly cà phê sữa đá, vài hạt cà phê rang rải, một quyển menu giấy kem, một nhánh lá xanh nhỏ.
Ánh sáng ban ngày tự nhiên chiếu chếch, bóng mềm. Tông kem ấm.
Phần bên trái khung để trống thoáng (sẽ đè chữ lên đó) — bố cục lệch phải.
Không chữ, không logo, không người.
```

```text
H002 · admin-login-cafe-counter.webp · Ảnh nền trang đăng nhập
Ảnh dọc tỉ lệ 3:4, chụp quầy pha chế của quán cafe Việt hiện đại:
máy pha espresso inox, dãy ly sứ trắng úp ngược, bình thủy tinh, kệ gỗ sáng phía sau,
một chậu cây nhỏ. Ánh sáng ban ngày từ cửa sổ bên trái, ấm và sáng.
Không có người trong khung. Bố cục có khoảng thoáng ở nửa dưới để đè chữ.
Tông kem nâu sáng, sạch sẽ, chuyên nghiệp.
```

```text
B001 · logo ngang · cafe-connect-horizontal.svg
Logo chữ (wordmark) nằm ngang cho thương hiệu "cafe-connect".
Chữ thường toàn bộ, font sans-serif hình học bo tròn nhẹ, chữ đậm vừa (semibold), màu nâu #6A3E28.
Bên trái chữ là một biểu tượng đơn giản: ly cà phê nhìn ngang, nét dày đều, bo góc mềm,
từ miệng ly bay lên hai vạch cong nhỏ vừa gợi làn khói vừa gợi sóng wifi — thể hiện "kết nối".
Nền trong suốt. Phẳng hoàn toàn, một màu, không gradient, không shadow, không hiệu ứng 3D.
```

```text
B002 · logo mark · cafe-connect-mark.svg
Chỉ biểu tượng, dạng vuông, dùng cho favicon và header màn nhỏ:
ly cà phê nhìn ngang nét dày màu #6A3E28 với hai vạch cong gợi khói/sóng wifi bay lên,
đặt trong khung tròn hoặc vuông bo góc mềm nền #FFF0E4.
Phẳng, tối giản, đọc được rõ ở kích thước 32×32px. Không chữ.
```

---

## 3. Minh họa trạng thái (I*, P*) — phong cách thống nhất

> Toàn bộ minh họa trong app dùng **một phong cách duy nhất**. Sinh cả nhóm trong cùng một phiên
> để nét vẽ đồng đều.

```text
KHỐI STYLE MINH HỌA — dán trước mỗi prompt trong mục này:

Minh họa vector phẳng, phong cách line-art nét mảnh đều (khoảng 2px), bo góc mềm.
Bảng màu giới hạn: nét chính #D7C4B3, mảng nhấn #D9682B dùng RẤT tiết chế (chỉ 1–2 chi tiết nhỏ),
mảng nền nhạt #F6EEE4. Nền trong suốt.
Phối cảnh đơn giản, không đổ bóng, không gradient, không texture.
Chủ thể đơn lẻ, căn giữa, nhiều khoảng trắng quanh chủ thể.
Không chữ, không người, không watermark. Tỉ lệ vuông, dùng ở kích thước 200×200px.
Cảm giác: nhẹ nhàng, ấm áp, không bi kịch hóa — đây là trạng thái bình thường của app.
```

```text
I101 · empty-cart.webp — Giỏ hàng trống
Một chiếc giỏ mua hàng nhỏ dạng nét mảnh, rỗng, đặt nghiêng nhẹ.
Bên trong có một hạt cà phê nhỏ màu #D9682B duy nhất làm điểm nhấn.
```

```text
I102 · order-placed.webp — Đã đặt món thành công
Một tờ biên nhận giấy nét mảnh với vài dòng kẻ, phía trên có dấu tích nằm trong vòng tròn
màu #3E8E53 (đây là ngoại lệ duy nhất được dùng màu xanh lá).
```

```text
I103 · session-expired.webp — Phiên hết hạn
Một mã QR vuông nét mảnh với các góc định vị, phía trên góc phải có biểu tượng đồng hồ nhỏ
màu #D9682B. Một góc của mã QR vẽ nét đứt để gợi ý đã hết hiệu lực.
```

```text
P101 · payment-pending.webp — Đang chờ thanh toán
Một tờ hóa đơn nét mảnh với biểu tượng đồng hồ cát nhỏ màu #D9682B đặt chồng ở góc dưới phải.
```

```text
P102 · payment-success.webp — Thanh toán thành công
Một tờ hóa đơn nét mảnh với dấu tích trong vòng tròn màu #3E8E53 ở góc dưới phải,
và hai tia nhỏ gợi sự hoàn tất.
```

```text
P103 · payment-failed.webp — Thanh toán thất bại
Một tờ hóa đơn nét mảnh với dấu chấm than trong vòng tròn màu #C44B45 ở góc dưới phải.
Tờ hóa đơn hơi gấp một góc. Không vẽ hình ảnh gây lo lắng quá mức.
```

```text
illustrations/admin/no-menu-items.webp — Chưa có món
Một tấm bảng menu đứng nét mảnh, mặt bảng trống, có một hạt cà phê #D9682B nhỏ ở chân bảng.
```

```text
illustrations/admin/no-tables.webp — Chưa có bàn
Một chiếc bàn tròn nhỏ và hai ghế nét mảnh nhìn từ trên xuống, mặt bàn trống,
có một tấm thẻ QR nhỏ #D9682B đặt trên bàn.
```

```text
illustrations/admin/no-report-data.webp — Chưa có dữ liệu báo cáo
Ba cột biểu đồ nét mảnh chiều cao khác nhau nhưng để rỗng (chỉ có viền),
cột giữa có phần đáy tô #D9682B rất nhỏ.
```

```text
illustrations/staff/no-active-sessions.webp — Không có bàn đang phục vụ
Một chiếc bàn cafe nét mảnh với ly úp ngược và khăn gấp gọn — trạng thái đã dọn sạch, chờ khách.
```

```text
illustrations/staff/no-staff-requests.webp — Không có yêu cầu
Một chiếc chuông quầy nhỏ nét mảnh, im lặng, có một vạch cong #D9682B rất mảnh phía trên
gợi ý sẵn sàng reo.
```

```text
illustrations/kds/no-tickets.webp — Bảng quầy pha chế trống
Một chiếc bình lắc pha chế và một ly nét mảnh đặt cạnh nhau, gọn gàng trên một vạch quầy.
Trạng thái yên tĩnh, sẵn sàng.
```

```text
illustrations/kds/offline.webp — Quầy pha chế mất kết nối
Một khung màn hình nét mảnh, bên trong có biểu tượng sóng wifi bị gạch chéo màu #C44B45.
```

---

## 4. Âm thanh (không sinh bằng AI ảnh)

Ba file trong `sounds/` **không tạo bằng model sinh ảnh**. Lấy từ thư viện âm thanh miễn phí
có giấy phép thương mại (Pixabay, Freesound CC0):

| File | Dùng khi | Yêu cầu |
|---|---|---|
| `new-order.mp3` | Đơn mới về màn quầy pha chế | Chuông nhẹ 1–2 nốt, 0.4–0.8 giây, rõ trong môi trường ồn, không chói tai |
| `staff-request.mp3` | Khách gọi phục vụ / đòi bill | Ting đôi ngắn, 0.5 giây, khác rõ với `new-order` |
| `error.mp3` | Thao tác thất bại | Nốt trầm ngắn 0.3 giây, không gây giật mình |

Mỗi file cần thêm bản `.ogg` để tương thích trình duyệt.

---

## 5. Placeholder

```text
placeholders/menu-item-placeholder.webp
Ảnh vuông nền #F6EEE4 phẳng, chính giữa là biểu tượng ly cà phê nét mảnh màu #D7C4B3
(cùng phong cách nhóm minh họa ở §3). Không chữ.
Dùng khi món chưa có ảnh — phải trông có chủ đích, không được giống ảnh lỗi.
```

```text
placeholders/avatar-placeholder.webp
Ảnh vuông nền #FFF0E4, chính giữa là biểu tượng người dạng nét mảnh màu #D9682B, bo tròn mềm.
Dùng cho avatar nhân viên chưa có ảnh.
```
