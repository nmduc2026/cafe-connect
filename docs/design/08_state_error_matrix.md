# 08 — State & Error Matrix: cafe-connect

> **Phụ thuộc:** `01_design_system.md` đến `07_kds_flow.md`
>
> **Phạm vi:** Toàn bộ loading, empty, validation, offline, permission, conflict và business error của Customer, Admin, Staff và KDS.
>
> **Mục tiêu:** Chuẩn hóa cách hệ thống phát hiện, hiển thị và phục hồi trạng thái lỗi; tránh mỗi module dùng một pattern khác nhau.

---

# 1. State taxonomy

Mọi trạng thái trong cafe-connect thuộc một trong 10 nhóm:

```text
1. Idle
2. Loading
3. Success
4. Empty
5. Validation
6. Business conflict
7. Permission/Auth
8. Network/Realtime
9. System/API error
10. Destructive confirmation
```

Không dùng một component chung cho tất cả. Mỗi nhóm có mức độ và cách phục hồi khác nhau.

---

# 2. Severity levels

| Level | Tên | Ý nghĩa | Ví dụ |
|---|---|---|---|
| L0 | Informational | Không cản flow | Toast đã lưu |
| L1 | Recoverable | Có thể thử lại | Menu load error |
| L2 | Blocking local | Chặn một action | Validation form |
| L3 | Blocking screen | Chặn screen hiện tại | Permission denied |
| L4 | Critical operational | Ảnh hưởng vận hành realtime | KDS offline |
| L5 | Data integrity risk | Có nguy cơ ghi đè hoặc thanh toán trùng | 409 payment conflict |

---

# 3. Feedback component mapping

| State | Component chính |
|---|---|
| Inline field error | FormField error |
| Action success | Toast |
| Recoverable API error | InlineAlert + Retry |
| Full empty | EmptyState |
| Full route error | ErrorState |
| Offline/reconnecting | StatusBanner |
| Permission denied | PermissionDeniedState |
| Conflict | ConflictDialog/InlineAlert |
| Destructive action | ConfirmationDialog |
| Background refresh | Subtle spinner/skeleton |
| Optimistic failure | Toast + revert |

---

# 4. Loading standards

# 4.1 Initial page loading

Dùng skeleton gần cấu trúc thật.

Không dùng spinner full-screen kéo dài trừ transitional state ngắn như redirect payment.

## Customer

- Menu card skeleton.
- Tracking timeline skeleton.
- Session loading lightweight.

## Admin

- Table row skeleton.
- Metric/chart skeleton.
- Form preload skeleton.

## Staff

- Request card skeleton.
- Session card/detail skeleton.

## KDS

- Column skeleton.
- Không phát sound khi initial hydrate.

---

# 4.2 Mutation loading

Áp dụng cho:

- Add/edit/delete.
- Submit order.
- Confirm payment.
- Change KDS item status.
- Regenerate QR.

Rules:

- Disable action đang submit.
- Giữ nguyên label hoặc thêm loading label rõ.
- Không disable toàn màn hình nếu không cần.
- Prevent double submit.
- Mutation critical phải chờ server success trước khi chuyển state cuối.

---

# 4.3 Background refresh

Biểu hiện nhẹ:

- Spinner nhỏ trong toolbar.
- `Đang cập nhật`.
- Không thay toàn bộ content bằng skeleton.
- Giữ dữ liệu cũ trong lúc refetch.

---

# 5. Empty state standards

# 5.1 Structural empty

Không có dữ liệu vì chưa được tạo.

Ví dụ:

- Chưa có món.
- Chưa có bàn.
- Chưa có nhân viên.

UI:

- Illustration/icon.
- Title.
- Description.
- Primary CTA nếu user có permission.

# 5.2 Filter empty

Có data tổng thể nhưng filter không match.

UI:

```text
Không tìm thấy kết quả phù hợp
```

Actions:

- Xóa bộ lọc.
- Đổi từ khóa.

Không dùng illustration lớn.

# 5.3 Operational empty

Không có việc cần xử lý.

Ví dụ:

- KDS chưa có ticket.
- Staff chưa có request.
- Không có phiên đang mở.

UI nhẹ, tích cực, không tạo cảm giác lỗi.

---

# 6. Validation standards

