# 06 — Staff Flow: cafe-connect

> **Phụ thuộc:** `01_design_system.md`, `02_component_library.md`, `03_asset_library.md`, `04_customer_flow.md`, `05_admin_flow.md`
>
> **Phạm vi:** Toàn bộ flow phía Staff trên responsive tablet/desktop web.
>
> **Mục tiêu:** Xác định đầy đủ màn hình và nghiệp vụ cho nhân viên phục vụ/thu ngân: nhận yêu cầu, xem phiên bàn, xác nhận thanh toán và đóng phiên.

---

# 1. Product surface

> **Quan trọng — Staff không có app riêng.**
> Theo `system_overview.md` §8 (*"chia làm 3 app / 3 layout"*) và §2 (*"gộp Thu ngân + Phục vụ thành một vai Staff và **dùng chung màn admin**"*), Staff đăng nhập vào **cùng `/admin` với `AdminLayout`**, chỉ khác ở chỗ sidebar và hành động được render theo permission (`auth.can(...)`).
>
> Tài liệu này vì vậy **không mô tả một surface thứ tư**, mà mô tả **chế độ Staff của Admin surface**: những màn hình nào Staff thấy, thấy ở dạng nào, và bị ẩn những gì. Mọi screen S* dưới đây đều là route `/admin/*` hoặc drawer/dialog trên đó — xem lại `05_admin_flow.md` cho phần chung, tài liệu này chỉ đặc tả phần Staff-specific.
>
> Hệ quả cho prototype: **không tạo `StaffLayout.vue`, không tạo thư mục `views/staff/`.** Component riêng của Staff nằm trong `components/staff/` và được nhúng vào `AdminLayout` / các view admin sẵn có.

Staff dùng **responsive web ưu tiên tablet và desktop**, không phải native mobile app.

## Viewport prototype chuẩn

| Loại | Kích thước |
|---|---:|
| Tablet chính | 1024 × 768 |
| Desktop | 1440 × 1024 |
| Tablet dọc fallback | 768 × 1024 |
| Mobile fallback | 390 × 844 |

Prototype ưu tiên:

```text
1024 × 768
```

## Thiết bị sử dụng thực tế

- Máy tính bảng tại quầy.
- Laptop/desktop của nhân viên.
- Có thể mở cùng lúc với KDS ở màn khác.
- Mobile chỉ là fallback, không phải surface chính.

---

# 2. Vai trò Staff theo source

Trong phạm vi MVP, Staff gộp:

- Phục vụ.
- Thu ngân.

Các trách nhiệm chính:

- Nhận thông báo `Gọi phục vụ`.
- Nhận thông báo `Yêu cầu thanh toán`.
- Xem phiên bàn đang mở.
- Xem order và tổng tiền.
- Xác nhận thanh toán tiền mặt.
- Xác nhận chuyển khoản.
- Đóng phiên sau khi thanh toán.
- Theo dõi bàn đang dùng/trống ở mức cần thiết.

Staff không phải màn quản lý cấu hình sâu như Admin.

Staff không sửa menu, category, QR hoặc report trừ khi có permission bổ sung.

---

# 3. Canonical staff context

## Staff user

```yaml
name: Mai Anh
email: maianh@demo.com
role: staff
permissions:
  - order.view
  - order.update
  - session.close
  - payment.record
```

> Đúng bộ permission mà `phase-02-auth.md` gán cho role `staff`. Staff **không** có `menu.manage`, `table.manage`, `report.view`, `user.manage` — nên các mục đó bị ẩn khỏi sidebar `AdminLayout`.

## Cafe

```yaml
brand: cafe-connect
timezone: Asia/Ho_Chi_Minh
currency: VND
```

## Canonical active session

```yaml
table_name: Bàn 5
table_capacity: 4
session_code: A7K2QX
opened_at: 2026-07-22T13:10:00+07:00
status: open
orders:
  - #015
  - #021
items_count: 4
total: 131000
payment_status: unpaid
bill_requested: true
staff_called: false
```

## Canonical staff requests

