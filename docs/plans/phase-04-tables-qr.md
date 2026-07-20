# Phase 4 — Quản lý bàn & sinh QR

> **Mục tiêu:** Admin tạo bàn, sinh mã QR, tải PNG hoặc in cả bộ QR ra giấy.
> **Ước lượng:** 3–4h · **Demo cuối phase:** in QR "Bàn 5" ra giấy thật, quét bằng điện thoại → mở đúng URL `/t/{token}`.

> Phase ngắn nhưng **giá trị video cao nhất tính trên thời lượng** — cảnh quét QR giấy thật bằng điện thoại là hình ảnh gây ấn tượng mạnh.

---

## Bước 1 — `QrServiceInterface`

Phase đầu tiên áp dụng pattern interface + implementation của [design_overview §8.2](../design_overview.md).

`app/Services/Contracts/QrServiceInterface.php`:

```php
namespace App\Services\Contracts;

use App\Models\Table;

interface QrServiceInterface
{
    /** Sinh (hoặc sinh lại) qr_token cho bàn, trả về token mới */
    public function generateToken(Table $table): string;

    /** URL đầy đủ khách sẽ mở khi quét */
    public function urlFor(Table $table): string;

    /** Ảnh PNG dạng binary string */
    public function pngFor(Table $table, int $size = 512): string;

    /** SVG dạng chuỗi — dùng khi in nhiều bàn một trang, nét không vỡ */
    public function svgFor(Table $table, int $size = 512): string;
}
```

`app/Services/QrService.php`:

```php
namespace App\Services;

use App\Models\Table;
use App\Services\Contracts\QrServiceInterface;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrService implements QrServiceInterface
{
    public function generateToken(Table $table): string
    {
        do {
            $token = Str::random(32);
        } while (Table::where('qr_token', $token)->exists());

        $table->update(['qr_token' => $token]);

        return $token;
    }

    public function urlFor(Table $table): string
    {
        return rtrim(config('app.frontend_url'), '/')."/t/{$table->qr_token}";
    }

    public function pngFor(Table $table, int $size = 512): string
    {
        return QrCode::format('png')
            ->size($size)
            ->margin(2)
            ->errorCorrection('H')      // chịu được che khuất/bẩn tới 30%
            ->generate($this->urlFor($table));
    }

    public function svgFor(Table $table, int $size = 512): string
    {
        return QrCode::format('svg')->size($size)->margin(2)
            ->errorCorrection('H')->generate($this->urlFor($table));
    }
}
```

Bind trong `AppServiceProvider::register()`:

```php
$this->app->bind(QrServiceInterface::class, QrService::class);
```

Thêm `config/app.php`: `'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),`

> **`errorCorrection('H')`** — mức sửa lỗi cao nhất. Mã QR dán trên bàn cafe sẽ bị đổ nước, xước, che một phần bởi ly. Mức H cho phép hỏng tới 30% diện tích vẫn quét được. Chi tiết "nghĩ từ thực tế vận hành" này rất đáng nói trong video.

> **Ảnh PNG sinh on-the-fly, không lưu file.** QR là hàm thuần của token — lưu ra storage chỉ tạo thêm rác và rủi ro lệch khi đổi token. Nếu lo hiệu năng thì cache theo token; nhưng quán 20 bàn thì không cần.

Cần cài thêm ext GD cho PNG — bổ sung vào `backend/Dockerfile`:

```dockerfile
RUN apk add --no-cache freetype-dev libjpeg-turbo-dev libpng-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd
```

---

## Bước 2 — API

```
GET    /api/admin/tables
POST   /api/admin/tables                    body: { name, capacity }
PUT    /api/admin/tables/{id}
DELETE /api/admin/tables/{id}
POST   /api/admin/tables/{id}/regenerate-qr        # đổi token mới (khi QR bị lộ/rách)
GET    /api/admin/tables/{id}/qr.png?size=512      # tải ảnh
GET    /api/admin/tables/print                     # trang HTML in cả bộ
```

Tất cả bọc `can:table.manage`.

`TableController`:

```php
public function __construct(private QrServiceInterface $qr) {}

public function store(StoreTableRequest $request)
{
    $table = new Table($request->validated());
    $table->qr_token = Str::random(32);
    $table->save();

    return (new TableResource($table))
        ->additional(['message' => 'Đã tạo bàn'])
        ->response()->setStatusCode(201);
}

public function qrPng(Table $table, Request $request)
{
    $size = (int) $request->integer('size', 512);
    $size = max(128, min($size, 2048));

    return response($this->qr->pngFor($table, $size))
        ->header('Content-Type', 'image/png')
        ->header('Content-Disposition', 'attachment; filename="qr-'.Str::slug($table->name).'.png"');
}

public function regenerateQr(Table $table)
{
    if ($table->diningSessions()->open()->exists()) {
        return response()->json([
            'message' => 'Bàn đang có khách, không thể đổi mã QR lúc này',
        ], 400);
    }

    $this->qr->generateToken($table);

    return (new TableResource($table->fresh()))
        ->additional(['message' => 'Đã sinh mã QR mới. Nhớ in và thay mã cũ trên bàn.']);
}

public function destroy(Table $table)
{
    if ($table->diningSessions()->open()->exists()) {
        return response()->json(['message' => 'Bàn đang có khách, không thể xóa'], 400);
    }
    $table->delete();
    return response()->json(['message' => 'Đã xóa bàn']);
}
```

