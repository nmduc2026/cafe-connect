# 05 — Admin Flow: cafe-connect

> **Phụ thuộc:** `01_design_system.md`, `02_component_library.md`, `03_asset_library.md`, `04_customer_flow.md`
>
> **Phạm vi:** Toàn bộ flow phía Admin trên responsive desktop web.
>
> **Mục tiêu:** Xác định đầy đủ từng màn hình quản trị, nghiệp vụ CRUD, permission, state và liên kết dữ liệu để làm prototype nhất quán và đủ cơ sở triển khai Vue 3.

---

# 1. Product surface

Admin là **desktop-first responsive web**, không phải mobile app.

## Viewport prototype chuẩn

| Loại | Kích thước |
|---|---:|
| Desktop chính | 1440 × 1024 |
| Laptop nhỏ | 1280 × 800 |
| Tablet ngang | 1024 × 768 |
| Mobile fallback | 390 × 844 |

Prototype ưu tiên `1440 × 1024`.

## Layout chính

```text
AdminSidebar 248px
+
AdminHeader
+
Main content
```

Tablet:

- Sidebar collapsed hoặc drawer.
- Table có thể scroll ngang.
- Form chuyển một cột.

Mobile fallback:

- List/table chuyển card.
- Sidebar thành drawer.
- Chỉ hỗ trợ tác vụ thiết yếu.

---

# 2. Canonical admin context

## User

```yaml
name: Nguyễn Minh Đức
email: admin@demo.com
role: admin
permissions:
  - menu.manage
  - table.manage
  - order.view
  - order.update
  - session.close
  - payment.record
  - report.view
  - user.manage
```

> Đúng bộ permission mà `phase-02-auth.md` gán cho role `admin` (admin có **tất cả**). Sidebar và hành động render theo `auth.can(...)`; role `staff` dùng cùng `AdminLayout` nhưng chỉ có `order.view`, `order.update`, `session.close`, `payment.record` — xem `06_staff_flow.md`.

## Cafe

```yaml
brand: cafe-connect
tenant_mode: single_tenant_mvp
timezone: Asia/Ho_Chi_Minh
currency: VND
```

## Canonical menu data

| ID | Tên | Giá | Category | Availability |
|---:|---|---:|---|---|
| 101 | Cà phê đen đá | 29.000đ | Cà phê | Còn hàng |
| 102 | Cà phê sữa đá | 35.000đ | Cà phê | Còn hàng |
| 103 | Bạc xỉu đá | 35.000đ | Cà phê | Còn hàng |
| 104 | Cà phê muối | 39.000đ | Cà phê | Còn hàng |
| 201 | Trà đào cam sả | 45.000đ | Trà | Còn hàng |
| 202 | Trà sen vàng | 42.000đ | Trà | Hết hàng |
| 301 | Croissant bơ | 32.000đ | Bánh | Còn hàng |
| 302 | Tiramisu | 45.000đ | Bánh | Còn hàng |

## Canonical categories

| ID | Tên | Sort | Active |
|---:|---|---:|---|
| 1 | Cà phê | 1 | Yes |
| 2 | Trà | 2 | Yes |
| 3 | Bánh | 3 | Yes |
| 4 | Đá xay | 4 | Yes |
| 5 | Nước ép | 5 | Yes |
| 6 | Topping | 6 | Yes |

## Canonical tables

| ID | Tên | Sức chứa | Trạng thái | QR |
|---:|---|---:|---|---|
| 1 | Bàn 1 | 2 | Trống | Có |
| 2 | Bàn 2 | 4 | Trống | Có |
| 3 | Bàn 3 | 4 | Đang dùng | Có |
| 4 | Bàn 4 | 6 | Trống | Chưa sinh |
| 5 | Bàn 5 | 4 | Đang dùng | Có |
| 6 | Bàn 6 | 2 | Trống | Có |

## Canonical live session

```yaml
table: Bàn 5
session_code: A7K2QX
opened_at: 2026-07-22T13:10:00+07:00
orders:
  - #015
  - #021
total: 131000
payment_status: unpaid
session_status: open
```

---

# 3. Admin navigation

```text
Tổng quan
Menu
  - Danh mục
  - Món
  - Nhóm tùy chọn
Bàn & QR
Đơn hàng
Báo cáo
Nhân viên
```

## Permission behavior

- Không có permission thì ẩn item khỏi sidebar.
- Nếu truy cập URL trực tiếp và backend trả 403 → PermissionDeniedState.
- Không chỉ disable menu item.
- Header user menu luôn có profile/logout.

