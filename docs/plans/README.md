# cafe-connect — Kế hoạch triển khai theo Phase

Tài liệu này chia nhỏ [design_overview.md](../design_overview.md) thành **10 phase** thực thi được.
Mỗi phase là **một tập video** độc lập: có mục tiêu rõ, các bước bấm-là-chạy, và tiêu chí "xong" để quay cảnh demo cuối tập.

---

## Nguyên tắc chung

1. **Mỗi phase phải chạy được và demo được.** Không có phase nào kết thúc ở trạng thái "code xong nhưng chưa thấy gì".
2. **Polling trước, WebSocket sau.** Phase 5–6 chạy bằng polling; Phase 7 mới thay bằng Reverb. Đây là cách tránh kẹt ở phần khó nhất.
3. **Backend trước, frontend ngay sau, trong cùng phase.** Không dồn hết API rồi mới làm UI — sẽ không có gì để quay.
4. **Commit theo bước.** Mỗi bước lớn trong phase = 1 commit. Tên commit dùng làm chapter marker cho video YouTube.
5. **Single-tenant.** Không đụng vào multi-tenant ở bất kỳ phase nào.

---

## Bảng phase

| Phase | Tên | Ước lượng | Demo cuối phase |
|---|---|---|---|
| [0](phase-00-setup.md) | Khởi tạo dự án & môi trường | 3–4h | `cd backend && docker compose up` → Laravel API + Vue chạy, gọi được `/api/health` |
| [1](phase-01-database.md) | Database schema, Model, Seeder | 4–5h | `migrate:fresh --seed` → có menu mẫu + 8 bàn trong DB |
| [2](phase-02-auth.md) | Auth JWT + RBAC + màn Login | 4–5h | Login admin trên Vue → vào được `/admin`, F5 không mất session |
| [3](phase-03-admin-menu.md) | Admin quản lý menu | 6–8h | Thêm/sửa/xóa món + tùy chọn + bật tắt hết hàng trên UI |
| [4](phase-04-tables-qr.md) | Quản lý bàn & sinh QR | 3–4h | Tạo bàn → tải PNG QR → quét bằng điện thoại ra đúng URL |
| [5](phase-05-customer-order.md) | Khách quét QR & gọi món | 8–10h | Quét QR thật → chọn món có topping → đặt → đơn nằm trong DB kèm snapshot giá |
| [6](phase-06-kds.md) | KDS + state machine (polling) | 5–6h | Đặt món trên điện thoại → ~3s sau ticket hiện ở màn bếp → đổi trạng thái → khách thấy |
| [7](phase-07-realtime.md) | Real-time với Laravel Reverb | 6–8h | Bỏ polling: order bật lên tức thì + có âm thanh; gọi phục vụ / đòi bill |
| [8](phase-08-payment.md) | Thanh toán & đóng bàn | 6–8h | Thanh toán tiền mặt tại quầy + VNPay sandbox end-to-end |
| [9](phase-09-report-deploy.md) | Báo cáo, polish, deploy | 8–10h | Link demo public + QR in ra giấy + README hoàn chỉnh |

**Tổng ~55–70h** ≈ 4–6 tuần nếu làm vài giờ mỗi tối.

---

## Thứ tự phụ thuộc

```
0 → 1 → 2 → 3 → 4
             ↓
             5 → 6 → 7 → 8 → 9
```

Phase 4 (QR) có thể làm song song hoặc hoán đổi với Phase 3 nếu muốn quay video "quét QR" sớm cho hấp dẫn.
Phase 8 phụ thuộc Phase 5 (cần có session + order để thanh toán), không phụ thuộc Phase 7.

---

## Quy ước dùng chung mọi phase

**Branch & commit**

```bash
git checkout -b phase-05-customer-order
# ... làm việc, commit theo từng bước
git checkout main && git merge --no-ff phase-05-customer-order
```

Commit message: `feat(order): snapshot giá khi tạo order_items`, `chore(setup): docker compose`, `test(order): unit test derive status`.

**Định dạng response API** — thống nhất từ Phase 0, mọi endpoint đều theo:

```json
{ "data": { }, "message": "OK" }
```

Lỗi validation trả 422 theo mặc định Laravel. Lỗi nghiệp vụ trả 400 kèm `message` tiếng Việt (khách sẽ đọc trực tiếp).

**Definition of Done cho mọi phase**
- [ ] Code chạy được bằng `cd backend && docker compose up` từ máy sạch
- [ ] Có ít nhất 1 test (Feature hoặc Unit) cho logic mới
- [ ] Không có `dd()`, `console.log`, code comment rác
- [ ] Đã commit và merge về `main`
- [ ] Đã quay xong phần demo của phase

---

## Ghi chú khi quay video

Mỗi file phase có mục **"Kịch bản quay video"** ở cuối. Nguyên tắc chung:

- **Mở đầu mỗi tập (30s):** nhắc lại đang ở đâu trong sơ đồ phase, hôm nay làm gì.
- **Không quay cảnh gõ boilerplate.** Chuẩn bị sẵn snippet, tua nhanh phần lặp lại.
- **Luôn kết bằng demo chạy thật**, không kết bằng "code compile không lỗi".
- **Chuẩn bị sẵn lỗi cố ý** ở 1–2 tập để giải thích cách debug — người xem thích phần này hơn code chạy trơn tru.
- Từ Phase 6 trở đi, quay **màn hình chia đôi/ba**: điện thoại (OBS + scrcpy hoặc cửa sổ trình duyệt mobile view) + màn bếp + màn admin.