> **Hai guard nghiệp vụ ở trên rất quan trọng.** Đổi token khi khách đang ngồi = khách mất phiên giữa chừng, refresh app là trắng giỏ hàng. Đây là loại lỗi chỉ lộ ra khi nghĩ tới vận hành thật — nêu rõ trong video.

`TableResource`:

```php
return [
    'id' => $this->id,
    'name' => $this->name,
    'capacity' => $this->capacity,
    'status' => $this->status->value,
    'status_label' => $this->status->label(),
    'qr_token' => $this->qr_token,
    'qr_url' => app(QrServiceInterface::class)->urlFor($this->resource),
    'qr_png_url' => route('admin.tables.qr', $this->id),
    'current_session' => new SessionResource($this->whenLoaded('openSession')),
];
```

---

## Bước 3 — Trang in hàng loạt

Endpoint `GET /api/admin/tables/print` trả **HTML** (không phải JSON) — mở tab mới, `Ctrl+P` là in được cả bộ QR.

`resources/views/tables/print.blade.php`:

```blade
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>Mã QR các bàn — {{ config('app.name') }}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    body { font-family: system-ui, sans-serif; margin: 0; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8mm; }
    .card {
      border: 1px dashed #bbb; border-radius: 8px; padding: 8mm;
      text-align: center; break-inside: avoid; page-break-inside: avoid;
    }
    .card h2 { margin: 0 0 4mm; font-size: 22pt; }
    .card svg { width: 60mm; height: 60mm; }
    .hint { margin-top: 4mm; font-size: 10pt; color: #555; }
    .brand { margin-top: 2mm; font-size: 9pt; color: #999; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <p class="no-print" style="padding:8mm">Nhấn Ctrl+P để in · Chọn khổ A4 · Bật "Đồ họa nền"</p>
  <div class="grid">
    @foreach ($tables as $table)
      <div class="card">
        <h2>{{ $table->name }}</h2>
        {!! $qr->svgFor($table, 400) !!}
        <div class="hint">Quét mã để xem menu và gọi món</div>
        <div class="brand">{{ config('app.name') }}</div>
      </div>
    @endforeach
  </div>
</body>
</html>
```

Dùng **SVG** ở đây thay vì PNG: in ra giấy nét ở mọi độ phân giải, và file nhẹ hơn khi có 20 bàn.

`break-inside: avoid` để một thẻ QR không bị cắt đôi giữa hai trang — chi tiết nhỏ nhưng thiếu là in ra hỏng cả tập.

> Route này cần auth. Vì mở bằng `window.open` (không gắn được header Bearer), dùng **signed URL có hạn**:
>
> ```php
> // API trả về link in
> return response()->json(['data' => [
>     'url' => URL::temporarySignedRoute('admin.tables.print', now()->addMinutes(10)),
> ]]);
> ```
> và route dùng middleware `signed` thay vì `auth:api`.

---

## Bước 4 — Frontend `TablesManageView.vue`

```
┌─────────────────────────────────────────────────────────┐
│ Quản lý bàn              [🖨 In toàn bộ QR] [+ Thêm bàn] │
├─────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│ │ ▣▣ QR   │ │ ▣▣ QR   │ │ ▣▣ QR   │ │ ▣▣ QR   │         │
│ │ Bàn 1   │ │ Bàn 2   │ │ Bàn 3   │ │ Bàn 4   │         │
│ │ 4 chỗ   │ │ 2 chỗ   │ │ 4 chỗ   │ │ 6 chỗ   │         │
│ │ ●Trống  │ │ ●Trống  │ │ ●Có khách│ │ ●Trống │         │
│ │ ⬇ ✎ ↻ 🗑 │ │ ...     │ │ ...     │ │ ...     │         │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
└─────────────────────────────────────────────────────────┘
```

Mỗi thẻ bàn:
- Ảnh QR preview (`<img :src="table.qr_png_url + '?size=256'">` — nhớ gắn token, xem ghi chú dưới)
- Badge trạng thái: xanh = Trống, cam = Có khách
- `⬇` tải PNG · `✎` sửa tên/sức chứa · `↻` sinh lại QR (có xác nhận) · `🗑` xóa
- Nút **"Mở như khách"** → mở `/t/{qr_token}` tab mới. Dùng cực nhiều khi test và khi quay video

