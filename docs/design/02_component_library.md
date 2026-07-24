# 02 — Component Library: cafe-connect

> **Phụ thuộc:** `01_design_system.md`
>
> **Phạm vi:** Thư viện component cho responsive web gồm Customer Web, Admin Web, Staff Web và KDS.
>
> **Mục tiêu:** Mọi màn hình prototype và code Vue sau này dùng chung một hệ component, tránh mỗi màn hình một cách trình bày khác nhau.

---

# 1. Nguyên tắc tổ chức component

Component được chia thành 5 tầng:

```text
1. Foundation
2. Primitive
3. Composite
4. Domain
5. Layout
```

## 1.1 Foundation

Không render UI độc lập nhưng định nghĩa quy chuẩn:

- Color token
- Typography
- Spacing
- Radius
- Shadow
- Breakpoint
- Motion
- Icon size
- Z-index

## 1.2 Primitive

Component cơ bản, dùng lại ở mọi module:

- Button
- IconButton
- Input
- Textarea
- Select
- Checkbox
- Radio
- Switch
- Badge
- Avatar
- Divider
- Skeleton
- Spinner
- Tooltip

## 1.3 Composite

Ghép từ primitive, chưa mang nghiệp vụ cụ thể:

- FormField
- SearchInput
- FilterBar
- DataTable
- Pagination
- Dialog
- Drawer
- BottomSheet
- Toast
- EmptyState
- ErrorState
- StatusBanner
- FileUploader
- ImageUploader
- PriceInput
- DateRangePicker

## 1.4 Domain

Mang nghiệp vụ riêng của cafe-connect:

- MenuItemCard
- ProductOptionGroup
- CartItem
- CartSummary
- OrderStatusTimeline
- TicketCard
- TableCard
- DiningSessionCard
- PaymentMethodCard
- StaffRequestCard
- MetricCard
- RevenueChart
- QrPreviewCard

## 1.5 Layout

Định nghĩa cấu trúc theo vai trò:

- CustomerShell
- AdminShell
- StaffShell
- KdsShell
- CustomerHeader
- AdminSidebar
- AdminHeader
- StaffHeader
- KdsHeader
- StickyCustomerActions
- DesktopCartRail

---

# 2. Quy ước đặt tên

## 2.1 Vue component

```text
BaseButton.vue
BaseInput.vue
BaseBadge.vue

CustomerHeader.vue
AdminSidebar.vue
MenuItemCard.vue
TicketCard.vue
PaymentMethodCard.vue
```

## 2.2 Props

- Dùng camelCase.
- Boolean dùng tiền tố `is`, `has`, `can`, `show`.
- Event dùng động từ rõ nghĩa.

Ví dụ:

```ts
interface MenuItemCardProps {
  item: MenuItem
  isCompact?: boolean
  showFavorite?: boolean
  isAdding?: boolean
}
```

Events:

```ts
defineEmits<{
  add: [item: MenuItem]
  open: [item: MenuItem]
}>()
```

## 2.3 Variant

Dùng variant khi component có cùng mục đích nhưng thay hình thức:

```ts
variant: 'primary' | 'secondary' | 'outline' | 'ghost'
```

Không dùng variant để biểu diễn business state nếu business state cần logic riêng.

---

# 3. Quy chuẩn icon

## 3.1 Bộ icon

Khuyến nghị dùng Lucide Icons để:

- Đồng nhất stroke.
- Dễ dùng với shadcn-vue.
- Có đủ icon cho CRUD và trạng thái.
- Tránh trộn nhiều bộ icon.

## 3.2 Kích thước

| Token | Size | Dùng cho |
|---|---:|---|
| `icon-xs` | 14px | Caption, badge |
| `icon-sm` | 16px | Input, button nhỏ |
| `icon-md` | 20px | Button mặc định |
| `icon-lg` | 24px | Header action |
| `icon-xl` | 32px | Empty state |
| `icon-display` | 48–64px | Success/empty illustration phụ |

## 3.3 Quy tắc

- Icon luôn đi cùng accessible label nếu không có text.
- Không dùng icon khác nhau cho cùng một action.
- `Trash2` luôn cho xóa.
- `Pencil` luôn cho sửa.
- `Plus` luôn cho thêm.
- `RefreshCw` cho retry/reconnect.
- `WifiOff` cho mất kết nối.
- `Bell` cho gọi phục vụ/thông báo tùy ngữ cảnh, nhưng cần label rõ.

---

# 4. Primitive components

# 4.1 Button

## Mục đích

Thực hiện một hành động.

## Variants

