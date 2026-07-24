# 04 — KDS Prompts (K01–K33)

> Viewport: **1440 × 1024** (màn hình tại quầy pha chế). Dán `00_base_prompt.md` §A trước mỗi prompt.
>
> Đặc thù KDS: **chữ to, tương phản cao, nhìn từ xa 1.5–2m**, không phụ thuộc hover.
> Giao diện gọi là **"Quầy pha chế"** — không hiện chữ "KDS" hay "Kitchen" cho người dùng.
>
> Ưu tiên sinh trước: **K04, K06, K10, K12, K21**.

---

## Khối shell KDS — dán vào mọi prompt trong file này

```text
KHUNG QUẦY PHA CHẾ CHUẨN (1440×1024, KHÔNG có sidebar — dùng trọn chiều rộng):

Header cao 72px, nền #FFFDFC, viền dưới #E8DCCF, padding ngang 24px:
- Trái: logo mark tròn "cc" màu #6A3E28, cạnh đó chữ "Quầy pha chế" 24px bold #35251D.
- Giữa: đồng hồ lớn "13:18" 30px bold #35251D và "22/07/2026" 14px #75655B bên dưới.
- Phải, xếp ngang cách nhau 16px:
  · Chip "4 ticket đang chờ" nền #FFF0E4 chữ #D9682B 15px semibold.
  · Chỉ báo kết nối: chấm tròn #3E8E53 + chữ "Đã kết nối" 14px.
  · Icon loa (âm thanh đang bật) trong nút vuông bo 12px viền #D7C4B3, 44×44px.
  · Icon toàn màn hình, 44×44px.
  · Avatar tròn 36px chữ "Q".

Bảng kanban 3 cột chia đều, khe 20px, padding 24px, nền tổng #FBF7F1:
Mỗi cột có header dính: tên cột 20px bold + huy hiệu tròn đếm số, và vùng cuộn riêng bên dưới.
- Cột 1 "Mới" — huy hiệu nền #EAF2F7 chữ #477A9E.
- Cột 2 "Đang làm" — huy hiệu nền #FFF4DE chữ #C98222.
- Cột 3 "Sẵn sàng" — huy hiệu nền #EAF5EC chữ #3E8E53.

THẺ TICKET CHUẨN: nền #FFFDFC, bo 16px, viền #E8DCCF, padding 16px, cách nhau 16px.
- Hàng đầu: tên bàn 24px bold #35251D (rất to, nhìn từ xa) bên trái;
  bên phải là chip thời gian chờ "Chờ 3 phút" 15px semibold.
- Dòng thứ hai: "Đơn #015 · 13:15" 14px #9C8C81.
- Kẻ ngang nhạt.
- Danh sách món, mỗi món là một khối:
  · Số lượng trong ô vuông bo 8px nền #F6EEE4 chữ 20px bold, ví dụ "1×", đặt bên trái.
  · Tên món 17px semibold #35251D (KDS tối thiểu 16px).
  · Dòng tùy chọn 15px #75655B, ví dụ "Ít đá · Không đường".
  · Ghi chú (nếu có) trong ô nền #FFF4DE bo 8px, chữ 15px #35251D, có icon bút chì.
  · Nút hành động của món bên phải, cao tối thiểu 48px, bo 12px.
Chữ trong ticket không nhỏ hơn 15px. Tên bàn không nhỏ hơn 20px.
```

---

## K01 — KDS Login

```text
Màn 1440×1024 — trang đăng nhập, dùng chung với admin, KHÔNG có sidebar.

Chia đôi:
- Trái (55%): ảnh thật quầy pha chế — máy espresso inox, tay pha chế đang rót sữa (không thấy mặt người),
  ly sứ, ánh sáng ban ngày ấm, tông kem nâu sáng. Chữ trắng góc dưới: "cafe-connect" 30px bold +
  "Màn hình quầy pha chế" 17px.
- Phải (45%): nền #FBF7F1, card 400px nền #FFFDFC bo 16px padding 32px:
  · "Đăng nhập vào Quầy pha chế" 26px bold.
  · Input "Email" giá trị "barista@demo.com"; input "Mật khẩu" dạng chấm ẩn.
  · Nút đặc #D9682B cao 52px tràn ngang "Đăng nhập".
  · Chữ nhỏ #9C8C81 căn giữa: "Màn hình này nên để mở suốt ca."
```