> **Vấn đề hiển thị ảnh QR:** thẻ `<img>` không gửi header `Authorization`. Hai cách: (a) fetch bằng axios rồi `URL.createObjectURL(blob)`; (b) đơn giản hơn — cho endpoint QR nhận signed URL. Chọn (a) cho preview trong app, (b) cho tải file và trang in.
>
> ```ts
> async function loadQrPreview(table: Table) {
>   const res = await client.get(`/admin/tables/${table.id}/qr.png`, {
>     params: { size: 256 }, responseType: 'blob',
>   })
>   qrPreviews.value[table.id] = URL.createObjectURL(res.data)
> }
> ```
> Nhớ `URL.revokeObjectURL` khi unmount để không rò bộ nhớ.

Dialog sinh lại QR phải cảnh báo rõ:

> ⚠️ Mã QR cũ trên bàn sẽ **không dùng được nữa**. Bạn cần in mã mới và dán thay. Tiếp tục?

---

## Bước 5 — Test

```php
it('tạo bàn thì tự sinh qr_token duy nhất', function () {
    $this->actingAs($this->admin, 'api')
        ->postJson('/api/admin/tables', ['name' => 'Bàn 9', 'capacity' => 4])
        ->assertCreated();

    $table = Table::where('name', 'Bàn 9')->first();
    expect($table->qr_token)->toHaveLength(32);
});

it('trả ảnh PNG hợp lệ', function () {
    $table = Table::factory()->create();

    $res = $this->actingAs($this->admin, 'api')
        ->get("/api/admin/tables/{$table->id}/qr.png");

    $res->assertOk()->assertHeader('Content-Type', 'image/png');
    expect(substr($res->streamedContent() ?: $res->getContent(), 1, 3))->toBe('PNG');
});

it('không cho đổi QR khi bàn đang có khách', function () {
    $table = Table::factory()->create();
    DiningSession::factory()->create(['table_id' => $table->id, 'status' => 'open']);

    $this->actingAs($this->admin, 'api')
        ->postJson("/api/admin/tables/{$table->id}/regenerate-qr")
        ->assertStatus(400);
});

it('url QR trỏ đúng frontend', function () {
    config(['app.frontend_url' => 'https://cafe.example.com']);
    $table = Table::factory()->create(['qr_token' => 'abc123']);

    expect(app(QrServiceInterface::class)->urlFor($table))
        ->toBe('https://cafe.example.com/t/abc123');
});
```

---

## Definition of Done

- [ ] Tạo bàn trên UI → có QR preview ngay
- [ ] Tải PNG → mở file → **quét bằng điện thoại thật** ra đúng URL
- [ ] Trang in mở được, `Ctrl+P` xem preview thấy 2 QR/hàng, không thẻ nào bị cắt qua trang
- [ ] Sinh lại QR: mã cũ hết tác dụng, mã mới quét ra URL mới
- [ ] Không đổi/xóa được bàn đang có khách (thử với Bàn 3 từ seeder)
- [ ] Nút "Mở như khách" hoạt động
- [ ] Test pass
- [ ] Commit: `feat(table): CRUD bàn + sinh QR + trang in hàng loạt`

---

## Kịch bản quay video — Tập 4: "Sinh mã QR"

| Thời lượng | Nội dung |
|---|---|
| 0:00–1:00 | Tập ngắn nhưng "sướng" — hôm nay có thứ cầm được trên tay |
| 1:00–6:00 | `QrServiceInterface` — **lần đầu dùng pattern interface + bind**. Giải thích lợi ích: nhìn interface biết service làm gì, đổi implementation chỉ sửa 1 dòng. Đây là pattern sẽ dùng lại cho OrderService và PaymentGateway |
| 6:00–9:00 | Implement QrService. Dừng lại ở `errorCorrection('H')` — **giải thích bằng thực tế**: mã dán trên bàn cafe sẽ bị đổ nước, che bởi ly. Có thể demo bằng cách lấy bút che 1 góc mã rồi quét vẫn được |
| 9:00–12:00 | Vì sao **không lưu file QR** mà sinh on-the-fly |
| 12:00–16:00 | API + hai guard nghiệp vụ (không đổi/xóa bàn đang có khách). Nói rõ hậu quả nếu thiếu: khách mất giỏ hàng giữa chừng |
| 16:00–21:00 | Trang in Blade. Giải thích `@page`, `break-inside: avoid`, vì sao dùng SVG thay PNG khi in |
| 21:00–28:00 | UI quản lý bàn. Xử lý vấn đề `<img>` không gửi được Bearer token → blob URL. Đây là bẫy nhiều người dính |
| 28:00–33:00 | **Cao trào của tập:** in thật ra giấy → cầm tờ giấy lên camera → **quét bằng điện thoại** → mở ra trang (còn trống, vì Phase 5 mới làm). Cảnh này nên quay bằng camera phụ, thấy cả tay, giấy và màn hình điện thoại |
| 33:00–35:00 | Chốt: "Tuần sau chúng ta sẽ làm cái mà mã QR này dẫn tới — màn gọi món của khách." Preview Phase 5 |

**Chuẩn bị đạo cụ:** in sẵn bộ QR ra giấy A4 và **cắt rời từng thẻ**, có thể dán lên chân đế acrylic mua ngoài tiệm cho giống quán thật. Chi phí vài chục nghìn nhưng nâng chất lượng video lên hẳn một bậc.