> **Không có bảng `staff_requests` trong ERD.** `system_overview.md` §7 và `phase-07-realtime.md` định nghĩa `StaffCalled` / `BillRequested` là **event broadcast thuần, không persist**. Không có row DB, không có id server-side, không có `status` lưu trữ.
>
> Vì vậy các "request" dưới đây là **payload event được client gom vào một danh sách trong bộ nhớ** (Pinia) của phiên làm việc hiện tại:
>
> - `id` là **id do client sinh** để keying list, không phải khóa DB.
> - `status: pending → acknowledged` là **state phía client**, mất khi F5. Chấp nhận được: yêu cầu gọi phục vụ có vòng đời vài phút.
> - Danh sách rỗng khi mới mở app (không có API để backfill lịch sử request).
>
> Nếu sau này cần persist (để không mất khi F5, để báo cáo thời gian phản hồi) thì phải thêm migration `staff_requests` — ghi vào roadmap, **không làm trong MVP**.

### Request R001

```yaml
id: R001            # client-generated, không phải DB id
type: bill_requested
table: Bàn 5
session_code: A7K2QX
created_at: 2026-07-22T13:34:00+07:00
status: pending
priority: high
amount: 131000
```

### Request R002

```yaml
id: R002
type: staff_called
table: Bàn 3
session_code: M3XQ7B
created_at: 2026-07-22T13:32:00+07:00
status: pending
priority: normal
amount: null
```

## Canonical open sessions

| Bàn | Session | Mở lúc | Đơn | Tổng | Yêu cầu |
|---|---|---|---:|---:|---|
| Bàn 3 | M3XQ7B | 13:05 | 1 | 78.000đ | Gọi phục vụ |
| Bàn 5 | A7K2QX | 13:10 | 2 | 131.000đ | Thanh toán |
| Bàn 8 | K9WR4T | 13:18 | 1 | 64.000đ | — |

---

# 4. Staff flow overview

```text
S01 Staff Login
→ S02 Staff Dashboard

Request flow:
S10 Request Inbox
→ S11 Staff Call Detail
→ S12 Acknowledge Staff Call
→ S13 Bill Request Detail
→ S14 Open Session from Request

Session flow:
S20 Active Session List
→ S21 Session Detail
→ S22 Order Detail
→ S23 Payment Method Selection
→ S24 Cash Payment
→ S25 Bank Transfer Payment
→ S26 Payment Confirmation
→ S27 Close Session
→ S28 Session Closed Success

History:
S30 Closed Session History
→ S31 Closed Session Detail

Global/error:
S40 Notifications
S41 Offline/Reconnecting
S42 Payment Conflict
S43 Session Already Closed
S44 Permission Denied
S45 Empty States
```

---

# 5. Screen inventory

| ID | Screen | Route |
|---|---|---|
| S01 | Staff Login | `/admin/login` |
| S02 | Staff Dashboard | `/admin/orders/live` |
| S10 | Request Inbox | panel chuông trong `AdminLayout` |
| S11 | Staff Call Detail | drawer từ panel chuông |
| S12 | Acknowledge Staff Call | inline/confirm |
| S13 | Bill Request Detail | drawer từ panel chuông |
| S14 | Open Session from Request | `/admin/sessions/:code` |
| S20 | Active Session List | `/admin/orders/live` |
| S21 | Session Detail | `/admin/sessions/:code` |
| S22 | Order Detail | drawer/page |
| S23 | Payment Method | drawer/dialog |
| S24 | Cash Payment | drawer/dialog |
| S25 | Bank Transfer Payment | drawer/dialog |
| S26 | Payment Confirmation | confirm |
| S27 | Close Session | confirm |
| S28 | Session Closed Success | state/page |
| S30 | Session History | `/admin/orders/history` |
| S31 | Closed Session Detail | `/admin/sessions/:code` |
| S40 | Notifications | drawer |
| S41 | Offline/Reconnecting | global state |
| S44 | Permission Denied | route state |

---

# 6. Layout and navigation

## Shell — dùng chung `AdminLayout`

Không có shell riêng. Staff thấy **đúng `AdminLayout` của `05_admin_flow.md`**, chỉ khác nội dung sidebar do permission lọc.

### Header

Giống Admin (`AdminHeader`): logo B002, connection indicator, **notification bell**, user menu.

Notification bell là điểm khác biệt chính của chế độ Staff: badge số yêu cầu đang chờ, click mở drawer chứa S10–S13.

### Sidebar theo permission

Sidebar `AdminLayout` render bằng `auth.can(...)`. Với role `staff`:

