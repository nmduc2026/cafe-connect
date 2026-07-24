# 01 — Design System: cafe-connect

> **Phạm vi:** Responsive web application cho hệ thống gọi món QR tại quán cafe.
>
> **Nguồn thiết kế:** `docs/system_overview.md` (kiến trúc & ERD), `docs/design/dessign_overview.md` (định hướng thị giác) và `docs/plans/` (10 phase triển khai).
>
> **Mục tiêu:** Tạo một nguồn quy chuẩn duy nhất để toàn bộ prototype Customer, Admin, Staff và KDS nhất quán về hình ảnh, dữ liệu, component và trạng thái.

---

## 1. Product surfaces

`cafe-connect` là một web app có nhiều layout theo vai trò, không phải native mobile app.

### 1.1 Customer Web

- Mở từ QR trên trình duyệt điện thoại.
- Mobile-first, có thể cài dạng PWA.
- Tối ưu cho thao tác một tay, đọc nhanh và gọi món tại bàn.
- Trên tablet/desktop vẫn dùng được nhưng giữ content column tập trung, không kéo giãn card quá rộng.

### 1.2 Admin Web

- Desktop-first.
- Dùng sidebar, header, bảng dữ liệu, filter, form và dialog/drawer.
- Hỗ trợ tablet ngang.
- Mobile chỉ hỗ trợ các thao tác khẩn cấp, không phải kích thước thiết kế chính.

### 1.3 Staff Web

- Tablet và desktop.
- Tập trung vào phiên bàn, yêu cầu gọi phục vụ, yêu cầu thanh toán và xác nhận thanh toán.
- Nút hành động lớn, trạng thái rõ, hạn chế form dài.

### 1.4 KDS — Quầy pha chế

- Desktop/tablet ngang.
- Kanban ticket theo trạng thái.
- Chữ lớn, độ tương phản cao, nhìn được từ xa.
- Ưu tiên tốc độ thao tác và âm thanh cảnh báo hơn trang trí.

---

## 2. Visual direction

### Từ khóa

**Cafe Việt hiện đại — sáng — ấm — sạch — gần gũi — dùng được thật.**

### Nên có

- Nền kem sáng và card trắng ấm.
- Chất liệu bàn gỗ sáng, menu giấy kem, cafe đá, bạc xỉu, QR giấy.
- Ảnh món ánh sáng tự nhiên, nhận biết rõ.
- Terracotta/cam đất làm màu hành động.
- Xanh lá dịu cho trạng thái thành công và hoàn thành.
- Khoảng trắng thoáng, border mềm và shadow nhẹ.

### Không dùng

- Giao diện quá tối hoặc phủ nâu đậm diện tích lớn.
- Gradient tím/xanh.
- Orb, bokeh hoặc decoration kiểu landing page SaaS.
- Glassmorphism nặng.
- Card lồng card nhiều tầng.
- Ảnh món tối, blur mạnh hoặc mang phong cách khác nhau.
- Hiệu ứng chỉ để trang trí nhưng làm giảm tốc độ thao tác.

---

## 3. Color tokens

Các mã màu dưới đây là chuẩn khởi đầu cho prototype và có thể đưa thẳng vào Tailwind CSS variables.

### 3.1 Brand and neutral

| Token | Hex | Công dụng |
|---|---:|---|
| `--background` | `#FBF7F1` | Nền chính toàn app |
| `--background-subtle` | `#F6EEE4` | Nền section, filter bar |
| `--surface` | `#FFFDFC` | Card, dialog, panel |
| `--surface-muted` | `#FAF4EC` | Card phụ, disabled surface |
| `--foreground` | `#35251D` | Text chính |
| `--foreground-muted` | `#75655B` | Text phụ |
| `--foreground-subtle` | `#9C8C81` | Placeholder, metadata |
| `--border` | `#E8DCCF` | Border mặc định |
| `--border-strong` | `#D7C4B3` | Border focus/selected |
| `--primary` | `#D9682B` | CTA, active tab, nút thêm |
| `--primary-hover` | `#BE5520` | Hover CTA |
| `--primary-soft` | `#FFF0E4` | Nền badge/tab primary |
| `--primary-foreground` | `#FFFFFF` | Text trên primary |
| `--espresso` | `#6A3E28` | Logo, heading đặc biệt |

### 3.2 Semantic status