## K02 — Audio Permission

```text
[Khối shell KDS, bảng kanban phía sau bị phủ tối 45%]
Dialog căn giữa rộng 520px nền #FFFDFC bo 16px padding 32px, căn giữa nội dung:
- Icon tròn 80px nền #FFF0E4 với hình loa màu #D9682B.
- Tiêu đề "Bật âm thanh báo đơn mới" 26px bold.
- Nội dung 17px #75655B: "Trình duyệt cần bạn cho phép phát âm thanh. Không có tiếng báo, bạn sẽ dễ bỏ sót đơn."
- Nút đặc #D9682B tràn ngang cao 56px chữ 17px "Bật âm thanh".
- Nút chữ #75655B "Tiếp tục không có tiếng".
```

## K03 — Loading Board

```text
[Khối shell KDS] Ba cột kanban đều ở trạng thái skeleton:
- Header cột vẫn hiện chữ thật ("Mới", "Đang làm", "Sẵn sàng") nhưng huy hiệu số là khối tròn xám #EEE9E4.
- Mỗi cột có 2 thẻ skeleton: khối bo 16px cao 200px nền #FFFDFC viền #E8DCCF,
  bên trong là các vạch skeleton #EEE9E4 — một vạch dày ngắn (tên bàn), một vạch mảnh dài,
  ba nhóm vạch (danh sách món), một khối chữ nhật bo 12px (nút).
- Chip "đang chờ" ở header cũng là skeleton.
Không dùng shimmer chói, chỉ khối xám ấm phẳng.
```

## K04 — Live Board ⭐ P0 (ảnh quan trọng nhất của KDS)

```text
[Khối shell KDS] Bảng kanban đầy đủ dữ liệu, 3 cột:

CỘT "Mới" — huy hiệu "2":
Thẻ 1 — "Bàn 5" 24px bold; chip "Chờ 1 phút" nền #EAF2F7 chữ #477A9E; "Đơn #021 · 13:28".
  · Món: ô "1×" + "Croissant bơ" 17px semibold; ghi chú ô nền #FFF4DE "Hâm nóng giúp mình".
  · Nút đặc tràn ngang cao 52px nền #D9682B chữ trắng 17px semibold: "BẮT ĐẦU LÀM".
Thẻ 2 — "Bàn 3"; chip "Chờ 16 phút" nền #FBECEB chữ #C44B45 (quá hạn); "Đơn #018 · 13:02".
  · Viền thẻ #C44B45 nét 2px và có dải mỏng #FBECEB phía trên thẻ ghi "Chờ lâu" chữ #C44B45.
  · Món: ô "2×" + "Trà đào cam sả"; tùy chọn "Ít ngọt · Ít đá"; ghi chú "1 ly không sả".
  · Nút "BẮT ĐẦU LÀM".

CỘT "Đang làm" — huy hiệu "2":
Thẻ 3 — "Bàn 5"; chip "Chờ 3 phút" nền #FFF4DE chữ #C98222; "Đơn #015 · 13:15".
  · Món 1: ô "1×" + "Bạc xỉu đá"; "Bình thường · Ít đá"; nút cao 48px viền #3E8E53 chữ #3E8E53 "XONG MÓN NÀY".
  · Món 2 (đã xong, hiển thị mờ hơn): ô "1×" + "Cà phê sữa đá" chữ #75655B gạch nhạt,
    thay nút bằng chip "Sẵn sàng" nền #EAF5EC chữ #3E8E53 có icon tích.
  · Có thanh tiến trình mảnh dưới tên bàn: 1/2 màu #C98222.
Thẻ 4 — "Bàn 8"; chip "Chờ 6 phút" #FFF4DE; "Đơn #020 · 13:12"; chip nhỏ "8 món" nền #F6EEE4.
  · Hiển thị 3 món đầu, rồi dòng chữ #9C8C81 15px "+ 5 món khác" kèm icon mũi tên xuống.
  · Nút viền tràn ngang "MỞ TICKET".

CỘT "Sẵn sàng" — huy hiệu "1":
Thẻ 5 — "Bàn 5"; chip "Sẵn sàng" nền #EAF5EC chữ #3E8E53; "Đơn #015".
  · Nền thẻ hơi ngả xanh: #F5FAF6, viền #3E8E53.
  · Món: ô "1×" + "Cà phê đen đá"; "Ít đá · Không đường"; chip "Sẵn sàng" có icon tích.
  · Nút đặc tràn ngang cao 52px nền #3E8E53 chữ trắng 17px: "ĐÃ PHỤC VỤ".

Tổng thể: sáng, tương phản cao, chữ to, mỗi cột cuộn độc lập, không có gì phải rê chuột mới thấy.
```