| Variant | Dùng khi |
|---|---|
| `primary` | Hành động chính của page/dialog |
| `secondary` | Hành động phụ có trọng lượng |
| `outline` | Hành động phụ |
| `ghost` | Toolbar, icon + text nhẹ |
| `destructive` | Xóa/hủy |
| `success` | Xác nhận thanh toán, hoàn tất |
| `link` | Điều hướng nhẹ |

## Sizes

- `sm`: 36px
- `md`: 44px
- `lg`: 48px
- `xl`: 56px, chỉ dùng KDS hoặc CTA customer đặc biệt

## Props

```ts
interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  type?: 'button' | 'submit' | 'reset'
  isLoading?: boolean
  isDisabled?: boolean
  leadingIcon?: Component
  trailingIcon?: Component
  fullWidth?: boolean
}
```

## States

- Default
- Hover
- Active
- Focus-visible
- Loading
- Disabled

## Rules

- Mỗi vùng chỉ nên có một primary action.
- Loading giữ nguyên chiều rộng.
- Destructive không dùng làm primary mặc định trừ confirm delete.
- Customer action phải có touch target tối thiểu 44px.
- KDS action ưu tiên 48–56px.

---

# 4.2 IconButton

## Mục đích

Action chỉ có icon, dùng khi không gian hẹp hoặc action đã rất quen thuộc.

## Props

```ts
interface IconButtonProps {
  icon: Component
  label: string
  variant?: 'ghost' | 'outline' | 'primary' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  isDisabled?: boolean
}
```

## Rules

- `label` là bắt buộc.
- Desktop có tooltip.
- Không dùng icon-only cho hành động nghiệp vụ khó hiểu như `Đóng phiên`.

---

# 4.3 Input

## Anatomy

1. Label
2. Input container
3. Leading/trailing icon nếu có
4. Helper/error text

## Props

```ts
interface InputProps {
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: string
  isDisabled?: boolean
  isReadonly?: boolean
  error?: string
  helperText?: string
  prefix?: string
  suffix?: string
}
```

## States

- Default
- Hover
- Focus
- Filled
- Error
- Disabled
- Readonly

## Rules

- Không dùng placeholder thay label.
- Giá tiền căn phải nếu là input số.
- Error message cụ thể, không dùng “Dữ liệu không hợp lệ”.

---

# 4.4 Textarea

Dùng cho:

- Ghi chú món.
- Ghi chú order.
- Lý do hủy.
- Mô tả món.

Rules:

- Có character counter khi giới hạn.
- Auto-resize trong Customer.
- Admin có thể resize nhưng cần giới hạn chiều cao.

---

# 4.5 Select

Dùng cho:

- Danh mục.
- Vai trò.
- Phương thức thanh toán.
- Trạng thái.
- Group by báo cáo.

Không dùng Select nếu chỉ có 2 lựa chọn và người dùng cần thấy ngay; dùng Radio hoặc SegmentedControl.

---

# 4.6 Checkbox

Dùng cho multi-select:

- Topping.
- Quyền.
- Chọn nhiều row.
- Filter.

Các option bị disable phải có giải thích nếu không hiển nhiên.

---

# 4.7 RadioGroup

Dùng cho:

- Size.
- Mức đường.
- Mức đá.
- Phương thức thanh toán khi có ít lựa chọn.

Customer dùng card-radio rộng toàn hàng để dễ bấm.

---

# 4.8 Switch

Dùng cho boolean tức thời:

- Còn hàng/hết hàng.
- Danh mục active/inactive.
- Bật/tắt âm thanh KDS.

Không dùng Switch cho hành động cần xác nhận như đóng bàn hoặc thanh toán.

---

# 4.9 Badge

## Variants

- Neutral
- Primary
- Success
- Warning
- Info
- Danger
- Outline

## Sizes

- `sm`: bảng dữ liệu.
- `md`: card.
- `lg`: KDS hoặc status quan trọng.

## Business mapping

```text
available     -> success
unavailable   -> neutral
pending       -> info
preparing     -> warning
ready         -> success
served        -> neutral-success
cancelled     -> danger
open          -> success
closed        -> neutral
paid          -> success
failed        -> danger
```

---

# 4.10 Avatar

Dùng cho admin/staff, không dùng cho customer anonymous.

Fallback:

- Ảnh user nếu có.
- Initial 1–2 ký tự.
- Màu nền lấy từ palette trung tính, không random quá nhiều màu.

---

# 4.11 Spinner

Dùng trong:

- Button loading.
- Inline fetch.
- Redirect payment.

Không dùng spinner full-screen quá lâu; sau 300–500ms nên chuyển skeleton hoặc loading state có thông tin.

---

# 4.12 Skeleton

Các loại:

- Menu card skeleton.
- Table row skeleton.
- Metric skeleton.
- Ticket skeleton.
- Session detail skeleton.

Skeleton phải gần cấu trúc nội dung thật, không dùng các thanh ngẫu nhiên.

---

# 5. Form components

# 5.1 FormField

Wrapper chuẩn cho label, control, description và error.

```ts
interface FormFieldProps {
  label: string
  name: string
  required?: boolean
  description?: string
  error?: string
}
```

Rules:

- `required` hiển thị dấu sao nhưng vẫn cần validation message.
- Error phải nằm ngay dưới field.
- Không dồn toàn bộ lỗi ở đầu form nếu có thể gắn vào field.

---

# 5.2 SearchInput

Dùng ở danh sách:

- Menu item.
- Bàn.
- Đơn hàng.
- Nhân viên.

Features:

- Debounce 300–400ms.
- Clear button.
- Loading indicator nhẹ.
- Giữ query trong URL ở Admin.

---

# 5.3 PriceInput

Features:

- Nhập số.
- Hiển thị format VND.
- Suffix `đ`.
- Không cho giá âm.
- Không cho ký tự không hợp lệ.
- Khi blur format lại.

---

# 5.4 QuantityStepper

Dùng ở Customer cart và product detail.

Anatomy:

- Minus button.
- Quantity.
- Plus button.

Rules:

- Min = 1 với item trong cart.
- Nếu bấm minus ở 1, có thể mở confirm remove hoặc chuyển thành icon trash.
- Nút đủ lớn 40–44px.

---

# 5.5 ImageUploader

Dùng khi Admin thêm/sửa món.

## States

- Empty.
- Drag over.
- Preview.
- Uploading.
- Success.
- Error.
- Replace.
- Remove.

## Anatomy

- Drop area.
- File hint.
- Preview.
- Replace button.
- Remove button.
- Progress nếu upload riêng.

## Rules

- Hiển thị crop khuyến nghị 1:1.
- Giới hạn file và định dạng rõ.
- Ảnh preview dùng object URL local trước upload.
- Asset prototype canonical phải map đúng vào uploader preview.

---

# 5.6 DateRangePicker

Dùng báo cáo.

Presets:

- Hôm nay.
- 7 ngày qua.
- 30 ngày qua.
- Tháng này.
- Tháng trước.
- Tùy chọn.

Rules:

- Hiển thị timezone Asia/Ho_Chi_Minh.
- Chặn range vượt giới hạn backend.
- Mobile/tablet dùng popover full width hoặc sheet.

---

# 6. Feedback components

# 6.1 Toast

## Types

- Success
- Error
- Warning
- Info

## Content

- Title ngắn.
- Description nếu cần.
- Retry action khi phù hợp.

## Rules

- Success CRUD biến mất sau 3–4 giây.
- Error quan trọng ở lại lâu hơn.
- Không dùng toast làm nơi duy nhất báo validation.
- Optimistic update lỗi phải toast + revert.

Ví dụ:

```text
Đã cập nhật trạng thái món
Cà phê sữa đá chuyển sang “Đang làm”.
```

---

# 6.2 InlineAlert

Dùng khi lỗi hoặc cảnh báo cần ở lại:

- Không kết nối được WebSocket.
- Session đã đóng.
- Payment chưa xác nhận.
- Không có quyền.
- Món vừa hết hàng.

Variants:

- Info
- Success
- Warning
- Danger

---

# 6.3 StatusBanner

Banner ngang toàn vùng nhìn thấy.

Dùng cho:

- Offline.
- Reconnecting.
- KDS mất kết nối.
- Customer session closed.
- Maintenance.

KDS mất kết nối phải dùng banner nổi bật hơn Customer.

---

# 6.4 ConfirmationDialog

## Dùng cho

- Xóa category.
- Xóa món.
- Xóa bàn.
- Hủy món.
- Đóng phiên.
- Xác nhận thanh toán tiền mặt.

## Anatomy

1. Icon semantic.
2. Title.
3. Consequence description.
4. Optional summary.
5. Cancel.
6. Confirm.

## Rules

- Button confirm ghi đúng hành động: `Xóa món`, không ghi `Đồng ý`.
- Destructive action bên phải.
- Với đóng phiên/thanh toán, hiển thị số tiền và bàn.

---

# 6.5 EmptyState

## Anatomy

- Icon/illustration.
- Title.
- Description.
- Primary action.
- Secondary help nếu cần.

## Examples

- Chưa có món.
- Không có ticket đang chờ.
- Chưa có bàn.
- Không có dữ liệu báo cáo.
- Giỏ hàng trống.

Không dùng illustration quá lớn trong Admin/KDS.

---