| Mục | Permission | Staff thấy? |
|---|---|---|
| Đơn hàng (`/admin/orders/live`) | `order.view` | ✅ |
| Lịch sử (`/admin/orders/history`) | `order.view` | ✅ |
| Quản lý menu | `menu.manage` | ❌ ẩn |
| Bàn & QR | `table.manage` | ❌ ẩn |
| Báo cáo | `report.view` | ❌ ẩn |
| Nhân viên | `user.manage` | ❌ ẩn |

Kết quả: sidebar của Staff chỉ còn 2 mục. Không disable — **ẩn hẳn** (theo `05_admin_flow.md` §3).

### Landing route

Vì Staff không có `menu.manage`, `/admin` **không được** redirect cứng về `/admin/menu`. Redirect phải chọn màn đầu tiên mà user có quyền: admin → `/admin/menu/items`, staff → `/admin/orders/live`.

## Layout behavior

Desktop:

```text
Navigation
Request/session list
Detail panel
```

Tablet:

- List page.
- Click mở detail full page hoặc drawer.
- Primary action sticky dưới.

Mobile fallback:

- Bottom/action bar có thể dùng.
- Không dùng dense table.

---

# 7. Authentication

# S01 — Staff Login

## Purpose

Đăng nhập Staff.

## Route

```text
/admin/login
```

## Layout

Có thể dùng chung login shell với Admin nhưng label vai trò rõ hơn.

## Form

```text
Email
Mật khẩu
Đăng nhập
```

## Demo account

```text
maianh@demo.com
password
```

## API

```http
POST /api/auth/login
GET /api/auth/me
```

## Success

Nếu role staff:

```text
/admin/orders
```

Nếu role admin đăng nhập:

- Có thể redirect admin.
- Hoặc cho truy cập Staff nếu permission phù hợp.

## States

- Default.
- Loading.
- Wrong credentials.
- Permission/role mismatch.
- Network error.

---

# 8. Staff dashboard

# S02 — Staff Dashboard

## Purpose

Cho nhân viên thấy ngay việc cần xử lý.

## Route

```text
/admin/orders
```

## Anatomy

1. StaffHeader.
2. Alert summary.
3. Pending request cards.
4. Active session summary.
5. Quick filters.
6. Recent activity.

## Canonical summary

```yaml
pending_requests: 2
bill_requests: 1
staff_calls: 1
open_sessions: 3
```

## Priority section

### Card 1

```text
Bàn 5
Yêu cầu thanh toán
131.000đ
Đang chờ 2 phút
[Xử lý]
```

### Card 2

```text
Bàn 3
Gọi phục vụ
Đang chờ 4 phút
[Đã nhận]
```

## Live events

```text
StaffCalled
BillRequested
SessionClosed
```

## Next

- Open request → S11/S13
- Open sessions → S20
- Notifications → S40

---

# 9. Request inbox

# S10 — Request Inbox

## Route

```text
/admin/orders  (panel chuông trong AdminLayout)
```

## Purpose

Danh sách yêu cầu từ khách cần nhân viên xử lý.

## Tabs/filters

```text
Tất cả
Gọi phục vụ
Thanh toán
Đã xử lý
```

## Sort

- Pending trước.
- Waiting duration cao trước.
- Bill request có thể ưu tiên cao hơn.

## StaffRequestCard anatomy

- Bàn.
- Request type.
- Waiting timer.
- Amount nếu bill.
- Session code.
- Status.
- Primary action.

## Canonical rows

- R001 — Bàn 5 — Thanh toán — 131.000đ.
- R002 — Bàn 3 — Gọi phục vụ.

## States

- Loading.
- Populated.
- Empty I302.
- Offline.
- Error.
- Permission denied.

---

# 10. Staff call flow

# S11 — Staff Call Detail

## Purpose

Xem chi tiết yêu cầu gọi phục vụ.

## Canonical request

```text
Bàn 3
Khách đang gọi phục vụ
Đã chờ 4 phút
```

## Content

- Table name.
- Session code.
- Opened time.
- Current total.
- Recent orders optional.
- Request timestamp.
- Status.

## Actions

Primary:

```text
Đã nhận yêu cầu
```

Secondary:

```text
Mở phiên bàn
```

## API support

