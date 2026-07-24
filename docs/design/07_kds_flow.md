# 07 — KDS Flow: cafe-connect

> **Phụ thuộc:** `01_design_system.md`, `02_component_library.md`, `03_asset_library.md`, `04_customer_flow.md`, `05_admin_flow.md`, `06_staff_flow.md`
>
> **Phạm vi:** Toàn bộ flow Kitchen Display System cho quầy pha chế trên desktop/tablet web.
>
> **Mục tiêu:** Xác định đầy đủ màn hình, trạng thái ticket, thao tác realtime, âm thanh, timer, offline/reconnect và conflict để prototype và triển khai KDS nhất quán.

---

# 1. Product surface

KDS là **desktop/tablet web chuyên dụng**, không phải native app.

## Viewport prototype chuẩn

| Loại | Kích thước |
|---|---:|
| Desktop chính | 1440 × 1024 |
| Màn hình quầy lớn | 1920 × 1080 |
| Tablet ngang | 1024 × 768 |
| Tablet dọc fallback | 768 × 1024 |

Prototype ưu tiên:

```text
1440 × 1024
```

## Môi trường sử dụng

- Màn hình tại quầy pha chế.
- Có thể mở toàn màn hình.
- Thao tác nhanh bằng chuột hoặc cảm ứng.
- Có tiếng ồn xung quanh.
- Nhân viên thường đứng xa màn hình hơn người dùng desktop bình thường.
- UI phải đọc được nhanh, không phụ thuộc hover.

---

# 2. Vai trò KDS

KDS dùng cho barista/nhân viên pha chế để:

- Nhận ticket mới realtime.
- Nghe âm thanh khi có order mới.
- Xem bàn, thời gian chờ, món, option và ghi chú.
- Chuyển trạng thái từng món.
- Chuyển ticket qua các cột.
- Nhìn thấy món chờ lâu.
- Xử lý ticket dài.
- Theo dõi trạng thái kết nối.
- Đồng bộ khi nhiều thiết bị cùng thao tác.

KDS không dùng để:

- Quản lý menu.
- Quản lý bàn/QR.
- Thu tiền.
- Đóng session.
- Xem báo cáo chi tiết.
- Sửa dữ liệu order lịch sử.

---

# 3. Canonical KDS context

## KDS user

```yaml
name: Quầy pha chế
email: barista@demo.com
role: staff
permissions:
  - order.update
  - order.view
```

## Canonical current time

```text
13:18 — 22/07/2026
```

## Canonical tickets

### Ticket K001

```yaml
ticket_id: K001
order_id: 15              # hiển thị dạng #015
table: Bàn 5
created_at: 2026-07-22T13:15:00+07:00
waiting_minutes: 3
status: mixed
items:
  - id: OI-1501
    name: Cà phê đen đá
    quantity: 1
    options:
      - Ít đá
      - Không đường
    note: null
    status: pending

  - id: OI-1502
    name: Cà phê sữa đá
    quantity: 1
    options:
      - Bình thường
      - Ít ngọt
    note: null
    status: preparing

  - id: OI-1503
    name: Bạc xỉu đá
    quantity: 1
    options:
      - Bình thường
      - Ít đá
    note: null
    status: ready
```

### Ticket K002

```yaml
ticket_id: K002
order_id: 21              # hiển thị dạng #021
table: Bàn 5
created_at: 2026-07-22T13:28:00+07:00
waiting_minutes: 1
items:
  - id: OI-2101
    name: Croissant bơ
    quantity: 1
    options: []
    note: Hâm nóng giúp mình
    status: pending
```

### Ticket K003

```yaml
ticket_id: K003
order_id: 18              # hiển thị dạng #018
table: Bàn 3
created_at: 2026-07-22T13:02:00+07:00
waiting_minutes: 16
items:
  - id: OI-1801
    name: Trà đào cam sả
    quantity: 2
    options:
      - Ít ngọt
      - Ít đá
    note: 1 ly không sả
    status: pending
```

### Ticket K004 — long ticket

```yaml
ticket_id: K004
order_id: 20              # hiển thị dạng #020
table: Bàn 8
created_at: 2026-07-22T13:12:00+07:00
waiting_minutes: 6
items_count: 8
status: preparing
```