## K05 — New Ticket Arrives

```text
Giống K04 nhưng vừa có đơn mới về ở cột "Mới":
- Một thẻ mới "Bàn 2 · Đơn #022 · 13:18" xuất hiện ở ĐẦU cột "Mới", đẩy các thẻ khác xuống.
- Thẻ mới có viền #D9682B nét 3px, nền hơi ngả cam #FFFBF7, và nhãn pill nhỏ ở góc trên phải:
  "MỚI" nền #D9682B chữ trắng 13px bold.
- Huy hiệu cột "Mới" đổi thành "3" và chính huy hiệu cũng có vòng sáng #D9682B quanh nó.
- Chip ở header đổi thành "5 ticket đang chờ".
- Món trong thẻ mới: ô "2×" + "Cà phê đen đá"; "Không đường".
```

## K06 — Ticket Highlight + Sound ⭐ P0

```text
Giống K05 nhưng nhấn mạnh khoảnh khắc báo động — đây là ảnh dùng cho video demo:
- Thẻ "Bàn 2" mới có vòng sáng lan tỏa màu #D9682B quanh viền (glow mềm, không chói),
  nền thẻ #FFF0E4 rõ hơn.
- Ở giữa phía trên bảng kanban, nổi một dải thông báo lớn: nền #D9682B, chữ trắng 20px semibold,
  bo 16px, shadow vừa, có icon chuông: "Đơn mới từ Bàn 2 · 2 món".
- Icon loa trên header đang ở trạng thái hoạt động: có 2–3 vòng sóng âm nhỏ màu #D9682B tỏa ra.
- Phần còn lại của bảng giữ nguyên như K04.
```

## K07 — Start Item

```text
Giống K04 nhưng đang bấm bắt đầu làm món "Croissant bơ" ở thẻ Bàn 5 cột "Mới":
- Nút "BẮT ĐẦU LÀM" ở trạng thái đang nhấn: nền #BE5520, hơi thu nhỏ, có vòng xoay trắng nhỏ bên trái chữ.
- Cả thẻ có shadow rõ hơn như đang được nhấc lên.
- Cột "Đang làm" hiện một khoảng trống bo 16px viền đứt nét #D7C4B3 nền #FAF4EC ở vị trí thẻ sắp rơi vào.
```

## K08 — Item Preparing

