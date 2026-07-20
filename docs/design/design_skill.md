# Design direction: Cafe Việt sáng, ấm và sạch

Phong cách thiết kế chính cho `cafe-connect` nên đi theo hướng **quán cafe Việt hiện đại, sáng, ấm, dễ bán cho quán thật**. Cảm giác tổng thể cần thân thiện và gần gũi như một menu giấy ở quán cafe, nhưng vẫn đủ sạch, chỉn chu và chuyên nghiệp để dùng cho sản phẩm portfolio.

## Tinh thần thị giác

- Ấm áp, sáng, thoáng, dễ đọc trên mobile.
- Gợi cảm giác cafe Việt thật: bàn gỗ sáng, ly cafe đá, ly bạc xỉu, menu giấy kem, QR đặt bàn.
- Không làm quá tối, không dùng các mảng nâu đậm lớn khiến giao diện nặng.
- Không biến thành landing page marketing; ưu tiên giao diện app thật, dùng được ngay.
- UI cần phù hợp với khách quét QR tại bàn, thao tác nhanh, nhìn giá và gọi món rõ ràng.

## Bảng màu gợi ý

- Nền chính: kem sáng, ivory, latte beige.
- Surface/card: trắng ấm hoặc kem rất nhạt.
- Text chính: nâu cafe đậm, gần espresso nhưng không quá đen.
- Accent chính: terracotta/cam đất nhẹ cho tab active, nút thêm, nút thanh toán.
- Accent phụ: xanh lá dịu cho trạng thái còn hàng và bước đã hoàn thành.
- Border/divider: beige nhạt, mảnh, mềm.

Tránh dùng quá nhiều màu nâu đậm, tránh palette quá tối, tránh tím/xanh gradient, tránh hiệu ứng orb/bokeh trang trí.

## Layout và component

- Mobile-first, ưu tiên màn hình khách hàng sau khi quét QR.
- Top bar gọn: logo chữ `cafe-connect`, thông tin bàn như `Bàn 5`.
- Category tabs rõ ràng: `Cà phê`, `Trà`, `Bánh`.
- Menu item card sáng, có ảnh món thật, tên món, mô tả ngắn, giá VND, trạng thái còn/hết hàng, nút thêm.
- Sticky cart bar ở cuối màn hình: số món, tổng tiền, hành động xem giỏ.
- Hai nút hành động luôn dễ thấy: `Gọi phục vụ` và `Thanh toán`.
- Status strip nhỏ cho real-time: `Đã nhận`, `Đang làm`, `Sẵn sàng`.
- Card bo góc vừa phải, không lồng card trong card.
- Khoảng cách thoáng, chữ đủ lớn, tránh chen chúc trên mobile.

## Chất liệu và hình ảnh

- Dùng ảnh cafe thật hoặc mockup giống ảnh thật, ánh sáng tự nhiên.
- Bối cảnh phụ có thể là bàn gỗ sáng, ly sứ, hạt cafe, bảng QR giấy, cây xanh nhẹ.
- Ảnh nền/bối cảnh chỉ hỗ trợ cảm xúc, không được lấn át UI.
- Món ăn/uống phải dễ nhận biết, sáng rõ, không tối hoặc blur quá mạnh.

## Prompt mẫu để tạo ảnh UI

```text
Tạo một mockup UI mobile high-fidelity cho cafe-connect, ứng dụng QR menu và gọi món real-time cho quán cafe Việt.

Phong cách: cafe Việt hiện đại, sáng, ấm và sạch. Dùng nền kem sáng/ivory/latte beige, card trắng ấm, chữ nâu cafe, accent terracotta/cam đất nhẹ, chấm trạng thái xanh lá dịu. Giao diện cần thoáng, dễ đọc, chuyên nghiệp, phù hợp quán cafe thật ở Việt Nam.

Màn hình: khách vừa quét QR tại Bàn 5. Top bar có cafe-connect và Bàn 5. Có tab danh mục Cà phê, Trà, Bánh. Danh sách món gồm ảnh cafe, tên món, mô tả ngắn, giá VND, trạng thái còn hàng, nút thêm. Cuối màn hình có sticky cart bar hiển thị 3 món và tổng 118.000đ, kèm nút Gọi phục vụ và Thanh toán. Có status strip real-time: Đã nhận, Đang làm, Sẵn sàng.

Ràng buộc: đây là giao diện app thật, không phải landing page. Không dùng mảng nâu đậm quá lớn, không dùng gradient tím/xanh, không dùng orb/bokeh trang trí, không lồng card trong card. Text ngắn, dễ đọc, UI mobile-first.
```