---

# 4. KDS state model

## Item status

```text
pending → preparing → ready → served
```

**KDS xử lý trọn cả bốn trạng thái, kể cả `ready → served`.** `phase-06-kds.md` chốt: barista bấm tới `ĐÃ PHỤC VỤ` ngay trên màn bếp, và đó cũng là lúc ticket rời board.

Vì vậy Step 07:

- KDS là actor duy nhất của `pending → preparing → ready → served`.
- Nút `Đã phục vụ` là **core action**, không phải action phụ — nó nằm trên ticket ở cột `Sẵn sàng`.
- Staff (`/admin`) chỉ *xem* trạng thái món, không đổi. Không vẽ nút đổi trạng thái món trong màn Staff.

Cả bốn chuyển tiếp dùng chung một endpoint `PATCH /api/kitchen/order-items/{id}/status`.

## Ticket derived status

Ticket không cần một trạng thái độc lập cứng nếu item có trạng thái riêng.

Derived rules:

```text
all pending       → pending column
any preparing     → preparing column
all ready         → ready column
mixed statuses    → column theo trạng thái cần xử lý tiếp
all served        → removed/archive
```

Khuyến nghị:

- Ticket hiển thị trong cột của item chưa hoàn tất sớm nhất.
- Mỗi item có action riêng.
- Không bắt buộc chuyển toàn ticket cùng lúc.

---

# 5. KDS flow overview

```text
K01 KDS Login
→ K02 Audio Permission
→ K03 Loading Board
→ K04 Live Board

New order:
K05 New Ticket Arrives
→ K06 Ticket Highlight + Sound
→ K07 Start Item
→ K08 Item Preparing
→ K09 Mark Item Ready
→ K10 Ticket Ready

Operational states:
K11 Long Ticket Expanded
K12 Overdue Ticket
K13 Filter/Focus Mode
K14 Sound Settings
K15 Undo Action
K16 Cancelled Item
K17 Multiple Device Conflict

Connectivity:
K20 Reconnecting
K21 Offline Board
K22 Reconnected Sync
K23 Stale Data Conflict

Empty/global:
K30 Empty Board
K31 Permission Denied
K32 Session Expired
K33 KDS Not Found
```

---

# 6. Screen inventory

| ID | Screen | Route |
|---|---|---|
| K01 | KDS Login | `/admin/login` |
| K02 | Audio Permission | `/kitchen` overlay |
| K03 | Loading Board | `/kitchen` |
| K04 | Live Board | `/kitchen` |
| K05 | New Ticket Arrives | live state |
| K06 | Ticket Highlight + Sound | live state |
| K07 | Start Item | ticket action |
| K08 | Item Preparing | ticket state |
| K09 | Mark Item Ready | ticket action |
| K10 | Ticket Ready | ready column |
| K11 | Long Ticket Expanded | drawer/dialog |
| K12 | Overdue Ticket | visual state |
| K13 | Filter/Focus Mode | toolbar state |
| K14 | Sound Settings | popover/dialog |
| K15 | Undo Action | toast/inline |
| K16 | Cancelled Item | ticket state |
| K17 | Device Conflict | modal/banner |
| K20 | Reconnecting | banner |
| K21 | Offline Board | full state/banner |
| K22 | Reconnected Sync | state |
| K23 | Stale Data Conflict | modal/banner |
| K30 | Empty Board | board state |
| K31 | Permission Denied | route |
| K32 | Session Expired | route/overlay |
| K33 | Not Found | route |

---

# 7. KDS layout

# KdsShell

## Header

- Logo mark B002.
- Title `Quầy pha chế`.
- Current time.
- Active ticket count.
- ConnectionIndicator.
- SoundToggle.
- Fullscreen action.
- User menu/logout.

## Board

Desktop:

```text
Mới | Đang làm | Sẵn sàng
```

Each column:

- Sticky header.
- Count.
- Ticket list.
- Independent scroll.

Tablet:

- Horizontal snap columns.
- Or tabs if width too narrow.

## No sidebar

KDS không dùng AdminSidebar.

KDS phải tận dụng toàn bộ chiều rộng.