---

# 4. Admin flow overview

```text
A01 Login
→ A02 Login Loading
→ A03 Dashboard

Menu module:
A10 Category List
A11 Create Category
A12 Edit Category
A13 Delete Category Confirm
A14 Category Empty/Error/Permission
A20 Menu Item List
A21 Create Menu Item
A22 Edit Menu Item
A23 Delete Menu Item Confirm
A24 Availability Toggle
A25 Upload Image
A26 Option Group Editor
A27 Copy Option Group
A28 Menu Item Preview
A29 Menu Error/Validation/Permission

Tables module:
A30 Table List
A31 Create Table
A32 Edit Table
A33 Delete Table Confirm
A34 QR Preview
A35 Generate QR
A36 Regenerate QR Confirm
A37 Download/Print QR
A38 Table Error/Permission

Orders module:
A40 Live Orders
A41 Order Detail
A42 Session Detail
A43 Confirm Cash Payment
A44 Confirm Bank Transfer
A45 Close Session
A46 Order History
A47 Order Filter/Export
A48 Order Error/Permission

Reports:
A50 Reports Overview
A51 Revenue Detail
A52 Top Items
A53 Peak Hours
A54 Average Session Value
A55 Report Empty/Error

Users:
A60 Staff List
A61 Create Staff
A62 Edit Staff
A63 Change Role/Permission
A64 Disable Staff
A65 Delete Staff Confirm
A66 Staff Error/Permission

Global:
A70 Notifications
A71 Profile
A72 Logout
A73 Session Expired
A74 Permission Denied
A75 Not Found
```

---

# 5. Screen inventory

| ID | Screen | Route |
|---|---|---|
| A01 | Login | `/admin/login` |
| A02 | Login loading | same |
| A03 | Dashboard | `/admin` |
| A10 | Category list | `/admin/menu/categories` |
| A11 | Create category | dialog/drawer |
| A12 | Edit category | dialog/drawer |
| A13 | Delete category | confirm |
| A20 | Menu item list | `/admin/menu/items` |
| A21 | Create menu item | `/admin/menu/items/create` |
| A22 | Edit menu item | `/admin/menu/items/:id/edit` |
| A23 | Delete menu item | confirm |
| A24 | Availability toggle | inline state |
| A25 | Upload image | form section |
| A26 | Option group editor | form section |
| A27 | Copy option group | dialog |
| A28 | Menu item preview | right rail/dialog |
| A30 | Table list | `/admin/tables` |
| A31 | Create table | dialog |
| A32 | Edit table | dialog |
| A33 | Delete table | confirm |
| A34 | QR preview | drawer/dialog |
| A35 | Generate QR | action state |
| A36 | Regenerate QR | confirm |
| A37 | Download/print QR | action |
| A40 | Live orders | `/admin/orders/live` |
| A41 | Order detail | `/admin/orders/:id` |
| A42 | Session detail | `/admin/sessions/:code` |
| A43 | Cash payment | drawer/dialog |
| A44 | Bank transfer | drawer/dialog |
| A45 | Close session | confirm |
| A46 | Order history | `/admin/orders/history` |
| A50 | Reports overview | `/admin/reports` |
| A51 | Revenue detail | `/admin/reports/revenue` |
| A52 | Top items | `/admin/reports/top-items` |
| A53 | Peak hours | `/admin/reports/peak-hours` |
| A60 | Staff list | `/admin/users` |
| A61 | Create staff | `/admin/users/create` |
| A62 | Edit staff | `/admin/users/:id/edit` |

---

# 6. Authentication and global screens

# A01 — Admin Login

## Purpose

Đăng nhập cho Admin/Staff/Barista.

## Route

```text
/admin/login
```

## Viewport

```text
1440 × 1024
```

## Layout

Desktop split layout:

```text
Left visual panel H002
Right login card
```

## Assets

- B001 horizontal logo.
- H002 admin-login-cafe-counter.webp.

## Form

```text
Email
Mật khẩu
Ghi nhớ đăng nhập
Đăng nhập
```

Secondary:

```text
Điền tài khoản demo
```

## Canonical demo credentials

```text
admin@demo.com
password
```

## Components

- Logo
- FormField
- Input
- PasswordInput
- Checkbox
- Button
- InlineAlert
- Toast

## API

```http
POST /api/auth/login
```

## States