# 6.1 Field validation

- Error ngay dưới field.
- Focus field lỗi đầu tiên.
- Giữ dữ liệu đã nhập.
- Message cụ thể.

Ví dụ tốt:

```text
Giá phải lớn hơn hoặc bằng 0.
```

Ví dụ không tốt:

```text
Dữ liệu không hợp lệ.
```

# 6.2 Cross-field validation

Dùng InlineAlert ở đầu section và error tại field liên quan.

Ví dụ:

```text
Số lượng chọn tối đa phải lớn hơn hoặc bằng số lượng tối thiểu.
```

# 6.3 Server validation

HTTP 422 map về field.

Các lỗi không map được hiển thị form-level alert.

---

# 7. Authentication and permission matrix

| Condition | HTTP | UI |
|---|---:|---|
| Chưa đăng nhập | 401 | Redirect login |
| Token hết hạn, refresh được | 401 | Silent refresh |
| Token hết hạn, refresh fail | 401 | Session expired |
| Đã đăng nhập nhưng thiếu quyền | 403 | Permission denied |
| Role sai surface | 403/route guard | Redirect surface phù hợp hoặc denied |

## Rules

- Backend là nguồn cuối về permission.
- Ẩn action/navigation theo permission.
- Direct URL vẫn phải xử lý 403.
- Không tiết lộ nội dung nhạy cảm sau denied.

---

# 8. HTTP error mapping

| HTTP | Ý nghĩa | Pattern |
|---:|---|---|
| 400 | Request sai | InlineAlert |
| 401 | Unauthenticated | Refresh hoặc login |
| 403 | Forbidden | PermissionDeniedState |
| 404 | Not found | ErrorState |
| 409 | Conflict | ConflictDialog + refetch |
| 410 | Expired/gone | Session expired/QR expired |
| 422 | Validation | Field errors |
| 429 | Rate limited | Warning + cooldown |
| 500 | Server error | Error alert + retry |
| 502/503/504 | Service unavailable | Status/ErrorState + retry |

---

# 9. Network state model

```text
online
→ reconnecting
→ online

online
→ offline
→ reconnecting
→ online
```

## Definitions

### Online

- HTTP và realtime hoạt động.

### Reconnecting

- Realtime mất, network có thể còn.
- Giữ dữ liệu cũ.
- Hiển thị banner.
- Hạn chế mutation nhạy cảm.

### Offline

- Không có network.
- Read-only cached data nếu có.
- Không giả vờ submit thành công.

### Reconnected

- Refetch snapshot.
- Reconcile server state.
- Clear banner.
- Toast success nhẹ.

---

# 10. Realtime error standards

# 10.1 Duplicate event

- Dedupe theo event/entity ID.
- Không duplicate ticket/order/request.

# 10.2 Out-of-order event

- So sánh version hoặc updated_at.
- Không áp event cũ đè state mới.

# 10.3 Missed event

- Reconnect phải refetch snapshot.
- Không chỉ subscribe lại rồi tin local state.

# 10.4 Event payload thiếu

- Refetch entity cụ thể.
- Không refetch toàn app nếu không cần.

# 10.5 Optimistic realtime mutation fail

- Revert.
- Toast error.
- Refetch entity.
- Preserve scroll/selection.

---

# 11. Conflict standards

Conflict thường là HTTP 409 hoặc state mismatch.

## Common conflict cases

- Menu item đã bị sửa bởi user khác.
- QR đã regenerate.
- Payment đã được xử lý.
- Session đã đóng.
- KDS item đã đổi trạng thái.
- Table đang có session open.
- Staff account là admin cuối cùng.

## UI pattern

Title:

```text
Dữ liệu vừa thay đổi
```

Description:

- Nói entity nào thay đổi.
- Nói action hiện tại không được áp dụng.

Actions:

- Tải trạng thái mới.
- Hủy.

Không cung cấp `Ghi đè` nếu backend không có versioning/permission rõ.

---

# 12. Destructive confirmation standards

Áp dụng:

- Delete category/item/table/user.
- Regenerate QR.
- Cancel item nếu được hỗ trợ.
- Close session.
- Logout không cần confirm mặc định.

Dialog phải có:

1. Tên entity.
2. Hậu quả.
3. Block reason nếu không thể.
4. Button action cụ thể.