# 6.6 ErrorState

Dùng cho API error hoặc route error.

Có:

- Thông báo rõ.
- Mã lỗi khi hữu ích.
- Retry.
- Back action.

---

# 7. Overlay components

# 7.1 Dialog

Dùng cho form hoặc confirm ngắn.

Width:

- Small: 420px.
- Medium: 560px.
- Large: 720px.

Không dùng dialog cho form món có quá nhiều option group; dùng Drawer hoặc page.

---

# 7.2 Drawer

Dùng trong Admin/Staff:

- Chi tiết phiên.
- Form món.
- Chi tiết order.
- Filter nâng cao.

Width:

- 480–640px.
- Form phức tạp có thể 720px.

---

# 7.3 BottomSheet

Dùng chủ yếu Customer mobile:

- Chi tiết món.
- Tùy chọn.
- Chọn phương thức thanh toán.
- Cart compact.

Rules:

- Có drag handle.
- Có title sticky.
- CTA sticky bottom.
- Max height khoảng 90vh.
- Nội dung scroll riêng.

Desktop chuyển thành Dialog hoặc side panel.

---

# 7.4 DropdownMenu

Dùng cho action phụ:

- Sửa.
- Nhân bản.
- Xóa.
- Tải QR.
- In QR.

Action thường xuyên không nên giấu trong dropdown.

---

# 8. Navigation components

# 8.1 CustomerHeader

## Anatomy

- Logo.
- Table badge.
- Session/order shortcut.
- Optional help.

## Mobile

- Cao 56–64px.
- Sticky top.
- Tối giản.

## Desktop

- Centered container.
- Có nav ngắn: Menu, Đơn của bạn.
- Không biến thành marketing navbar.

---

# 8.2 CategoryTabs

## Anatomy

- Icon tùy chọn.
- Label.
- Active indicator.

## Behavior

- Sticky dưới CustomerHeader.
- Horizontal scroll trên mobile.
- Click scroll đến section hoặc filter list.
- Active category cập nhật khi scroll.

## States

- Default.
- Active.
- Disabled nếu category inactive không được render.

---

# 8.3 AdminSidebar

## Sections

- Tổng quan.
- Menu.
- Bàn & QR.
- Đơn hàng.
- Báo cáo.
- Nhân viên.

## Behavior

- Active route rõ.
- Item ẩn theo permission.
- Collapsible trên tablet.
- Logo và user ở vùng ổn định.
- Logout không đặt lẫn với navigation chính.

---

# 8.4 Breadcrumb

Dùng ở Admin:

```text
Menu / Món / Cà phê sữa đá
```

Không cần ở Customer và KDS.

---

# 8.5 Pagination

Dùng ở Admin list/history.

- Previous/next.
- Current page.
- Page size nếu cần.
- Result count.

Customer menu không pagination; dùng load toàn menu hoặc lazy section.

---

# 9. Customer domain components

# 9.1 MenuHero

## Mục đích

Giới thiệu ngắn và tạo cảm xúc cho menu, không phải landing hero.

## Anatomy

- Background asset.
- Overlay nhẹ.
- Greeting.
- Short description.
- Optional session/table info.

## Rules

- Cao vừa phải 160–220px mobile.
- Text ngắn.
- Không có CTA marketing.
- Asset riêng: `banners/customer-menu-hero.webp`.

---

# 9.2 MenuItemCard

## Anatomy

1. Product image.
2. Availability badge.
3. Favorite optional.
4. Name.
5. Short description.
6. Price.
7. Add button.

## Variants

- `grid`
- `horizontal`
- `compact`

## Props

```ts
interface MenuItemCardProps {
  item: MenuItem
  variant?: 'grid' | 'horizontal' | 'compact'
  isAdding?: boolean
}
```

## Rules

- Ảnh dùng cùng canonical asset với detail.
- Hết hàng: giảm opacity, label, disable add.
- Add button không che giá.
- Description tối đa 2–3 dòng.
- Giá không bị đẩy lệch giữa card.

---

# 9.3 ProductDetailSheet

## Anatomy

- Product image.
- Name + description.
- Base price.
- Option groups.
- Note.
- Quantity.
- Total.
- Add to cart CTA.

## States

- Default.
- Required option missing.
- Invalid max selection.
- Item unavailable while open.
- Adding.
- Added success.

---

# 9.4 ProductOptionGroup

## Variants

- `single` dùng radio.
- `multi` dùng checkbox.

## Anatomy

- Group name.
- Required/optional label.
- Selection rule.
- Options.
- Price delta.

Ví dụ:

```text
Size — Bắt buộc, chọn 1
Nhỏ
Vừa +5.000đ
Lớn +10.000đ
```

