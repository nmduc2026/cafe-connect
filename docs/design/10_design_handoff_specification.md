# 10 — Design Handoff Specification: cafe-connect

> **Phụ thuộc:** Step 01 → Step 09
>
> **Mục tiêu:** Chuẩn hóa toàn bộ thông tin cần bàn giao từ Design sang Frontend, Backend và QA để triển khai mà không phải suy đoán lại nghiệp vụ.

---

# 1. Handoff objectives

Design handoff phải trả lời được:

- Screen này thuộc actor nào?
- Route nào?
- Component nào?
- API nào?
- Event realtime nào?
- Asset nào?
- State nào?
- Responsive ra sao?
- Business rule nào?
- Acceptance criteria là gì?

Không chỉ bàn giao file thiết kế.

---

# 2. Handoff package structure

```text
handoff/
├── screens/
├── components/
├── assets/
├── design-tokens/
├── api-events/
├── routes/
├── business-rules/
├── accessibility/
├── qa/
└── changelog/
```

---

# 3. Screen handoff contract

Mỗi screen phải có một file spec.

Ví dụ:

```yaml
screen_id: C03
name: Menu Home
actor: customer
route: /t/demo-table-5/menu
viewport: 390x844
priority: P0

components:
  - CustomerHeader
  - MenuHero
  - CategoryTabs
  - MenuItemCard
  - StickyCustomerActions

assets:
  - B001
  - H001
  - M101
  - M102

api:
  - GET /api/menu
  - GET /api/sessions/{code}

events:
  incoming:
    - SessionClosed

states:
  - default
  - loading
  - offline
  - error

business_rules:
  - BR-002
  - BR-003

responsive:
  mobile_first: true
```

---

# 4. Component handoff

Mỗi component cần:

- Tên.
- Mục đích.
- Props.
- States.
- Variants.
- Responsive rules.
- Accessibility.
- Mapping tới thư viện UI (ví dụ shadcn-vue).

Ví dụ:

```yaml
component: MenuItemCard

variants:
  - default
  - unavailable
  - loading

states:
  - hover
  - focus
  - disabled

responsive:
  mobile: full width
  desktop: grid
```

---

# 5. Asset handoff

Mỗi asset phải có:

```yaml
asset_id: M101
file_name: coffee-black-iced.webp
usage:
  - C03
  - C05

status: approved
```

Không dùng asset không có ID.

---

# 6. API & Event mapping

Cho từng screen:

| Screen | API | Event (kênh) |
|---|---|---|
| C03 | `GET /api/menu` | `SessionClosed` (`session.{code}`) |
| C12 | `GET /api/sessions/{code}` | `OrderItemStatusUpdated` (`session.{code}`) |
| A40 | `GET /api/admin/orders` | `OrderPlaced`, `OrderItemStatusUpdated`, `BillRequested` (`admin.orders`) |
| S10 | — *(không có API, chỉ nghe event)* | `StaffCalled`, `BillRequested` (`staff`) |
| K04 | `GET /api/kitchen/tickets` | `OrderPlaced` (`kitchen`) |

Toàn bộ endpoint và event trong tài liệu này đã đối chiếu với `system_overview.md` §6–§7 và `docs/plans/`. **Không còn mục nào ở trạng thái `proposal`** — xem §13.

Chỉ 5 event tồn tại, đúng bảng ở `system_overview.md` §7: `OrderPlaced`, `OrderItemStatusUpdated`, `StaffCalled`, `BillRequested`, `SessionClosed`. Không tự thêm event mới khi làm prototype.

---

# 7. Route manifest

**Ba layout, không phải bốn** (`system_overview.md` §8). Staff không có nhánh route riêng — dùng chung `/admin`.

```yaml
customer:            # CustomerLayout — mobile-first, không đăng nhập
  - /t/:qrToken                       # C01 QR Entry
  - /t/:qrToken/menu                  # C03
  - /t/:qrToken/cart                  # C08
  - /t/:qrToken/cart/review           # C09
  - /t/:qrToken/order-success/:orderId # C11
  - /t/:qrToken/orders                # C12
  - /t/:qrToken/payment               # C19
  - /t/:qrToken/closed                # C23
  - /payment/return                   # C21
  - /payment/success                  # C22

admin:               # AdminLayout — dùng chung cho role admin VÀ staff
  - /admin/login
  - /admin                            # redirect động theo landingRoute
  - /admin/menu/categories            # menu.manage
  - /admin/menu/items                 # menu.manage
  - /admin/tables                     # table.manage
  - /admin/orders/live                # order.view   ← staff vào đây
  - /admin/orders/history             # order.view   ← staff vào đây
  - /admin/orders/:id
  - /admin/sessions/:code
  - /admin/reports                    # report.view
  - /admin/users                      # user.manage

kitchen:             # KitchenLayout — KDS, permission order.update
  - /kitchen
```

