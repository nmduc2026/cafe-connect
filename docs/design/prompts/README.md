# Prompts sinh ảnh — cafe-connect

Bộ prompt để đưa cho model sinh ảnh (codex / image model) tạo mockup UI và asset cho `cafe-connect`.

Toàn bộ nội dung ở đây đã đối chiếu với [`../../system_overview.md`](../../system_overview.md),
[`../01_design_system.md`](../01_design_system.md) và [`../../plans/`](../../plans/) — route, permission,
tên endpoint và dữ liệu mẫu đều khớp. **Đừng sửa dữ liệu mẫu trong prompt** trừ khi sửa luôn ở các file nguồn.

---

## File

| File | Nội dung | Số prompt |
|---|---|---:|
| [00_base_prompt.md](00_base_prompt.md) | **Khối style chung + dữ liệu chuẩn.** Dán trước mọi prompt khác | — |
| [01_customer_prompts.md](01_customer_prompts.md) | Màn khách C01–C23 + nhóm lỗi E01–E06 | 23 + 6 |
| [02_admin_prompts.md](02_admin_prompts.md) | Màn quản trị A01–A75 | 45 |
| [03_staff_prompts.md](03_staff_prompts.md) | Chế độ nhân viên S01–S45 | 21 |
| [04_kds_prompts.md](04_kds_prompts.md) | Màn quầy pha chế K01–K33 | 26 |
| [05_asset_prompts.md](05_asset_prompts.md) | Ảnh món, hero, logo, minh họa, placeholder | 30 |

---

## Cách dùng

### Quy tắc bất di bất dịch

**Mỗi lần sinh một ảnh = `00_base_prompt.md` §A + prompt màn hình đó.**
Bỏ khối §A đi thì ảnh sẽ lệch màu, lệch font, lệch phong cách với phần còn lại.

```text
[dán nguyên §A của 00_base_prompt.md]

---

[dán prompt màn hình, ví dụ C03]
```

### Thứ tự nên làm

1. **Asset trước** ([05](05_asset_prompts.md)) — 8 ảnh món M101–M302 và hero H001.
   Có ảnh món rồi thì mockup mới không bị ô xám placeholder.
2. **10 màn P0** (đánh dấu ⭐ trong từng file) — đủ để dựng prototype bấm được và quay video demo:
   `C03 · C05 · C08 · C12 · C19 · A03 · A20 · A40 · A43 · K04`
3. **Còn lại theo surface**, làm trọn một surface rồi mới sang surface khác — để phong cách trong
   cùng một luồng đồng nhất.

### Sau khi có ảnh

- Đặt tên file theo **screen ID**: `C03_menu_home.png`, `K04_live_board.png`.
- Ảnh asset đặt tên theo **asset ID** trong [`../03_asset_library.md`](../03_asset_library.md):
  `M101_coffee-black-iced.webp`.
- Xếp vào cấu trúc thư mục mô tả ở [`../09_prototype_production_plan.md`](../09_prototype_production_plan.md).

---

## Kiểm tra ảnh trước khi nhận

Ảnh trả về **không đạt** nếu vi phạm bất kỳ điểm nào:

- [ ] Có chữ tiếng Việt **sai dấu** hoặc chữ giả (lorem ipsum).
- [ ] Nền tối, hoặc mảng nâu đậm phủ diện tích lớn.
- [ ] Có gradient tím/xanh, orb, bokeh, glassmorphism.
- [ ] Có khung điện thoại/laptop bao quanh, tay người, bàn làm việc phía sau.
- [ ] Giá tiền sai định dạng (phải là `29.000đ`, không phải `29,000 VND` hay `29.000 ₫`).
- [ ] Dữ liệu sai so với §C của [00_base_prompt.md](00_base_prompt.md) — sai tên món, sai giá,
      sai mã phiên (`A7K2QX`), sai tên bàn.
- [ ] Màu trạng thái sai: "Đang làm" phải cam `#C98222`, "Sẵn sàng" phải xanh lá `#3E8E53`.
- [ ] Vùng chạm nhỏ hơn 44px, hoặc chữ nhỏ hơn 12px.
- [ ] Màn KDS có sidebar (KDS **không** có sidebar).
- [ ] Màn Staff trông như một app riêng — phải là AdminLayout với sidebar 2 mục.

---

## Ba điều dễ sai nhất

**1. Staff không phải app thứ tư.**
Chỉ có 3 layout: Customer (`/t/:qrToken`), Admin (`/admin`), KDS (`/kitchen`).
Nhân viên đăng nhập vào chính `/admin`, sidebar chỉ còn `Đơn hàng` + `Lịch sử`.
Nếu ảnh S* trông như một sản phẩm khác biệt với A* thì prompt đã bị hiểu sai.

**2. Chữ hiển thị luôn là "Quầy pha chế", không phải "KDS"/"Kitchen".**
Tên kỹ thuật KDS chỉ tồn tại trong code và URL.

**3. Trạng thái không bao giờ chỉ dùng màu.**
Mọi badge trạng thái phải có **cả icon lẫn chữ** — yêu cầu accessibility trong
[`../01_design_system.md`](../01_design_system.md) §3.3.

---

## Khi cần sửa

Sửa prompt ở đây **không** làm design docs tự cập nhật. Nếu phát hiện lệch giữa prompt và
`0X_*.md`, sửa file design trước, rồi mới đồng bộ xuống prompt — design docs là nguồn, prompt là dẫn xuất.