```text
Giống K04 nhưng thẻ "Bàn 5 · Đơn #021" đã CHUYỂN sang cột "Đang làm":
- Cột "Mới" giờ chỉ còn 1 thẻ (Bàn 3), huy hiệu "1".
- Cột "Đang làm" có 3 thẻ, huy hiệu "3", thẻ Croissant nằm trên cùng với viền sáng nhẹ vừa chuyển tới.
- Món "Croissant bơ" giờ có nút viền #3E8E53 "XONG MÓN NÀY" và chip trạng thái nhỏ "Đang làm" nền #FFF4DE.
- Chip thời gian của thẻ đổi sang nền #FFF4DE chữ #C98222.
```

## K09 — Mark Item Ready

```text
Giống K08 nhưng đang bấm "XONG MÓN NÀY" trên món "Bạc xỉu đá":
- Nút chuyển sang nền #3E8E53 đặc, chữ trắng, có vòng xoay trắng.
- Dòng món có nền chuyển dần sang #EAF5EC.
- Thanh tiến trình của thẻ chuyển từ 1/2 sang 2/2 màu #3E8E53.
```

## K10 — Ticket Ready ⭐ P0

```text
[Khối shell KDS] Tập trung vào trạng thái một ticket đã hoàn tất toàn bộ:
- Cột "Sẵn sàng" có 2 thẻ, huy hiệu "2".
- Thẻ trên cùng "Bàn 5 · Đơn #015": nền #F5FAF6, viền #3E8E53 nét 2px, có dải trên thẻ nền #EAF5EC
  chữ #3E8E53 15px semibold có icon tích: "Tất cả món đã sẵn sàng".
  · Ba dòng món đều có chip "Sẵn sàng" nền #EAF5EC chữ #3E8E53:
    "1× Cà phê đen đá · Ít đá · Không đường", "1× Cà phê sữa đá · Bình thường · Ít ngọt",
    "1× Bạc xỉu đá · Bình thường · Ít đá".
  · Nút đặc tràn ngang cao 56px nền #3E8E53 chữ trắng 17px semibold: "ĐÃ PHỤC VỤ CẢ TICKET".
- Hai cột "Mới" và "Đang làm" vẫn có thẻ như K04 nhưng ít hơn.
```

## K11 — Long Ticket Expanded

```text
[Khối shell KDS, bảng phía sau phủ tối 40%]
Dialog lớn căn giữa rộng 720px, cao tối đa 80% màn hình, nền #FFFDFC bo 16px padding 32px:
- Hàng đầu: "Bàn 8" 30px bold; chip "Chờ 6 phút" nền #FFF4DE; nút X góc phải.
- Dòng "Đơn #020 · 13:12 · 8 món" 15px #9C8C81.
- Thanh tiến trình ngang dày 8px bo tròn: 3/8 màu #C98222, phần còn lại #EEE9E4, kèm chữ "3/8 món xong".
- Danh sách 8 món, mỗi món là một hàng cao 72px, cách nhau 8px, nền #FAF4EC bo 12px:
  ô số lượng vuông, tên món 17px semibold, tùy chọn 15px #75655B, và nút cao 48px bên phải.
  · 3 món đầu: chip "Sẵn sàng" nền #EAF5EC.
  · 2 món giữa: nút viền #3E8E53 "XONG MÓN NÀY", chip "Đang làm".
  · 3 món cuối: nút đặc #D9682B "BẮT ĐẦU", chip "Mới".
  Một trong các món có ghi chú nền #FFF4DE "Không đường giúp mình".
- Chân dialog: nút viền "Bắt đầu tất cả" + nút đặc #3E8E53 "Đánh dấu xong tất cả".
```

## K12 — Overdue Ticket ⭐ P0