Ví dụ:

```text
Xóa món “Cà phê sữa đá”?
Món sẽ không còn xuất hiện trên menu khách.
```

Không dùng:

```text
Bạn có chắc không?
```

---

# 13. Customer matrix

| ID | State | UI | Recovery |
|---|---|---|---|
| C01-L | QR/session loading | Spinner/status | Auto |
| E01 | Invalid QR | ErrorState | Scan again/call staff |
| E02 | Session expired | I103 + ErrorState | Rescan |
| E03 | Menu load error | Inline/full error | Retry |
| C03-E | Menu empty | EmptyState | Call staff optional |
| C05-V | Missing option | Inline field error | Select option |
| C06-V | Max topping exceeded | Inline error | Reduce selection |
| C08-E | Empty cart | I101 | Back to menu |
| E04 | Item unavailable | InlineAlert + cart update | Choose another item |
| E05 | Order submit fail | Error alert | Retry, keep cart |
| E06 | Offline | StatusBanner | Auto reconnect |
| C10-L | Submit loading | Button/page state | Wait |
| C11-S | Order success | I102 | Track/add more |
| C12-R | Realtime disconnected | Banner | Reconnect/refetch |
| C17-429 | Staff call cooldown | Warning/countdown | Wait |
| C18-B | No payable order | Disabled + explanation | Order first |
| C21-L | Payment verifying | P101 | Poll/wait |
| E07 | Payment failed | P103 | Retry/change method |
| E08 | Payment cancelled | Info state | Retry/back |
| C22-S | Payment success | P102 | Complete |
| C23 | Session closed | Closed state | Rescan for new session |

---

# 14. Admin matrix

| Module | State | UI | Recovery |
|---|---|---|---|
| Login | Wrong credentials | Form alert | Retry |
| Dashboard | Metrics loading | Skeleton | Auto/retry |
| Dashboard | Realtime lost | Banner | Reconnect |
| Category | Empty | EmptyState + CTA | Create |
| Category | Delete blocked | Dialog/alert | Remove/move items |
| Category | Reorder fail | Toast + revert | Retry |
| Menu | Filter empty | Small empty | Clear filter |
| Menu | Image invalid | Field error | Replace file |
| Menu | Upload fail | Inline error | Retry upload |
| Menu | Save 422 | Field errors | Correct |
| Menu | Save 409 | Conflict dialog | Refetch |
| Availability | Mutation fail | Toast + revert | Retry |
| Table | Delete occupied | Block dialog | Close session first |
| QR | Generate fail | Inline error | Retry |
| QR | Regenerate | Destructive confirm | Confirm/cancel |
| Orders | Payment already paid | Conflict | Refresh |
| Orders | Session closed | Alert/read-only | History |
| Reports | No data | I203 | Change range |
| Reports | API fail | ErrorState | Retry |
| Users | Duplicate email | Field error | Change email |
| Users | Last admin | Block dialog | Assign another admin |
| Global | 403 | I204 | Back dashboard |
| Global | 401 expired | Session expired | Login |

---

# 15. Staff matrix

| ID | State | UI | Recovery |
|---|---|---|---|
| S02-L | Dashboard loading | Card skeleton | Auto |
| S10-E | No requests | I302 | Wait realtime |
| S11-C | Request already handled | Info/conflict | Refresh |
| S12-L | Acknowledge loading | Button loading | Wait |
| S20-E | No active sessions | I301 | Wait |
| S21-404 | Session not found | ErrorState | Back |
| S23-B | Payment already pending online | Warning | Refresh/wait |
| S24-V | Cash below total | Field error | Enter valid amount |
| S25-V | Missing confirmation data | Field/form error | Correct |
| S26-C | Duplicate payment | Conflict dialog | Refresh |
| S27-B | Close unpaid | Blocking alert | Pay first |
| S41 | Offline | StatusBanner | Reconnect |
| S42 | Payment conflict | Conflict dialog | Refetch |
| S43 | Session closed elsewhere | Info state | History |
| S44 | Permission denied | Denied state | Back |

---

# 16. KDS matrix