**Không có endpoint.** `StaffCalled` là event không persist (xem §3), nên `Đã nhận yêu cầu` là **hành động thuần client**: đánh dấu item `acknowledged` trong store và ẩn khỏi danh sách đang chờ. Không gọi API, không có gì để đồng bộ giữa nhiều máy staff.

Hệ quả cần thể hiện trong prototype: nếu hai nhân viên mở hai máy, **cả hai đều thấy request cho tới khi mỗi người tự dismiss**. Đây là hành vi đúng theo thiết kế gốc, không phải bug.

---

# S12 — Acknowledge Staff Call

## Purpose

Đánh dấu nhân viên đã tiếp nhận.

## UI behavior

- Button loading.
- Success state:

```text
Đã nhận yêu cầu
```

- Card chuyển trạng thái `Đang xử lý`.
- Không xóa request ngay lập tức nếu cần theo dõi.

## Optional completion

Nếu hệ thống cần:

```text
Hoàn tất yêu cầu
```

Source chưa định nghĩa request lifecycle chi tiết.

Prototype nên dùng tối thiểu:

```text
pending → acknowledged
```

Không tự mở rộng quá sâu nếu backend chưa có.

---

# 11. Bill request flow

# S13 — Bill Request Detail

## Purpose

Xử lý yêu cầu thanh toán từ Customer.

## Canonical data

```text
Bàn 5
A7K2QX
2 lần gọi món
4 món
Tổng: 131.000đ
```

## Content

- Request time.
- Session status.
- Payment status.
- Order summary.
- Total.
- Available methods.

## Actions

Primary:

```text
Xử lý thanh toán
```

Secondary:

```text
Xem chi tiết phiên
```

## Realtime event

```text
BillRequested
```

## Next

- S14/S21
- S23

---

# S14 — Open Session from Request

## Purpose

Mở đúng phiên liên quan yêu cầu.

## Route

```text
/admin/sessions/A7K2QX
```

## Behavior

- Request context được giữ ở top.
- Payment action nổi bật.
- Không bắt nhân viên tìm lại bàn trong list.

---

# 12. Active sessions

# S20 — Active Session List

## Route

```text
/admin/orders
```

## Purpose

Xem tất cả dining session đang mở.

## Layout

Tablet:

- Card list.

Desktop:

- Table hoặc split view.

## Filters

- Table.
- Has request.
- Payment status.
- Open duration.

## DiningSessionCard anatomy

- Table.
- Session code.
- Opened time.
- Order count.
- Item count.
- Total.
- Request badges.
- Payment status.

## Canonical cards

- Bàn 3 — 78.000đ — Gọi phục vụ.
- Bàn 5 — 131.000đ — Yêu cầu thanh toán.
- Bàn 8 — 64.000đ — Không yêu cầu.

## States

- Loading.
- Empty I301.
- Reconnecting.
- Error.

---

# S21 — Session Detail

## Route

```text
/admin/sessions/A7K2QX
```

## Purpose

Xem toàn bộ phiên bàn và xử lý thanh toán.

## Header

```text
Bàn 5
Phiên A7K2QX
Đang mở
```

## Session summary

```text
Mở lúc 13:10
2 lần gọi món
4 món
131.000đ
Chưa thanh toán
```

## Order sections

### Order 1

```text
#015
13:15
99.000đ
```

Items:

- Cà phê đen đá.
- Cà phê sữa đá.
- Bạc xỉu đá.

### Order 2

```text
#021
13:28
32.000đ
```

Item:

- Croissant bơ — `Hâm nóng giúp mình`.

## Actions

Primary:

```text
Xác nhận thanh toán
```

Secondary:

- Xem order detail.
- Gọi lại thông tin nếu cần.

## Rules

- Không sửa snapshot.
- Không close unpaid.
- Nếu payment đang pending online, hiển thị trạng thái rõ.

---

# S22 — Order Detail

## Presentation

Drawer hoặc full page tablet.

## Content

- Order code.
- Time.
- Item list.
- Quantity.
- Options.
- Notes.
- Status.
- Snapshot price.
- Order total.

## Staff permissions

Read-only mặc định.

Source không nêu Staff được thay status món; đó là KDS responsibility.

---

# 13. Payment method selection

# S23 — Payment Method Selection

## Purpose

Chọn phương thức khách thanh toán tại quầy.

## Presentation