```text
[Khối shell KDS] Nhấn mạnh ticket quá hạn — dùng đúng ba mức của backend:

Cột "Mới" có 3 thẻ minh họa đủ 3 mức thời gian chờ:
1) "Bàn 2" — chip "Chờ 3 phút" nền #EAF2F7 chữ #477A9E — thẻ bình thường, viền #E8DCCF.
2) "Bàn 8" — chip "Chờ 9 phút" nền #FFF4DE chữ #C98222 — thẻ có viền #C98222 nét 2px.
3) "Bàn 3" — chip "Chờ lâu · 16 phút" nền #C44B45 CHỮ TRẮNG — thẻ có viền #C44B45 nét 3px,
   nền thẻ ngả đỏ rất nhạt #FEF7F6, và dải trên cùng thẻ nền #FBECEB chữ #C44B45 15px semibold
   có icon cảnh báo tam giác: "Món chờ quá lâu — ưu tiên làm ngay".
   Thẻ này được xếp LÊN ĐẦU cột, trên cả các thẻ mới hơn.

Chú giải nhỏ góc dưới phải bảng, nền #FFFDFC bo 12px viền #E8DCCF padding 12px:
ba dòng có chấm màu — "Dưới 8 phút: bình thường" (#477A9E) ·
"8–14 phút: cần chú ý" (#C98222) · "Từ 15 phút: quá hạn" (#C44B45).
```

## K13 — Filter / Focus Mode

```text
[Khối shell KDS] Có thêm thanh công cụ ngay dưới header, cao 56px, nền #FFFDFC viền dưới #E8DCCF:
- Nhóm nút phân đoạn: "Tất cả" · "Đồ uống" (ĐANG CHỌN: nền #D9682B chữ trắng) · "Đồ ăn".
- Nhóm nút phân đoạn thứ hai: "Mọi bàn" (đang chọn) · "Chỉ bàn của tôi".
- Bên phải: công tắc có nhãn "Chế độ tập trung" đang BẬT màu #D9682B,
  và chữ nhỏ #9C8C81 "Ẩn cột Sẵn sàng".
Vì chế độ tập trung đang bật: bảng CHỈ CÒN 2 CỘT "Mới" và "Đang làm", chia đôi màn hình,
thẻ ticket rộng hơn và chữ to hơn (tên bàn 30px). Cột "Sẵn sàng" không hiển thị.
Các thẻ chỉ chứa đồ uống (không có Croissant bơ, Tiramisu).
```

## K14 — Sound Settings

```text
[Khối shell KDS] Popover neo dưới icon loa ở header, rộng 340px, nền #FFFDFC bo 16px shadow vừa padding 20px:
- Tiêu đề "Âm thanh" 20px bold.
- Hàng công tắc "Báo đơn mới" BẬT màu #3E8E53.
- Hàng công tắc "Nhắc món chờ lâu" TẮT (xám), kèm chữ nhỏ #9C8C81 "Kêu lại mỗi 5 phút".
- Nhãn "Âm lượng": thanh trượt ngang, phần đã chọn màu #D9682B ở khoảng 70%, núm tròn trắng viền #D9682B.
- Nhãn "Chọn tiếng báo": 3 hàng radio — "Chuông nhẹ" (đang chọn), "Tiếng ting", "Tiếng chuông đôi";
  mỗi hàng có nút phát thử hình tam giác nhỏ trong ô tròn viền #D7C4B3.
- Nút viền tràn ngang "Nghe thử".
```

## K15 — Undo Action

```text
Giống K04 nhưng vừa lỡ tay đánh dấu xong một món:
- Toast lớn nổi ở giữa phía dưới màn hình, nền #35251D chữ trắng, bo 12px, shadow vừa, cao 56px, rộng 480px:
  icon tích trắng + chữ 17px "Đã đánh dấu Cà phê sữa đá sẵn sàng",
  bên phải là nút chữ màu #F0A97A 17px semibold "HOÀN TÁC" và một vòng đếm ngược mảnh quanh nút.
- Món tương ứng trên thẻ đang ở trạng thái vừa đổi, có viền sáng nhẹ.
```

## K16 — Cancelled Item

