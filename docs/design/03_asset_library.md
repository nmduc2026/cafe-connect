# 03 — Asset Library: cafe-connect

> **Phụ thuộc:** `01_design_system.md`, `02_component_library.md`
>
> **Phạm vi:** Toàn bộ hình ảnh, logo, banner, illustration, QR và placeholder dùng trong prototype responsive web.
>
> **Mục tiêu:** Mỗi asset có một danh tính canonical duy nhất, dùng xuyên suốt Customer, Admin, Staff và KDS; không generate lại tùy hứng ở từng màn hình.

---

# 1. Nguyên tắc quản lý asset

## 1.1 Một asset — một danh tính

Mỗi món, banner hoặc illustration chỉ có một asset canonical.

Ví dụ:

```text
Cà phê sữa đá
→ menu/coffee/coffee-milk-iced.webp
```

Asset này phải được dùng lại ở:

- Menu item card.
- Chi tiết món.
- Giỏ hàng.
- Order tracking.
- Admin preview.
- Lịch sử order.
- Báo cáo top items nếu cần thumbnail.

Không generate một phiên bản khác cho cùng món ở màn hình khác.

## 1.2 UI screenshot không phải asset

Ảnh mockup màn hình chỉ dùng để làm prototype.

Không crop ảnh món từ screenshot UI để dùng làm asset thật.

Asset món phải được generate riêng, sạch, không có UI, chữ, badge hoặc logo.

## 1.3 Nhất quán art direction

Tất cả ảnh món phải có:

- Ánh sáng tự nhiên.
- Tone sáng, ấm.
- Bàn gỗ sáng hoặc nền neutral ấm.
- Góc máy gần nhất quán.
- Món rõ, dễ nhận biết.
- Không quá nhiều đạo cụ.
- Không blur mạnh.
- Không có chữ.
- Không có watermark.
- Không có tay người trừ khi được yêu cầu riêng.
- Không tạo branding giả trên ly.

## 1.4 Web-first delivery

Asset master có thể lớn, nhưng bản dùng trong web phải tối ưu:

- WebP.
- Có kích thước phù hợp.
- Có `srcset` khi cần.
- Có lazy loading.
- Có placeholder blur/LQIP nếu cần.

---

# 2. Cấu trúc thư mục

```text
public/
└── assets/
    ├── brand/
    │   ├── logo/
    │   ├── favicon/
    │   └── social/
    ├── menu/
    │   ├── coffee/
    │   ├── tea/
    │   ├── blended/
    │   ├── juice/
    │   ├── cake/
    │   └── topping/
    ├── banners/
    ├── illustrations/
    │   ├── customer/
    │   ├── admin/
    │   ├── staff/
    │   ├── kds/
    │   └── payment/
    ├── qr/
    ├── placeholders/
    └── sounds/
```

---

# 3. Quy ước tên file

## 3.1 Naming

- Dùng kebab-case.
- Không dấu.
- Không khoảng trắng.
- Không nhét version vào tên trừ khi thật sự cần.
- Tên phản ánh nội dung, không phản ánh màn hình.

Ví dụ đúng:

```text
coffee-black-iced.webp
tea-peach-orange-lemongrass.webp
payment-success.webp
customer-menu-hero.webp
```

Ví dụ không nên dùng:

```text
screen1-image-final-v2.png
ca-phe-sua-da-new.png
admin-page-image.png
```

## 3.2 Suffix kích thước

Master không cần suffix.

Nếu giữ nhiều rendition:

```text
coffee-black-iced-400.webp
coffee-black-iced-800.webp
coffee-black-iced-1200.webp
```

---

# 4. Quy chuẩn file và kích thước