Drawer/dialog.

## Options

- Tiền mặt.
- Chuyển khoản.

VNPay không phải Staff xác nhận thủ công nếu webhook đã paid, nhưng Staff cần thấy trạng thái.

## Canonical choice

```text
Tiền mặt
```

## Content

```text
Bàn 5
Tổng cần thanh toán: 131.000đ
```

## Next

- Cash → S24
- Transfer → S25

---

# 14. Cash payment

# S24 — Cash Payment

## Purpose

Nhập số tiền khách đưa và tính tiền thừa.

## Fields

```text
Tổng cần thanh toán: 131.000đ
Khách đưa: 150.000đ
Tiền thừa: 19.000đ
```

## Quick amount buttons

```text
131.000đ
150.000đ
200.000đ
```

## Validation

- Amount required.
- Amount >= total.
- Integer/non-negative.
- Prevent duplicate submit.

## CTA

```text
Xác nhận đã thu 131.000đ
```

## API

Theo source:

```http
POST /api/admin/sessions/A7K2QX/pay
{
  "method": "cash",
  "amount": 131000
}
```

Staff route/backend namespace chưa được tách rõ trong source.

Prototype có thể dùng cùng nghiệp vụ endpoint nếu permission cho phép, nhưng implementation cần chốt route naming.

---

# 15. Bank transfer payment

# S25 — Bank Transfer Payment

## Purpose

Nhân viên xác nhận đã nhận chuyển khoản.

## Content

- Total.
- Bank/QR info nếu hệ thống có.
- Reference/note optional.
- Confirm checkbox optional.

## Canonical fields

```text
Tổng: 131.000đ
Mã giao dịch: MB2407221315
```

## CTA

```text
Xác nhận đã nhận chuyển khoản
```

## API

```http
POST /api/admin/sessions/A7K2QX/pay
{
  "method": "bank_transfer",
  "amount": 131000
}
```

## Rules

- Không xác nhận nếu chưa kiểm tra.
- Prevent duplicate payment.
- Show actor/time trong audit nếu backend hỗ trợ.

---

# 16. Payment confirmation

# S26 — Payment Confirmation

## Purpose

Confirm cuối trước khi ghi nhận paid.

## Cash example

```text
Xác nhận thanh toán tiền mặt?
Bàn 5
Tổng: 131.000đ
Khách đưa: 150.000đ
Tiền thừa: 19.000đ
```

## Transfer example

```text
Xác nhận đã nhận chuyển khoản 131.000đ?
```

## Buttons

- Hủy.
- Xác nhận thanh toán.

## Behavior

- Submit loading.
- Không double click.
- Server response là nguồn thật.

## Success effect

- Payment `paid`.
- Session có thể đóng theo flow.
- Table trở lại available.
- Customer nhận `SessionClosed`.

---

# 17. Close session

# S27 — Close Session

## Purpose

Đóng phiên khi đã thanh toán hợp lệ.

## Canonical state

```yaml
payment_status: paid
session_status: open
```

## Confirm copy

```text
Đóng phiên Bàn 5?
Phiên đã thanh toán đủ 131.000đ.
```

## CTA

```text
Đóng phiên
```

## API

Theo source:

```http
POST /api/admin/sessions/A7K2QX/close
```

Tuy nhiên source cũng ghi session đóng khi payment paid.

Cần chốt implementation theo một trong hai cách:

1. `pay` tự đóng session.
2. `pay` ghi paid, sau đó `close` riêng.

Prototype phải nhất quán.

### Quyết định cho prototype

Dùng hai bước rõ cho Staff:

```text
Confirm payment
→ Payment paid
→ Confirm close session
```

Lý do:

- Dễ kiểm tra.
- Giảm đóng nhầm.
- Thể hiện rõ business state.

Khi triển khai, backend có thể gộp nếu tài liệu phase chốt như vậy.

## Invalid state

Nếu unpaid:

```text
Không thể đóng phiên chưa thanh toán.
```

---

# S28 — Session Closed Success

## Purpose

Xác nhận thao tác hoàn tất.

## UI

```text
Đã đóng phiên Bàn 5
Tổng thanh toán: 131.000đ
Phương thức: Tiền mặt
```

## Result

- Session removed from active list.
- Table available.
- Request marked completed.
- Customer closed screen.
- Event broadcast.

