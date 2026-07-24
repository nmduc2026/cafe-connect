# 09 — Prototype Production Plan: cafe-connect

> **Phụ thuộc:** `01_design_system.md` đến `08_state_error_matrix.md`
>
> **Phạm vi:** Kế hoạch sản xuất toàn bộ wireframe/prototype cho Customer, Admin, Staff, KDS và các state/error.
>
> **Mục tiêu:** Biến toàn bộ tài liệu trước đó thành một pipeline tạo screen có thể kiểm soát, review và version hóa; đảm bảo không screen nào tự phát sinh dữ liệu, asset hoặc flow ngoài source of truth.

---

# 1. Production objective

Prototype phải đạt 5 mục tiêu:

```text
1. Flow đầy đủ
2. Data nhất quán
3. Asset nhất quán
4. Component nhất quán
5. Có thể handoff cho implementation
```

Prototype không chỉ là hình đẹp.

Mỗi screen phải đủ để:

- Hiểu actor đang làm gì.
- Hiểu dữ liệu nào đang hiển thị.
- Hiểu action chính/phụ.
- Hiểu state hiện tại.
- Biết màn trước và màn sau.
- Biết component nào dùng.
- Biết API/event nào liên quan.
- Biết responsive behavior.

---

# 2. Deliverable hierarchy

Output chia thành 6 lớp:

```text
L1 — Screen inventory
L2 — Wireframe
L3 — High-fidelity screen
L4 — State variants
L5 — Clickable prototype
L6 — Handoff package
```

## L1 — Screen inventory

Đã có từ Step 04–08.

## L2 — Wireframe

- Grayscale.
- Chốt hierarchy/layout.
- Không tập trung ảnh đẹp.
- Kiểm tra flow và information architecture.

## L3 — High fidelity

- Áp Design System.
- Áp Asset Library.
- Áp Component Library.
- Dùng canonical fixtures.

## L4 — State variants

- Loading.
- Empty.
- Error.
- Offline.
- Permission.
- Conflict.
- Success.
- Validation.

## L5 — Clickable prototype

- Link các màn chính.
- Không cần mọi error đều clickable.
- Core user journey phải chạy đầu-cuối.

## L6 — Handoff package

- Screen spec.
- Design tokens.
- Component mapping.
- Assets.
- Route/API/event mapping.
- Acceptance checklist.

---

# 3. Folder structure

```text
prototype/
├── 00_manifest/
│   ├── screen_manifest.json
│   ├── flow_manifest.json
│   ├── asset_usage.json
│   └── review_status.json
│
├── 01_wireframes/
│   ├── customer/
│   ├── admin/
│   ├── staff/
│   ├── kitchen/
│   └── states/
│
├── 02_high_fidelity/
│   ├── customer/
│   ├── admin/
│   ├── staff/
│   ├── kitchen/
│   └── states/
│
├── 03_prototype/
│   ├── customer/
│   ├── admin/
│   ├── staff/
│   └── cross-platform/
│
├── 04_specs/
│   ├── customer/
│   ├── admin/
│   ├── staff/
│   ├── kitchen/
│   └── states/
│
├── 05_review/
│   ├── pending/
│   ├── approved/
│   ├── rejected/
│   └── changelog/
│
└── 06_handoff/
    ├── assets/
    ├── tokens/
    ├── components/
    ├── routes/
    ├── api-events/
    └── qa/
```

---

# 4. Naming convention

## Screen image

```text
{platform}_{screen-id}_{slug}_{viewport}_{version}.{ext}
```

Ví dụ:

```text
customer_C03_menu-home_390x844_v01.png
admin_A20_menu-item-list_1440x1024_v01.png
staff_S21_session-detail_1024x768_v01.png
kds_K04_live-board_1440x1024_v01.png
```

## State variant

```text
{platform}_{screen-id}_{slug}__{state}_{viewport}_{version}.png
```

Ví dụ:

```text
customer_C08_cart__empty_390x844_v01.png
admin_A20_menu-item-list__loading_1440x1024_v01.png
kds_K04_live-board__offline_1440x1024_v01.png
```

## Screen spec

```text
{platform}_{screen-id}_{slug}.yaml
```

## Review file

```text
{platform}_{screen-id}_{slug}_review.md
```

---

# 5. Versioning rules

## Version format

```text
v01
v02
v03
```

## When to increment

Increment khi:

- Layout thay đổi.
- Content hierarchy thay đổi.
- Component thay đổi.
- Asset thay đổi.
- Business state thay đổi.
- Review yêu cầu sửa.

Không increment chỉ vì:

- Export lại cùng nội dung.
- Nén ảnh.
- Đổi metadata không ảnh hưởng visual.

## Approved version

Mỗi screen chỉ có một approved version hiện hành.

Ví dụ:

```yaml
screen_id: C03
approved_version: v04
status: approved
supersedes:
  - v01
  - v02
  - v03
```

---

# 6. Screen manifest

Mỗi screen cần record:

```yaml
screen_id: C03
platform: customer
name: Menu Home
slug: menu-home
route: /t/demo-table-5/menu
viewport: 390x844
priority: P0
batch: CUSTOMER-A
status: planned
depends_on:
  - 01_design_system
  - 02_component_library
  - 03_asset_library
  - 04_customer_flow

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

states:
  - default
  - loading
  - menu_error
  - offline

previous:
  - C02

next:
  - C05
  - C08
  - C12
  - C17

review:
  design: pending
  data: pending
  flow: pending
  accessibility: pending
```

---

# 7. Priority model

| Priority | Meaning |
|---|---|
| P0 | Core flow, bắt buộc prototype |
| P1 | Important operation/state |
| P2 | Secondary/edge |
| P3 | Optional/future |

## P0 examples

- Customer menu/cart/order/tracking/payment.
- Admin menu/table/order.
- Staff requests/payment.
- KDS live board/status changes.

## P1 examples

- Empty/loading/error.
- QR regenerate.
- Reports overview.
- Session history.

## P2 examples

- Focus mode.
- Copy option group.
- Advanced filter/export.
- Optional undo.

## P3 examples

- Non-MVP enhancement.
- Future actor/action chưa source-confirmed.

---

# 8. Production phases

# Phase 1 — Inventory lock

Tasks:

- Freeze screen IDs.
- Freeze canonical data.
- Freeze asset IDs.
- Freeze primary routes.
- Mark source gaps.
- Assign priority.

Exit criteria:

- Không còn screen không có ID.
- Không còn total/order code mâu thuẫn.
- Không còn asset không có manifest.

# Phase 2 — Low-fidelity wireframes

Tasks:

- Build layout.
- Place content blocks.
- Validate hierarchy.
- Validate responsive pattern.
- Validate screen transitions.

Exit criteria:

- Core flow đi được.
- Action chính nhìn thấy.
- Không có missing state.
- Review flow approved.

# Phase 3 — High fidelity

Tasks:

- Apply tokens.
- Apply typography.
- Apply approved assets.
- Apply component styles.
- Use real canonical copy/data.

Exit criteria:

- Design review approved.
- Asset review approved.
- Data review approved.

# Phase 4 — State variants

Tasks:

- Loading.
- Empty.
- Error.
- Offline.
- Validation.
- Permission.
- Conflict.

Exit criteria:

- Step 08 coverage complete.
- Critical mutations có failure state.

# Phase 5 — Clickable prototype

Tasks:

- Link P0 screens.
- Add overlays.
- Add success/error branches.
- Add cross-platform transitions where useful.

Exit criteria:

- Customer end-to-end.
- Admin core CRUD.
- Staff payment.
- KDS item lifecycle.

# Phase 6 — Handoff

Tasks:

- Export specs.
- Export assets.
- Map components.
- Map routes.
- Map API/events.
- QA package.

---

# 9. Production batches

# CUSTOMER

## CUSTOMER-A — Entry and menu

| Order | ID | Screen | Priority |
|---:|---|---|---|
| 1 | C01 | QR Entry | P0 |
| 2 | C02 | Session Loading | P0 |
| 3 | C03 | Menu Home | P0 |
| 4 | C04 | Category Browse | P0 |
| 5 | C05 | Product Detail | P0 |
| 6 | C06 | Product Validation | P1 |
| 7 | C07 | Added to Cart | P1 |

## CUSTOMER-B — Cart and order

| Order | ID | Screen | Priority |
|---:|---|---|---|
| 8 | C08 | Cart | P0 |
| 9 | C09 | Order Review | P0 |
| 10 | C10 | Order Submitting | P1 |
| 11 | C11 | Order Success | P0 |

## CUSTOMER-C — Tracking and add more

