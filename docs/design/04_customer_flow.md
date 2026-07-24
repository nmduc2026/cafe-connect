# 04 — Customer Flow: cafe-connect

> **Phụ thuộc:** `01_design_system.md`, `02_component_library.md`, `03_asset_library.md`
>
> **Phạm vi:** Toàn bộ flow phía khách trên responsive web/PWA, từ lúc quét QR đến khi session đóng.
>
> **Mục tiêu:** Tạo một source of truth duy nhất cho toàn bộ màn hình Customer, đảm bảo dữ liệu, asset, route, API, state và chuyển cảnh khớp nhau.

---

# 1. Product surface

Customer dùng **web responsive mobile-first**, không phải native mobile app.

## Viewport prototype chuẩn

| Loại | Kích thước |
|---|---:|
| Mobile chính | 390 × 844 |
| Mobile nhỏ | 360 × 800 |
| Tablet | 768 × 1024 |
| Desktop | 1440 × 1024 |

Prototype ảnh đầu tiên ưu tiên `390 × 844`.

Desktop vẫn dùng cùng flow nhưng layout thay đổi:

- Menu grid rộng hơn.
- Cart chuyển thành sticky right rail.
- Product detail chuyển từ bottom sheet sang dialog/side panel.
- Customer content không kéo giãn như admin dashboard.

---

# 2. Canonical customer context

Toàn bộ screen dùng chung dữ liệu sau.

## Cafe

```yaml
brand: cafe-connect
table_name: Bàn 5
table_capacity: 4
qr_token: demo-table-5
session_code: A7K2QX
session_status: open
```

## URL canonical

```text
https://demo.cafe-connect.vn/t/demo-table-5
```

## Customer identity

Khách không đăng nhập.

```yaml
customer_type: anonymous
device: mobile browser
locale: vi-VN
timezone: Asia/Ho_Chi_Minh
currency: VND
```

## Menu canonical

| ID | Tên | Giá |
|---:|---|---:|
| 101 | Cà phê đen đá | 29.000đ |
| 102 | Cà phê sữa đá | 35.000đ |
| 103 | Bạc xỉu đá | 35.000đ |
| 104 | Cà phê muối | 39.000đ |
| 201 | Trà đào cam sả | 45.000đ |
| 202 | Trà sen vàng | 42.000đ |
| 301 | Croissant bơ | 32.000đ |
| 302 | Tiramisu | 45.000đ |

## Canonical assets

```text
M101 coffee-black-iced.webp
M102 coffee-milk-iced.webp
M103 bac-xiu-iced.webp
M104 salted-coffee.webp
M201 peach-orange-lemongrass-tea.webp
M202 golden-lotus-tea.webp
M301 butter-croissant.webp
M302 tiramisu.webp
H001 customer-menu-hero.webp
I101 empty-cart.webp
I102 order-placed.webp
I103 session-expired.webp
P101 payment-pending.webp
P102 payment-success.webp
P103 payment-failed.webp
```

---

# 3. Canonical order data

## Order 1

```yaml
order_id: 15              # hiển thị dạng #015
created_at: 2026-07-22T13:15:00+07:00
status: received
items:
  - menu_item_id: 101
    name: Cà phê đen đá
    quantity: 1
    unit_price: 29000
    options:
      - Ít đá
      - Không đường
    note: null
    status: pending

  - menu_item_id: 102
    name: Cà phê sữa đá
    quantity: 1
    unit_price: 35000
    options:
      - Bình thường
      - Ít ngọt
    note: null
    status: pending

  - menu_item_id: 103
    name: Bạc xỉu đá
    quantity: 1
    unit_price: 35000
    options:
      - Bình thường
      - Ít đá
    note: null
    status: pending
```

Total:

```text
99.000đ
```

## Order 2 — gọi thêm

```yaml
order_id: 21              # hiển thị dạng #021
created_at: 2026-07-22T13:28:00+07:00
status: received
items:
  - menu_item_id: 301
    name: Croissant bơ
    quantity: 1
    unit_price: 32000
    options: []
    note: Hâm nóng giúp mình
    status: pending
```

Dining session total after second order:

```text
131.000đ
```

---

# 4. Customer flow overview