- Default.
- Filled demo.
- Validation error.
- Wrong credentials.
- Loading.
- Network error.

## Next

- Success → A03
- Wrong credentials → stay A01

---

# A02 — Login Loading

## UI

- Submit button loading.
- Form disabled.
- Copy:

```text
Đang đăng nhập...
```

## Rules

- Prevent double submit.
- Token chỉ lưu theo auth strategy đã chọn.
- Sau login fetch `/auth/me`.

---

# A03 — Dashboard

## Purpose

Tổng quan hoạt động quán theo thời gian thực.

## Route

```text
/admin
```

## Layout anatomy

1. AdminHeader.
2. PageHeader.
3. Date/status summary.
4. Metric cards.
5. Live orders panel.
6. Staff requests panel.
7. Revenue mini chart.
8. Quick actions.

## Canonical metrics

```yaml
revenue_today: 4850000
open_sessions: 6
orders_today: 128
average_session_value: 121250
```

## Quick actions

- Thêm món.
- Tạo bàn.
- Xem đơn live.
- Xem báo cáo.

## Live event

```text
OrderPlaced
OrderItemStatusUpdated
BillRequested
```

## Empty state

Nếu chưa có activity:

```text
Chưa có hoạt động hôm nay
```

## Next

Đi tới từng module.

---

# A70 — Notifications

## Types

- Order mới.
- Gọi phục vụ.
- Yêu cầu thanh toán.
- Payment failed.
- KDS disconnected optional.

## Behavior

- Notification drawer.
- Read/unread.
- Click mở entity liên quan.
- Realtime update.

---

# A71 — Profile

## Fields

- Tên.
- Email.
- Role.
- Change password optional.

MVP có thể chỉ read-only + logout.

---

# A72 — Logout

## Action

```http
POST /api/auth/logout
```

## Behavior

- Clear auth state.
- Redirect login.
- Token cũ blacklist.

---

# A73 — Session Expired

## UI

```text
Phiên đăng nhập đã hết hạn
Vui lòng đăng nhập lại để tiếp tục.
```

Actions:

- Đăng nhập lại.

---

# A74 — Permission Denied

## Asset

```text
I204
```

## UI

```text
Bạn không có quyền truy cập
```

Actions:

- Quay về Dashboard.

---

# A75 — Admin Not Found

```text
Không tìm thấy trang
```

Actions:

- Về Dashboard.

---

# 7. Menu — Category flow

# A10 — Category List

## Route

```text
/admin/menu/categories
```

## Purpose

Quản lý danh mục và thứ tự hiển thị.

## Page header

```text
Danh mục
Quản lý nhóm món và thứ tự hiển thị trên menu khách.
[Thêm danh mục]
```

## Table/list columns

- Drag handle.
- Tên danh mục.
- Số món.
- Thứ tự.
- Trạng thái.
- Cập nhật.
- Actions.

## Canonical rows

- Cà phê — 4 món.
- Trà — 2 món.
- Bánh — 2 món.
- Đá xay — 0 món.
- Nước ép — 0 món.
- Topping — 0 món.

## Interactions

- Reorder drag-drop.
- Toggle active.
- Edit.
- Delete.

## API

```http
GET /api/admin/categories
PATCH /api/admin/categories/:id
DELETE /api/admin/categories/:id
```

## States

- Loading row skeleton.
- Empty I201 adapted.
- Error.
- Optimistic reorder.
- Revert on error.
- Permission denied.

---

# A11 — Create Category

## Presentation

Small/medium dialog.

## Fields

```text
Tên danh mục *
Thứ tự
Trạng thái hoạt động
```

## Default

```yaml
sort_order: next_available
is_active: true
```

## Validation

- Name required.
- Max length.
- Sort integer.
- Duplicate name warning if backend enforces.

## API

```http
POST /api/admin/categories
```

## Success

- Close dialog.
- Insert row.
- Toast:

```text
Đã thêm danh mục
```

---

# A12 — Edit Category

## Fields

Pre-filled.

## Business behavior

- Đổi tên cập nhật menu khách sau cache invalidation.
- Tắt active ẩn category khỏi menu public.
- Không xóa item bên trong khi inactive.

## Success toast

```text
Đã cập nhật danh mục
```

---

# A13 — Delete Category Confirm

## Copy

```text
Xóa danh mục “Cà phê”?
Danh mục đang có 4 món.
```

## Rule

Nguồn tài liệu không chốt rõ cascade hay block delete.

Prototype phải chọn an toàn:

- Nếu category có item → chặn xóa.
- Yêu cầu chuyển/xóa các món trước.

## UI

```text
Không thể xóa danh mục đang có món.
```

Nếu empty:

- Confirm destructive.

---

# A14 — Category Error States

- Create validation error.
- Update conflict.
- Reorder failed.
- Delete blocked.
- API unavailable.
- Permission denied.

---

# 8. Menu — Item flow

# A20 — Menu Item List

## Route

```text
/admin/menu/items
```

## Page header

```text
Món
Quản lý món, giá bán, ảnh và trạng thái còn hàng.
[Thêm món]
```

## FilterBar

- Search.
- Category.
- Availability.
- Reset.
- Result count.

## Table columns

- Thumbnail.
- Tên.
- Danh mục.
- Giá.
- Còn hàng.
- Nhóm tùy chọn.
- Cập nhật.
- Actions.

## Canonical rows

Dùng M101–M302.

## Actions

- Edit.
- Duplicate optional.
- Preview.
- Delete.
- Availability toggle.

## API

```http
GET /api/admin/menu-items
```

## States

- Loading.
- Populated.
- Empty.
- Filter no result.
- Error.
- Permission denied.

---

# A21 — Create Menu Item

## Route

```text
/admin/menu/items/create
```

## Layout

Desktop:

```text
Main form 8 cols
Preview rail 4 cols
```

## Sections

### 1. Basic information

- Name.
- Description.
- Category.

### 2. Pricing

- Base price.
- Price preview formatted.

### 3. Image

- ImageUploader.
- 1:1 preview.

### 4. Availability

- Is available.
- Sort order.

### 5. Option groups

- Size.
- Sugar.
- Ice.
- Topping.

### 6. Customer preview

- MenuItemCard.
- Product detail preview.

## Canonical create fixture

```yaml
name: Cold Brew Cam
description: Cold brew dịu nhẹ kết hợp lát cam tươi.
category: Cà phê
price: 45000
is_available: true
```

## API

```http
POST /api/admin/menu-items
```

## Validation

- Category required.
- Name required.
- Price >= 0.
- Image format/size.
- Option group valid.
- Min/max selection valid.

## Success

- Redirect A20.
- Toast.
- Cache menu invalidated.

---

# A22 — Edit Menu Item

## Route

```text
/admin/menu/items/102/edit
```

## Canonical item

```text
Cà phê sữa đá
```

## Asset

```text
M102
```

## Behavior

- Load current item + nested option groups.
- Preview current image.
- Replace image.
- Remove old image only after save success.
- Preserve current asset if no replacement.
- Cache invalidation after update.

## CTA

```text
Lưu thay đổi
```

Secondary:

```text
Hủy
```

## Unsaved changes

Nếu rời page khi dirty:

```text
Bạn có thay đổi chưa lưu
```

Confirm leave.

---

# A23 — Delete Menu Item Confirm

## Copy

```text
Xóa món “Cà phê sữa đá”?
Món sẽ không còn xuất hiện trên menu khách.
```

## Business

Historical order dùng snapshot nên vẫn giữ đúng dữ liệu cũ.

## API

```http
DELETE /api/admin/menu-items/102
```

## Success

- Remove row.
- Toast.
- Cache invalidation.

---

# A24 — Availability Toggle

## Purpose

Bật/tắt hết hàng nhanh.

## Behavior

1. User toggles.
2. UI optimistic update.
3. API call.
4. Success toast subtle.
5. Failure revert + error toast.

## API

```http
PATCH /api/admin/menu-items/:id/availability
```

## Canonical example

```text
Trà sen vàng
Còn hàng → Hết hàng
```

## Customer effect

Món bị dim/disabled ở menu public ngay sau cache/event refresh.

---

# A25 — Upload Image

## States

- Empty.
- Preview.
- Drag over.
- Uploading.
- Invalid file.
- Replace.
- Remove.

## Rules

- Recommended 1:1.
- Preview local.
- Approved asset canonical dùng trong prototype.
- Không tạo ảnh random trong form.

---

# A26 — Option Group Editor

## Canonical structure

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
max_select: 1
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

## Actions

- Add group.
- Edit group.
- Reorder.
- Delete.
- Add option.
- Edit option.
- Delete option.
- Copy from another item.

## Validation

- Single max = 1.
- Required single min = 1.
- Multi max >= min.
- Option name required.
- Price delta >= 0 unless discounts supported later.

---