---

# 8. Authentication and startup

# K01 — KDS Login

## Route

```text
/admin/login
```

## Form

```text
Email
Mật khẩu
Đăng nhập vào KDS
```

## Demo account

```text
barista@demo.com
password
```

## API

```http
POST /api/auth/login
GET /api/auth/me
```

## Success

- Role/permission check.
- Redirect `/kitchen`.

## States

- Default.
- Loading.
- Wrong credentials.
- Missing permission.
- Network error.

---

# K02 — Audio Permission

## Purpose

Browser có thể chặn autoplay sound.

## Trigger

Lần đầu mở KDS hoặc khi browser chưa cho phép âm thanh.

## UI

Centered dialog/banner:

```text
Bật âm thanh thông báo?
KDS sẽ phát chuông khi có đơn mới.
```

Actions:

```text
Bật âm thanh
Để sau
```

Secondary:

```text
Nghe thử
```

## Asset/sound

```text
S001 new-order.mp3
```

## Behavior

- User gesture kích hoạt audio.
- Save preference local.
- Header SoundToggle phản ánh trạng thái.
- Nếu từ chối, KDS vẫn hoạt động.

---

# K03 — Loading Board

## Purpose

Load ticket đang active trước khi subscribe realtime.

## UI

- Header skeleton.
- 3 column skeleton.
- Connection state `Đang kết nối`.
- Không phát sound cho ticket cũ khi initial load.

## API

Source chưa liệt kê endpoint KDS cụ thể trong phần đã đọc.

Cần endpoint kiểu:

```http
GET /api/kitchen/tickets
```

Đây là đề xuất triển khai, không coi là source requirement đã chốt.

## Next

- Success → K04
- Error/offline → K20/K21
- Permission → K31

---

# 9. Live board

# K04 — Live Board

## Purpose

Màn hình vận hành chính.

## Route

```text
/kitchen
```

## Columns

### Mới

Items/tickets có `pending`.

### Đang làm

Items/tickets có `preparing`.

### Sẵn sàng

Items/tickets có `ready`.

## Canonical layout

### Mới

- K002 — Bàn 5 — Croissant bơ.
- K003 — Bàn 3 — Trà đào cam sả x2.

### Đang làm

- K001 — Bàn 5 — mixed ticket.
- K004 — Bàn 8 — long ticket.

### Sẵn sàng

- K001 ready item summary hoặc ticket/item card theo design.

## Toolbar

- Filter by table/order.
- Focus mode.
- Sound.
- Fullscreen.
- Connection.

## Realtime channel

Source overview nói KDS nhận:

```text
OrderPlaced
```

và Customer/Admin nhận:

```text
OrderItemStatusUpdated
```

KDS cần subscribe order stream và publish update.

Channel naming cụ thể chưa được source chốt.

---

# 10. Ticket card anatomy

# TicketCard

## Priority information

1. Table.
2. WaitingTimer.
3. Order code/time.
4. Item rows.
5. Notes.
6. Action.

## Header example

```text
Bàn 5
#015
Chờ 3 phút
```

## Item row example

```text
1 × Cà phê sữa đá
Bình thường · Ít ngọt
[Đang làm]
```

## Notes

```text
Ghi chú: Hâm nóng giúp mình
```

Note phải nổi bật nhưng không dùng danger color trừ note khẩn.

## No product image

Mặc định KDS không dùng product image.

Lý do:

- Tên, số lượng, option quan trọng hơn.
- Giảm chiều cao ticket.
- Dễ nhìn xa.
- Giảm tải asset/network.

---

# 11. New ticket flow

# K05 — New Ticket Arrives

## Trigger

Realtime event:

```text
OrderPlaced
```

Canonical new order:

```text
#021
Bàn 5
Croissant bơ
Hâm nóng giúp mình
```

## Behavior

- Insert vào cột `Mới`.
- Sort theo priority/waiting rule.
- Increment count.
- Highlight ticket.
- Play S001 nếu sound on.
- Do not reload board.

## Duplicate protection

- Event phải có order/ticket ID.
- Ignore duplicate event đã tồn tại.
- On reconnect, reconcile with server.

---

# K06 — Ticket Highlight + Sound