```text
C01 QR Entry
→ C02 Session Loading
→ C03 Menu Home
→ C04 Category Browse
→ C05 Product Detail
→ C06 Product Validation
→ C07 Added to Cart
→ C08 Cart
→ C09 Order Review
→ C10 Order Submitting
→ C11 Order Success
→ C12 Order Tracking
→ C13 Item Preparing
→ C14 Item Ready
→ C15 Item Served
→ C16 Add More Items
→ C17 Staff Call
→ C18 Bill Request
→ C19 Payment Method
→ C20 VNPay Redirect
→ C21 Payment Pending
→ C22 Payment Success
→ C23 Session Closed
```

Các nhánh lỗi:

```text
E01 Invalid QR
E02 Session Expired
E03 Menu Load Error
E04 Item Became Unavailable
E05 Order Submit Error
E06 Offline/Reconnecting
E07 Payment Failed
E08 Payment Cancelled
```

---

# 5. Screen inventory

| ID | Screen | Route |
|---|---|---|
| C01 | QR Entry | `/t/:qrToken` |
| C02 | Session Loading | `/t/:qrToken` |
| C03 | Menu Home | `/t/:qrToken/menu` |
| C04 | Category Browse | `/t/:qrToken/menu?category=` |
| C05 | Product Detail | overlay trên menu |
| C06 | Product Validation | overlay state |
| C07 | Added to Cart | toast + sticky state |
| C08 | Cart | `/t/:qrToken/cart` hoặc sheet |
| C09 | Order Review | `/t/:qrToken/cart/review` |
| C10 | Order Submitting | same route state |
| C11 | Order Success | `/t/:qrToken/order-success/:orderId` |
| C12 | Order Tracking | `/t/:qrToken/orders` |
| C13 | Item Preparing | tracking state |
| C14 | Item Ready | tracking state |
| C15 | Item Served | tracking state |
| C16 | Add More Items | `/t/:qrToken/menu` |
| C17 | Staff Call | overlay/toast state |
| C18 | Bill Request | overlay/confirm |
| C19 | Payment Method | `/t/:qrToken/payment` |
| C20 | VNPay Redirect | external |
| C21 | Payment Pending | `/payment/return` |
| C22 | Payment Success | `/payment/success` |
| C23 | Session Closed | `/t/:qrToken/closed` |

---

# 6. Detailed screens

# C01 — QR Entry

## Purpose

Khách vừa quét QR và mở URL của bàn.

## Route

```text
/t/demo-table-5
```

## Viewport

```text
390 × 844
```

## UI

- Minimal browser-like web screen.
- Logo B001.
- Text: `Đang kết nối với Bàn 5`.
- Spinner hoặc skeleton ngắn.
- Background kem sáng.
- Không cần hero.

## Components

- CustomerShell
- Logo
- Spinner
- Inline status

## API

```http
POST /api/sessions
{
  "qr_token": "demo-table-5"
}
```

## Success

Trả:

```json
{
  "code": "A7K2QX",
  "table_name": "Bàn 5",
  "status": "open"
}
```

## Next

- Success → C02
- Invalid QR → E01

---

# C02 — Session Loading

## Purpose

Khởi tạo hoặc gắn khách vào dining session hiện tại.

## UI

- Logo.
- Table badge `Bàn 5`.
- Loading copy:
  - `Đang chuẩn bị menu cho bạn`
  - `Chỉ mất vài giây`
- Skeleton nhẹ.

## Business behavior

Nếu bàn đã có session open thì trả session hiện tại.

Nếu chưa có thì tạo session mới.

Không cho tạo nhiều session open cho cùng một bàn.

## Next

- Success → C03
- Expired/invalid session → E02
- Network error → E06

---

# C03 — Menu Home

## Purpose

Màn hình chính sau khi vào bàn.

## Route

```text
/t/demo-table-5/menu
```

## UI anatomy

1. CustomerHeader
2. Bàn 5 badge
3. H001 MenuHero
4. CategoryTabs
5. Menu grid
6. StickyCustomerActions

## Header

```text
cafe-connect
Bàn 5
Theo dõi đơn
```

## Hero copy

```text
Chào bạn tại Bàn 5
Chọn món yêu thích, quầy pha chế sẽ nhận đơn ngay.
```

