# cafe-connect

Hệ thống gọi món qua QR cho quán cafe. Laravel 12 (API) + Vue 3 (SPA).
Thiết kế: [docs/design_overview.md](docs/design_overview.md) · Kế hoạch: [docs/plans/](docs/plans/)

## Quy trình làm việc

**Luôn đọc file phase tương ứng trong `docs/plans/` trước khi code.** Kế hoạch đã chốt —
nếu thấy cần làm khác, nói ra trước, đừng tự đổi.

Sau mỗi bước lớn: cập nhật `docs/plans/PROGRESS.md` và commit.

## Lệnh

```bash
docker compose exec app php artisan test           # test backend
docker compose exec app ./vendor/bin/pint          # format PHP
cd frontend && npm run lint && npm run type-check  # frontend
```

## Convention — Backend

- **Controller mỏng, service dày.** Logic nghiệp vụ nằm trong `app/Services/`, controller chỉ điều phối và trả Resource.
- **Mỗi service có interface** trong `Services/Contracts/`, bind trong `AppServiceProvider`. Controller type-hint interface, không type-hint implementation.
- **Controllers để phẳng** trong `Http/Controllers/`, không chia sub-folder.
- Validation luôn qua **Form Request**, kèm `messages()` **tiếng Việt** (frontend hiển thị thẳng message từ backend).
- Response luôn qua **API Resource**, định dạng `{ "data": ..., "message": ... }`.
- Tiền tệ: `decimal(12,2)` ở DB, `bcmath` khi tính toán. **Không dùng float cho tiền.**
- Enum: backed enum string, có method `label()` tiếng Việt.
- Lỗi nghiệp vụ: `throw new BusinessException('thông báo tiếng Việt')` → render 400.
- **Broadcast event ngoài transaction**, không bao giờ bên trong.
- Query có quan hệ phải `with()` — không chấp nhận N+1.

## Convention — Frontend

- Vue 3 `<script setup lang="ts">`, Composition API. Không Options API.
- State dùng **Pinia setup store** (`defineStore('x', () => {...})`), không option store.
- UI component từ **shadcn-vue** (`components/ui/`). Không tự viết lại button/dialog/input.
- Gọi API qua `src/api/*.ts`, **không gọi `client` trực tiếp trong component**.
- Kiểu dữ liệu API khai báo trong `src/types/`, dùng lại — không viết inline interface.
- Thao tác thường xuyên (toggle, tăng giảm số lượng) dùng **optimistic update** kèm revert khi lỗi.
- Mobile (màn khách): vùng chạm ≥ 44px, font input ≥ 16px, tôn trọng `safe-area-inset`.

## Convention — Chung

- Text hiển thị cho người dùng: **tiếng Việt**. Code, comment kỹ thuật, commit: tiếng Anh (trừ message nghiệp vụ).
- Commit: `type(scope): mô tả` — `feat(order):`, `fix(kds):`, `chore(setup):`, `test(payment):`.
- Mỗi thay đổi logic nghiệp vụ phải có test. Test đặt tên bằng tiếng Việt mô tả hành vi:
  `it('snapshot giá tại thời điểm đặt, không đổi khi menu đổi giá')`.
- Không commit `.env`. Mọi biến mới phải thêm vào `.env.example`.

## Ba điểm kỹ thuật cốt lõi — không được phá vỡ

1. **Snapshot giá** — `order_items` lưu `name_snapshot`, `unit_price_snapshot`. Mọi tính tiền và báo cáo dùng snapshot, **không join sang `menu_items` để lấy giá**.
2. **Dining session** — mỗi bàn tối đa một session `open`. Bảo vệ bằng transaction + `lockForUpdate` + partial unique index. Không bỏ lớp nào.
3. **Derive `order.status`** từ trạng thái các `order_items` con. Không bao giờ set tay.

## Không làm trong MVP

Multi-tenant, đa ngôn ngữ, tích điểm khách, in bill nhiệt, voucher.
Nếu thấy cần, ghi vào roadmap — đừng implement.
