# Phase 9 — Báo cáo, polish & deploy

> **Mục tiêu:** Báo cáo doanh thu có biểu đồ, hoàn thiện UI, deploy lên internet, viết README, quay video demo cuối.
> **Ước lượng:** 8–10h · **Demo cuối phase:** gửi link cho bạn bè, họ quét QR trên điện thoại của họ và gọi món được thật.

---

## PHẦN A — Báo cáo (2–3h)

### Bước 1 — API báo cáo

```
GET /api/admin/reports/summary?from=&to=      # 4 chỉ số tổng quan
GET /api/admin/reports/revenue?from=&to=&group_by=day|hour
GET /api/admin/reports/top-items?from=&to=&limit=10
GET /api/admin/reports/peak-hours?from=&to=
```

`ReportController@summary`:

```php
public function summary(ReportRangeRequest $request)
{
    [$from, $to] = $request->range();

    $sessions = DiningSession::whereBetween('closed_at', [$from, $to])
        ->where('status', SessionStatus::Closed);

    $revenue = (clone $sessions)->sum('total');
    $count   = (clone $sessions)->count();

    // Kỳ trước cùng độ dài để so sánh tăng/giảm
    $length = $from->diffInDays($to) + 1;
    $prevRevenue = DiningSession::whereBetween('closed_at', [
        $from->copy()->subDays($length), $from->copy()->subDay(),
    ])->where('status', SessionStatus::Closed)->sum('total');

    return response()->json(['data' => [
        'revenue'          => (float) $revenue,
        'revenue_formatted'=> number_format((float) $revenue, 0, ',', '.').'đ',
        'session_count'    => $count,
        'avg_per_session'  => $count ? round($revenue / $count) : 0,
        'items_sold'       => OrderItem::whereHas('order.diningSession', fn ($q) =>
                                  $q->whereBetween('closed_at', [$from, $to]))
                                  ->where('order_items.status', '!=', 'cancelled')
                                  ->sum('quantity'),
        'revenue_change_pct' => $prevRevenue > 0
            ? round((($revenue - $prevRevenue) / $prevRevenue) * 100, 1)
            : null,
    ], 'message' => 'OK']);
}
```

> **So sánh với kỳ trước** biến con số vô nghĩa ("hôm nay 3.2 triệu") thành thông tin có ích ("+18% so với tuần trước"). Chủ quán quan tâm xu hướng, không quan tâm số tuyệt đối. Chi tiết sản phẩm này đáng nói trong video.

`revenue` — nhóm theo ngày, **có điền ngày trống**:

```php
public function revenue(ReportRangeRequest $request)
{
    [$from, $to] = $request->range();

    $rows = DiningSession::query()
        ->selectRaw('DATE(closed_at) as date, SUM(total) as revenue, COUNT(*) as sessions')
        ->where('status', SessionStatus::Closed)
        ->whereBetween('closed_at', [$from, $to])
        ->groupByRaw('DATE(closed_at)')
        ->orderBy('date')
        ->get()
        ->keyBy('date');

    // Ngày không có đơn vẫn phải có điểm 0, nếu không biểu đồ bị "nhảy cóc"
    $series = collect(CarbonPeriod::create($from, $to))->map(fn ($d) => [
        'date'     => $d->toDateString(),
        'label'    => $d->format('d/m'),
        'revenue'  => (float) ($rows[$d->toDateString()]->revenue ?? 0),
        'sessions' => (int) ($rows[$d->toDateString()]->sessions ?? 0),
    ]);

    return response()->json(['data' => $series, 'message' => 'OK']);
}
```

`top-items` — **dùng snapshot, không join menu_items**:

```php
$items = OrderItem::query()
    ->selectRaw('name_snapshot, SUM(quantity) as qty,
                 SUM(unit_price_snapshot * quantity) as revenue')
    ->whereHas('order.diningSession', fn ($q) => $q
        ->where('status', SessionStatus::Closed)
        ->whereBetween('closed_at', [$from, $to]))
    ->where('order_items.status', '!=', 'cancelled')
    ->groupBy('name_snapshot')
    ->orderByDesc('qty')
    ->limit($request->integer('limit', 10))
    ->get();
```

> **Điểm cực đáng khoe:** báo cáo dùng `name_snapshot` và `unit_price_snapshot`. Nghĩa là **món đã xóa khỏi menu vẫn xuất hiện đúng trong báo cáo cũ**, và doanh thu quá khứ không bị thay đổi khi admin đổi giá. Đây là lúc quyết định snapshot từ Phase 1 "trả cổ tức" — **nhắc lại nó trong video và trong README**.