## Categories

```text
Cà phê
Trà
Bánh
Đá xay
Nước ép
```

## Product cards visible initially

- M101 Cà phê đen đá
- M102 Cà phê sữa đá
- M103 Bạc xỉu đá
- M104 Cà phê muối

## Sticky actions state

```yaml
cart_count: 0
cart_total: 0
call_staff: enabled
payment: disabled
```

## API

```http
GET /api/menu
GET /api/sessions/A7K2QX
```

## Events

```text
SessionClosed
```

## Next

- Tap product → C05
- Tap category → C04
- Tap cart → C08
- Tap track order → C12
- Tap call staff → C17
- Tap payment → disabled until valid

---

# C04 — Category Browse

## Purpose

Khách xem danh sách món theo category.

## Example state

```text
Category active: Trà
```

## Visible items

- M201 Trà đào cam sả
- M202 Trà sen vàng

## Behavior

- Active tab sticky.
- Scroll state cập nhật tab.
- Search không bắt buộc MVP.
- Hết hàng phải dim + badge.

## Responsive

Mobile:

- 2-column grid.
- Nếu màn quá hẹp, dùng horizontal card.

Desktop:

- 3–4 columns.
- Cart rail bên phải.

## Next

- Tap item → C05
- Scroll/category change → C04 state khác
- Cart → C08

---

# C05 — Product Detail

## Example product

```text
Cà phê sữa đá
```

## Asset

```text
M102
```

## Presentation

Mobile:

- Bottom sheet.
- Max 90vh.
- Sticky CTA.

Desktop:

- Dialog hoặc side panel.

## Content

```text
Cà phê sữa đá
35.000đ
Cà phê pha phin đậm vị, kết hợp sữa đặc và đá.
```

## Option groups

### Mức đường

```yaml
type: single
required: true
min_select: 1
max_select: 1
options:
  - Không đường
  - Ít ngọt
  - Bình thường
```

### Mức đá

```yaml
type: single
required: true
options:
  - Không đá
  - Ít đá
  - Bình thường
```

### Topping

```yaml
type: multi
required: false
max_select: 3
options:
  - Kem muối +8.000đ
  - Trân châu trắng +7.000đ
```

## Other controls

- QuantityStepper.
- Note textarea.
- Total dynamic.

## Default selected fixture

```yaml
sugar: Ít ngọt
ice: Bình thường
quantity: 1
note: null
total: 35000
```

## CTA

```text
Thêm vào giỏ · 35.000đ
```

## Next

- Invalid options → C06
- Valid add → C07
- Close → C03/C04

---

# C06 — Product Validation

## Purpose

Hiển thị lỗi khi option bắt buộc chưa chọn hoặc vượt max.

## Example

```text
Vui lòng chọn mức đường
```

Hoặc:

```text
Bạn chỉ có thể chọn tối đa 3 topping
```

## UI behavior

- Inline error dưới group.
- Scroll/focus group lỗi đầu tiên.
- CTA không biến mất.
- Không dùng toast thay cho field error.

## Next

- Correct options → C05 valid state
- Add → C07

---

# C07 — Added to Cart

## Purpose

Phản hồi ngay khi thêm món.

## UI

- Product detail đóng.
- Toast success:

```text
Đã thêm Cà phê sữa đá
```

- Sticky cart bar update:

```text
1 món
35.000đ
Xem giỏ
```

## State after canonical selections

Sau khi thêm ba món:

```yaml
cart_count: 3
cart_total: 99000
```

## Next

- Continue browsing → C03/C04
- View cart → C08

---

# C08 — Cart

## Purpose

Xem và chỉnh giỏ trước khi order.

## Route

```text
/t/demo-table-5/cart
```

## UI items

### Item 1

```text
Cà phê đen đá
Ít đá · Không đường
1 × 29.000đ
```

### Item 2

```text
Cà phê sữa đá
Bình thường · Ít ngọt
1 × 35.000đ
```

### Item 3

```text
Bạc xỉu đá
Bình thường · Ít đá
1 × 35.000đ
```

## Summary

```text
Tạm tính: 99.000đ
Tổng cộng: 99.000đ
```

## CTA

```text
Tiếp tục
```