| ID | State | UI | Recovery |
|---|---|---|---|
| K02 | Audio blocked | Permission dialog | User gesture |
| K03-L | Board loading | Column skeleton | Auto |
| K30 | Empty board | I401 | Wait realtime |
| K05 | New ticket | Highlight + sound | Auto |
| K07-L | Start item loading | Item button loading | Wait |
| K07-E | Start item fail | Revert + toast | Retry |
| K09-E | Ready mutation fail | Revert + toast | Retry |
| K12 | Overdue | Label + priority | Process |
| K15-C | Undo no longer valid | Toast/conflict | Refresh |
| K16 | Cancelled item | Disabled row | No action |
| K17 | Device conflict | Conflict dialog | Refetch |
| K20 | Reconnecting | Banner | Auto |
| K21 | Offline | Banner/full state | Retry |
| K22 | Reconnected | Toast + sync | Auto |
| K23 | Stale data | Server wins + notice | Continue |
| K31 | Permission denied | Denied state | Login other user |
| K32 | Session expired | Blocking state | Login |

---

# 17. Business rule error catalog

# BR-001 — Table already has open session

Surface:

- Customer QR.
- Admin table actions.

Response:

```text
Bàn đang có phiên hoạt động.
```

Expected behavior:

- Customer joins existing session.
- Admin cannot create another open session.

# BR-002 — Item unavailable

Surface:

- Customer cart/review.
- Admin availability.

Behavior:

- Remove/block item.
- Recalculate total.
- Preserve remaining cart.

# BR-003 — Session closed

Surface:

- Customer submit/payment.
- Staff/Admin action.

Behavior:

- Read-only/closed state.
- No new order/payment mutation.

# BR-004 — Payment already completed

Surface:

- Staff/Admin/payment return.

Behavior:

- Do not create second payment.
- Show current paid status.
- Refetch session.

# BR-005 — Cannot close unpaid session

Surface:

- Staff/Admin.

Behavior:

- Blocking alert.
- Link/action to payment.

# BR-006 — Cannot delete occupied table

Surface:

- Admin.

Behavior:

- Block.
- Show active session/table.

# BR-007 — Cannot delete non-empty category

Surface:

- Admin.

Behavior:

- Block.
- Ask move/delete items first.

# BR-008 — QR token invalidated

Surface:

- Customer/Admin.

Behavior:

- Customer invalid QR.
- Admin shows new QR only.

# BR-009 — Invalid status transition

Surface:

- KDS.

Behavior:

- Conflict/error.
- Refetch item.
- No overwrite.

# BR-010 — Last admin protection

Surface:

- Admin users.

Behavior:

- Block disable/delete/role downgrade.

---

# 18. Error message writing rules

## Structure

```text
What happened
What it affects
What user can do
```

Example:

```text
Chưa gửi được đơn
Đơn của bạn vẫn được giữ trong giỏ.
Thử lại
```

## Tone

- Bình tĩnh.
- Cụ thể.
- Không đổ lỗi cho user.
- Không hiển thị stack trace.
- Không dùng mã lỗi làm headline.

## Technical detail

Admin/KDS có thể hiển thị request ID ở phần phụ:

```text
Mã tham chiếu: ERR-8F31
```

Customer không cần trừ khi hỗ trợ cần tra cứu.

---

# 19. Retry policy

| Action | Retry |
|---|---|
| GET menu/list/report | Manual + optional auto |
| Realtime reconnect | Auto exponential backoff |
| Order submit | Manual, preserve cart |
| Payment submit | Không tự retry mù |
| KDS status mutation | Manual after refetch |
| Image upload | Manual |
| QR generation | Manual |
| Background metrics | Auto safe |

## Critical rule

Không tự retry các mutation có nguy cơ duplicate nếu không có idempotency:

- Order creation.
- Payment.
- Session close.
- QR regenerate.

---

# 20. Idempotency guidance

Nên có idempotency key cho:

- Create order.
- Checkout/payment initialization.
- Confirm payment nếu API hỗ trợ.
- Session close.
- QR regenerate optional.

UI phải:

- Generate key per logical action.
- Reuse key khi retry cùng action.
- Không tạo key mới mỗi click retry nếu request trước không rõ kết quả.

---

# 21. Logging and observability UX

UI production nên capture:

- Route.
- Actor role.
- Entity ID.
- HTTP status.
- Request/correlation ID.
- Realtime connection status.
- Client timestamp.
- App version.