| Token | Hex | Công dụng |
|---|---:|---|
| `--success` | `#3E8E53` | Thành công, còn hàng, ready/served |
| `--success-soft` | `#EAF5EC` | Nền success badge |
| `--warning` | `#C98222` | Đang làm, chờ xử lý |
| `--warning-soft` | `#FFF4DE` | Nền warning |
| `--info` | `#477A9E` | Đã nhận, thông tin |
| `--info-soft` | `#EAF2F7` | Nền info |
| `--danger` | `#C44B45` | Xóa, hủy, lỗi |
| `--danger-soft` | `#FBECEB` | Nền danger |
| `--disabled` | `#A89E97` | Text disabled |
| `--disabled-surface` | `#EEE9E4` | Nền disabled |

### 3.3 Trạng thái order item

| Business status | Label giao diện | Color |
|---|---|---|
| `pending` | Đã nhận | Info |
| `preparing` | Đang làm | Warning |
| `ready` | Sẵn sàng | Success |
| `served` | Đã phục vụ | Success neutral |
| `cancelled` | Đã hủy | Danger |

Không dùng màu để truyền đạt trạng thái một mình. Luôn đi kèm icon hoặc label.

---

## 4. Typography

### Font

- Primary: `Be Vietnam Pro`
- Fallback: `Inter`, `system-ui`, `sans-serif`
- Số tiền dùng tabular numbers khi có thể: `font-variant-numeric: tabular-nums`.

### Scale

| Token | Desktop | Mobile | Dùng cho |
|---|---:|---:|---|
| `display` | 36/44, 700 | 30/38, 700 | Empty/Success hero giới hạn |
| `h1` | 30/38, 700 | 26/34, 700 | Tiêu đề trang |
| `h2` | 24/32, 700 | 22/30, 700 | Tiêu đề section |
| `h3` | 20/28, 650 | 19/27, 650 | Card heading |
| `body-lg` | 17/26, 400 | 17/26, 400 | Nội dung quan trọng |
| `body` | 15/23, 400 | 15/23, 400 | Nội dung mặc định |
| `body-sm` | 14/20, 400 | 14/20, 400 | Metadata |
| `caption` | 12/18, 500 | 12/18, 500 | Badge, hint |
| `button` | 15/20, 600 | 15/20, 600 | Button |

### Quy tắc

- Không dùng text nhỏ hơn 12px.
- Giá tiền là thông tin nổi bật, dùng weight 650–700.
- KDS dùng tối thiểu 16px cho nội dung ticket và 20px cho tên bàn.
- Không dùng toàn bộ chữ in hoa cho paragraph hoặc button.

---

## 5. Spacing and sizing

Dùng hệ 4px:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

### Container

| Surface | Quy chuẩn |
|---|---|
| Customer mobile | Padding ngang 16px |
| Customer tablet | Max-width 760px, padding 24px |
| Customer desktop | Max-width 1120px; menu có thể chuyển 3–4 cột |
| Admin | Content max-width 1600px, padding 24–32px |
| Staff | Full width, padding 20–24px |
| KDS | Full viewport, padding 16–24px |

### Touch target

- Customer/Staff/KDS: tối thiểu `44 × 44px`.
- Nút chuyển trạng thái KDS: tối thiểu cao `48px`.
- Icon-only button phải có tooltip trên desktop và accessible label.

---

## 6. Radius and elevation

| Token | Value | Dùng cho |
|---|---:|---|
| `radius-sm` | 8px | Input, small badge |
| `radius-md` | 12px | Button, filter |
| `radius-lg` | 16px | Card, dialog |
| `radius-xl` | 20px | Customer hero, bottom sheet |
| `radius-full` | 999px | Pill/tab/status |

### Shadow

- `shadow-xs`: card thường, gần như phẳng.
- `shadow-sm`: hover card hoặc sticky bar.
- `shadow-md`: dialog, drawer, dropdown.
- Không dùng shadow đậm màu đen; dùng nâu xám với opacity thấp.

---

## 7. Responsive breakpoints

| Name | Width | Mục tiêu |
|---|---:|---|
| `xs` | `< 480px` | Điện thoại nhỏ |
| `sm` | `480–767px` | Customer mobile chính |
| `md` | `768–1023px` | Tablet |
| `lg` | `1024–1279px` | Laptop/KDS nhỏ |
| `xl` | `1280–1535px` | Desktop admin |
| `2xl` | `≥ 1536px` | KDS/desktop lớn |

### Responsive behavior

#### Customer

- `<768px`: một cột page, menu grid 2 cột nếu card đủ rộng; màn rất nhỏ có thể về 1 cột.
- `768–1023px`: menu 2–3 cột, cart summary dạng side sheet hoặc sticky bottom.
- `≥1024px`: content centered; menu bên trái, cart/session panel sticky bên phải.
- Không biến Customer desktop thành admin dashboard.