## Secondary action

```text
Thêm món
```

## Components

- CustomerHeader
- CartItem
- QuantityStepper
- CartSummary
- Button
- ConfirmationDialog remove

## Edge states

- Empty cart → I101
- Quantity changed
- Remove item
- Item became unavailable → E04

## Next

- Continue → C09
- Add more → C16
- Edit item → C05 edit mode

---

# C09 — Order Review

## Purpose

Xác nhận cuối trước khi gửi order.

## UI

- Bàn 5.
- 3 món.
- Total 99.000đ.
- Optional order note.

## Copy

```text
Kiểm tra lại đơn của bạn
Sau khi gửi, quầy pha chế sẽ nhận đơn ngay.
```

## CTA

```text
Gọi món · 99.000đ
```

## Secondary

```text
Quay lại giỏ
```

## Business rules

- Session phải open.
- Item vẫn available.
- Option vẫn hợp lệ.
- Total tính từ backend snapshot, không tin frontend.

## API

```http
POST /api/sessions/A7K2QX/orders
```

Payload:

```json
{
  "items": [
    {
      "menu_item_id": 101,
      "quantity": 1,
      "options": [],
      "note": "Ít đá, không đường"
    },
    {
      "menu_item_id": 102,
      "quantity": 1,
      "options": [],
      "note": "Bình thường, ít ngọt"
    },
    {
      "menu_item_id": 103,
      "quantity": 1,
      "options": [],
      "note": "Bình thường, ít đá"
    }
  ],
  "note": null
}
```

## Next

- Submit → C10
- Backend item unavailable → E04
- API error → E05

---

# C10 — Order Submitting

## Purpose

Khóa double submit và thể hiện trạng thái đang gửi.

## UI

- CTA loading.
- Copy:

```text
Đang gửi đơn đến quầy pha chế...
```

## Behavior

- Disable back action trong lúc transaction ngắn.
- Idempotency nếu backend hỗ trợ.
- Không reset cart trước khi server success.

## Next

- Success → C11
- Failure → E05

---

# C11 — Order Success

## Purpose

Xác nhận đơn đã được nhận.

## Asset

```text
I102
```

## Content

```text
Quầy pha chế đã nhận đơn
Mã đơn: #015
3 món · 99.000đ
```

## CTA

Primary:

```text
Theo dõi đơn
```

Secondary:

```text
Gọi thêm món
```

## Behavior

- Clear cart after success.
- Keep session.
- Subscribe realtime channel.

## Event

Order được broadcast sang KDS/Admin.

## Next

- Track → C12
- Add more → C16

---

# C12 — Order Tracking

## Purpose

Theo dõi toàn bộ order trong dining session.

## Route

```text
/t/demo-table-5/orders
```

## UI anatomy

1. Header.
2. SessionSummaryCard.
3. Realtime connection state.
4. Order group.
5. CustomerOrderItem list.
6. Sticky actions.

## Initial state

Order `#015`

Tất cả item:

```text
Đã nhận
```

## Total

```text
99.000đ
```

## Realtime channel

```text
session.A7K2QX
```

## Events

```text
OrderItemStatusUpdated
SessionClosed
```

## Fallback

```http
GET /api/sessions/A7K2QX/orders
```

## Next

- Item update → C13/C14/C15
- Add more → C16
- Call staff → C17
- Request bill → C18

---

# C13 — Item Preparing

## Purpose

Realtime state sau khi barista bắt đầu làm.

## UI update

Ví dụ:

```text
Cà phê sữa đá
Đang làm
Cập nhật lúc 13:17
```

Các món khác có thể vẫn `Đã nhận`.

## Visual

- Warning badge.
- Timeline current step.
- Subtle transition.
- Không reload page.

## Event payload

Phải đủ để update đúng item.

## Next

- Ready → C14
- Cancelled → cancelled state
- Offline → E06

---

# C14 — Item Ready

## Purpose

Thông báo món đã sẵn sàng.

## UI

```text
Bạc xỉu đá
Sẵn sàng
Quầy pha chế đang chuẩn bị mang ra.
```

## Visual

- Success badge.
- Optional subtle highlight.
- Không dùng animation quá mạnh.

## Next

- Served → C15