```text
Giống K04 nhưng một món bị hủy:
- Trong thẻ "Bàn 3", món "Trà đào cam sả" hiển thị: tên món bị gạch ngang, chữ #A89E97,
  ô số lượng chuyển nền #EEE9E4, và chip "Đã hủy" nền #FBECEB chữ #C44B45 có icon X thay cho nút hành động.
- Cả dòng món có nền #FBECEB rất nhạt.
- Nếu thẻ chỉ còn món đã hủy: thẻ có dải dưới cùng nền #FBECEB chữ #C44B45 "Ticket này đã bị hủy toàn bộ"
  và nút viền #C44B45 "Bỏ khỏi bảng".
```

## K17 — Multiple Device Conflict

```text
[Khối shell KDS, bảng phía sau phủ tối 40%]
Dialog căn giữa 520px nền #FFFDFC bo 16px padding 32px:
- Icon tròn 64px nền #FFF4DE với hình hai màn hình chồng nhau, màu #C98222.
- Tiêu đề "Món này vừa được cập nhật ở máy khác" 24px bold.
- Nội dung 17px #75655B: "Một màn hình khác đã đánh dấu Bạc xỉu đá là Sẵn sàng lúc 13:17.
  Bảng của bạn sẽ được làm mới."
- Card nền #FAF4EC bo 12px: "Món" – "Bạc xỉu đá" · "Trạng thái mới" – "Sẵn sàng" · "Lúc" – "13:17".
- Nút đặc #D9682B tràn ngang cao 52px "Làm mới bảng".
```

## K20 — Reconnecting

```text
[Khối shell KDS] Dải cảnh báo dính ngay dưới header, tràn ngang, cao 52px,
nền #FFF4DE viền dưới #C98222: icon wifi #C98222, chữ 17px #35251D
"Mất kết nối tới máy chủ — đang thử lại...", vòng xoay #C98222, nút chữ "Thử ngay".
- Chỉ báo kết nối ở header đổi thành chấm #C98222 và chữ "Đang kết nối lại".
- Bảng kanban vẫn hiện đầy đủ nhưng mờ 75%, TẤT CẢ nút hành động chuyển disabled nền #EEE9E4 chữ #A89E97.
- Góc dưới phải có chip nhỏ nền #FFFDFC viền #E8DCCF: "Dữ liệu lúc 13:16".
```

## K21 — Offline Board ⭐ P0

```text
[Khối shell KDS] Trạng thái mất mạng hoàn toàn:
- Dải cảnh báo dưới header nền #FBECEB viền dưới #C44B45, cao 52px:
  icon wifi gạch chéo #C44B45, chữ 17px "Mất kết nối — đang hiển thị dữ liệu cũ lúc 13:16",
  nút viền #C44B45 chữ #C44B45 "Tải lại".
- Chỉ báo header: chấm xám #A89E97 + chữ "Ngoại tuyến".
- Vùng bảng kanban thay bằng trạng thái rỗng lớn căn giữa:
  · Minh họa nét mảnh: màn hình quầy có dấu wifi gạch chéo, tông #D7C4B3, cao 200px.
  · Tiêu đề "Không kết nối được tới máy chủ" 30px bold #35251D.
  · Mô tả 17px #75655B căn giữa: "Đơn mới sẽ không hiện lên cho tới khi kết nối trở lại.
    Kiểm tra wifi của quán hoặc gọi kỹ thuật."
  · Nút đặc #D9682B cao 52px "Thử kết nối lại".
  · Chữ nhỏ #9C8C81: "Đã thử lại 3 lần · lần cuối 13:18".
```

## K22 — Reconnected Sync

```text
[Khối shell KDS] Vừa kết nối lại thành công:
- Dải thông báo dưới header nền #EAF5EC viền dưới #3E8E53, cao 52px, icon tích #3E8E53,
  chữ 17px "Đã kết nối lại — đang đồng bộ 2 đơn mới...", kèm vòng xoay #3E8E53.
- Chỉ báo header: chấm #3E8E53 + "Đã kết nối".
- Bảng kanban hiện đầy đủ. Hai thẻ mới về trong lúc mất mạng có viền #D9682B và nhãn pill "MỚI" góc trên phải.
- Huy hiệu các cột có vòng sáng nhẹ thể hiện vừa cập nhật.
```