Staff screens (S*) map vào nhánh `admin` ở trên; S10–S13 là drawer của notification bell trong `AdminLayout`, không phải route.

---

# 8. Responsive specification

Cho mỗi screen:

- Primary viewport.
- Breakpoints hỗ trợ.
- Thành phần sticky.
- Scroll region.
- Collapse behavior.

---

# 9. Accessibility checklist

Mỗi screen cần xác nhận:

- Contrast đạt chuẩn.
- Keyboard navigation.
- Focus visible.
- Semantic heading.
- Alt text.
- Form label.
- Touch target ≥ 44px.

---

# 10. QA acceptance

QA phải kiểm tra:

- Flow đúng.
- Route đúng.
- Canonical data đúng.
- Asset đúng.
- Component đúng.
- Loading.
- Empty.
- Error.
- Offline.
- Permission.
- Responsive.

---

# 11. Traceability matrix

Mỗi screen phải truy vết được:

```text
Requirement
→ Flow
→ Screen
→ Component
→ API
→ Event
→ QA testcase
```

Ví dụ:

```text
Customer thanh toán
→ Step 04 C19–C23
→ PaymentMethod
→ POST /api/sessions/{code}/checkout
→ SessionClosed
→ TC-PAY-001
```

---

# 12. Versioning

Mỗi package:

```yaml
version: 1.0.0
approved_at:
approved_by:
```

Changelog:

```text
1.0.0 Initial handoff
1.0.1 Update payment flow
```

---

# 13. Implementation notes

Đối với các điểm chưa được tài liệu nguồn chốt (source gaps):

- Đánh dấu rõ `proposal`.
- Không coi là yêu cầu backend chính thức.
- Chỉ triển khai sau khi được xác nhận.

Các source gap trước đây — **đã đối chiếu `docs/plans/` và chốt hết**, không còn `proposal` nào:

| # | Gap | Chốt | Nguồn |
|---|---|---|---|
| 1 | Staff request endpoints | **Không có endpoint.** `StaffCalled`/`BillRequested` là event không persist; acknowledge là state client | `system_overview.md` §7, `phase-07-realtime.md` |
| 2 | KDS endpoints | `GET /api/kitchen/tickets`, `PATCH /api/kitchen/order-items/{id}/status`, `PATCH /api/kitchen/orders/{id}/status` | `phase-06-kds.md` Bước 2 |
| 3 | Actor chuyển `ready → served` | **KDS/barista**, ngay trên màn bếp | `phase-06-kds.md` |
| 4 | Ticket removal rule | Ticket rời board khi **mọi item** ở `served` hoặc `cancelled` (query `whereNotIn`) | `phase-06-kds.md` |
| 5 | Payment tự close session hay tách bước | **Tự động.** `SessionService::close()` chạy trong cùng transaction thanh toán | `phase-08-payment.md` |
| 6 | SLA overdue | `urgency: normal / warning / critical` theo `waiting_minutes` — ngưỡng chốt ở `07_kds_flow.md` | `phase-06-kds.md` `TicketResource` |

---

# 14. Final handoff checklist

- Design System được tham chiếu.
- Component Library được tham chiếu.
- Asset IDs hợp lệ.
- Screen spec đầy đủ.
- API/Event mapping đầy đủ.
- Responsive notes đầy đủ.
- Accessibility hoàn thành.
- QA checklist hoàn thành.
- Version/changelog cập nhật.
- Source gaps được đánh dấu.

---

# 15. Acceptance criteria Step 10

Step 10 hoàn thành khi:

- Có cấu trúc handoff thống nhất.
- Mỗi screen có spec chuẩn.
- Có component handoff.
- Có asset handoff.
- Có API/Event mapping.
- Có route manifest.
- Có responsive spec.
- Có accessibility checklist.
- Có QA acceptance.
- Có traceability matrix.
- Có versioning/changelog.
- Có source-gap policy.
- Có thể bàn giao cho đội Frontend, Backend và QA mà không cần giải thích thêm.