# A27 — Copy Option Group

## Dialog

```text
Sao chép nhóm tùy chọn
Chọn món nguồn
Chọn nhóm cần sao chép
```

## Canonical source

```text
Cà phê sữa đá
- Mức đường
- Mức đá
- Topping
```

## Behavior

- Copy creates new records.
- Không liên kết reference chung nếu source sửa sau.
- Preview before confirm.

---

# A28 — Menu Item Preview

## Presentation

Right rail hoặc dialog.

## Shows

- Product card.
- Product detail.
- Current image.
- Price.
- Option groups.
- Availability.

## Purpose

Admin xem gần giống Customer UI trước khi publish/save.

---

# A29 — Menu Error States

- 422 validation.
- Image upload failed.
- Optimistic availability failed.
- Copy option conflict.
- Permission denied.
- Not found.
- Network retry.
- Unsaved changes.

---

# 9. Tables & QR flow

# A30 — Table List

## Route

```text
/admin/tables
```

## Page header

```text
Bàn & mã QR
Quản lý bàn và mã QR để khách gọi món.
[Thêm bàn]
```

## Layout

Desktop card grid hoặc table.

Khuyến nghị card grid vì QR/status trực quan hơn.

## TableCard content

- Tên.
- Capacity.
- Status.
- Session code nếu occupied.
- QR status.
- Actions.

## Filters

- Search table.
- Status.
- QR generated.

## API

```http
GET /api/admin/tables
```

---

# A31 — Create Table

## Fields

```text
Tên bàn *
Sức chứa *
```

Optional:

```text
Ghi chú/vị trí
```

## Canonical create

```yaml
name: Bàn 7
capacity: 4
```

## API

```http
POST /api/admin/tables
```

## Success

- Insert card.
- QR status `Chưa sinh`.
- Offer `Sinh mã QR`.

---

# A32 — Edit Table

## Fields

- Name.
- Capacity.

## Rules

- Không đổi QR token khi chỉ sửa tên/capacity.
- Nếu table occupied, vẫn cho sửa thông tin không ảnh hưởng session, tùy business.
- Không cho xóa khi occupied.

---

# A33 — Delete Table Confirm

## Copy

```text
Xóa Bàn 4?
Bàn sẽ bị xóa khỏi danh sách quản lý.
```

## Rules

- Block nếu có session open.
- Historical session phải không bị phá quan hệ; backend có thể soft delete.
- Prototype hiển thị block reason.

---

# A34 — QR Preview

## Asset

- Q001.
- Q002.
- Q003.

## Content

```text
Bàn 5
https://demo.cafe-connect.vn/t/demo-table-5
```

## Actions

- Download PNG.
- Print.
- Copy URL.
- Regenerate.

---

# A35 — Generate QR

## API

```http
POST /api/admin/tables/:id/regenerate-qr
```

## States

- Generating.
- Success.
- Error.

## Success

- Show QR preview.
- Toast.
- Enable download/print.

---

# A36 — Regenerate QR Confirm

## Copy

```text
Sinh lại mã QR cho Bàn 5?
Mã QR cũ sẽ không còn sử dụng được.
```

## Action

Destructive/strong confirm.

## Result

- New token.
- New QR.
- Old URL invalid.

---

# A37 — Download / Print QR

## Download

- PNG 1024.
- SVG if supported.
- Filename:

```text
cafe-connect-ban-5-qr.png
```

## Print layout

- Logo.
- `Bàn 5`.
- QR.
- Copy:

```text
Quét mã để xem menu và gọi món
```

Không in URL quá nổi bật nếu không cần.

---

# A38 — Table Error States

- Duplicate table name optional.
- Invalid capacity.
- QR generation failed.
- Cannot delete occupied table.
- Permission denied.
- Download failed.

---

# 10. Orders and sessions flow

# A40 — Live Orders

## Route

```text
/admin/orders/live
```

## Purpose

Theo dõi order và session đang hoạt động.

## Layout

Desktop:

```text
Filter/list left
Detail/live status right
```

Hoặc table + drawer.

## Filters

- Table.
- Order status.
- Waiting duration.
- Bill requested.
- Payment status.

## Columns/cards

- Order code.
- Table.
- Created time.
- Item count.
- Total.
- Status.
- Payment.
- Waiting time.

## Realtime events

- OrderPlaced.
- OrderItemStatusUpdated.
- BillRequested.

## Canonical row

```text
#015
Bàn 5
3 món
99.000đ
Đang làm
```