| Asset type | Master | Web delivery | Ratio |
|---|---:|---:|---|
| Product image | 1200×1200 | 400/800/1200 WebP | 1:1 |
| Hero banner | 2000×1125 | 1280/1600 WebP | 16:9 |
| Customer illustration | 1400×1050 | 800/1200 WebP | 4:3 |
| Admin illustration | 1400×1050 | 800/1200 WebP | 4:3 |
| Payment result | 1200×900 | 800 WebP/PNG | 4:3 |
| Logo horizontal | SVG | SVG | flexible |
| Logo mark | SVG | SVG | 1:1 |
| Favicon | SVG/PNG | 32/48/180/512 | 1:1 |
| QR | SVG + PNG | 512/1024 PNG | 1:1 |
| Placeholder | SVG/WebP | responsive | 1:1 hoặc 4:3 |
| Sound | WAV master | MP3/OGG | — |

---

# 5. Brand assets

# 5.1 Logo system

## Asset B001 — Horizontal logo

```yaml
id: B001
name: cafe-connect horizontal logo
file: brand/logo/cafe-connect-horizontal.svg
format: svg
usage:
  - CustomerHeader
  - AdminSidebar
  - Login page
  - Print QR sheet
```

### Direction

- Wordmark `cafe-connect`.
- Có thể có icon tách cafe/QR nhẹ.
- Không quá vintage.
- Không giống logo chuỗi cafe lớn.
- Dễ đọc ở chiều cao 28–36px.
- Màu espresso/terracotta.

## Asset B002 — Logo mark

```yaml
id: B002
file: brand/logo/cafe-connect-mark.svg
usage:
  - favicon
  - collapsed sidebar
  - app icon
  - QR print header
```

## Asset B003 — Monochrome logo

```yaml
id: B003
file: brand/logo/cafe-connect-monochrome.svg
usage:
  - dark print
  - watermark nhẹ
  - loading state
```

## Asset B004 — Favicon set

```text
brand/favicon/favicon.svg
brand/favicon/favicon-32.png
brand/favicon/favicon-48.png
brand/favicon/apple-touch-icon-180.png
brand/favicon/pwa-icon-192.png
brand/favicon/pwa-icon-512.png
```

---

# 6. Canonical product assets

Dữ liệu giá và tên phải khớp `01_design_system.md`.

# 6.1 Coffee

## M101 — Cà phê đen đá

```yaml
id: M101
product_id: 101
name: Cà phê đen đá
file: menu/coffee/coffee-black-iced.webp
master: menu/coffee/master/coffee-black-iced.png
ratio: 1:1
price: 29000
```

### Visual direction

- Ly thủy tinh thấp hoặc trung bình.
- Cafe đen đậm và đá rõ.
- Condensation nhẹ.
- Bàn gỗ sáng.
- Ánh sáng bên cửa sổ.
- Không sữa, không foam.

### Used in

- Customer menu.
- Product detail.
- Cart.
- Order tracking.
- Admin preview.
- Canonical demo order.

## M102 — Cà phê sữa đá

```yaml
id: M102
product_id: 102
name: Cà phê sữa đá
file: menu/coffee/coffee-milk-iced.webp
price: 35000
```

### Visual direction

- Layer cafe và sữa nhận biết rõ.
- Ly cao vừa.
- Đá.
- Tone Việt Nam, không biến thành latte phương Tây.
- Không có logo giả trên ly.

## M103 — Bạc xỉu đá

```yaml
id: M103
product_id: 103
name: Bạc xỉu đá
file: menu/coffee/bac-xiu-iced.webp
price: 35000
```

### Visual direction

- Màu sữa sáng hơn cà phê sữa đá.
- Lớp cafe nhẹ phía trên.
- Ly thủy tinh trong.
- Phân biệt được với M102.

## M104 — Cà phê muối

```yaml
id: M104
product_id: 104
name: Cà phê muối
file: menu/coffee/salted-coffee.webp
price: 39000
```

### Visual direction

- Cafe đậm phía dưới.
- Lớp cream muối sáng phía trên.
- Không trang trí quá cầu kỳ.
- Có thể dùng ly thấp.