---

# C15 — Item Served

## Purpose

Món đã phục vụ.

## UI

```text
Cà phê đen đá
Đã phục vụ
```

## Behavior

- Timeline hoàn tất.
- Item vẫn giữ trong lịch sử session.
- Không biến mất khỏi tracking.

## Session state

Khi tất cả served:

```text
Đơn đã hoàn tất
```

Nhưng session vẫn open cho gọi thêm.

## Next

- Add more → C16
- Bill request → C18

---

# C16 — Add More Items

## Purpose

Khách quay lại menu trong cùng session.

## Route

```text
/t/demo-table-5/menu
```

## UI

- Header giữ `Bàn 5`.
- Có shortcut `Đơn của bạn`.
- Cart mới độc lập.
- Session total hiện tại 99.000đ.

## Canonical added item

```text
Croissant bơ
1 × 32.000đ
Ghi chú: Hâm nóng giúp mình
```

## New order

```text
#021
```

## Updated session total

```text
131.000đ
```

## Next

Đi lại C05 → C11 cho order thứ hai.

Sau success quay C12, hiển thị 2 order group.

---

# C17 — Staff Call

## Purpose

Khách gọi phục vụ.

## Trigger

Sticky action:

```text
Gọi phục vụ
```

## Confirm overlay

```text
Gọi phục vụ đến Bàn 5?
```

Primary:

```text
Gọi ngay
```

## API

```http
POST /api/sessions/A7K2QX/call-staff
```

## Success state

Toast:

```text
Đã gọi phục vụ
Nhân viên sẽ đến Bàn 5 sớm nhất có thể.
```

Button state:

```text
Đã gọi
```

## Business rules

- Cooldown để tránh spam.
- Pending request indicator.
- Không tạo hàng loạt request trùng.

## Realtime

Broadcast:

```text
StaffCalled
```

## Next

- Stay current screen.
- Staff acknowledges nếu có future event thì update optional.

---

# C18 — Bill Request

## Purpose

Khách yêu cầu thanh toán.

## Trigger

```text
Thanh toán
```

## Preconditions

- Session open.
- Có order.
- Có total > 0.

## Confirm

```text
Yêu cầu thanh toán 131.000đ?
Bạn vẫn có thể chọn thanh toán online hoặc tại quầy.
```

## API

```http
POST /api/sessions/A7K2QX/request-bill
```

## Success

- Broadcast BillRequested.
- Button state `Đã yêu cầu`.
- Navigate C19 hoặc hiện chọn method.

## Next

- Choose method → C19
- Stay tracking with request pending

---

# C19 — Payment Method

## Purpose

Chọn phương thức thanh toán.

## Route

```text
/t/demo-table-5/payment
```

## Amount

```text
131.000đ
```

## Options

### Tiền mặt tại quầy

```text
Nhân viên sẽ xác nhận thanh toán.
```

### Chuyển khoản tại quầy

```text
Nhân viên cung cấp thông tin chuyển khoản.
```

### VNPay

```text
Thanh toán online qua VNPay sandbox.
```

## UI

- PaymentMethodCard.
- Session summary.
- Amount sticky/clear.
- CTA dynamic.

## Canonical selected method

```text
VNPay
```

## CTA

```text
Thanh toán 131.000đ
```

## API

```http
POST /api/sessions/A7K2QX/checkout
{
  "gateway": "vnpay"
}
```

## Next

- VNPay → C20
- Cash/transfer → pending staff confirmation state
- API error → E07

---

# C20 — VNPay Redirect

## Purpose

Chuyển sang VNPay sandbox.

## UI before redirect

```text
Đang chuyển đến VNPay...
```

- Spinner.
- Payment amount.
- Safe messaging.

## Behavior

- Use returned checkout URL.
- External page not generated as cafe-connect UI.
- Prototype có thể biểu diễn một transitional frame riêng.

## Next

- Return → C21
- Cancel → E08

---

# C21 — Payment Pending

## Purpose

Khách quay lại app, chờ backend verify.

## Route

```text
/payment/return
```

## Asset

```text
P101
```

## Content

```text
Đang xác nhận thanh toán
Số tiền: 131.000đ
```

## Behavior