---

# A41 — Order Detail

## Route

```text
/admin/orders/15
```

## Content

- Order header.
- Table/session.
- Created time.
- Item list.
- Options.
- Notes.
- Item statuses.
- Snapshot prices.
- Total.

## Rules

- Historical display uses snapshot.
- Status item update mostly done at KDS; Admin may view or override only if permission defined.
- Source docs do not explicitly require Admin status override, so prototype should not make it primary.

---

# A42 — Session Detail

## Route

```text
/admin/sessions/A7K2QX
```

## Content

- Bàn 5.
- Session code.
- Opened time.
- 2 orders.
- 4 items.
- Total 131.000đ.
- Payment unpaid.
- Bill requested state.
- Actions: confirm payment, close after paid.

## Orders

- #015 — 99.000đ.
- #021 — 32.000đ.

---

# A43 — Confirm Cash Payment

## Presentation

Drawer/dialog.

## Content

```text
Bàn 5
Tổng cần thanh toán: 131.000đ
Khách đưa: [input]
Tiền thừa: auto calculate
```

## CTA

```text
Xác nhận đã thu tiền mặt
```

## API

```http
POST /api/admin/sessions/A7K2QX/pay
{
  "method": "cash",
  "amount": 131000
}
```

## Success

- Payment paid.
- Session closes according to source flow.
- Table available.
- SessionClosed broadcast.

## Validation

- Received amount >= total.
- Confirm amount.
- Prevent duplicate payment.

---

# A44 — Confirm Bank Transfer

## Content

```text
Tổng: 131.000đ
Mã giao dịch/chú thích: optional
```

## CTA

```text
Xác nhận đã nhận chuyển khoản
```

## API

```json
{
  "method": "bank_transfer",
  "amount": 131000
}
```

## Rule

Admin/staff xác nhận thủ công tại quầy.

---

# A45 — Close Session

## Important

Theo source, session đóng khi payment paid.

Vì vậy prototype không nên cho close unpaid bình thường.

## Confirm

```text
Đóng phiên Bàn 5?
Phiên đã thanh toán đủ 131.000đ.
```

## Success

- Session closed.
- Table available.
- Customer receives SessionClosed.

Nếu unpaid:

```text
Không thể đóng phiên chưa thanh toán.
```

---

# A46 — Order History

## Route

```text
/admin/orders/history
```

## Filters

- Date range.
- Table.
- Status.
- Payment method.
- Search order/session code.

## Columns

- Order/session.
- Table.
- Open/closed time.
- Total.
- Payment method.
- Payment status.
- Actions.

## Data principle

- Name/price snapshot.
- Historical data unaffected by menu edits.

---

# A47 — Order Filter / Export

Nguồn tài liệu chưa chốt export orders.

Prototype có thể:

- Có filter đầy đủ.
- `Export CSV` để ở secondary action nếu muốn mở rộng.
- Đánh dấu optional, không core MVP.

---

# A48 — Order Error States

- Live connection lost.
- Payment already processed.
- Amount mismatch.
- Session already closed.
- Order not found.
- Permission denied.
- Realtime stale/reconnect.

---

# 11. Reports flow

# A50 — Reports Overview

## Route

```text
/admin/reports
```

## Date range default

```text
7 ngày qua
```

## Metric cards

- Doanh thu.
- Số phiên.
- Giá trị trung bình/phiên.
- Số món bán.

## Charts

- Revenue series.
- Top items.
- Peak hours.

## API

```http
GET /api/admin/reports/revenue?from=&to=
GET /api/admin/reports/top-items
```

---

# A51 — Revenue Detail

## Route

```text
/admin/reports/revenue
```

## Content

- Date range.
- Revenue chart.
- Revenue by day.
- Session count.
- Average session value.
- Comparison.

## Formatting

- VND.
- Asia/Ho_Chi_Minh.
- Zero-fill missing date.

---

# A52 — Top Items

## Route

```text
/admin/reports/top-items
```

## Table

- Rank.
- Item snapshot name.
- Quantity.
- Revenue.
- Average price.

## Canonical top items

```text
1. Cà phê sữa đá
2. Cà phê đen đá
3. Trà đào cam sả
4. Bạc xỉu đá
5. Croissant bơ
```

## Rule

Historical name uses snapshot/source aggregation policy.

---

# A53 — Peak Hours

## Route

```text
/admin/reports/peak-hours
```

## Chart

- Hour buckets.
- Orders or sessions.
- Highlight peak.