## M105 — Espresso

```yaml
id: M105
name: Espresso
file: menu/coffee/espresso.webp
price: 32000
status: optional_seed_asset
```

## M106 — Americano đá

```yaml
id: M106
name: Americano đá
file: menu/coffee/americano-iced.webp
price: 34000
status: optional_seed_asset
```

---

# 6.2 Tea

## M201 — Trà đào cam sả

```yaml
id: M201
product_id: 201
name: Trà đào cam sả
file: menu/tea/peach-orange-lemongrass-tea.webp
price: 45000
```

### Visual direction

- Trà màu hổ phách sáng.
- Miếng đào, lát cam, sả.
- Ly cao.
- Không quá nhiều garnish.
- Món nhận biết ngay.

## M202 — Trà sen vàng

```yaml
id: M202
product_id: 202
name: Trà sen vàng
file: menu/tea/golden-lotus-tea.webp
price: 42000
```

### Visual direction

- Trà sáng.
- Hạt sen hoặc lotus-related cue nhẹ.
- Có lớp cream mỏng nếu phù hợp menu.
- Không biến thành đồ uống thương hiệu cụ thể.

## M203 — Trà vải

```yaml
id: M203
name: Trà vải
file: menu/tea/lychee-tea.webp
price: 42000
status: optional_seed_asset
```

## M204 — Trà chanh

```yaml
id: M204
name: Trà chanh
file: menu/tea/lemon-tea.webp
price: 32000
status: optional_seed_asset
```

---

# 6.3 Cake

## M301 — Croissant bơ

```yaml
id: M301
product_id: 301
name: Croissant bơ
file: menu/cake/butter-croissant.webp
price: 32000
```

### Visual direction

- Một croissant vàng, flaky.
- Đĩa gốm sáng.
- Bàn gỗ hoặc nền kem.
- Không quá nhiều đồ trang trí.
- Nhìn giống món bán thật.

## M302 — Tiramisu

```yaml
id: M302
product_id: 302
name: Tiramisu
file: menu/cake/tiramisu.webp
price: 45000
```

### Visual direction

- Một lát hoặc hộp vuông.
- Cocoa powder rõ.
- Tone sáng.
- Không quá dark/moody.

## M303 — Bánh mì bơ tỏi

```yaml
id: M303
name: Bánh mì bơ tỏi
file: menu/cake/garlic-butter-bread.webp
price: 35000
status: optional_seed_asset
```

## M304 — Cheesecake chanh dây

```yaml
id: M304
name: Cheesecake chanh dây
file: menu/cake/passionfruit-cheesecake.webp
price: 48000
status: optional_seed_asset
```

---

# 6.4 Blended drinks

## M401 — Matcha đá xay

```yaml
id: M401
name: Matcha đá xay
file: menu/blended/matcha-frappe.webp
price: 49000
status: optional_seed_asset
```

## M402 — Chocolate đá xay

```yaml
id: M402
name: Chocolate đá xay
file: menu/blended/chocolate-frappe.webp
price: 49000
status: optional_seed_asset
```

---

# 6.5 Juice

## M501 — Nước cam

```yaml
id: M501
name: Nước cam
file: menu/juice/orange-juice.webp
price: 39000
status: optional_seed_asset
```

## M502 — Nước ép dứa

```yaml
id: M502
name: Nước ép dứa
file: menu/juice/pineapple-juice.webp
price: 39000
status: optional_seed_asset
```

---

# 6.6 Topping and option assets

Option trong UI không bắt buộc có ảnh, nhưng có thể dùng trong Admin preview hoặc marketing/demo.

## T601 — Trân châu trắng

```yaml
id: T601
file: menu/topping/white-pearls.webp
status: optional
```

## T602 — Kem muối

```yaml
id: T602
file: menu/topping/salted-cream.webp
status: optional
```

## T603 — Đào miếng