## Actions

- Về danh sách phiên.
- Xem lịch sử.

---

# 18. Session history

# S30 — Closed Session History

## Route

```text
/admin/orders/history
```

## Purpose

Tra cứu phiên đã thanh toán/đóng gần đây.

## Filters

- Date.
- Table.
- Payment method.
- Search session code.

## Columns/cards

- Table.
- Session code.
- Closed at.
- Total.
- Payment method.
- Staff confirmer.
- Detail.

## Scope

Staff chỉ cần lịch sử vận hành gần đây.

Báo cáo phân tích thuộc Admin.

---

# S31 — Closed Session Detail

## Content

- Table.
- Session code.
- Orders.
- Snapshot items.
- Total.
- Payment.
- Paid at.
- Closed at.
- Staff actor.

## Rules

Read-only.

Không chỉnh sửa payment historical từ Staff UI nếu source chưa định nghĩa refund/correction.

---

# 19. Notifications

# S40 — Notification Drawer

## Types

- StaffCalled.
- BillRequested.
- Payment status change.
- Session closed optional.

## Anatomy

- Icon.
- Table.
- Copy.
- Waiting duration.
- Read/unread.
- Open action.

## Behavior

- New event adds item.
- Bell badge updates.
- Sound S002 optional.
- Browser permission handling.

---

# 20. Offline and conflict states

# S41 — Offline / Reconnecting

## UI

Global StatusBanner:

```text
Mất kết nối
Bạn đang xem dữ liệu gần nhất. Đang kết nối lại...
```

## Behavior

- Disable payment confirmation while offline.
- Keep cached session list read-only.
- Reconnect → refetch active requests/sessions.
- Show last updated time.

---

# S42 — Payment Conflict

## Examples

- Payment already paid by another Staff.
- VNPay webhook completed while Staff is entering cash.
- Amount changed due to late order.
- Session closed elsewhere.

## UI

```text
Trạng thái phiên vừa thay đổi
Vui lòng tải lại trước khi tiếp tục.
```

## Behavior

- Stop submit.
- Refetch.
- Do not overwrite.

---

# S43 — Session Already Closed

```text
Phiên Bàn 5 đã được đóng bởi người dùng khác.
```

Actions:

- Xem lịch sử.
- Về danh sách.

---

# S44 — Permission Denied

```text
Bạn không có quyền thực hiện thao tác này.
```

Examples:

- Staff lacks `payment.record`.
- Direct URL access.
- Restricted override.

---

# S45 — Empty States

## No requests

Asset I302.

```text
Không có yêu cầu đang chờ
```

## No active sessions

Asset I301.

```text
Không có phiên bàn đang mở
```

## No history result

Icon-only or simple empty state.

---

# 21. Business state machines

## Request

Source only establishes event creation, not full request lifecycle.

Minimum prototype:

```text
pending → acknowledged → completed
```

`completed` may be omitted for MVP if backend only supports acknowledgement.

## Payment

```text
unpaid
→ pending
→ paid
→ failed
```

For cash/transfer:

```text
unpaid → paid
```

For VNPay:

```text
unpaid → pending → paid|failed
```

## Session

```text
open → closed
```

Rule:

```text
payment must be paid before close
```

## Table

```text
occupied → available
```

after session close.

---

# 22. API matrix

| Screen | Source-supported API |
|---|---|
| S01 | auth/login, auth/me |
| S10–S14 | Source has events; request query/ack endpoint not explicitly listed |
| S20–S22 | admin/orders and session data can support read; dedicated staff endpoint not specified |
| S24–S25 | admin/sessions/:code/pay |
| S27 | admin/sessions/:code/close |
| S30–S31 | admin/orders with history/filter |

## Important source gap

Tài liệu nguồn xác định vai trò Staff và events `StaffCalled`, `BillRequested`, nhưng không liệt kê đầy đủ API riêng cho:

- Staff request inbox.
- Acknowledge request.
- Complete request.
- Staff session list.

Vì vậy Step 06 chỉ định nghĩa UI/flow hợp lý.

Backend route cụ thể cho request lifecycle cần được bổ sung trong phase triển khai hoặc tài liệu API mới.

Không nên coi các endpoint đề xuất là source requirement đã có sẵn.

---

# 23. Realtime matrix