#### Admin

- `≥1024px`: sidebar cố định 248px.
- `768–1023px`: sidebar thu gọn/icon hoặc drawer.
- `<768px`: table chuyển card/list; form dùng full-screen sheet.

#### Staff

- Desktop: danh sách phiên/yêu cầu bên trái, chi tiết bên phải.
- Tablet: list → detail navigation hoặc drawer.
- Nút thanh toán và đóng bàn luôn nằm trong vùng nhìn thấy.

#### KDS

- `≥1280px`: 3 cột `Mới / Đang làm / Sẵn sàng`.
- `1024–1279px`: 3 cột hẹp hoặc horizontal scroll có snap.
- Tablet dọc: tab theo trạng thái, mỗi lần xem một cột.
- Không thiết kế KDS theo card mobile nhỏ.

---

## 8. Grid

### Customer menu card

- Mobile phổ biến: 2 cột, gap 12px.
- Mobile nhỏ: 1 cột hoặc card compact ngang.
- Tablet: 3 cột.
- Desktop: 3–4 cột trong vùng menu.

### Admin

- Dashboard: 12-column grid.
- Form page: content 8 cột + contextual panel 4 cột.
- CRUD list: table full width.
- Dialog không vượt 720px; form phức tạp dùng drawer/page thay vì dialog.

### KDS

- CSS grid với cột bằng nhau.
- Ticket width tối thiểu khoảng 320px.
- Khoảng cách ticket 12–16px.

---

## 9. Core components

### 9.1 App shell

#### CustomerHeader

- Logo chữ `cafe-connect`.
- Table badge: `Bàn 5`.
- Link/trạng thái phiên hiện tại.
- Trên desktop có thể thêm nút `Theo dõi đơn`.

#### AdminSidebar

- Tổng quan
- Menu
- Bàn & QR
- Đơn hàng
- Báo cáo
- Nhân viên, chỉ hiển thị khi có quyền
- Item bị ẩn theo permission, không chỉ disabled.

#### StaffHeader

- Tên ca/người dùng.
- WebSocket status.
- Notification bell.
- Logout/profile.

#### KdsHeader

- Tên `Quầy pha chế`.
- Trạng thái kết nối.
- Bật/tắt âm thanh.
- Đồng hồ.
- Filter bàn hoặc thời gian chờ.

### 9.2 Button

Variants:

- `primary`
- `secondary`
- `outline`
- `ghost`
- `destructive`
- `success`
- `icon`

States:

- default
- hover
- pressed
- focus-visible
- loading
- disabled

Button loading giữ nguyên width, thay icon bằng spinner, tránh layout shift.

### 9.3 Input and form

- Label luôn hiển thị, không dùng placeholder thay label.
- Helper text và error text đặt dưới input.
- Error border + icon + message.
- Giá tiền có suffix `đ` hoặc format VND.
- Upload ảnh có preview, replace và remove.
- Switch dùng cho `is_active`, `is_available`.
- Radio cho nhóm single; checkbox cho nhóm multi.

### 9.4 Card

- `MenuItemCard`
- `OrderItemCard`
- `TicketCard`
- `TableCard`
- `MetricCard`
- `PaymentCard`
- `RequestCard`

Không lồng nhiều card. Bên trong card dùng divider/section thay vì thêm card con.

### 9.5 Feedback

- Toast: thành công, lỗi, cảnh báo, thông tin.
- Inline alert: lỗi cần giữ lại trên page.
- Confirmation dialog: xóa/hủy/đóng bàn.
- Skeleton: menu, table, ticket.
- Empty state: có lý do và hành động tiếp theo.
- Error state: retry.
- Offline/reconnecting banner: đặc biệt cho Customer và KDS.

### 9.6 Data display

- Badge trạng thái.
- Avatar/user chip.
- Price.
- Timestamp + waiting duration.
- QR preview.
- Chart tooltip.
- Pagination.
- Sort/filter.
- Data table.
- Timeline trạng thái món.

### 9.7 Overlay

- Customer: bottom sheet cho chi tiết món và tùy chọn.
- Admin: dialog cho tác vụ ngắn; drawer/page cho form dài.
- Staff: side panel cho chi tiết phiên.
- KDS: hạn chế overlay; confirmation nhanh khi hủy món.

---

## 10. Customer-specific patterns

### Sticky action area

Ở mobile:

1. Sticky cart summary: số món + tổng tiền + `Xem giỏ`.
2. `Gọi phục vụ` và `Thanh toán` nằm trong action area rõ ràng.
3. Không che nội dung cuối trang; page phải có bottom padding tương ứng.