| Order | ID | Screen | Priority |
|---:|---|---|---|
| 12 | C12 | Order Tracking | P0 |
| 13 | C13 | Item Preparing | P1 |
| 14 | C14 | Item Ready | P1 |
| 15 | C15 | Item Served | P1 |
| 16 | C16 | Add More Items | P0 |
| 17 | C17 | Staff Call | P1 |
| 18 | C18 | Bill Request | P0 |

## CUSTOMER-D — Payment

| Order | ID | Screen | Priority |
|---:|---|---|---|
| 19 | C19 | Payment Method | P0 |
| 20 | C20 | VNPay Redirect | P1 |
| 21 | C21 | Payment Pending | P0 |
| 22 | C22 | Payment Success | P0 |
| 23 | C23 | Session Closed | P0 |

## CUSTOMER-E — Errors

| ID | State | Priority |
|---|---|---|
| E01 | Invalid QR | P1 |
| E02 | Session Expired | P1 |
| E03 | Menu Load Error | P1 |
| E04 | Item Unavailable | P0 |
| E05 | Order Submit Error | P0 |
| E06 | Offline | P0 |
| E07 | Payment Failed | P0 |
| E08 | Payment Cancelled | P1 |

---

# ADMIN

## ADMIN-A — Auth/dashboard

- A01 Login — P0.
- A02 Login loading/error — P1.
- A03 Dashboard — P0.
- A70 Notifications — P1.
- A74 Permission denied — P1.

## ADMIN-B — Categories

- A10 Category list — P0.
- A11 Create category — P0.
- A12 Edit category — P0.
- A13 Delete blocked/confirm — P1.
- A14 Empty/error — P1.

## ADMIN-C — Menu items

- A20 List — P0.
- A21 Create — P0.
- A22 Edit — P0.
- A23 Delete — P1.
- A24 Availability — P0.
- A25 Upload image — P1.
- A26 Option group editor — P0.
- A27 Copy option group — P2.
- A28 Preview — P1.
- A29 Validation/error — P1.

## ADMIN-D — Tables and QR

- A30 Table list — P0.
- A31 Create table — P0.
- A32 Edit table — P1.
- A33 Delete blocked — P1.
- A34 QR preview — P0.
- A35 Generate QR — P0.
- A36 Regenerate confirm — P1.
- A37 Download/print — P1.
- A38 Error — P1.

## ADMIN-E — Orders/sessions

- A40 Live orders — P0.
- A41 Order detail — P0.
- A42 Session detail — P0.
- A43 Cash payment — P0.
- A44 Bank transfer — P0.
- A45 Close session — P0.
- A46 History — P1.
- A48 Error/reconnect — P1.

## ADMIN-F — Reports

- A50 Overview — P1.
- A51 Revenue — P1.
- A52 Top items — P1.
- A53 Peak hours — P1.
- A55 Empty/error — P1.

## ADMIN-G — Users

- A60 Staff list — P1.
- A61 Create staff — P1.
- A62 Edit staff — P1.
- A63 Permissions — P1.
- A64 Disable — P1.
- A65 Delete/blocked — P2.
- A66 Error — P1.

---

# STAFF

## STAFF-A — Startup/dashboard

- S01 Login — P0.
- S02 Dashboard — P0.
- S40 Notifications — P1.
- S41 Offline — P0.

## STAFF-B — Requests

- S10 Request inbox — P0.
- S11 Staff call detail — P0.
- S12 Acknowledge — P1.
- S13 Bill request detail — P0.
- S14 Session from request — P0.
- S45 Empty request — P1.

## STAFF-C — Sessions

- S20 Active sessions — P0.
- S21 Session detail — P0.
- S22 Order detail — P1.
- S45 Empty sessions — P1.

## STAFF-D — Payment

- S23 Method — P0.
- S24 Cash — P0.
- S25 Transfer — P0.
- S26 Confirmation — P0.
- S42 Conflict — P0.
- S27 Close session — P0.
- S28 Success — P0.
- S43 Already closed — P1.

## STAFF-E — History/security

- S30 History — P1.
- S31 Detail — P1.
- S44 Permission denied — P1.

---

# KDS

## KDS-A — Startup

- K01 Login — P0.
- K02 Audio permission — P1.
- K03 Loading — P1.
- K30 Empty — P1.
- K31 Permission denied — P1.

## KDS-B — Core board

- K04 Live board — P0.
- K05 New ticket — P0.
- K06 Highlight/sound — P1.
- K07 Start item — P0.
- K08 Preparing — P0.
- K09 Mark ready — P0.
- K10 Ready — P0.

## KDS-C — Operations