## Visual

- Subtle pulse hoặc border highlight 1–2 giây.
- Badge `Mới`.
- Không animation vô hạn.

## Sound

- Một lần mỗi new order.
- Không play cho từng item.
- Nếu nhiều order đến cùng lúc, queue/limit sound.
- Có visual fallback khi muted.

## Accessibility

- New ticket count update.
- Không phụ thuộc hoàn toàn vào sound.

---

# 12. Start preparing

# K07 — Start Item

## Action

Trên pending item:

```text
Bắt đầu làm
```

## API proposal

Source chưa nêu endpoint cụ thể.

Cần endpoint kiểu:

```http
PATCH /api/kitchen/order-items/:id/status
{
  "status": "preparing"
}
```

Đây là contract đề xuất dựa trên state machine đã có, cần đối chiếu phase backend.

## Behavior

1. Optimistic update item.
2. Move/derive ticket to preparing column.
3. Send API.
4. Broadcast `OrderItemStatusUpdated`.
5. Failure → revert + toast/banner.

## Multi-item ticket

Mỗi item có thể bắt đầu riêng.

Có thể có action:

```text
Bắt đầu tất cả
```

nhưng chỉ là optional nếu workflow thực tế cần.

---

# K08 — Item Preparing

## UI

Item:

```text
Đang làm
```

Ticket:

- Moved to preparing column.
- Timer continues from order created_at.
- Action changes to `Đánh dấu sẵn sàng`.

## Customer effect

Customer tracking C13 update realtime.

## Admin effect

Live order detail update.

---

# 13. Mark ready

# K09 — Mark Item Ready

## Action

```text
Sẵn sàng
```

## API proposal

```http
PATCH /api/kitchen/order-items/:id/status
{
  "status": "ready"
}
```

## Behavior

- Optimistic update.
- Broadcast.
- If all active items ready, ticket moves to ready column.
- Show undo toast for a short safe window if supported.

## Customer effect

Customer C14.

---

# K10 — Ticket Ready

## UI

Header:

```text
Bàn 5
Sẵn sàng
```

## Content

- Ready item list.
- Ready time.
- Optional action `Đã giao` only if actor/permission confirmed.

## Core decision

Because source does not clearly assign `served` transition:

- Core prototype shows ticket in `Sẵn sàng`.
- Optional `Đã giao` action marked as backend/workflow decision.
- Staff may be the actor who confirms served.

## Auto removal

Do not auto-remove immediately.

Ticket remains until:

- Served/completed event.
- Or configured timeout/acknowledgement.

Exact rule must come from backend phase.

---

# 14. Long ticket handling

# K11 — Long Ticket Expanded

## Trigger

Ticket has many items/long notes.

## Default collapsed ticket

Shows:

- First 4–5 rows.
- Summary:

```text
+3 món khác
```

## Expanded presentation

- Drawer/dialog or expanded card.
- Full item list.
- Sticky ticket header.
- Item actions.
- Notes fully visible.

## Rules

- Do not make a single column unusable due to one tall ticket.
- Preserve scroll position after close.
- Expansion state local only.

---

# 15. Waiting and overdue

# K12 — Overdue Ticket

## Waiting thresholds

Backend đã chốt ngưỡng trong `Order::urgencyLevel()` (`phase-06-kds.md`). Design **dùng đúng ba giá trị này**, không tự định nghĩa thang riêng:

```text
0–7 phút   → normal     (không nhấn mạnh)
8–14 phút  → warning    (--warning: #C98222)
15+ phút   → critical   (--danger: #C44B45)
```

Tên trạng thái từ API là `normal | warning | critical`. Chữ hiển thị cho barista: `Chờ N phút` (normal), `Chờ N phút` + viền warning, `Chờ lâu · N phút` (critical).

Giá trị `waiting_minutes` và `urgency` đến sẵn trong `TicketResource` — **frontend không tự tính lại từ `created_at`**, tránh lệch giờ máy client.

## UI

Warning:

```text
Chờ 9 phút
```

Overdue:

```text
Chờ lâu · 16 phút
```

## Rules

- Add icon/text, not color only.
- Sort overdue higher within same status.
- Do not automatically alter item status.
- Timer uses server created_at.