```yaml
id: T603
file: menu/topping/peach-slices.webp
status: optional
```

---

# 7. Hero and banner assets

# 7.1 H001 — Customer menu hero

```yaml
id: H001
file: banners/customer-menu-hero.webp
ratio: 16:9
usage:
  - Customer menu landing
```

### Content

- Một ly cà phê sữa đá và một ly bạc xỉu/cafe đen.
- Bàn gỗ sáng.
- Ánh sáng tự nhiên.
- Không có chữ trong ảnh.
- Chừa negative space bên trái hoặc vùng phù hợp để overlay greeting.
- Không giống banner quảng cáo quá bóng bẩy.

## H002 — Login background

```yaml
id: H002
file: banners/admin-login-cafe-counter.webp
ratio: 16:9
usage:
  - Admin/Staff login desktop
```

### Content

- Quầy cafe Việt hiện đại.
- Sáng, sạch.
- Không có người nhận diện rõ.
- Không có logo/thương hiệu thật.
- Chừa vùng sạch cho form login.

## H003 — QR print cover

```yaml
id: H003
file: banners/qr-print-cover.webp
ratio: 16:9
usage:
  - Print all QR cover/header optional
```

---

# 8. Illustration assets

Illustration chỉ dùng cho empty/success/error khi icon đơn giản không đủ.

Phong cách illustration:

- Semi-realistic hoặc clean editorial.
- Không hoạt hình trẻ con.
- Cùng palette kem/terracotta/xanh dịu.
- Không có chữ.
- Không có UI giả trong illustration trừ khi thật cần thiết.

# 8.1 Customer illustrations

## I101 — Empty cart

```yaml
id: I101
file: illustrations/customer/empty-cart.webp
usage:
  - Customer cart empty
```

Visual:

- Khay cafe trống hoặc giỏ nhẹ.
- Một ly cafe nhỏ làm motif.
- Transparent background nếu phù hợp.

## I102 — Order placed

```yaml
id: I102
file: illustrations/customer/order-placed.webp
usage:
  - Order success
```

Visual:

- Phiếu order đã gửi tới quầy.
- Motion cue nhẹ, không có chữ.

## I103 — Session expired

```yaml
id: I103
file: illustrations/customer/session-expired.webp
usage:
  - QR/session expired
```

Visual:

- QR card và đồng hồ.
- Không tạo cảm giác lỗi nghiêm trọng.

## I104 — No menu result

```yaml
id: I104
file: illustrations/customer/no-menu-results.webp
usage:
  - Search/filter empty
```

---

# 8.2 Admin illustrations

## I201 — No menu items

```yaml
id: I201
file: illustrations/admin/no-menu-items.webp
```

## I202 — No tables

```yaml
id: I202
file: illustrations/admin/no-tables.webp
```

## I203 — No report data

```yaml
id: I203
file: illustrations/admin/no-report-data.webp
```

## I204 — Permission denied

```yaml
id: I204
file: illustrations/admin/permission-denied.webp
```

---

# 8.3 Staff illustrations

## I301 — No active sessions

```yaml
id: I301
file: illustrations/staff/no-active-sessions.webp
```

## I302 — No staff requests

```yaml
id: I302
file: illustrations/staff/no-staff-requests.webp
```

---

# 8.4 KDS illustrations

KDS ưu tiên icon và text hơn illustration.

## I401 — No tickets

```yaml
id: I401
file: illustrations/kds/no-tickets.webp
usage:
  - Empty KDS board
```

Visual:

- Quầy pha chế gọn.
- Một ticket holder trống.
- Rất tối giản.

## I402 — Offline

```yaml
id: I402
file: illustrations/kds/offline.webp
usage:
  - Full-page KDS offline fallback
```

Chỉ dùng nếu mất kết nối kéo dài; bình thường dùng banner.

---

# 8.5 Payment illustrations

## P101 — Payment pending

```yaml
id: P101
file: illustrations/payment/payment-pending.webp
```