- K11 Long ticket — P1.
- K12 Overdue — P0.
- K13 Filter — P1.
- K13 Focus — P2.
- K14 Sound settings — P2.
- K15 Undo — P2.
- K16 Cancelled item — P2.
- K17 Conflict — P0.

## KDS-D — Connectivity

- K20 Reconnecting — P0.
- K21 Offline — P0.
- K22 Reconnected sync — P1.
- K23 Stale conflict — P1.
- K32 Session expired — P1.

---

# 10. Minimum viable prototype scope

Nếu cần ra prototype nhanh, làm P0 trước.

## Customer P0

```text
C01 → C03 → C05 → C08 → C09 → C11 → C12
→ C16 → C18 → C19 → C21 → C22 → C23
```

Plus:

- E04.
- E05.
- E06.
- E07.

## Admin P0

```text
A01 → A03
A20 → A21/A22/A24/A26
A30 → A31/A34/A35
A40 → A41/A42 → A43/A44 → A45
```

## Staff P0

```text
S01 → S02 → S10 → S13/S14
→ S21 → S23 → S24/S25 → S26 → S27 → S28
```

## KDS P0

```text
K01 → K04 → K05 → K07 → K08 → K09 → K10
```

Plus:

- K12.
- K17.
- K20.
- K21.

---

# 11. Wireframe rules

Wireframe chỉ dùng:

- Grayscale.
- Real text.
- Real canonical data.
- Asset placeholder có ID.
- Component label optional.
- Không dùng lorem ipsum.

## Must show

- Header/navigation.
- Main content hierarchy.
- Primary CTA.
- Secondary action.
- State indicator.
- Scroll/fixed areas.
- Overlay boundary.
- Responsive viewport.

## Must not show

- Random product name.
- Random amount.
- New routes.
- New business logic.
- Decorative UI chưa có trong Design System.

---

# 12. High-fidelity rules

## Design System

- Color/token từ Step 01.
- Typography đúng scale.
- Spacing đúng scale.
- Radius/shadow đúng convention.
- Accessibility contrast.

## Component Library

Không vẽ component mới nếu component tương đương đã có.

Nếu bắt buộc thêm component:

1. Ghi reason.
2. Add vào component library.
3. Version component.
4. Sau đó mới dùng.

## Asset Library

Chỉ dùng asset status `approved`.

Trong giai đoạn prototype chưa generate asset thật:

- Dùng placeholder với Asset ID.
- Không thay bằng ảnh random web.

---

# 13. Prompt template — wireframe

```text
Create one responsive web wireframe for cafe-connect.

Screen:
{screen_id} — {screen_name}

Platform:
{platform}

Viewport:
{viewport}

Purpose:
{purpose}

Previous screen:
{previous}

Next actions:
{next_actions}

Layout:
{layout_anatomy}

Canonical content:
{canonical_content}

Components:
{components}

State:
{state}

Rules:
- One image contains exactly one screen.
- Use grayscale wireframe styling.
- Use Vietnamese copy exactly as specified.
- Use canonical names, order codes, table names and amounts.
- Do not invent new features.
- Do not combine desktop and mobile.
- Show fixed/sticky regions clearly.
- Keep it implementation-oriented, not a marketing mockup.
```

---

# 14. Prompt template — high fidelity

```text
Create one high-fidelity responsive web UI screen for cafe-connect.

Screen:
{screen_id} — {screen_name}

Platform:
{platform}

Viewport:
{viewport}

Use:
- Design System from Step 01.
- Components from Step 02.
- Approved assets from Step 03.
- Flow and canonical data from Step {flow_step}.
- State rules from Step 08.

Canonical data:
{canonical_data}

Assets:
{asset_ids}

Components:
{components}

State:
{state}

Navigation:
Previous: {previous}
Next: {next}

Critical rules:
- One image contains exactly one screen.
- This is responsive web, not a native mobile app.
- Use Vietnamese UI copy.
- Do not invent data, prices, order codes or business rules.
- Use only listed assets.
- Keep Customer/Admin/Staff/KDS visual language consistent but role-appropriate.
- Ensure primary action and current state are immediately visible.
- No device mockup frame unless explicitly requested.
```

---

# 15. Prompt template — state variant

```text
Create the {state_name} variant of screen {screen_id}.

Base screen:
{base_screen}

Keep unchanged:
- Layout shell
- Navigation
- Canonical data that remains valid
- Component system
- Viewport

Change only:
{state_changes}

Use feedback pattern:
{feedback_component}

Recovery action:
{recovery}

Do not redesign the whole page.
```