`ReportRangeRequest` — mặc định 30 ngày, chặn khoảng quá dài:

```php
public function rules(): array
{
    return [
        'from' => ['nullable', 'date'],
        'to'   => ['nullable', 'date', 'after_or_equal:from'],
    ];
}

public function range(): array
{
    $to   = $this->date('to')   ? Carbon::parse($this->to)->endOfDay()   : now()->endOfDay();
    $from = $this->date('from') ? Carbon::parse($this->from)->startOfDay() : now()->subDays(29)->startOfDay();

    abort_if($from->diffInDays($to) > 366, 422, 'Khoảng thời gian tối đa 1 năm');

    return [$from, $to];
}
```

### Bước 2 — Màn `ReportsView.vue`

```bash
npm install chart.js vue-chartjs
```

```
┌────────────────────────────────────────────────────────────┐
│ Báo cáo    [Hôm nay][7 ngày][30 ngày][Tùy chọn: __ → __]   │
├────────────────────────────────────────────────────────────┤
│ ┌──────────┐┌──────────┐┌──────────┐┌──────────┐           │
│ │Doanh thu ││ Số lượt  ││ TB/bàn   ││ Món bán  │           │
│ │3.240.000đ││   42     ││  77.000đ ││   186    │           │
│ │ ▲ 18%    ││  ▲ 12%   ││  ▲ 5%    ││          │           │
│ └──────────┘└──────────┘└──────────┘└──────────┘           │
├────────────────────────────────────────────────────────────┤
│ Doanh thu theo ngày                                        │
│  ▁▃▅▂▇▆▃▅▇█▅▃▂▄▆                                          │
├──────────────────────────┬─────────────────────────────────┤
│ Top món bán chạy         │ Giờ cao điểm                    │
│ 1. Trà sữa TC     42 ly  │  ▁▁▂▅█▆▃▂▁▃▅▇▄▂                │
│ 2. Cà phê sữa     38 ly  │  7 9 11 13 15 17 19 21          │
│ 3. Cold Brew      31 ly  │                                 │
└──────────────────────────┴─────────────────────────────────┘
```

Chi tiết cần có:
- **Preset khoảng thời gian** (Hôm nay / 7 / 30 ngày) — chủ quán không muốn chọn ngày thủ công
- Chỉ số phụ `▲ 18%` màu xanh khi tăng, đỏ khi giảm
- **Skeleton loading**, không để màn nhảy
- Trạng thái rỗng có ý nghĩa: *"Chưa có dữ liệu trong khoảng này"* + nút "Xem 30 ngày"
- Format tiền VN nhất quán ở tooltip biểu đồ

Cấu hình Chart.js tối thiểu:

```ts
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => new Intl.NumberFormat('vi-VN').format(ctx.parsed.y) + 'đ',
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { callback: (v: any) => new Intl.NumberFormat('vi-VN', {
        notation: 'compact' }).format(v) + 'đ' },
    },
  },
}
```

### Bước 3 — Seeder dữ liệu báo cáo

Báo cáo trên dữ liệu 3 phiên trông rất tệ. Viết `ReportDemoSeeder` sinh **60 ngày lịch sử**:

```php
foreach (CarbonPeriod::create(now()->subDays(60), now()->subDay()) as $date) {
    // Cuối tuần đông hơn, giữa tuần ít hơn — dữ liệu có nhịp trông thật
    $isWeekend = $date->isWeekend();
    $sessionCount = random_int($isWeekend ? 18 : 8, $isWeekend ? 32 : 18);

    for ($i = 0; $i < $sessionCount; $i++) {
        // Giờ cao điểm: sáng 7–9h, chiều 14–16h, tối 19–21h
        $hour = collect([7,8,8,9,14,15,15,16,19,20,20,21])->random();
        // ... tạo session + orders + items với giá thật từ menu
    }
}
```

> Dữ liệu có **nhịp cuối tuần và giờ cao điểm** khiến biểu đồ trông như quán thật. Biểu đồ random phẳng lì thì ai nhìn cũng biết là dữ liệu giả. Đây là công sức nhỏ mà nâng chất lượng portfolio rõ rệt.

---

## PHẦN B — Polish (2–3h)

Checklist rà soát trước khi deploy:

**Trải nghiệm khách (quan trọng nhất — người ngoài sẽ thử cái này)**
- [ ] Ảnh món: nén WebP, `loading="lazy"`, có placeholder blur
- [ ] Skeleton cho mọi màn có loading
- [ ] Trạng thái rỗng đều có hình + chữ hướng dẫn, không để trống trơn
- [ ] Toast không chồng lên thanh giỏ hàng
- [ ] Vùng chạm ≥ 44px; font input ≥ 16px
- [ ] `safe-area-inset` cho iPhone
- [ ] Nút "Gọi món" có loading state, chặn bấm đôi
- [ ] Lỗi mạng hiện thông báo tiếng Việt rõ nghĩa, có nút "Thử lại"

**PWA** (`vite-plugin-pwa`) — cho khách "Thêm vào màn hình chính":

```bash
npm i -D vite-plugin-pwa
```

```ts
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'cafe-connect', short_name: 'cafe-connect',
    theme_color: '#0f172a', background_color: '#ffffff',
    display: 'standalone', start_url: '/',
    icons: [ /* 192, 512 */ ],
  },
})
```

**Chung**
- [ ] Favicon + title từng app ("Menu · cafe-connect", "Quầy pha chế", "Quản trị")
- [ ] Meta OG image — link gửi qua Zalo/Messenger hiện đẹp
- [ ] Xóa toàn bộ `console.log`, `dd()`
- [ ] Kiểm tra dark mode nếu có bật, hoặc **khóa light mode** nếu chưa polish kỹ
- [ ] Lighthouse mobile ≥ 90 điểm Performance cho màn khách
- [ ] Test trên **Safari iOS thật**, không chỉ Chrome DevTools

---

## PHẦN C — Deploy (3–4h)

### Bước 1 — Database: Neon