---

# 9.5 CartItem

## Anatomy

- Thumbnail.
- Name.
- Options summary.
- Note.
- Unit/line price.
- Quantity stepper.
- Remove.

## Rules

- Dùng đúng product asset canonical.
- Option hiển thị ngắn, không lặp label thừa.
- Snapshot giá trong order history, current price trong cart trước order.

---

# 9.6 CartSummary

## Anatomy

- Item count.
- Subtotal.
- Optional fees.
- Total.
- Place order CTA.

MVP chưa có discount/fee thì không hiển thị dòng rỗng.

---

# 9.7 StickyCustomerActions

## Mobile anatomy

- Cart bar.
- `Gọi phục vụ`.
- `Thanh toán`.

## States

- No active session.
- Empty cart.
- Cart has items.
- Staff call pending.
- Bill requested.
- Session closed.

## Rules

- Không che content.
- Thanh toán disabled khi không có session/order hợp lệ.
- Gọi phục vụ có cooldown và feedback.

---

# 9.8 OrderStatusTimeline

## Anatomy

- Status nodes.
- Time.
- Current state.
- Completed state.
- Description.

## Status sequence

```text
Đã nhận → Đang làm → Sẵn sàng → Đã phục vụ
```

Cancelled tách riêng, không nối như một bước thành công.

---

# 9.9 CustomerOrderItem

Hiển thị từng món trong tracking:

- Image.
- Name.
- Options.
- Quantity.
- Status badge.
- Status time.
- Cancelled reason nếu có.

---

# 9.10 SessionSummaryCard

- Table.
- Session code.
- Opened time.
- Total.
- Number of orders.
- Payment state.

Dùng ở tracking/payment.

---

# 9.11 PaymentMethodCard

Options:

- Tiền mặt tại quầy.
- Chuyển khoản tại quầy.
- VNPay online.

Anatomy:

- Icon/logo.
- Name.
- Short description.
- Status/availability.
- Radio indicator.

---

# 9.12 PaymentResult

Variants:

- Pending.
- Success.
- Failed.
- Cancelled.

Có:

- Result icon/illustration.
- Amount.
- Payment reference.
- Next action.
- Return to order.

---

# 10. Admin domain components

# 10.1 PageHeader

## Anatomy

- Breadcrumb.
- Title.
- Description.
- Primary action.
- Secondary action.

Ví dụ:

```text
Món
Quản lý món, giá bán và trạng thái còn hàng.
[Thêm món]
```

---

# 10.2 FilterBar

## Anatomy

- Search.
- Category filter.
- Status filter.
- Date range nếu có.
- Reset.
- Result count.

Desktop một hàng; tablet wrap; mobile drawer.

---

# 10.3 DataTable

## Features

- Header.
- Sort.
- Row.
- Empty/loading.
- Pagination.
- Bulk selection khi thật sự cần.
- Sticky action column nếu bảng rộng.

## Rules

- Không nhồi quá nhiều cột.
- Giá và số căn phải.
- Status dùng badge.
- Action chính hiển thị; action phụ trong menu.
- Row click chỉ dùng khi rõ ràng, không xung đột checkbox/button.

---

# 10.4 CategoryRow

- Drag handle.
- Name.
- Item count.
- Active switch.
- Edit.
- Delete.

Reorder optimistic, lỗi revert.

---

# 10.5 MenuItemAdminRow

- Thumbnail.
- Name.
- Category.
- Price.
- Availability switch.
- Updated time.
- Actions.

---

# 10.6 MenuItemForm

## Sections

1. Thông tin cơ bản.
2. Ảnh.
3. Giá.
4. Danh mục.
5. Trạng thái.
6. Nhóm tùy chọn.
7. Preview.

## Responsive

- Desktop: main form + preview rail.
- Tablet: single column.
- Không dùng dialog nhỏ.

---

# 10.7 OptionGroupEditor

## Anatomy

- Group header.
- Type.
- Required.
- Min/max.
- Option list.
- Add option.
- Copy from another item.
- Reorder.
- Delete.

## Rules

- Option group không lồng card quá nhiều.
- Dùng section + divider.
- Hiển thị rule summary rõ.

---

# 10.8 OptionRowEditor

- Drag.
- Name.
- Price delta.
- Availability nếu schema hỗ trợ.
- Delete.

---

# 10.9 AvailabilitySwitch

Wrapper business cho Switch.

Có:

- Optimistic state.
- Saving indicator.
- Revert on error.
- Toast.
- Optional confirm khi chuyển hết hàng nếu item đang có order pending, nếu nghiệp vụ cần.

---

# 10.10 TableCard

## Anatomy