- Poll payment status hoặc chờ event.
- Return URL không phải nguồn tin cậy cuối cùng.
- Webhook là nguồn chốt paid.

## Next

- Paid → C22
- Failed → E07
- Timeout → show retry/status check

---

# C22 — Payment Success

## Purpose

Xác nhận thanh toán thành công.

## Asset

```text
P102
```

## Content

```text
Thanh toán thành công
131.000đ
Mã giao dịch: VNP-240722-845921
```

## CTA

```text
Xem lại đơn
```

Secondary:

```text
Hoàn tất
```

## Business effect

- Payment paid.
- Session closes.
- Table returns available.
- SessionClosed broadcast.

## Next

- C23

---

# C23 — Session Closed

## Purpose

Kết thúc flow.

## Route

```text
/t/demo-table-5/closed
```

## UI

```text
Cảm ơn bạn đã ghé cafe-connect
Phiên tại Bàn 5 đã kết thúc.
```

## Summary

```text
2 lần gọi món
4 món
Tổng thanh toán: 131.000đ
```

## Actions

Primary:

```text
Xem hóa đơn
```

Secondary:

```text
Quay lại trang chính
```

## Rules

- Không cho order thêm.
- Không cho reuse session code như active.
- QR có thể mở session mới cho lượt khách tiếp theo.

---

# 7. Error and edge screens

# E01 — Invalid QR

## UI

```text
Mã QR không hợp lệ
Vui lòng quét lại mã QR được đặt trên bàn.
```

Actions:

- Thử lại.
- Báo nhân viên.

---

# E02 — Session Expired

## Asset

```text
I103
```

## UI

```text
Phiên bàn đã kết thúc
Quét lại mã QR trên bàn để bắt đầu phiên mới.
```

---

# E03 — Menu Load Error

## UI

```text
Không tải được menu
Kiểm tra kết nối và thử lại.
```

Actions:

- Thử lại.
- Call staff nếu session đã có.

---

# E04 — Item Became Unavailable

## Trigger

Món vừa hết sau khi khách thêm vào cart.

## UI

Inline alert:

```text
Cà phê muối vừa hết
Món đã được bỏ khỏi đơn. Vui lòng chọn món khác.
```

## Behavior

- Update cart.
- Recalculate total.
- Preserve other items.
- Không xóa toàn cart.

---

# E05 — Order Submit Error

## UI

```text
Chưa gửi được đơn
Đơn của bạn vẫn được giữ trong giỏ.
```

Actions:

- Thử lại.
- Quay lại giỏ.

---

# E06 — Offline / Reconnecting

## UI

StatusBanner:

```text
Mất kết nối
Đang thử kết nối lại...
```

## Behavior

- Cart local vẫn giữ.
- Không cho submit khi offline.
- Tracking giữ dữ liệu cuối cùng.
- Reconnect rồi sync/fetch fallback.

---

# E07 — Payment Failed

## Asset

```text
P103
```

## UI

```text
Thanh toán chưa thành công
Bạn chưa bị ghi nhận thanh toán.
```

Actions:

- Thử lại.
- Chọn phương thức khác.
- Gọi nhân viên.

---

# E08 — Payment Cancelled

## UI

```text
Bạn đã hủy thanh toán
Đơn và phiên bàn vẫn được giữ nguyên.
```

Actions:

- Thanh toán lại.
- Quay về đơn.

---

# 8. Prototype generation order

Mỗi screen phải là một ảnh riêng.

## Batch CUST-A — Core ordering

1. C01 QR Entry
2. C02 Session Loading
3. C03 Menu Home
4. C04 Category Browse
5. C05 Product Detail
6. C06 Product Validation
7. C07 Added to Cart
8. C08 Cart
9. C09 Order Review
10. C10 Order Submitting
11. C11 Order Success

## Batch CUST-B — Tracking and realtime

12. C12 Order Tracking
13. C13 Item Preparing
14. C14 Item Ready
15. C15 Item Served
16. C16 Add More Items
17. C17 Staff Call
18. C18 Bill Request

## Batch CUST-C — Payment

19. C19 Payment Method
20. C20 VNPay Redirect
21. C21 Payment Pending
22. C22 Payment Success
23. C23 Session Closed

## Batch CUST-D — Errors