1. Tạo project trên [neon.tech](https://neon.tech) (free tier)
2. Lấy connection string, tách thành `DB_HOST`, `DB_DATABASE`, ...
3. Neon yêu cầu SSL: `DB_SSLMODE=require`

### Bước 2 — Redis: Upstash

Tạo database ở [upstash.com](https://upstash.com), lấy `REDIS_URL` (dạng `rediss://`). Dùng cho cache, queue, và Reverb scaling.

### Bước 3 — Ảnh: Cloudflare R2

```bash
composer require league/flysystem-aws-s3-v3
```

`config/filesystems.php`:

```php
'r2' => [
    'driver' => 's3',
    'key' => env('R2_ACCESS_KEY_ID'),
    'secret' => env('R2_SECRET_ACCESS_KEY'),
    'region' => 'auto',
    'bucket' => env('R2_BUCKET'),
    'endpoint' => env('R2_ENDPOINT'),
    'url' => env('R2_PUBLIC_URL'),
    'use_path_style_endpoint' => true,
],
```

Đổi `FILESYSTEM_DISK=r2` là xong — vì Phase 3 đã dùng `config('filesystems.default')` chứ không hard-code `'public'`. **Nhắc lại điểm này trong video**: quyết định nhỏ ở Phase 3 giúp Phase 9 chỉ đổi 1 dòng env.

### Bước 4 — Backend: Fly.io

```bash
cd backend
fly launch --no-deploy
```

`fly.toml` — **hai process: app và Reverb**:

```toml
app = "cafe-connect-api"
primary_region = "sin"          # Singapore, gần VN nhất

[build]
  dockerfile = "docker/Dockerfile.prod"

[processes]
  app    = "php-fpm & nginx -g 'daemon off;'"
  reverb = "php artisan reverb:start --host=0.0.0.0 --port=8080"
  worker = "php artisan queue:work --tries=3 --max-time=3600"

[[services]]
  processes = ["app"]
  internal_port = 8080
  protocol = "tcp"
  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[[services]]
  processes = ["reverb"]
  internal_port = 8080
  protocol = "tcp"
  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[[vm]]
  memory = "512mb"
  cpu_kind = "shared"
  cpus = 1
```

`docker/Dockerfile.prod` khác dev ở: `composer install --no-dev --optimize-autoloader`, chạy `php artisan config:cache route:cache view:cache`, và không mount volume.

```bash
fly secrets set APP_KEY=... DB_HOST=... JWT_SECRET=... VNPAY_HASH_SECRET=...
fly deploy
fly ssh console -C "php artisan migrate --force"
fly ssh console -C "php artisan db:seed --force"
```

> **`primary_region = "sin"`** (Singapore) — độ trễ tới VN ~30ms thay vì ~250ms nếu để mặc định US. Với ứng dụng real-time, đây là khác biệt cảm nhận được. Chi tiết nhỏ cho thấy bạn nghĩ tới người dùng cuối.

### Bước 5 — Frontend: Vercel

```bash
cd frontend && vercel
```

Env trên Vercel:

```
VITE_API_BASE_URL=https://cafe-connect-api.fly.dev/api
VITE_REVERB_APP_KEY=...
VITE_REVERB_HOST=cafe-connect-reverb.fly.dev
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

`vercel.json` cho SPA routing:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### Bước 6 — Cập nhật cấu hình production

- `FRONTEND_URL` trên Fly = domain Vercel (QR sẽ trỏ tới đây)
- CORS `allowed_origins` thêm domain Vercel
- `VNPAY_RETURN_URL` trỏ domain thật
- **Sinh lại QR sau khi có domain thật** — QR sinh lúc dev trỏ về `localhost`, in ra là vô dụng

### Bước 7 — Kiểm tra sau deploy

- [ ] `https://api.../api/health` trả `db: ok`
- [ ] WebSocket kết nối được qua `wss://` (DevTools → Network → WS → status 101)
- [ ] Đặt món từ **mạng 4G** (không phải WiFi nhà) → ticket bật lên
- [ ] Ảnh món load từ R2
- [ ] VNPay sandbox chạy được với return URL production
- [ ] HTTPS không có mixed-content warning

> **Bẫy hay gặp:** WebSocket qua HTTPS phải là `wss://`, và Reverb phải nằm sau TLS termination của Fly. Nếu frontend là `https` mà kết nối `ws://` thì trình duyệt chặn thẳng. Cấu hình `VITE_REVERB_SCHEME=https` và `VITE_REVERB_PORT=443`.

---

## PHẦN D — README & tài liệu (1–2h)

Cấu trúc `README.md`:

```markdown
# cafe-connect — QR Menu & Real-time Ordering

Hệ thống gọi món qua mã QR cho quán cafe. Khách quét QR tại bàn → gọi món →
quầy pha chế nhận đơn real-time → theo dõi trạng thái đến khi thanh toán.

[🔗 Demo khách (Bàn 5)] · [🖥 Màn quầy pha chế] · [⚙️ Trang quản trị] · [📹 Video demo]

Tài khoản demo: admin@demo.com / password

![3 giao diện cạnh nhau]

## Điểm kỹ thuật đáng chú ý

### 1. Real-time hai chiều với Laravel Reverb
[sơ đồ luồng event]
Không chỉ "chạy được": có **fallback tự động về polling** khi mất kết nối,
và **reconcile định kỳ 60s** để tự sửa nếu lỡ miss event — WiFi quán cafe
không ổn định, màn bếp không được phép đứng hình.

### 2. Dining session — gộp nhiều lượt gọi món vào một hóa đơn
Bốn người cùng bàn quét QR trong cùng một giây vẫn chỉ tạo **một** phiên,
nhờ ba lớp bảo vệ: transaction → `lockForUpdate` → **partial unique index**
ở tầng Postgres.

### 3. Snapshot giá
`order_items` lưu `name_snapshot` và `unit_price_snapshot` tại thời điểm đặt.
Admin đổi giá hay xóa món thì hóa đơn cũ và **báo cáo doanh thu lịch sử vẫn đúng**.

### 4. Cổng thanh toán sau interface
`PaymentGatewayInterface` + DTO `PaymentVerification`. Đổi VNPay → Stripe
chỉ sửa một dòng binding. Webhook xử lý **idempotent** — cổng gọi lại
bao nhiêu lần cũng chỉ chốt một lần.

## Kiến trúc
[sơ đồ]

## Stack
...

## Chạy local
...

## Test
`php artisan test` — XX test bao phủ snapshot giá, state machine,
race condition phiên bàn, và idempotency webhook.
```

**Ảnh chụp cần có:** 3 giao diện cạnh nhau (ảnh hero), màn KDS, màn báo cáo, và **ảnh QR in ra giấy dán trên bàn thật**.

---

## PHẦN E — Video demo cuối (1h)

Video 2–3 phút riêng biệt (không phải tập dạy code) để **gắn đầu README và gửi nhà tuyển dụng**:

| Giây | Cảnh |
|---|---|
| 0–10 | QR in trên giấy dán bàn cafe thật, tay cầm điện thoại quét |
| 10–35 | Duyệt menu, chọn trà sữa, chọn size/đường/topping, thêm giỏ |
| 35–45 | Bấm "Gọi món" |
| 45–55 | **Cắt sang màn KDS:** ticket bật lên + tiếng chuông (chia đôi màn hình với điện thoại) |
| 55–70 | Barista bấm "BẮT ĐẦU" → "XONG" → điện thoại rung, đổi trạng thái |
| 70–85 | Khách bấm Tính tiền → VNPay → thành công |
| 85–95 | Màn admin: bàn tự về "Trống"; lướt qua biểu đồ báo cáo |
| 95–120 | Text overlay 3 điểm kỹ thuật, link demo, tên + liên hệ |

Không lời thoại — nhạc nền + text overlay, để người xem quốc tế cũng hiểu.

---

## Definition of Done — toàn dự án

- [ ] Báo cáo hiển thị đúng trên 60 ngày dữ liệu, biểu đồ có nhịp cuối tuần
- [ ] Lighthouse mobile ≥ 90 cho màn khách
- [ ] Backend chạy trên Fly.io (3 process: app, reverb, worker)
- [ ] Frontend chạy trên Vercel
- [ ] **Người khác quét QR trên điện thoại của họ, mạng của họ, gọi món thành công**
- [ ] Real-time chạy qua `wss://` trên production
- [ ] VNPay sandbox chạy với return URL production
- [ ] README đầy đủ ảnh, sơ đồ, giải thích 4 điểm kỹ thuật, hướng dẫn chạy local
- [ ] Video demo 2 phút gắn đầu README
- [ ] QR "Bàn 5" in ra giấy, quét được, trỏ về production
- [ ] Toàn bộ test pass trên CI
- [ ] Commit: `feat(report): báo cáo doanh thu` · `chore(deploy): production Fly.io + Vercel` · `docs: README`

---

## Kịch bản quay video — Tập 9: "Báo cáo & lên sóng"

| Thời lượng | Nội dung |
|---|---|
| 0:00–2:00 | Tập cuối. Nhìn lại: từ repo trống đến sản phẩm chạy được |
| 2:00–10:00 | API báo cáo. **Điểm nhấn:** dùng `name_snapshot` cho top-items → món đã xóa vẫn hiện đúng trong báo cáo cũ. Demo: xóa một món trên admin → báo cáo tháng trước không đổi. **Đây là lúc quyết định ở Phase 1 trả cổ tức** — nói rõ điều này |
| 10:00–14:00 | Điền ngày trống trong series. Demo lỗi trước: biểu đồ nhảy cóc khi có ngày không bán được gì |
| 14:00–20:00 | UI báo cáo với Chart.js. So sánh kỳ trước — giải thích: chủ quán cần xu hướng, không cần số tuyệt đối |
| 20:00–25:00 | `ReportDemoSeeder` 60 ngày có nhịp cuối tuần + giờ cao điểm. Chỉ ra biểu đồ trước (random phẳng) và sau (có nhịp) |
| 25:00–32:00 | Polish: PWA, ảnh WebP, Lighthouse. Chạy Lighthouse trên camera, tối ưu vài chỗ, cho thấy điểm tăng |
| 32:00–40:00 | Deploy Neon + Upstash + R2. **Điểm nhấn:** đổi từ local disk sang R2 chỉ cần sửa `FILESYSTEM_DISK` — vì Phase 3 đã không hard-code disk. Bài học: viết code tránh hard-code hôm nay, tiết kiệm ngày mai |
| 40:00–50:00 | Fly.io với 3 process. Giải thích vì sao Reverb cần process riêng, vì sao chọn region Singapore |
| 50:00–56:00 | **Bẫy cuối cùng — `ws://` vs `wss://`.** Deploy xong WebSocket không kết nối, console báo mixed content. Debug trên camera rồi sửa |
| 56:00–60:00 | Sinh lại QR với domain production, **in ra giấy** |
| 60:00–68:00 | **DEMO CUỐI CÙNG — quay ngoài quán cafe thật nếu được:** dán QR lên bàn, ngồi xuống, quét bằng điện thoại, gọi món; laptop mở màn KDS bên cạnh. Đây là cảnh kết đẹp nhất cho cả series |
| 68:00–73:00 | Đi qua README. Tổng kết 4 điểm kỹ thuật. Nói về hướng mở rộng (multi-tenant, in bill nhiệt, tích điểm) và **vì sao cố ý không làm trong MVP** |
| 73:00–76:00 | Lời cảm ơn, link repo, link demo, mời đóng góp |

**Gợi ý cho series:** sau tập cuối, làm thêm **1 video tổng kết 10 phút** dạng "Tôi đã xây hệ thống gọi món QR trong 6 tuần — đây là những gì tôi học được". Video kiểu này thường có lượt xem cao hơn các tập dạy code, và là thứ nhà tuyển dụng xem đầu tiên.