---

# 16. Screen production checklist

Trước khi generate:

- Screen ID đúng.
- Viewport đúng.
- Priority đúng.
- Canonical data có.
- Asset list có.
- Component list có.
- Previous/next có.
- State có.
- Source gap được đánh dấu.

Sau khi generate:

- One screen only.
- Text đúng.
- Total đúng.
- Asset đúng.
- Layout đúng role.
- State rõ.
- Primary action rõ.
- Không phát sinh feature.
- Không thiếu navigation/context.

---

# 17. Review gates

Mỗi screen đi qua 5 gate.

# G1 — Flow review

Questions:

- Màn này xuất hiện đúng lúc không?
- Previous/next hợp lý không?
- Có branch thiếu không?
- Actor có đúng quyền không?

# G2 — Data review

- Tên bàn.
- Session code.
- Order code.
- Item.
- Price.
- Total.
- Status.
- Timestamp.

# G3 — Design review

- Token.
- Component.
- Hierarchy.
- Spacing.
- Responsive.
- Accessibility.

# G4 — State review

- Loading/error/empty có đúng pattern?
- Recovery action có?
- Critical mutation failure có?
- Offline/conflict có đúng?

# G5 — Implementation review

- Route rõ.
- API/event rõ.
- Component map rõ.
- Không có interaction không implement được.
- Source gap rõ.

---

# 18. Review status model

```text
planned
→ wireframe_ready
→ wireframe_review
→ wireframe_approved
→ high_fidelity_ready
→ high_fidelity_review
→ approved
→ handoff_ready
```

Failure:

```text
rejected
needs_changes
blocked
```

## Block reason examples

- Missing asset.
- Missing backend decision.
- Canonical data conflict.
- Component not defined.
- Permission unclear.
- State transition unclear.

---

# 19. Review record template

```yaml
screen_id: K04
version: v02
reviewed_at: 2026-07-22
status: needs_changes

checks:
  flow: pass
  data: pass
  design: needs_changes
  state: pass
  implementation: pass

issues:
  - severity: major
    area: design
    description: Waiting timer chưa đủ nổi bật khi nhìn xa.
    action: Tăng hierarchy theo Step 07.

  - severity: minor
    area: copy
    description: Dùng “Order mới” thay vì “Đơn mới”.
    action: Sửa về copy canonical.
```

---

# 20. Acceptance thresholds

## Approve

- Không có blocker.
- Không có critical issue.
- Không có data mismatch.
- Không có business rule mismatch.
- Major issue = 0.
- Minor issue có thể được ghi nhận nếu không ảnh hưởng handoff.

## Reject

- Sai flow.
- Sai actor.
- Sai total/order code.
- Dùng asset không approved.
- Invent feature.
- Gộp nhiều screen.
- Không xử lý state critical.

---

# 21. Cross-platform prototype links

Một số interaction cần nối giữa các platform để demo system behavior.

## Customer → KDS

```text
C10 submit
→ C11 success
→ K05 new ticket
```

## KDS → Customer/Admin

```text
K07/K09 status update
→ C13/C14
→ A41/A42 update
```

## Customer → Staff

```text
C17 call staff
→ S10/S11
```

```text
C18 bill request
→ S10/S13
```

## Staff/Admin → Customer

```text
S26/A43 payment
→ C22
```

```text
S27/A45 close
→ C23
```

Prototype cross-link chỉ cần demo key system behavior, không cần xây một hệ thống multi-user realtime thật.

---

# 22. Prototype interaction levels

## Level 1 — Navigation only

- Click button chuyển màn.
- Dùng cho broad flow.

## Level 2 — Overlay and state

- Dialog.
- Drawer.
- Bottom sheet.
- Toast.
- Validation.

## Level 3 — Simulated realtime

- New ticket appears.
- Status badge changes.
- Staff request appears.
- Payment success.

## Level 4 — Micro-interaction

- Timer.
- Loading animation.
- Pulse new ticket.
- Sound.

MVP prototype ưu tiên Level 1–3.

---

# 23. QA matrix