Canonical example:

```text
Khung giờ đông nhất: 08:00–09:00
```

---

# A54 — Average Session Value

Có thể là section trong overview, không nhất thiết page riêng.

## Metric

```text
Giá trị trung bình mỗi bàn
```

Source yêu cầu báo cáo cơ bản gồm average value per table/session.

---

# A55 — Report Empty / Error

## Empty

Asset I203.

```text
Chưa có dữ liệu trong khoảng thời gian này.
```

## Error

- Retry.
- Keep filters.

---

# 12. Staff/user management flow

Nguồn overview nói Admin quản lý nhân viên, nhưng API chi tiết cho users chưa được liệt kê trong phần trích dẫn. Vì vậy module này được thiết kế ở mức prototype hợp lý, cần đối chiếu backend phase nếu triển khai.

# A60 — Staff List

## Route

```text
/admin/users
```

## Columns

- Avatar/name.
- Email.
- Role.
- Status.
- Last login.
- Updated.
- Actions.

## Filters

- Search.
- Role.
- Status.

---

# A61 — Create Staff

## Route

```text
/admin/users/create
```

## Fields

- Name.
- Email.
- Password/temp password.
- Role.
- Permissions optional.
- Active.

## Roles

- Staff.
- Barista.
- Admin.

Nếu MVP gộp staff/barista thì chỉ Staff/Admin.

---

# A62 — Edit Staff

- Name.
- Email.
- Role.
- Active.
- Reset password.

## Rules

- Không cho admin tự disable chính mình.
- Không cho xóa admin cuối cùng.
- Permission changes cần confirm nếu nhạy cảm.

---

# A63 — Change Role / Permission

## Presentation

Section hoặc drawer.

## UI

- Role select.
- Permission checklist.
- Summary.

## Rules

- Backend là nguồn quyền.
- Sidebar cập nhật sau login/me refresh.

---

# A64 — Disable Staff

## Confirm

```text
Vô hiệu hóa tài khoản Mai Anh?
Người dùng sẽ không thể đăng nhập.
```

Không xóa lịch sử action.

---

# A65 — Delete Staff Confirm

Khuyến nghị soft delete hoặc disable thay vì hard delete.

Nếu hard delete:

- Block nếu ảnh hưởng audit.
- Giữ historical references.

---

# A66 — Staff Error States

- Duplicate email.
- Invalid role.
- Cannot disable self.
- Cannot remove last admin.
- Permission denied.
- API error.

---

# 13. Global CRUD pattern

Mọi module CRUD phải có:

## List

- Page header.
- Search/filter.
- Result count.
- Loading.
- Empty.
- Error.
- Pagination nếu cần.
- Permission behavior.

## Create

- Required labels.
- Validation.
- Loading submit.
- Success.
- API error.
- Cancel/dirty state.

## Edit

- Preload data.
- Not found.
- Dirty state.
- Loading save.
- Success.
- Conflict handling.

## Delete

- Named entity in confirm.
- Consequence.
- Business block reason.
- Loading.
- Success.
- Error.

---

# 14. API matrix

| Module | API |
|---|---|
| Auth | login, refresh, logout, me |
| Categories | GET/POST/PUT/DELETE admin/categories |
| Menu items | GET/POST/PUT/DELETE admin/menu-items |
| Availability | PATCH admin/menu-items/:id/availability |
| Option groups | GET/POST/PUT/DELETE admin/option-groups |
| Options | GET/POST/PUT/DELETE admin/options |
| Tables | GET/POST/PUT/DELETE admin/tables |
| QR | POST admin/tables/:id/regenerate-qr · GET admin/tables/:id/qr.png |
| Orders | GET admin/orders |
| Sessions | POST admin/sessions/:code/close |
| Payment | POST admin/sessions/:code/pay |
| Reports | GET reports/revenue, top-items |

---

# 15. Realtime matrix

| Event | Admin effect |
|---|---|
| OrderPlaced | Add live order + badge |
| OrderItemStatusUpdated | Update row/detail |
| BillRequested | Add payment request |
| SessionClosed | Remove open session/update status |
| StaffCalled | Optional dashboard notification |

---

# 16. Responsive behavior

## Desktop

- Fixed sidebar.
- Full table.
- Drawer/dialog.
- Multi-column form.
- Preview rail.

## Tablet

- Sidebar collapsed.
- Tables scroll.
- Form one column.
- Drawer wider/full height.

## Mobile fallback