- Table name.
- Capacity.
- Status.
- Open session.
- QR state.
- Actions.

Actions:

- Xem QR.
- Tải PNG.
- In.
- Sinh lại token.
- Sửa.
- Xóa.

---

# 10.11 QrPreviewCard

- Table name.
- QR image.
- URL.
- Token partial.
- Download PNG.
- Print.
- Regenerate.

Regenerate cần confirm vì QR cũ sẽ mất hiệu lực.

---

# 10.12 OrderAdminRow

- Order code.
- Table.
- Session.
- Created time.
- Item count.
- Total.
- Status.
- Payment.
- Detail action.

---

# 10.13 MetricCard

## Variants

- Revenue.
- Sessions.
- Average per session.
- Items sold.

Có:

- Label.
- Value.
- Change percentage.
- Comparison label.
- Optional sparkline.

Không dùng màu xanh/đỏ nếu không có label tăng/giảm.

---

# 10.14 RevenueChart

- Line/bar chart.
- Tooltip VND.
- Empty dates bằng 0.
- Date range.
- Loading/error/empty.

---

# 10.15 TopItemsTable

- Rank.
- Item name snapshot.
- Quantity.
- Revenue.
- Trend optional.

Luôn dùng dữ liệu snapshot cho báo cáo lịch sử.

---

# 10.16 UserRoleBadge

Hiển thị:

- Admin.
- Staff.
- Barista nếu sau này tách role.

Không dùng role badge để thay permission detail.

---

# 11. Staff domain components

# 11.1 StaffRequestCard

Types:

- Gọi phục vụ.
- Yêu cầu thanh toán.

Anatomy:

- Table.
- Request type.
- Waiting duration.
- Session total nếu payment.
- Acknowledge action.
- Open session action.

Priority tăng theo thời gian chờ.

---

# 11.2 DiningSessionCard

- Table.
- Session code.
- Open time.
- Order count.
- Total.
- Payment status.
- Request badges.

---

# 11.3 DiningSessionDetail

Sections:

1. Session header.
2. Orders timeline.
3. Items.
4. Total.
5. Payment.
6. Close session.

Desktop side panel; tablet full page/drawer.

---

# 11.4 PaymentConfirmationPanel

## Cash

- Total.
- Received amount.
- Change.
- Confirm paid.

## Bank transfer

- Total.
- Transfer reference optional.
- Confirm received.

Rules:

- Amount mismatch cảnh báo.
- Confirm action ghi rõ method.
- Thành công mới cho đóng session.

---

# 11.5 SessionClosePanel

- Table.
- Session.
- Paid status.
- Outstanding amount.
- Confirm close.

Không cho close nếu payment chưa paid, trừ override có permission riêng.

---

# 12. KDS domain components

# 12.1 KdsColumn

Columns:

- Mới.
- Đang làm.
- Sẵn sàng.

Anatomy:

- Title.
- Count.
- Status color marker.
- Ticket list.
- Empty state.

---

# 12.2 TicketCard

## Priority anatomy

1. Table name.
2. Waiting timer.
3. Order code/time.
4. Item list.
5. Notes.
6. Ticket action.

## Variants

- Pending.
- Preparing.
- Ready.
- Overdue.
- New-highlight.

## Rules

- Không dùng ảnh món trong KDS mặc định; tên và option quan trọng hơn.
- Tên bàn và thời gian lớn.
- Note có màu/background dễ thấy.
- Không để ticket cao vô hạn; list món dài có pattern rõ.

---

# 12.3 TicketItemRow

- Quantity.
- Item name.
- Options.
- Note.
- Current state.
- Next action.

Actions phụ:

- Cancel.
- Undo trong thời gian cho phép.

---

# 12.4 WaitingTimer

States:

- Normal.
- Warning.
- Overdue.

Không chỉ đổi màu; thêm icon/label `Chờ lâu`.

Timer cập nhật mỗi phút hoặc phù hợp, tránh re-render không cần thiết.

---

# 12.5 ConnectionIndicator

States:

- Connected.
- Reconnecting.
- Offline.

KDS:

- Indicator ở header.
- Offline đồng thời mở StatusBanner lớn.

---

# 12.6 SoundToggle

- On/off.
- Test sound.
- Browser permission state.

Nếu browser chặn autoplay, hiển thị CTA `Bật âm thanh`.

---

# 13. Chart components

# 13.1 RevenueSeriesChart

- Date x-axis.
- Revenue y-axis.
- Sessions optional secondary info.
- Tooltip.
- Zero-fill date.
- Responsive.

# 13.2 PeakHoursChart

- Hour buckets.
- Order/session count.
- Highlight top hour.
- Clear label `Khung giờ đông nhất`.