| QA Area | Customer | Admin | Staff | KDS |
|---|---:|---:|---:|---:|
| Route/navigation | Required | Required | Required | Required |
| Canonical data | Required | Required | Required | Required |
| Loading | Required | Required | Required | Required |
| Empty | Required | Required | Required | Required |
| Error | Required | Required | Required | Required |
| Offline | Required | Useful | Required | Critical |
| Permission | N/A mostly | Required | Required | Required |
| Conflict | Payment | CRUD/payment | Payment | Status |
| Responsive | Mobile-first | Desktop-first | Tablet-first | Desktop/tablet |
| Realtime simulation | Tracking | Orders | Requests | Core |

---

# 24. Handoff package

Mỗi approved screen phải có:

```text
1. PNG/WebP export
2. YAML screen spec
3. Component mapping
4. Asset mapping
5. Route
6. API/event mapping
7. Responsive notes
8. State notes
9. Review record
10. Approved version
```

## Example handoff bundle

```text
06_handoff/screens/customer/C03/
├── customer_C03_menu-home_390x844_v04.png
├── customer_C03_menu-home.yaml
├── customer_C03_menu-home_review.md
└── customer_C03_menu-home_assets.json
```

---

# 25. Machine-readable flow manifest

Example:

```json
{
  "platform": "customer",
  "start": "C01",
  "nodes": {
    "C01": {
      "success": "C02",
      "invalid": "E01"
    },
    "C02": {
      "success": "C03",
      "expired": "E02",
      "offline": "E06"
    },
    "C03": {
      "product": "C05",
      "cart": "C08",
      "tracking": "C12",
      "staff_call": "C17"
    }
  }
}
```

---

# 26. Production metrics

Track:

- Total screens planned.
- Wireframes complete.
- High-fidelity complete.
- Approved.
- Blocked.
- Average review revisions.
- Data mismatch count.
- Asset mismatch count.
- Flow defect count.

## Suggested dashboard

```yaml
planned: 120+
wireframe_complete: 0
high_fidelity_complete: 0
approved: 0
blocked: 0
```

Exact count depends on whether each state variant is counted as a separate screen.

---

# 27. Recommended first production sprint

## Goal

Hoàn thành một vertical slice xuyên 4 platform.

## Screens

### Customer

- C03 Menu.
- C05 Product Detail.
- C08 Cart.
- C11 Success.
- C12 Tracking.

### KDS

- K04 Board.
- K05 New Ticket.
- K07 Preparing.
- K09 Ready.

### Staff

- S10 Request inbox.
- S13 Bill request.
- S24 Cash payment.
- S28 Closed success.

### Admin

- A03 Dashboard.
- A40 Live orders.
- A42 Session detail.

## Why

Vertical slice này kiểm tra được:

- Design consistency.
- Canonical data.
- Realtime system story.
- Role differentiation.
- Customer-to-operations flow.
- Payment/session close.

---

# 28. Source-gap review queue

Trước handoff implementation, cần chốt các gap sau:

1. KDS endpoints chính xác.
2. Staff request inbox/acknowledge endpoints.
3. Actor chuyển `ready → served`.
4. Item cancellation actor/reason/state.
5. Payment `pay` có tự close session hay không.
6. Dedicated Staff route namespace.
7. User management API chi tiết.
8. Export orders/reports có thuộc MVP không.
9. SLA overdue thresholds.
10. Ticket removal rule sau ready.

Các gap không ngăn wireframe, nhưng có thể block final implementation spec.

---

# 29. Final production rules

- Không generate hàng loạt trước khi approve 2–3 screen mẫu mỗi platform.
- Không dùng AI output chưa review làm source of truth mới.
- Không sửa canonical data trong ảnh để “trông đẹp hơn”.
- Không dùng nhiều asset cho cùng một món.
- Không tạo component mới âm thầm.
- Không bỏ state critical để giảm số screen.
- Không coi prototype là backend requirement nếu tài liệu đánh dấu proposal.
- Approved spec mới là đầu vào handoff.

---

# 30. Acceptance criteria Step 09

Step 09 hoàn thành khi:

- Có deliverable hierarchy.
- Có folder structure.
- Có naming/versioning.
- Có screen manifest.
- Có priority model.
- Có production phases.
- Có batch cho Customer/Admin/Staff/KDS.
- Có minimum viable prototype scope.
- Có wireframe/high-fidelity rules.
- Có prompt templates.
- Có review gates/status/record.
- Có cross-platform links.
- Có QA matrix.
- Có handoff bundle.
- Có production metrics.
- Có first sprint recommendation.
- Có source-gap review queue.
- Có thể bắt đầu tạo prototype mà không tự nghĩ thêm quy trình.