---

# 16. Focus and filter

# K13 — Filter / Focus Mode

## Filters

- All tables.
- Specific table.
- Order code search.
- Pending/preparing/ready.
- Overdue only.

## Focus mode

Purpose:

- Hide non-critical header controls.
- Enlarge board/tickets.
- Useful for wall-mounted screen.

## Rules

- Filters visible as chips.
- Clear all action.
- Do not hide active filter state.
- Realtime events still inserted if matching; otherwise count indicator shows hidden new ticket.

---

# 17. Sound settings

# K14 — Sound Settings

## Controls

- Sound on/off.
- Volume.
- Test sound.
- Browser permission status.
- New order sound.
- Optional overdue reminder.

## Source support

Source asset library defines:

```text
S001 new-order.mp3
```

Overdue reminder sound is not source-defined and should remain optional.

## Rules

- Save local/device preference.
- Do not bind to user globally unless backend supports settings.
- Show clear muted icon.

---

# 18. Undo and cancellation

# K15 — Undo Action

## Purpose

Khôi phục thao tác vừa đổi status nếu bấm nhầm.

## UI

Toast:

```text
Cà phê sữa đá đã chuyển sang “Sẵn sàng”.
[Hoàn tác]
```

## Constraints

- Short time window.
- Backend must allow valid reverse transition.
- If another device changed status, undo fails with conflict.

Source does not explicitly define reverse transitions.

Therefore undo is a recommended UX pattern, not guaranteed backend behavior.

---

# K16 — Cancelled Item

## Source gap

Customer flow includes cancelled state, but KDS cancellation permissions/reason flow chưa được source chốt.

## Prototype safe behavior

- Display cancelled item if event received.
- Strike-through/neutral-danger badge.
- Show reason if available.
- Disable status actions.

Optional cancel action should not be core until backend requirements clarify:

- Who can cancel?
- At which status?
- Is reason required?
- Does total/payment change?

---

# 19. Multiple device conflict

# K17 — Multiple Device Conflict

## Scenario

Device A marks item ready.

Device B still shows preparing and attempts same/change.

## Server response

Expected:

```text
409 Conflict
```

## UI

```text
Trạng thái món vừa được cập nhật trên thiết bị khác.
```

Actions:

- Tải trạng thái mới.
- Close message.

## Behavior

- Refetch ticket.
- Do not overwrite newer state.
- Preserve board position where possible.

---

# 20. Connectivity

# K20 — Reconnecting

## Trigger

WebSocket disconnect but HTTP may still work.

## UI

Header indicator:

```text
Đang kết nối lại
```

Global banner:

```text
Mất kết nối realtime. KDS đang thử kết nối lại...
```

## Behavior

- Keep current board.
- Disable or queue mutations according to implementation.
- Recommended: disable status mutation until server certainty.
- Show last updated time.

---

# K21 — Offline Board

## Trigger

No network.

## UI

Large StatusBanner or full fallback:

```text
KDS đang ngoại tuyến
Dữ liệu dưới đây có thể chưa cập nhật.
```

Asset:

```text
I402 optional
```

## Behavior

- Board read-only.
- Do not accept status mutations silently.
- Retry action.
- Keep cached tickets.

---

# K22 — Reconnected Sync

## Behavior

1. Reconnect WebSocket.
2. Refetch active ticket snapshot.
3. Diff with local board.
4. Add missing ticket.
5. Update changed status.
6. Remove completed/cancelled tickets.
7. Clear banner.

## UI

Toast:

```text
Đã kết nối lại
Dữ liệu KDS đã được đồng bộ.
```

Do not play new-order sound for every ticket discovered during reconciliation unless truly new since disconnect and UX decision supports it.

---

# K23 — Stale Data Conflict

## Scenario

Offline board has stale ticket.

On reconnect:

- Ticket already ready.
- Ticket cancelled.
- Session closed.

## UI

No manual merge needed for normal KDS.

Server snapshot wins.

If current user has unsent local action:

```text
Thao tác chưa được ghi nhận vì dữ liệu đã thay đổi.
```

---

# 21. Empty and global states

# K30 — Empty Board