## K23 — Stale Data Conflict

```text
[Khối shell KDS, phủ tối 40%]
Dialog 520px nền #FFFDFC bo 16px padding 32px:
- Icon tròn 64px nền #EAF2F7 chữ i màu #477A9E.
- Tiêu đề "Bảng của bạn đã cũ" 24px bold.
- Nội dung 17px #75655B: "Có 3 thay đổi từ máy khác trong lúc bạn mất kết nối.
  Tải lại để tránh làm trùng món."
- Danh sách 3 dòng thay đổi trong card nền #FAF4EC bo 12px, mỗi dòng có chấm màu:
  "Bàn 5 · Cà phê sữa đá → Sẵn sàng" · "Bàn 3 · Đơn #018 mới" · "Bàn 8 · Trà sen vàng → Đã hủy".
- Nút đặc #D9682B tràn ngang cao 52px "Tải lại bảng".
```

## K30 — Empty Board

```text
[Khối shell KDS] Header vẫn đầy đủ nhưng chip đổi thành "Không có ticket" nền #F6EEE4 chữ #75655B.
Ba cột kanban vẫn hiện header cột với huy hiệu "0" màu xám, nhưng vùng bên dưới trống.
Ở giữa toàn bộ vùng bảng, nội dung căn giữa dọc:
- Minh họa nét mảnh: ly cà phê và bình lắc đặt gọn trên quầy, tông #D7C4B3, cao 200px.
- Tiêu đề "Chưa có đơn nào" 30px bold #35251D.
- Mô tả 17px #75655B căn giữa: "Đơn của khách sẽ tự hiện ở đây kèm tiếng báo. Cứ để màn hình này mở."
- Chip nhỏ nền #EAF5EC chữ #3E8E53 có chấm tròn: "Đang chờ đơn mới".
Cảm giác bình yên, sạch — không phải trạng thái lỗi.
```

## K31 — Permission Denied

```text
Màn 1440×1024, chỉ có header KDS (không có bảng kanban), nội dung căn giữa dọc:
- Icon tròn 120px nền #EEE9E4 hình ổ khóa #A89E97.
- Tiêu đề "Tài khoản này không vào được màn quầy pha chế" 30px bold.
- Mô tả 17px #75655B căn giữa: "Bạn cần quyền cập nhật trạng thái món. Nhờ chủ quán cấp quyền giúp bạn."
- Hai nút ngang: nút đặc #D9682B cao 52px "Đăng nhập tài khoản khác" + nút viền "Về trang quản trị".
```

## K32 — Session Expired

```text
Màn 1440×1024, bảng kanban phía sau bị làm mờ mạnh và phủ tối 55%.
Dialog căn giữa 480px, KHÔNG có nút X:
- Icon tròn 64px nền #FFF4DE hình đồng hồ #C98222.
- Tiêu đề "Phiên đăng nhập đã hết hạn" 24px bold căn giữa.
- Nội dung 17px #75655B căn giữa: "Đăng nhập lại để tiếp tục nhận đơn. Các đơn đang chờ vẫn được giữ nguyên."
- Nút đặc #D9682B tràn ngang cao 52px "Đăng nhập lại".
```

## K33 — Not Found

```text
Màn 1440×1024, chỉ header KDS, nội dung căn giữa:
- Minh họa nét mảnh: ly cà phê đổ nghiêng, tông #D7C4B3, cao 200px.
- Chữ "404" 48px bold #D7C4B3.
- Tiêu đề "Không tìm thấy màn hình này" 30px bold #35251D.
- Mô tả 17px #75655B: "Đường dẫn không đúng hoặc đã thay đổi."
- Nút đặc #D9682B cao 52px "Về bảng quầy pha chế".
```