## P102 — Payment success

```yaml
id: P102
file: illustrations/payment/payment-success.webp
```

## P103 — Payment failed

```yaml
id: P103
file: illustrations/payment/payment-failed.webp
```

## P104 — Cash payment

```yaml
id: P104
file: illustrations/payment/cash-payment.webp
status: optional
```

---

# 9. QR assets

# 9.1 QR canonical data

Prototype phải dùng cùng một URL demo:

```text
https://demo.cafe-connect.vn/t/demo-table-5
```

Table:

```text
Bàn 5
Capacity: 4
QR token fixture: demo-table-5
```

## Q001 — Bàn 5 QR SVG

```yaml
id: Q001
file: qr/table-5.svg
format: svg
```

## Q002 — Bàn 5 QR PNG

```yaml
id: Q002
file: qr/table-5-1024.png
format: png
size: 1024x1024
```

## Q003 — QR tabletop card preview

```yaml
id: Q003
file: qr/table-5-table-card.webp
usage:
  - Admin preview
  - README/demo
```

Q003 là mockup vật lý của QR trên bàn, không phải QR source.

## Q004 — QR placeholder

```yaml
id: Q004
file: qr/qr-placeholder.svg
usage:
  - Table chưa generate QR
```

---

# 10. Placeholder assets

# 10.1 Product placeholder

```yaml
id: PH001
file: placeholders/product-placeholder.svg
ratio: 1:1
```

- Nền kem.
- Icon ly cafe tối giản.
- Không dùng ảnh stock ngẫu nhiên.

# 10.2 Avatar placeholder

```yaml
id: PH002
file: placeholders/avatar-placeholder.svg
ratio: 1:1
```

# 10.3 Chart placeholder

Không cần file ảnh riêng; dùng skeleton bằng CSS.

# 10.4 Broken image fallback

```yaml
id: PH003
file: placeholders/image-error.svg
```

---

# 11. Sound assets

# 11.1 KDS new order sound

```yaml
id: S001
file: sounds/new-order.mp3
alternate: sounds/new-order.ogg
duration: 0.8-1.5s
```

Direction:

- Chuông ngắn, rõ.
- Không gây giật mình.
- Không giống notification hệ điều hành phổ biến.
- Có thể nghe trong quán.
- Không lặp vô hạn.

## S002 — Staff request sound

```yaml
id: S002
file: sounds/staff-request.mp3
duration: 0.8-1.5s
```

Khác nhẹ với S001 để phân biệt.

## S003 — Payment success sound

```yaml
id: S003
file: sounds/payment-success.mp3
status: optional
```

---

# 12. Asset usage matrix

| Asset group | Customer | Admin | Staff | KDS |
|---|---:|---:|---:|---:|
| Brand | ✓ | ✓ | ✓ | ✓ |
| Product images | ✓ | ✓ | optional | no |
| Hero banner | ✓ | Login | no | no |
| Empty illustrations | ✓ | ✓ | ✓ | limited |
| Payment illustrations | ✓ | ✓ | ✓ | no |
| QR | source/scan | ✓ | optional | no |
| Sounds | optional | optional | ✓ | ✓ |

---

# 13. Canonical asset mapping theo screen flow

## Customer

### Menu screen

- B001
- H001
- M101
- M102
- M103
- M104
- M201
- M202
- M301
- M302

### Product detail — Cà phê sữa đá

- M102

### Cart

- M101
- M102
- M103

### Order tracking

- M101
- M102
- M103
- M301 khi gọi thêm

### Payment

- P101/P102/P103 tùy state

### Session expired

- I103

## Admin

### Login

- B001
- H002

### Menu list

- M101–M104
- M201–M202
- M301–M302
- PH001 fallback

### Create/edit item

- Selected canonical product asset.
- PH001 khi chưa upload.

### Tables & QR

- Q001
- Q002
- Q003
- Q004

### Reports