| Event | Staff UI effect |
|---|---|
| StaffCalled | Add RequestCard + sound/badge |
| BillRequested | Add high-priority payment request |
| SessionClosed | Remove active session/update request |
| OrderPlaced | Update session order count/total if needed |
| Payment updated | Refresh session/payment state |

Source channel:

```text
staff
```

---

# 24. Responsive behavior

## Tablet landscape

- Top navigation/header.
- List 40%.
- Detail 60%.
- Sticky action bottom in detail.
- Request cards medium density.

## Desktop

- Wider split pane.
- More columns in session list.
- Notification drawer.
- Payment drawer.

## Tablet portrait

- List → full detail.
- Back navigation.
- Action footer fixed.

## Mobile fallback

- Card list.
- Full-screen sheet.
- Single primary action.
- No dense data table.

---

# 25. Prototype generation order

Mỗi màn hình là một ảnh riêng.

## Batch STAFF-A — Auth and dashboard

1. S01 Staff Login
2. S02 Staff Dashboard
3. S40 Notifications
4. S41 Offline banner

## Batch STAFF-B — Requests

5. S10 Request Inbox
6. S11 Staff Call Detail
7. S12 Acknowledge Staff Call
8. S13 Bill Request Detail
9. S14 Session from Request
10. S45 No Requests

## Batch STAFF-C — Sessions

11. S20 Active Session List
12. S21 Session Detail
13. S22 Order Detail
14. S45 No Active Sessions

## Batch STAFF-D — Payments

15. S23 Payment Method
16. S24 Cash Payment
17. S25 Bank Transfer
18. S26 Payment Confirmation
19. S42 Payment Conflict
20. S27 Close Session
21. S28 Session Closed Success
22. S43 Already Closed

## Batch STAFF-E — History and permission

23. S30 Session History
24. S31 Closed Session Detail
25. S44 Permission Denied

---

# 26. Screen spec contract

Ví dụ:

```yaml
screen_id: S21
screen_name: Staff Session Detail
actor: staff
route: /admin/sessions/A7K2QX
viewport: 1024x768
permission: order.view

canonical_data:
  table: Bàn 5
  session_code: A7K2QX
  orders:
    - #015
    - #021
  total: 131000
  payment_status: unpaid

components:
  - StaffShell
  - StaffHeader
  - DiningSessionDetail
  - OrderSummary
  - PaymentStatusBadge
  - Button

assets:
  - B002

events:
  - BillRequested
  - SessionClosed

api:
  - session/order detail source endpoint

previous: S20
next:
  payment: S23
  order_detail: S22
```

---

# 27. Consistency checklist

## Data

- Bàn 5.
- Session A7K2QX.
- 2 orders.
- 4 items.
- Total 131.000đ.
- Order codes đúng Customer/Admin flow.
- Payment state đúng current screen.

## Asset

- Staff không dùng ảnh món nếu không cần.
- Empty state dùng I301/I302.
- Logo dùng B002/B001.
- Sound dùng S002.

## UI

- Tablet/desktop web.
- Không giống Admin CRUD dashboard.
- Action lớn và rõ.
- Request priority rõ.
- Một ảnh một screen.
- Không ghép list và nhiều modal ngoài spec.

## Business

- Staff không sửa menu.
- Staff không đổi trạng thái món KDS.
- Không close unpaid.
- Không double payment.
- Conflict phải refetch.
- VNPay paid phải được nhận biết trước khi staff thu tiền.
- Session closed cập nhật Customer/Admin.

## Source honesty

- Request lifecycle endpoint là gap.
- Không trình bày endpoint đề xuất như đã có trong source.
- Dedicated Staff API chưa được source chốt.

---

# 28. Acceptance criteria Step 06

Step 06 hoàn thành khi:

- Có login và dashboard Staff.
- Có request inbox.
- Có Staff Call và Bill Request flow.
- Có active session list/detail.
- Có order detail read-only.
- Có payment method.
- Có cash và bank transfer flow.
- Có payment confirmation.
- Có close session.
- Có history.
- Có offline, conflict, permission và empty states.
- Có responsive tablet/desktop behavior.
- Có generation order.
- Có screen spec contract.
- Dữ liệu khớp Customer/Admin.
- Các source gap được nêu rõ, không tự coi endpoint đề xuất là requirement đã có.