Ở desktop:

- Cart/session chuyển thành right rail sticky.
- Không giữ một thanh full-width khổng lồ ở đáy.

### Product card

Bắt buộc có:

- Ảnh asset thật.
- Tên.
- Mô tả ngắn tối đa 2–3 dòng.
- Giá VND.
- Trạng thái còn/hết hàng.
- Nút thêm.
- Hết hàng: ảnh giảm opacity, label rõ, nút disabled.

### Product detail

- Ảnh sản phẩm dùng cùng asset với card.
- Giá cơ bản và price delta của option rõ ràng.
- Validate số lượng chọn ngay tại UI.
- Nút thêm hiển thị tổng dòng món.

### Tracking

- Mỗi món có trạng thái riêng.
- Timeline phải phản ánh đúng `pending → preparing → ready → served`.
- Nhiều lần gọi món được nhóm theo order nhưng tổng hợp trong cùng dining session.
- Session closed có trạng thái kết thúc rõ ràng.

---

## 11. Admin-specific patterns

### List page anatomy

1. Breadcrumb/page title.
2. Primary action.
3. Search/filter.
4. Summary or result count.
5. Table/list.
6. Pagination.
7. Empty/loading/error states.

### CRUD

Mỗi entity có đủ:

- Danh sách.
- Thêm.
- Xem/chi tiết nếu cần.
- Sửa.
- Xóa với confirm.
- Validation error.
- Loading/submitting.
- Thành công và lỗi.
- Empty state.
- Permission denied state khi phù hợp.

### Menu management

- Category list/reorder.
- Menu item list theo category/search.
- Create/edit menu item.
- Upload image preview.
- Availability optimistic update; lỗi mạng phải revert.
- Option group single/multi.
- Min/max selection.
- Add/edit/delete option.
- Copy option group từ món khác.

---

## 12. Staff-specific patterns

- Live table/session list.
- Badge yêu cầu `Gọi phục vụ`.
- Badge yêu cầu `Thanh toán`.
- Session detail: orders, items, total, timeline.
- Payment method: tiền mặt/chuyển khoản.
- Xác nhận số tiền.
- Close session sau khi thanh toán thành công.
- Không cho đóng khi trạng thái nghiệp vụ không hợp lệ.
- Action nguy hiểm phải confirm.

---

## 13. KDS-specific patterns

### Ticket information priority

1. Tên bàn.
2. Thời gian chờ.
3. Món + số lượng.
4. Tùy chọn.
5. Ghi chú.
6. Hành động trạng thái.

### State columns

- Mới — `pending`.
- Đang làm — `preparing`.
- Sẵn sàng — `ready`.
- Served không giữ trong board chính; chuyển lịch sử hoặc biến mất có animation nhẹ.
- Cancelled không hiển thị như ticket active.

### Interaction

- Có thể đổi từng món.
- Có thể đổi cả ticket khi hợp lệ.
- Không cho transition sai.
- Cho lùi một bậc trong cửa sổ nghiệp vụ đã quy định.
- Mất kết nối phải hiển thị banner lớn, không chỉ chấm nhỏ.

---

## 14. Image asset rules

Mỗi ảnh xuất hiện trong prototype phải có file asset riêng.

### Naming

```text
assets/
├── brand/
├── menu/
│   ├── coffee/
│   ├── tea/
│   ├── cake/
│   └── topping/
├── banners/
├── illustrations/
├── qr/
└── placeholders/
```

Ví dụ:

```text
menu/coffee/ca-phe-den-da.webp
menu/coffee/ca-phe-sua-da.webp
menu/coffee/bac-xiu-da.webp
banners/customer-menu-hero.webp
illustrations/payment-success.webp
```

### Consistency

- Một món chỉ có một asset canonical trong toàn prototype.
- Card, detail, cart và lịch sử dùng lại đúng asset đó.
- Góc máy, ánh sáng và background cùng một art direction.
- Không generate lại món với hình thức khác ở mỗi screen.
- Không để AI render chữ/logo trong ảnh món.
- Ảnh UI không được dùng làm asset sản phẩm.

### Recommended sizes

| Asset | Size |
|---|---|
| Menu product master | 1200 × 1200 |
| Menu delivery web | 800 × 800 WebP |
| Hero/banner | 1600 × 900 |
| Empty illustration | 1200 × 900, transparent nếu phù hợp |
| QR demo | SVG + PNG |
| Logo | SVG |

---