- Không bắt buộc ảnh món.
- Có thể dùng thumbnail canonical ở top items detail, không generate mới.

## Staff

### Live sessions

- Không bắt buộc product image.
- Dùng B001.
- I301/I302 cho empty.

### Payment

- P102 hoặc icon semantic.

## KDS

### Board

- Không dùng product image.
- B002.
- S001.
- I401 khi empty.

---

# 14. Prompt template cho product asset

```text
Tạo một ảnh sản phẩm đồ uống/đồ ăn riêng biệt cho website cafe-connect.

Món: {PRODUCT_NAME}

Phong cách hình ảnh:
- ảnh chụp sản phẩm chân thực, cao cấp vừa phải nhưng giống món bán thật tại quán cafe Việt;
- ánh sáng tự nhiên, sáng và ấm;
- nền bàn gỗ sáng hoặc nền kem trung tính;
- bố cục sạch, ít đạo cụ;
- món nằm rõ ở trung tâm;
- góc máy 3/4 hơi từ trên xuống, nhất quán với bộ menu;
- màu sắc tự nhiên;
- không có người;
- không có chữ;
- không logo;
- không watermark;
- không UI;
- không nhãn thương hiệu;
- không dark moody;
- không bokeh mạnh.

Đầu ra:
- ảnh vuông 1:1;
- chủ thể chiếm khoảng 70–80% khung;
- đủ khoảng trống quanh món để crop responsive;
- phù hợp dùng ở menu card, product detail, cart và order tracking.
```

---

# 15. Prompt template cho hero

```text
Tạo một ảnh hero riêng biệt cho web cafe-connect, không chứa UI hoặc chữ.

Bối cảnh:
- quán cafe Việt hiện đại;
- bàn gỗ sáng;
- một ly cà phê sữa đá và một ly cafe Việt khác;
- ánh sáng ban ngày tự nhiên;
- tone kem, latte beige, nâu cafe và terracotta nhẹ;
- cảm giác sáng, ấm, sạch, gần gũi;
- không quá quảng cáo;
- không người nhận diện rõ;
- không logo;
- không chữ;
- không watermark;
- không gradient màu nhân tạo;
- chừa negative space để đặt text overlay.

Tỉ lệ 16:9.
```

---

# 16. Prompt template cho illustration

```text
Tạo một illustration sạch cho web cafe-connect.

Tình huống: {STATE}

Phong cách:
- editorial semi-realistic tối giản;
- palette kem sáng, terracotta, nâu espresso và xanh lá dịu;
- thân thiện nhưng không trẻ con;
- ít chi tiết;
- không chữ;
- không UI;
- không watermark;
- không logo thương hiệu ngoài cafe-connect;
- nền trong suốt hoặc nền kem rất nhạt tùy tình huống;
- phù hợp empty state/success state của một web app thật.
```

---

# 17. Asset generation order

Để prototype không bị chặn, generate theo thứ tự:

## Batch A — bắt buộc trước Customer flow

1. B001 — horizontal logo
2. B002 — logo mark
3. H001 — customer hero
4. M101 — Cà phê đen đá
5. M102 — Cà phê sữa đá
6. M103 — Bạc xỉu đá
7. M104 — Cà phê muối
8. M201 — Trà đào cam sả
9. M202 — Trà sen vàng
10. M301 — Croissant bơ
11. M302 — Tiramisu
12. I101 — Empty cart
13. I102 — Order placed
14. P101/P102/P103 — Payment states
15. Q001/Q002 — Table 5 QR

## Batch B — Admin/Staff/KDS

1. H002 — Login background
2. I201 — No menu items
3. I202 — No tables
4. I203 — No report data
5. I204 — Permission denied
6. I301 — No active sessions
7. I302 — No staff requests
8. I401 — No tickets
9. S001 — New order sound
10. S002 — Staff request sound

## Batch C — mở rộng seed data