# 13.3 TopItemsChart

- Horizontal bar.
- Item snapshot names.
- Quantity/revenue toggle.

Không dùng pie chart cho nhiều món.

---

# 14. Loading, empty và error matrix

| Component | Loading | Empty | Error |
|---|---|---|---|
| MenuGrid | Card skeleton | Không có món | Retry menu |
| Cart | Không cần | Giỏ trống | Local state warning |
| Tracking | Timeline skeleton | Chưa có đơn | Retry/reconnect |
| AdminTable | Row skeleton | CTA thêm | Retry |
| KDS Board | Column skeleton ngắn | Không có ticket | Offline banner |
| Reports | Metric/chart skeleton | Không có dữ liệu | Retry/filter |
| Session list | Card skeleton | Không có phiên mở | Retry |

---

# 15. Permission behavior

UI phải tuân thủ permission từ backend.

## Rules

- Không có permission thì ẩn navigation/action.
- Nếu người dùng truy cập URL trực tiếp và backend trả 403, hiển thị PermissionDeniedState.
- Không chỉ disable action rồi để người dùng đoán.
- Các component nhận `can()` hoặc permission map từ auth state.

Ví dụ:

```ts
const canManageMenu = auth.can('menu.manage')
```

---

# 16. API state contract

Component gọi API thông qua composable/store, không tự gọi Axios rải rác.

Ví dụ:

```text
useMenuItems()
useDiningSession()
useKitchenTickets()
usePayments()
useReports()
```

Mỗi composable nên cung cấp:

- `data`
- `isLoading`
- `isFetching`
- `error`
- `refresh`
- mutation state
- optimistic helpers nếu có

---

# 17. Real-time contract

## Customer

Nghe:

- `OrderItemStatusUpdated`
- `SessionClosed`

UI update:

- CustomerOrderItem.
- OrderStatusTimeline.
- Session summary.
- Payment/session closed banner.

## KDS

Nghe:

- `OrderPlaced`

UI update:

- Insert TicketCard.
- Highlight.
- Sound.
- Counter.

## Staff

Nghe:

- `StaffCalled`
- `BillRequested`

UI update:

- StaffRequestCard.
- Notification count.
- Sound/toast nếu bật.

## Admin

Nghe:

- `OrderPlaced`
- `OrderItemStatusUpdated`
- `BillRequested`

UI update:

- Order list.
- Dashboard metrics/live list.

Event payload phải đủ render; component không nên bắt buộc refetch toàn bộ chỉ để hiển thị một thay đổi đơn giản.

---

# 18. Responsive component mapping

| Component | Mobile | Tablet | Desktop |
|---|---|---|---|
| MenuItemCard | 2-col/1-col | 2–3 col | 3–4 col |
| ProductDetail | BottomSheet | Dialog/Sheet | Dialog/side panel |
| CartSummary | Sticky bottom | Sheet/rail | Sticky right rail |
| AdminSidebar | Drawer | Collapsed | Fixed |
| DataTable | Card/list fallback | Scroll/table | Full table |
| Staff session detail | Full page | Drawer | Split pane |
| KDS columns | Tabs | Scroll/snap | 3-column grid |

---

# 19. Component prototype checklist

Mỗi component trước khi dùng trong screen cần kiểm tra:

- Có anatomy rõ.
- Có variant cần thiết.
- Có loading/disabled/error nếu phù hợp.
- Có responsive rule.
- Có accessible label/focus.
- Có mapping với token.
- Có business state rõ.
- Không chứa dữ liệu hard-code ngoài prototype fixture.
- Không tự generate asset mới nếu asset canonical đã tồn tại.
- Không làm thay nhiệm vụ của component khác.

---

# 20. Component inventory theo flow

## Customer

- CustomerShell
- CustomerHeader
- MenuHero
- CategoryTabs
- MenuItemCard
- ProductDetailSheet
- ProductOptionGroup
- QuantityStepper
- CartItem
- CartSummary
- StickyCustomerActions
- SessionSummaryCard
- CustomerOrderItem
- OrderStatusTimeline
- PaymentMethodCard
- PaymentResult
- EmptyState
- StatusBanner

## Admin

- AdminShell
- AdminSidebar
- AdminHeader
- PageHeader
- Breadcrumb
- FilterBar
- SearchInput
- DataTable
- Pagination
- CategoryRow
- MenuItemAdminRow
- MenuItemForm
- ImageUploader
- OptionGroupEditor
- OptionRowEditor
- AvailabilitySwitch
- TableCard
- QrPreviewCard
- OrderAdminRow
- MetricCard
- RevenueChart
- TopItemsTable
- ConfirmationDialog
- Toast