## Asset

```text
I401
```

## UI

```text
Chưa có ticket đang chờ
Đơn mới sẽ xuất hiện tự động tại đây.
```

## Board

Columns remain visible with count 0, or central empty state across board.

Prefer columns visible so layout does not jump when first ticket arrives.

---

# K31 — Permission Denied

```text
Tài khoản không có quyền truy cập KDS.
```

Actions:

- Đăng nhập tài khoản khác.
- Về trang phù hợp.

---

# K32 — Session Expired

```text
Phiên đăng nhập đã hết hạn
```

Behavior:

- Stop realtime.
- Do not expose stale operational screen indefinitely.
- Redirect login after acknowledgement.

---

# K33 — Not Found

```text
Không tìm thấy màn hình KDS
```

Action:

- Về KDS board.

---

# 22. Ticket sorting rules

Recommended:

## Within pending

1. Overdue.
2. Waiting time descending.
3. Created time ascending.

## Within preparing

1. Overdue.
2. Started time ascending.
3. Created time ascending.

## Within ready

1. Ready time ascending.
2. Table/order grouping.

## New insertion

- Insert by sort rule.
- Brief highlight.
- Do not force whole board scroll unless focus/setting says so.

These are UX recommendations unless source phase defines exact priority.

---

# 23. Realtime event contract

## OrderPlaced

Minimum payload needed:

```json
{
  "order_id": 21,
  "table_name": "Bàn 5",
  "created_at": "2026-07-22T13:28:00+07:00",
  "items": [
    {
      "id": "OI-2101",
      "name": "Croissant bơ",
      "quantity": 1,
      "options": [],
      "note": "Hâm nóng giúp mình",
      "status": "pending"
    }
  ]
}
```

## OrderItemStatusUpdated

Minimum payload:

```json
{
  "order_id": 15,
  "order_item_id": "OI-1502",
  "status": "ready",
  "updated_at": "2026-07-22T13:20:00+07:00",
  "updated_by": {
    "id": 12,
    "name": "Quầy pha chế"
  }
}
```

## Optional events

- OrderItemCancelled.
- SessionClosed.
- TicketRemoved/OrderCompleted.

Source đã nêu một số event tổng quát nhưng chưa chốt đầy đủ payload/channel.

Contracts trên là đề xuất để UI có thể render mà không refetch toàn board sau mỗi event.

---

# 24. API matrix

| Purpose | API status |
|---|---|
| Load active tickets | Dedicated endpoint not explicitly listed in source |
| Change item status | Endpoint not explicitly listed in source |
| Auth login/me | Source-supported auth |
| Realtime OrderPlaced | Source-supported concept |
| Broadcast OrderItemStatusUpdated | Source-supported concept |

## Recommended implementation endpoints

```http
GET /api/kitchen/tickets
GET /api/kitchen/tickets/:orderId
PATCH /api/kitchen/order-items/:itemId/status
```

These are **recommended contracts**, not source-confirmed routes.

---

# 25. Component mapping

## Layout

- KdsShell.
- KdsHeader.
- KdsBoard.
- KdsColumn.

## Ticket

- TicketCard.
- TicketItemRow.
- WaitingTimer.
- TicketNote.
- TicketSummary.
- TicketExpandedDrawer.

## Controls

- ConnectionIndicator.
- SoundToggle.
- FocusModeToggle.
- FilterBar.
- FullscreenButton.

## Feedback

- StatusBanner.
- Toast.
- ConfirmationDialog.
- ConflictDialog.
- EmptyState.

---

# 26. Responsive behavior

## 1440 desktop

- 3 fixed fluid columns.
- 16–20px gap.
- Ticket width comfortable.
- Header one line.

## 1920 large screen

- 3 columns with larger ticket text.
- Optional 4th column only if workflow defines another state; default remains 3.
- More tickets visible.

## 1024 tablet landscape

Option A:

- 3 horizontally scrollable columns.

Option B:

- Status tabs.

Recommendation:

- Horizontal snap board if staff monitors all statuses.
- Tabs if ticket density too low.

## Tablet portrait

- Tabs.
- One column at a time.
- Status count always visible.

---

# 27. Visual hierarchy