24. E01 Invalid QR
25. E02 Session Expired
26. E03 Menu Load Error
27. E04 Item Unavailable
28. E05 Order Submit Error
29. E06 Offline
30. E07 Payment Failed
31. E08 Payment Cancelled

---

# 9. Screen spec contract

Mỗi screen output phải có file spec đi kèm.

Ví dụ:

```yaml
screen_id: C03
screen_name: Customer Menu Home
actor: customer
route: /t/demo-table-5/menu
viewport: 390x844
previous: C02
next:
  product_open: C05
  cart_open: C08
  tracking_open: C12

assets:
  - B001
  - H001
  - M101
  - M102
  - M103
  - M104

components:
  - CustomerShell
  - CustomerHeader
  - MenuHero
  - CategoryTabs
  - MenuItemCard
  - StickyCustomerActions

api:
  - GET /api/menu
  - GET /api/sessions/A7K2QX

events:
  - SessionClosed
```

---

# 10. Consistency checklist

Trước khi approve mỗi screen:

## Data

- Bàn luôn là Bàn 5.
- Session code luôn A7K2QX.
- Giá đúng canonical.
- Tên món đúng.
- Order code đúng theo flow.
- Total đúng:
  - order 1: 99.000đ
  - session after order 2: 131.000đ

## Asset

- Dùng đúng M-ID.
- Không regenerate ảnh món.
- Product detail và card cùng asset.
- Hero chỉ dùng H001.
- Payment state dùng đúng P101/P102/P103.

## UI

- Một ảnh chỉ có một screen.
- Không gộp mobile và desktop.
- Customer rõ là web mobile-first.
- Không có bottom tab native app trừ khi được định nghĩa rõ.
- Header/spacing/radius/colors khớp Step 01.
- Component khớp Step 02.

## Business

- Không thanh toán khi chưa có order.
- Session open cho gọi thêm.
- Served không đồng nghĩa session closed.
- Payment paid mới close session.
- Realtime item state đúng state machine.
- Cancelled không đi tiếp sang served.

---

# 11. API and event matrix

| Screen | API | Event |
|---|---|---|
| C01–C02 | POST sessions | — |
| C03–C04 | GET menu, GET session | SessionClosed |
| C05–C08 | local cart | menu availability refresh |
| C09–C11 | POST order | OrderPlaced outbound |
| C12–C15 | GET orders fallback | OrderItemStatusUpdated |
| C17 | POST call-staff | StaffCalled outbound |
| C18 | POST request-bill | BillRequested outbound |
| C19–C22 | POST checkout, return/status | payment/session events |
| C23 | GET session summary | SessionClosed |

---

# 12. Responsive behavior

## Mobile

- Bottom sheet cho product.
- Sticky cart/action area.
- 2-column menu grid.
- Single-column cart.
- Payment method cards full width.

## Tablet

- Menu 2–3 columns.
- Product detail dialog/sheet.
- Cart có thể side sheet.
- Tracking rộng hơn.

## Desktop

Layout:

```text
Main menu content | Sticky cart/session rail
```

- Header centered.
- Category tabs sticky.
- Product dialog center.
- Không sử dụng sidebar admin.
- Không biến thành landing page.

---

# 13. Accessibility checklist

- Touch target ≥44px.
- Label rõ.
- Status không chỉ dùng màu.
- Focus visible.
- Bottom sheet trap focus.
- Dialog có Escape.
- Realtime update dùng live region phù hợp.
- Toast không che CTA.
- Payment error đọc được bằng screen reader.
- Form option group có legend/label.

---

# 14. Customer flow acceptance criteria

Step 04 hoàn thành khi:

- Flow đủ từ QR đến session closed.
- Có màn cho menu, detail, cart, order, tracking, gọi thêm, staff call, bill request và payment.
- Có error/edge states chính.
- Mỗi screen có route/purpose/component/API/event.
- Canonical data không mâu thuẫn.
- Total giữ đúng xuyên suốt.
- Asset mapping rõ.
- Responsive behavior rõ.
- Prototype generation order rõ.
- Có screen spec contract.
- Có consistency checklist.
- Có thể bắt đầu generate từng screen mà không cần tự nghĩ thêm flow.