Không log:

- Password.
- Full token.
- Sensitive payment payload.
- Excessive personal data.

---

# 22. State ownership

| State | Owner |
|---|---|
| Form draft | Component/form store |
| Customer cart | Local persisted store |
| Server entity | Query/store cache |
| Auth | Auth store |
| Realtime connection | Realtime service |
| Toast | Global toaster |
| Dialog open | Local/page |
| Permission | Auth/permission store |
| KDS sound setting | Local device storage |
| Filters | URL/query where useful |

---

# 23. Global component contracts

# StatusBanner

Props:

```ts
interface StatusBannerProps {
  variant: 'info' | 'warning' | 'danger' | 'success'
  title: string
  description?: string
  actionLabel?: string
  isDismissible?: boolean
}
```

# ErrorState

```ts
interface ErrorStateProps {
  title: string
  description?: string
  retryLabel?: string
  backLabel?: string
  referenceId?: string
}
```

# EmptyState

```ts
interface EmptyStateProps {
  title: string
  description?: string
  asset?: string
  actionLabel?: string
  compact?: boolean
}
```

# ConflictDialog

```ts
interface ConflictDialogProps {
  entityName?: string
  description: string
  refreshLabel?: string
  cancelLabel?: string
}
```

---

# 24. Screen-state coverage checklist

Mỗi screen spec từ Step 04–07 phải khai báo tối thiểu:

```yaml
states:
  initial_loading:
  populated:
  empty:
  error:
  offline:
  permission:
```

Không phải state nào cũng áp dụng.

Mỗi mutation phải khai báo:

```yaml
mutation_states:
  idle:
  loading:
  success:
  validation_error:
  conflict:
  system_error:
```

---

# 25. Prototype requirements

Mỗi nhóm flow phải generate tối thiểu:

## Customer

- Loading.
- Empty cart.
- Validation.
- Offline.
- Item unavailable.
- Submit error.
- Payment failed.
- Session expired.

## Admin

- Table/list loading.
- Empty.
- Filter empty.
- Validation.
- Delete blocked.
- Permission denied.
- Conflict.
- API error.

## Staff

- No request.
- No active session.
- Payment validation.
- Payment conflict.
- Offline.
- Already closed.

## KDS

- Loading.
- Empty.
- New ticket.
- Overdue.
- Mutation error.
- Device conflict.
- Reconnecting.
- Offline.

---

# 26. State generation order

## Batch STATE-A — Global foundations

1. Skeleton patterns.
2. Toast variants.
3. InlineAlert variants.
4. StatusBanner variants.
5. EmptyState variants.
6. ErrorState variants.
7. PermissionDeniedState.
8. ConflictDialog.
9. ConfirmationDialog.

## Batch STATE-B — Customer

10. Invalid QR.
11. Session expired.
12. Menu error.
13. Empty cart.
14. Product validation.
15. Item unavailable.
16. Order submit error.
17. Offline.
18. Payment failed/cancelled.

## Batch STATE-C — Admin

19. Table skeleton.
20. Empty list.
21. Filter empty.
22. Form 422.
23. Delete blocked.
24. Optimistic revert.
25. Conflict.
26. Permission denied.
27. Report empty/error.

## Batch STATE-D — Staff

28. Empty requests.
29. Empty sessions.
30. Cash validation.
31. Payment conflict.
32. Session closed elsewhere.
33. Offline.

## Batch STATE-E — KDS

34. Empty board.
35. Overdue.
36. Mutation fail.
37. Device conflict.
38. Reconnecting.
39. Offline.
40. Reconnected sync.

---

# 27. Acceptance criteria Step 08

Step 08 hoàn thành khi:

- Có taxonomy state chung.
- Có severity levels.
- Có feedback component mapping.
- Có loading/empty/validation standards.
- Có auth/permission matrix.
- Có HTTP mapping.
- Có network/realtime model.
- Có conflict/destructive standards.
- Có matrix riêng cho Customer/Admin/Staff/KDS.
- Có business rule error catalog.
- Có retry/idempotency guidance.
- Có state ownership.
- Có component contracts.
- Có prototype coverage checklist.
- Không có flow nào xử lý lỗi trái ngược flow khác.