- M105–M106
- M203–M204
- M303–M304
- M401–M402
- M501–M502
- T601–T603

---

# 18. Asset QA checklist

Mỗi asset phải đạt:

## Identity

- Đúng món.
- Phân biệt rõ với món gần giống.
- Không đổi ly/garnish đến mức thành món khác.

## Style

- Sáng, ấm, sạch.
- Cùng art direction.
- Không dark/moody.
- Không lạm dụng props.

## Technical

- Đúng ratio.
- Không chữ/watermark.
- Không artefact.
- Không phần thừa kỳ lạ.
- Crop được.
- WebP delivery rõ.
- File name đúng manifest.

## Consistency

- Được map đúng ID.
- Không generate asset duplicate.
- Screen sau dùng đúng asset.
- Giá/tên trong UI khớp fixture.
- Thumbnail và detail cùng một ảnh canonical.

---

# 19. Asset manifest machine-readable đề xuất

Tạo file sau khi asset bắt đầu được generate:

```text
assets/manifest.json
```

Ví dụ:

```json
{
  "M102": {
    "name": "Cà phê sữa đá",
    "type": "product",
    "path": "/assets/menu/coffee/coffee-milk-iced.webp",
    "width": 800,
    "height": 800,
    "ratio": "1:1",
    "productId": 102,
    "status": "approved"
  }
}
```

Các trạng thái:

```text
planned
generated
review
approved
rejected
deprecated
```

Prototype chỉ dùng asset `approved`.

---

# 20. Asset review workflow

Mỗi asset sau khi generate:

1. Kiểm tra đúng món và style.
2. So với asset đã approved trước đó.
3. Nếu đạt: đánh dấu approved.
4. Nếu chưa đạt: regenerate chính asset đó.
5. Không generate screen dựa trên asset đang ở trạng thái review.
6. Sau khi approved, giữ cố định seed/reference.
7. Screen mới luôn lấy asset từ manifest.

---

# 21. Quy tắc generate màn hình liên quan asset

Khi một screen cần asset mới:

1. Kiểm tra manifest.
2. Nếu đã có approved asset → dùng lại.
3. Nếu chưa có → generate asset riêng trước.
4. Approve asset.
5. Generate screen dùng asset đó.
6. Không gộp screen và asset thành một output duy nhất.
7. Mỗi screen một ảnh riêng.
8. Mỗi asset một ảnh/file riêng.

---

# 22. Out of scope ở MVP

Chưa cần generate:

- Ảnh voucher.
- Ảnh loyalty.
- Ảnh multi-tenant.
- Ảnh thương hiệu cho nhiều quán.
- Momo/ZaloPay branding.
- In nhiệt.
- Campaign banner.
- Seasonal campaign.
- User avatar thật.

Các mục này thuộc roadmap mở rộng, không nằm trong MVP.

---

# 23. Deliverables Step 03

Step 03 gồm:

- Asset taxonomy.
- Canonical product list.
- Naming convention.
- Folder structure.
- Brand asset list.
- Hero/banner list.
- Illustration list.
- QR list.
- Sound list.
- Usage matrix.
- Prompt templates.
- Generation order.
- QA checklist.
- Manifest contract.
- Review workflow.

---

# 24. Acceptance criteria

Step 03 hoàn thành khi:

- Mỗi product canonical có ID, tên, giá và path.
- Các món xuất hiện trong demo order có asset bắt buộc.
- Có đủ asset cho Customer full flow.
- Có đủ empty/success/error asset cần thiết cho Admin/Staff/KDS.
- QR Bàn 5 có fixture cố định.
- Mỗi asset có nơi sử dụng rõ.
- Có thứ tự generate hợp lý.
- Có quy tắc không generate duplicate.
- Có manifest contract.
- Có QA và approval workflow.
- Step 04 có thể dùng tài liệu này để tạo Customer Flow mà không tự nghĩ thêm asset ngoài manifest.