## Staff

- StaffShell
- StaffHeader
- StaffRequestCard
- DiningSessionCard
- DiningSessionDetail
- PaymentConfirmationPanel
- SessionClosePanel
- StatusBanner
- ConfirmationDialog

## KDS

- KdsShell
- KdsHeader
- KdsColumn
- TicketCard
- TicketItemRow
- WaitingTimer
- ConnectionIndicator
- SoundToggle
- StatusBanner
- EmptyState

---

# 21. Đề xuất mapping với shadcn-vue

| Component cafe-connect | shadcn-vue base |
|---|---|
| Button | Button |
| Input | Input + Label |
| Textarea | Textarea |
| Select | Select |
| Checkbox | Checkbox |
| RadioGroup | RadioGroup |
| Switch | Switch |
| Badge | Badge |
| Dialog | Dialog |
| Drawer | Sheet |
| BottomSheet | Drawer/Sheet custom mobile |
| DropdownMenu | DropdownMenu |
| Tooltip | Tooltip |
| Toast | Sonner |
| DataTable | Table + TanStack Table |
| FormField | Form |
| Tabs | Tabs |
| Accordion | Accordion |
| Skeleton | Skeleton |
| Date picker | Calendar + Popover |
| Command select | Command + Popover |

Các domain component phải bọc các primitive này thay vì dùng shadcn trực tiếp khắp page.

---

# 22. Cấu trúc thư mục đề xuất

```text
src/
├── components/
│   ├── base/
│   │   ├── BaseButton.vue
│   │   ├── BaseIconButton.vue
│   │   ├── BaseBadge.vue
│   │   └── BasePrice.vue
│   ├── forms/
│   │   ├── FormField.vue
│   │   ├── SearchInput.vue
│   │   ├── PriceInput.vue
│   │   ├── QuantityStepper.vue
│   │   └── ImageUploader.vue
│   ├── feedback/
│   │   ├── EmptyState.vue
│   │   ├── ErrorState.vue
│   │   ├── StatusBanner.vue
│   │   └── ConfirmationDialog.vue
│   ├── customer/
│   │   ├── CustomerHeader.vue
│   │   ├── MenuHero.vue
│   │   ├── MenuItemCard.vue
│   │   ├── ProductDetailSheet.vue
│   │   ├── CartItem.vue
│   │   ├── CartSummary.vue
│   │   └── OrderStatusTimeline.vue
│   ├── admin/
│   │   ├── AdminSidebar.vue
│   │   ├── PageHeader.vue
│   │   ├── FilterBar.vue
│   │   ├── MenuItemForm.vue
│   │   ├── OptionGroupEditor.vue
│   │   ├── TableCard.vue
│   │   └── QrPreviewCard.vue
│   ├── staff/
│   │   ├── StaffRequestCard.vue
│   │   ├── DiningSessionCard.vue
│   │   └── PaymentConfirmationPanel.vue
│   └── kitchen/
│       ├── KdsColumn.vue
│       ├── TicketCard.vue
│       ├── TicketItemRow.vue
│       └── WaitingTimer.vue
├── layouts/
│   ├── CustomerLayout.vue
│   ├── AdminLayout.vue
│   ├── StaffLayout.vue
│   └── KdsLayout.vue
└── components/ui/
    └── ...shadcn-vue generated components
```

---

# 23. Storybook/Histoire coverage

Khuyến nghị dùng Histoire cho Vue.

Mỗi component domain cần story:

- Default.
- Populated.
- Empty nếu phù hợp.
- Loading.
- Disabled.
- Error.
- Mobile.
- Desktop.
- Business edge case.

Ví dụ TicketCard:

```text
TicketCard / Pending
TicketCard / Preparing
TicketCard / Ready
TicketCard / Overdue
TicketCard / Long order
TicketCard / Has note
TicketCard / Reconnecting
```

---

# 24. Acceptance criteria Step 02

Step 02 hoàn thành khi:

- Component được chia theo primitive/composite/domain/layout.
- Customer, Admin, Staff và KDS đều có inventory riêng.
- Mỗi component chính có anatomy, variant, state và responsive behavior.
- CRUD Admin đủ list/create/edit/delete/confirm/error.
- Customer có menu, detail, cart, tracking và payment.
- Staff có request, session, payment và close.
- KDS có board, ticket, item action, timer và connection state.
- Có mapping với shadcn-vue.
- Có cấu trúc thư mục Vue.
- Component không tự tạo dữ liệu hoặc asset sai lệch so với canonical prototype data.
- Tài liệu đủ làm đầu vào cho Step 03 — Asset Library và Step 04 trở đi — flow prototype.