## 15. Canonical prototype data

Toàn bộ màn hình phải dùng chung dữ liệu mẫu, không tự thay đổi giữa các ảnh.

### Cafe

- Tên: `cafe-connect`
- Bàn demo: `Bàn 5`
- Session code: `A7K2QX`
- Admin: `Nguyễn Minh Đức`
- Staff: `Mai Anh`
- Barista: `Minh Khoa`

### Menu categories

1. Cà phê
2. Trà
3. Bánh
4. Đá xay
5. Nước ép
6. Topping

### Canonical products

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

### Canonical demo order

Order `#015`

- 1 × Cà phê đen đá — ít đá, không đường — 29.000đ
- 1 × Cà phê sữa đá — bình thường, ít ngọt — 35.000đ
- 1 × Bạc xỉu đá — bình thường, ít đá — 35.000đ

Tổng ban đầu: `99.000đ`.

Order gọi thêm `#021`

- 1 × Croissant bơ — 32.000đ

Tổng dining session sau gọi thêm: `131.000đ`.

Các màn prototype phải giữ đúng ID, tên, option, tổng tiền và trạng thái của dữ liệu này.

---

## 16. UI states checklist

Mỗi nhóm màn hình phải có khi phù hợp:

- Default.
- Loading/skeleton.
- Empty.
- Populated.
- Hover/focus.
- Form validation error.
- API error.
- Offline/reconnecting.
- Permission denied.
- Disabled.
- Confirmation.
- Success.
- Business rule conflict.
- Session closed/expired.
- Item just became unavailable.
- Payment pending/paid/failed.

Không cần tạo ảnh riêng cho mọi micro-state nếu spec thể hiện đủ, nhưng các state quan trọng trong flow phải có screen/frame riêng.

---

## 17. Accessibility

- Contrast tối thiểu WCAG AA.
- Focus-visible rõ ràng.
- Form có label liên kết.
- Icon-only button có accessible name.
- Trạng thái không phụ thuộc chỉ vào màu.
- Dialog trap focus và đóng bằng Escape.
- Toast quan trọng dùng live region.
- Reduced motion được tôn trọng.
- Customer flow có thể thao tác bằng một tay trên màn hình nhỏ.
- KDS giữ chữ lớn, tránh thông tin quá dày.

---

## 18. Motion

- 150–200ms: hover, button, dropdown.
- 200–280ms: drawer, bottom sheet.
- Ticket mới vào KDS: highlight nhẹ + âm thanh, không rung/nhấp nháy liên tục.
- Trạng thái món thay đổi: crossfade/slide ngắn.
- Served: rời khỏi board sau một khoảng ngắn đủ để người dùng nhận biết.
- Không dùng parallax hoặc animation landing-page.

---

## 19. Prototype output contract

Mỗi màn hình được tạo thành **một file ảnh riêng**.

Mỗi screen gồm:

1. `screen-name.png` — mockup UI riêng biệt, không ghép nhiều màn.
2. Asset riêng cho mọi ảnh mới xuất hiện trong screen.
3. Spec:
   - Screen name.
   - Actor.
   - Route.
   - Viewport.
   - Purpose.
   - Source data.
   - Components.
   - States.
   - Interactions.
   - API/event.
   - Previous/next screen.
4. Mapping asset canonical.
5. Consistency checklist.

### Viewport chuẩn

| Surface | Prototype viewport |
|---|---|
| Customer mobile web | 390 × 844 |
| Customer tablet web | 768 × 1024 |
| Customer desktop web | 1440 × 1024 |
| Admin desktop | 1440 × 1024 |
| Staff tablet | 1024 × 768 |
| Staff desktop | 1440 × 1024 |
| KDS desktop | 1440 × 900 |
| KDS large | 1920 × 1080 |

Ảnh prototype chỉ chứa **một viewport**. Không đặt điện thoại frame nếu mục tiêu là screenshot web; có thể dùng browser chrome rất tối giản khi cần trình bày.

---

## 20. Acceptance criteria

Design System đạt yêu cầu khi:

- Customer rõ ràng là web mobile-first, không bị hiểu là native app.
- Admin, Staff và KDS có layout đúng thiết bị sử dụng.
- Màu, typography, radius, spacing và trạng thái có token rõ ràng.
- Dữ liệu demo canonical được cố định.
- Mỗi ảnh trong UI có asset riêng.
- Không gộp nhiều screen vào một ảnh.
- Có quy tắc responsive.
- Có đủ pattern CRUD và business state.
- Tất cả screen sau này có thể truy ngược về token/component trong tài liệu này.