## Table name

Largest ticket text after status.

## Waiting time

Highly visible.

## Quantity

Bold and aligned.

## Item name

Clear and larger than options.

## Options

Smaller but readable.

## Notes

Highlighted background/left border.

## Action

Large 48–56px button.

## Colors

- Pending: neutral/info.
- Preparing: warning.
- Ready: success.
- Overdue: danger accent + text.
- Cancelled: muted danger.

No dark full-screen brown theme.

KDS may use slightly stronger contrast than Customer/Admin, but still follow bright visual system.

---

# 28. Prototype generation order

Mỗi screen/state là một ảnh riêng.

## Batch KDS-A — Startup

1. K01 KDS Login
2. K02 Audio Permission
3. K03 Loading Board
4. K30 Empty Board
5. K31 Permission Denied

## Batch KDS-B — Core board

6. K04 Live Board
7. K05 New Ticket Arrives
8. K06 Ticket Highlight
9. K07 Start Item
10. K08 Item Preparing
11. K09 Mark Ready
12. K10 Ticket Ready

## Batch KDS-C — Operational complexity

13. K11 Long Ticket Expanded
14. K12 Overdue Ticket
15. K13 Filter Mode
16. K13 Focus Mode
17. K14 Sound Settings
18. K15 Undo
19. K16 Cancelled Item
20. K17 Device Conflict

## Batch KDS-D — Connectivity

21. K20 Reconnecting
22. K21 Offline Board
23. K22 Reconnected Sync
24. K23 Stale Data Conflict
25. K32 Session Expired

---

# 29. Screen spec contract

Example:

```yaml
screen_id: K04
screen_name: KDS Live Board
actor: barista
route: /kitchen
viewport: 1440x1024
permission: order.update

canonical_tickets:
  - K001
  - K002
  - K003
  - K004

components:
  - KdsShell
  - KdsHeader
  - KdsColumn
  - TicketCard
  - TicketItemRow
  - WaitingTimer
  - ConnectionIndicator
  - SoundToggle

assets:
  - B002
  - S001

api:
  - recommended GET /api/kitchen/tickets

events:
  incoming:
    - OrderPlaced
    - OrderItemStatusUpdated
  outgoing:
    - OrderItemStatusUpdated

previous: K03
next:
  start_item: K07
  mark_ready: K09
  expand_ticket: K11
```

---

# 30. Consistency checklist

## Data

- Order codes khớp Customer/Admin/Staff.
- Bàn 5/session/order total không tự thay đổi.
- Món/options/note đúng canonical.
- Item status đúng flow.

## Asset

- Không dùng product image trong ticket.
- Logo B002.
- Sound S001.
- Empty I401.
- Offline I402 chỉ khi cần.

## UI

- Desktop/tablet web.
- Đọc được từ xa.
- Action lớn.
- One screen per image.
- Không ghép nhiều board state vào cùng ảnh.
- Không giống Admin dashboard.
- Không sidebar.

## Realtime

- New ticket không reload board.
- Duplicate event không duplicate card.
- Mutation lỗi phải revert.
- Reconnect phải reconcile.
- Server snapshot wins.
- Conflict không overwrite.

## Business

- Core KDS: pending → preparing → ready.
- Served actor chưa source-confirmed.
- Cancel permission chưa source-confirmed.
- SLA threshold là assumption/configurable.
- Endpoint KDS là recommended, not source-confirmed.

---

# 31. Acceptance criteria Step 07

Step 07 hoàn thành khi:

- Có login và audio permission.
- Có loading/empty/live board.
- Có 3 cột Mới/Đang làm/Sẵn sàng.
- Có new ticket realtime + sound.
- Có thao tác từng item pending → preparing → ready.
- Có ticket mixed state.
- Có long ticket handling.
- Có waiting timer và overdue.
- Có filter/focus/sound settings.
- Có undo/cancelled/conflict states với source-gap note.
- Có reconnect/offline/reconciliation.
- Có responsive desktop/tablet.
- Có generation order.
- Có screen spec contract.
- Dữ liệu khớp Customer/Admin/Staff.
- Các endpoint và workflow chưa được source chốt được ghi rõ là đề xuất.