- Card list.
- Bottom sheet/drawer.
- Primary action sticky.
- Không ưu tiên báo cáo chart phức tạp.
- Không dùng hover-only interaction.

---

# 17. Prototype generation order

Mỗi screen là một ảnh riêng.

## Batch ADMIN-A — Auth and dashboard

1. A01 Login
2. A02 Login loading/error
3. A03 Dashboard
4. A70 Notifications
5. A74 Permission denied

## Batch ADMIN-B — Menu categories

6. A10 Category list
7. A11 Create category
8. A12 Edit category
9. A13 Delete blocked/confirm
10. A14 Category empty/error

## Batch ADMIN-C — Menu items

11. A20 Menu list
12. A21 Create item
13. A22 Edit item
14. A23 Delete item
15. A24 Availability optimistic
16. A25 Image upload
17. A26 Option group editor
18. A27 Copy option group
19. A28 Customer preview
20. A29 Validation/error

## Batch ADMIN-D — Tables & QR

21. A30 Table list
22. A31 Create table
23. A32 Edit table
24. A33 Delete blocked
25. A34 QR preview
26. A35 Generate QR
27. A36 Regenerate QR confirm
28. A37 Print/download QR
29. A38 Error

## Batch ADMIN-E — Orders & sessions

30. A40 Live orders
31. A41 Order detail
32. A42 Session detail
33. A43 Cash payment
34. A44 Bank transfer
35. A45 Close session
36. A46 Order history
37. A48 Error/reconnecting

## Batch ADMIN-F — Reports

38. A50 Reports overview
39. A51 Revenue
40. A52 Top items
41. A53 Peak hours
42. A55 Empty/error

## Batch ADMIN-G — Users

43. A60 Staff list
44. A61 Create staff
45. A62 Edit staff
46. A63 Permissions
47. A64 Disable staff
48. A65 Delete/blocked
49. A66 Error

---

# 18. Screen spec contract

Mỗi screen phải có spec:

```yaml
screen_id: A20
screen_name: Admin Menu Item List
actor: admin
route: /admin/menu/items
viewport: 1440x1024
permission: menu.manage

assets:
  - B002
  - M101
  - M102
  - M103
  - M104
  - M201
  - M202
  - M301
  - M302

components:
  - AdminShell
  - AdminSidebar
  - AdminHeader
  - PageHeader
  - FilterBar
  - DataTable
  - MenuItemAdminRow
  - AvailabilitySwitch
  - Pagination

api:
  - GET /api/admin/menu-items

events: []

previous: A03
next:
  create: A21
  edit: A22
  delete: A23
```

---

# 19. Consistency checklist

## Data

- Tên, giá, availability khớp canonical.
- Bàn 5/session A7K2QX khớp Customer flow.
- Tổng session 131.000đ.
- Order code không đổi.
- Payment state khớp screen.

## Asset

- Product thumbnail dùng đúng M-ID.
- QR dùng Q001/Q002/Q003.
- Login dùng H002.
- Empty dùng đúng illustration manifest.

## Layout

- Desktop web.
- Sidebar/header nhất quán.
- Một ảnh một screen.
- Không ghép nhiều viewport.
- Component đúng Step 02.
- Token đúng Step 01.

## CRUD

- List/create/edit/delete đủ.
- Delete có consequence.
- Validation rõ.
- Loading rõ.
- Permission rõ.
- Error và empty state rõ.

## Business

- Menu update invalidates public cache.
- Availability optimistic revert on error.
- Historical orders giữ snapshot.
- Không close session unpaid.
- Không delete occupied table.
- QR regenerate invalidates old token.
- Permission backend là nguồn cuối.

---

# 20. Acceptance criteria Step 05

Step 05 hoàn thành khi:

- Có flow auth và dashboard.
- Menu categories đủ list/create/edit/delete.
- Menu items đủ list/create/edit/delete/upload/options/preview.
- Tables đủ CRUD + QR generate/preview/download/print/regenerate.
- Orders đủ live/detail/session/payment/close/history.
- Reports đủ revenue/top items/peak hours/empty.
- Users có flow prototype với ghi chú phần source chưa chi tiết API.
- Có permission, loading, validation, error, empty.
- Có API/event mapping.
- Có responsive behavior.
- Có generation order.
- Có screen spec contract.
- Dữ liệu khớp Customer flow.
- Có thể bắt đầu generate toàn bộ Admin prototype mà không tự nghĩ lại cấu trúc.
