# Phase 1 — Database schema, Model, Seeder

> **Mục tiêu:** Toàn bộ ERD ở [design_overview.md §4](../design_overview.md) thành migration chạy được, kèm Model có quan hệ đầy đủ và seeder tạo dữ liệu demo đẹp.
> **Ước lượng:** 4–5h · **Demo cuối phase:** `php artisan migrate:fresh --seed` → mở DB thấy 6 danh mục, ~25 món, 8 bàn, và một phiên bàn mẫu có 2 đơn.

---

## Thứ tự tạo bảng (quan trọng — khóa ngoại phụ thuộc thứ tự)

```
1. categories
2. menu_items            → categories
3. item_option_groups    → menu_items
4. item_options          → item_option_groups
5. tables
6. dining_sessions       → tables
7. orders                → dining_sessions
8. order_items           → orders, menu_items
9. order_item_options    → order_items
10. payments             → dining_sessions
```

Đặt tên file migration với timestamp tăng dần đúng thứ tự này.

---

## Bước 1 — Enums trước, migration sau

Tạo `app/Enums/` — dùng **backed enum string** để đọc DB ra vẫn hiểu được.

```php
// app/Enums/OrderStatus.php
namespace App\Enums;

enum OrderStatus: string
{
    case Received   = 'received';
    case InProgress = 'in_progress';
    case Completed  = 'completed';
    case Cancelled  = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Received   => 'Đã nhận',
            self::InProgress => 'Đang làm',
            self::Completed  => 'Hoàn tất',
            self::Cancelled  => 'Đã hủy',
        };
    }
}
```

Tạo tương tự:

| Enum | Case |
|---|---|
| `OrderItemStatus` | `pending`, `preparing`, `ready`, `served`, `cancelled` |
| `SessionStatus` | `open`, `closed` |
| `TableStatus` | `available`, `occupied` |
| `PaymentMethod` | `cash`, `bank_transfer`, `vnpay`, `stripe` |
| `PaymentStatus` | `pending`, `paid`, `failed` |
| `OptionGroupType` | `single`, `multi` |

Mỗi enum đều có `label()` tiếng Việt — frontend sẽ nhận label sẵn từ API Resource, không phải map lại.

> **Quyết định:** lưu enum ở DB là **string** (`varchar`), không dùng native enum của Postgres. Lý do: thêm case mới chỉ sửa PHP, không cần migration đổi type — rất quan trọng khi đang phát triển nhanh.

---

## Bước 2 — Migration

```bash
docker compose exec app php artisan make:migration create_categories_table
# ... lặp cho 10 bảng
```

### 2.1 `categories`

```php
Schema::create('categories', function (Blueprint $t) {
    $t->id();
    $t->string('name');
    $t->integer('sort_order')->default(0);
    $t->boolean('is_active')->default(true);
    $t->timestamps();

    $t->index(['is_active', 'sort_order']);
});
```

### 2.2 `menu_items`

```php
Schema::create('menu_items', function (Blueprint $t) {
    $t->id();
    $t->foreignId('category_id')->constrained()->cascadeOnDelete();
    $t->string('name');
    $t->text('description')->nullable();
    $t->decimal('price', 12, 2);
    $t->string('image_url')->nullable();
    $t->boolean('is_available')->default(true);
    $t->integer('sort_order')->default(0);
    $t->timestamps();
    $t->softDeletes();          // xóa món cũ vẫn giữ được lịch sử đơn

    $t->index(['category_id', 'sort_order']);
});
```

> **`decimal(12,2)` chứ không phải float.** Tiền tệ dùng float sẽ ra `39999.999999`. `12,2` đủ cho 9.999.999.999,99 ₫.
> **`softDeletes`:** admin xóa món nhưng `order_items` cũ vẫn `belongsTo` nó. Có snapshot rồi nhưng vẫn nên giữ để truy vết.

### 2.3 `item_option_groups`

```php
Schema::create('item_option_groups', function (Blueprint $t) {
    $t->id();
    $t->foreignId('menu_item_id')->constrained()->cascadeOnDelete();
    $t->string('name');                        // "Size", "Mức đường", "Topping"
    $t->string('type')->default('single');     // single | multi
    $t->boolean('required')->default(false);
    $t->unsignedTinyInteger('min_select')->default(0);
    $t->unsignedTinyInteger('max_select')->default(1);
    $t->integer('sort_order')->default(0);
    $t->timestamps();
});
```

### 2.4 `item_options`

```php
Schema::create('item_options', function (Blueprint $t) {
    $t->id();
    $t->foreignId('option_group_id')->constrained('item_option_groups')->cascadeOnDelete();
    $t->string('name');                        // "Size L", "50% đường", "Trân châu"
    $t->decimal('price_delta', 12, 2)->default(0);   // có thể âm nếu giảm giá
    $t->boolean('is_available')->default(true);
    $t->integer('sort_order')->default(0);
    $t->timestamps();
});
```

### 2.5 `tables`

```php
Schema::create('tables', function (Blueprint $t) {
    $t->id();
    $t->string('name');                        // "Bàn 5", "Sân vườn 2"
    $t->string('qr_token', 64)->unique();
    $t->unsignedTinyInteger('capacity')->default(4);
    $t->string('status')->default('available');
    $t->boolean('is_active')->default(true);
    $t->timestamps();
});
```

> `qr_token` là chuỗi ngẫu nhiên 32 ký tự (`Str::random(32)`), **không phải id**. Nếu dùng id thì khách đoán được `/t/1`, `/t/2` và đặt món cho bàn khác. Đây là chi tiết bảo mật nhỏ nhưng đáng nhắc trong README.

### 2.6 `dining_sessions`

```php
Schema::create('dining_sessions', function (Blueprint $t) {
    $t->id();
    $t->foreignId('table_id')->constrained()->cascadeOnDelete();
    $t->string('code', 12)->unique();          // mã ngắn để khách/nhân viên đọc: "A7K2QX"
    $t->string('status')->default('open');
    $t->decimal('total', 12, 2)->default(0);
    $t->timestamp('opened_at');
    $t->timestamp('closed_at')->nullable();
    $t->timestamps();

    $t->index(['table_id', 'status']);
});
```

> **Ràng buộc nghiệp vụ quan trọng:** mỗi bàn chỉ có **tối đa một session `open`** tại một thời điểm. Postgres cho phép ép bằng partial unique index — thêm vào cuối migration:
>
> ```php
> DB::statement("CREATE UNIQUE INDEX one_open_session_per_table
>                ON dining_sessions (table_id) WHERE status = 'open'");
> ```
>
> Đây là thứ đáng khoe: chống race condition ở tầng DB, không chỉ tầng app. Hai khách cùng quét QR một lúc sẽ không tạo ra 2 session.

### 2.7 `orders`

```php
Schema::create('orders', function (Blueprint $t) {
    $t->id();
    $t->foreignId('dining_session_id')->constrained()->cascadeOnDelete();
    $t->string('status')->default('received');
    $t->text('note')->nullable();
    $t->timestamps();

    $t->index(['dining_session_id', 'created_at']);
});
```

### 2.8 `order_items` — **trái tim của hệ thống**

```php
Schema::create('order_items', function (Blueprint $t) {
    $t->id();
    $t->foreignId('order_id')->constrained()->cascadeOnDelete();
    $t->foreignId('menu_item_id')->constrained();     // KHÔNG cascade — giữ liên kết truy vết

    // --- SNAPSHOT: copy tại thời điểm đặt, không bao giờ đổi ---
    $t->string('name_snapshot');
    $t->decimal('unit_price_snapshot', 12, 2);
    // ---------------------------------------------------------

    $t->unsignedInteger('quantity')->default(1);
    $t->text('note')->nullable();
    $t->string('status')->default('pending');
    $t->timestamp('status_changed_at')->nullable();
    $t->timestamps();

    $t->index(['order_id']);
    $t->index(['status']);                            // KDS query theo status rất nhiều
});
```

### 2.9 `order_item_options`

```php
Schema::create('order_item_options', function (Blueprint $t) {
    $t->id();
    $t->foreignId('order_item_id')->constrained()->cascadeOnDelete();
    $t->foreignId('item_option_id')->nullable()->constrained('item_options')->nullOnDelete();
    $t->string('name_snapshot');
    $t->decimal('price_delta_snapshot', 12, 2)->default(0);
    $t->timestamps();
});
```

### 2.10 `payments`

```php
Schema::create('payments', function (Blueprint $t) {
    $t->id();
    $t->foreignId('dining_session_id')->constrained()->cascadeOnDelete();
    $t->string('method');
    $t->string('gateway_ref')->nullable()->index();   // mã giao dịch VNPay/Stripe
    $t->decimal('amount', 12, 2);
    $t->string('status')->default('pending');
    $t->json('gateway_payload')->nullable();          // lưu raw response để đối soát
    $t->timestamp('paid_at')->nullable();
    $t->timestamps();
});
```

> `gateway_payload` kiểu JSON: khi VNPay báo lỗi lúc đối soát, có raw payload là cứu tinh. Nhớ **không** log số thẻ (VNPay không trả về, nhưng nêu nguyên tắc này trong video).

Chạy:

```bash
docker compose exec app php artisan migrate:fresh
```

---

## Bước 3 — Models & quan hệ

```bash
docker compose exec app php artisan make:model Category
# ... 10 model
```

Ví dụ đầy đủ nhất — `MenuItem`:

```php
class MenuItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id', 'name', 'description', 'price',
        'image_url', 'is_available', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_available' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function optionGroups(): HasMany
    {
        return $this->hasMany(ItemOptionGroup::class)->orderBy('sort_order');
    }

    public function scopeAvailable($q) { return $q->where('is_available', true); }
}
```

`DiningSession` — chú ý các helper sẽ dùng suốt các phase sau:

```php
class DiningSession extends Model
{
    protected $fillable = ['table_id', 'code', 'status', 'total', 'opened_at', 'closed_at'];

    protected function casts(): array
    {
        return [
            'status'    => SessionStatus::class,
            'total'     => 'decimal:2',
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function table(): BelongsTo   { return $this->belongsTo(Table::class); }
    public function orders(): HasMany    { return $this->hasMany(Order::class); }
    public function payments(): HasMany  { return $this->hasMany(Payment::class); }

    public function orderItems(): HasManyThrough
    {
        return $this->hasManyThrough(OrderItem::class, Order::class);
    }

    public function scopeOpen($q) { return $q->where('status', SessionStatus::Open); }

    public function getRouteKeyName(): string { return 'code'; }   // route model binding theo code
}
```

`OrderItem` — chỗ tính tiền:

```php
class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 'menu_item_id', 'name_snapshot', 'unit_price_snapshot',
        'quantity', 'note', 'status', 'status_changed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => OrderItemStatus::class,
            'unit_price_snapshot' => 'decimal:2',
            'status_changed_at' => 'datetime',
        ];
    }

    public function options(): HasMany { return $this->hasMany(OrderItemOption::class); }
    public function order(): BelongsTo  { return $this->belongsTo(Order::class); }
    public function menuItem(): BelongsTo { return $this->belongsTo(MenuItem::class); }

    /** Thành tiền = (giá snapshot + tổng phụ thu tùy chọn) × số lượng */
    public function getLineTotalAttribute(): string
    {
        $delta = $this->options->sum(fn ($o) => (float) $o->price_delta_snapshot);
        return bcmul((string) ((float) $this->unit_price_snapshot + $delta), (string) $this->quantity, 2);
    }
}
```

> Dùng `bcmul` thay vì `*` cho phép nhân tiền — tránh sai số dấu phẩy động. Nếu chưa bật, thêm `bcmath` vào Dockerfile (đã có ở Phase 0).

Còn lại (`Category`, `ItemOptionGroup`, `ItemOption`, `Table`, `Order`, `OrderItemOption`, `Payment`) làm tương tự: `$fillable`, `casts()` map enum, và quan hệ hai chiều.

---

## Bước 4 — Factories

Cần cho test ở mọi phase sau. Tối thiểu làm factory cho: `Category`, `MenuItem`, `Table`, `DiningSession`, `Order`, `OrderItem`.

```php
// database/factories/MenuItemFactory.php
public function definition(): array
{
    return [
        'category_id' => Category::factory(),
        'name' => fake()->words(2, true),
        'description' => fake()->sentence(),
        'price' => fake()->numberBetween(25, 75) * 1000,
        'is_available' => true,
        'sort_order' => 0,
    ];
}

public function unavailable(): static
{
    return $this->state(fn () => ['is_available' => false]);
}
```

```php
// database/factories/TableFactory.php
public function definition(): array
{
    return [
        'name' => 'Bàn '.fake()->unique()->numberBetween(1, 99),
        'qr_token' => Str::random(32),
        'capacity' => 4,
        'status' => TableStatus::Available,
    ];
}
```

---

## Bước 5 — Seeder dữ liệu demo

Đây là phần **ảnh hưởng trực tiếp tới chất lượng video và ấn tượng portfolio**. Dữ liệu phải giống một quán cafe thật ở VN, không phải "Item 1, Item 2".

`database/seeders/MenuSeeder.php`:

```php
$data = [
    'Cà phê' => [
        ['Cà phê đen',        25000, 'Cà phê phin truyền thống, đậm vị'],
        ['Cà phê sữa',        29000, 'Phin đậm pha sữa đặc'],
        ['Bạc xỉu',           32000, 'Nhiều sữa, nhẹ cà phê'],
        ['Cold Brew',         45000, 'Ủ lạnh 12 tiếng, hậu vị trái cây'],
        ['Espresso',          35000, 'Shot đơn, 30ml'],
    ],
    'Trà & Trà sữa' => [
        ['Trà đào cam sả',    45000, 'Trà đen, đào ngâm, sả tươi'],
        ['Trà sữa trân châu', 42000, 'Trà ô long, trân châu đường đen'],
        ['Trà vải',           42000, 'Trà xanh, vải thiều'],
        ['Trà chanh giã tay', 35000, 'Chanh tươi, mát lạnh'],
    ],
    'Đá xay & Sinh tố' => [
        ['Cookie đá xay',     55000, 'Bánh quy socola, kem tươi'],
        ['Matcha đá xay',     55000, 'Matcha Uji, kem sữa'],
        ['Sinh tố bơ',        50000, 'Bơ sáp Đắk Lắk'],
    ],
    'Bánh ngọt' => [
        ['Bánh mì bơ tỏi',    30000, 'Nướng nóng, phô mai'],
        ['Tiramisu',          48000, 'Mascarpone, cacao Bỉ'],
        ['Croissant',         35000, 'Bơ Pháp, 64 lớp'],
    ],
    'Đồ ăn nhẹ' => [
        ['Khoai tây chiên',   39000, 'Sốt phô mai'],
        ['Mì Ý sốt bò bằm',   69000, 'Kèm salad'],
    ],
];
```

**Nhóm tùy chọn — gán có chọn lọc, đừng gán tất cả cho tất cả:**

| Nhóm | Áp dụng cho | Type | Bắt buộc | Options |
|---|---|---|---|---|
| Size | Đồ uống | single | ✅ | S (+0), M (+7.000), L (+12.000) |
| Mức đường | Trà, trà sữa, đá xay | single | ✅ | 0%, 30%, 50%, 70%, 100% (+0) |
| Mức đá | Đồ uống lạnh | single | ✅ | Không đá, Ít đá, Bình thường (+0) |
| Topping | Trà sữa, đá xay | multi (max 3) | ❌ | Trân châu đen (+8.000), Thạch dừa (+8.000), Pudding (+10.000), Kem cheese (+12.000) |
| Nóng/Lạnh | Cà phê, trà | single | ✅ | Nóng (+0), Lạnh (+3.000) |

Đặt **2 món `is_available = false`** (ví dụ Cold Brew, Tiramisu) để video có cảnh món hết hàng bị mờ đi — chi tiết nhỏ này khiến demo trông thật.

`TableSeeder.php`: tạo 8 bàn — `Bàn 1..6`, `Sân vườn 1`, `Sân vườn 2`. **Cố định `qr_token` của "Bàn 5" thành một chuỗi biết trước** (ví dụ `demo-table-5-fixed-token`) để link demo trong README và video luôn ổn định qua các lần seed lại.

`DemoDataSeeder.php`: tạo 1 session `open` ở Bàn 3 với 2 order — một order đã `served` hết, một order đang `preparing`. Có sẵn dữ liệu này thì mở KDS ở Phase 6 là thấy ngay ticket, không phải đặt tay.

`UserSeeder.php`: `admin@demo.com` / `password` (role admin) và `barista@demo.com` / `password` (role staff). Roles thật sẽ gán ở Phase 2, ở đây tạm tạo user.

`DatabaseSeeder.php` gọi theo thứ tự: `UserSeeder`, `MenuSeeder`, `TableSeeder`, `DemoDataSeeder`.

```bash
docker compose exec app php artisan migrate:fresh --seed
```

---

## Bước 6 — Test

`tests/Unit/OrderItemTest.php`:

```php
it('tính line total gồm phụ thu tùy chọn và số lượng', function () {
    $item = OrderItem::factory()->create([
        'unit_price_snapshot' => 42000,
        'quantity' => 2,
    ]);
    $item->options()->createMany([
        ['name_snapshot' => 'Size L',      'price_delta_snapshot' => 12000],
        ['name_snapshot' => 'Trân châu',   'price_delta_snapshot' => 8000],
    ]);

    expect($item->fresh()->line_total)->toBe('124000.00');   // (42000+20000)*2
});
```

`tests/Feature/DiningSessionTest.php`:

```php
it('không cho phép 2 session open trên cùng một bàn', function () {
    $table = Table::factory()->create();
    DiningSession::factory()->create(['table_id' => $table->id, 'status' => 'open']);

    expect(fn () => DiningSession::factory()->create([
        'table_id' => $table->id, 'status' => 'open',
    ]))->toThrow(QueryException::class);
});
```

Test thứ hai này chính là bằng chứng partial unique index hoạt động — **quay cảnh nó chạy xanh trong video**.

---

## Definition of Done

- [ ] `migrate:fresh --seed` chạy sạch, không lỗi
- [ ] Mở DB (TablePlus/pgAdmin) thấy: ≥5 categories, ≥17 menu_items, 8 tables, 1 session open có order
- [ ] Bàn 5 có `qr_token` cố định biết trước
- [ ] 2 test ở Bước 6 pass
- [ ] Toàn bộ enum có `label()` tiếng Việt
- [ ] Commit: `feat(db): schema đầy đủ + seeder menu quán cafe VN`

---

## Kịch bản quay video — Tập 1: "Thiết kế database"

| Thời lượng | Nội dung |
|---|---|
| 0:00–2:00 | Chiếu **sơ đồ ERD** (mermaid trong design_overview). Đi qua từng bảng bằng lời, chưa code |
| 2:00–5:00 | **Giải thích snapshot giá** — vẽ tay hoặc slide: hôm nay cà phê 25k, tháng sau lên 30k, hóa đơn cũ phải giữ 25k. Đây là phần "ăn điểm", nói kỹ |
| 5:00–8:00 | Tạo Enums. Giải thích vì sao string chứ không phải native enum Postgres |
| 8:00–18:00 | Viết migration. Tua nhanh phần lặp, **dừng lại kỹ ở 3 chỗ:** `decimal(12,2)` cho tiền, `qr_token` random chứ không dùng id, và partial unique index cho session |
| 18:00–22:00 | Models + quan hệ. Highlight `line_total` với `bcmul` |
| 22:00–28:00 | Seeder — vừa gõ vừa nói "menu này lấy cảm hứng từ quán X ngoài đời". Chỉ ra 2 món cố tình để hết hàng |
| 28:00–31:00 | `migrate:fresh --seed`, mở TablePlus xem dữ liệu thật |
| 31:00–34:00 | Chạy 2 test. Đặc biệt **demo test partial unique index**: thử tạo 2 session open → DB chặn. Giải thích race condition |
| 34:00–35:00 | Chốt tập, preview: đăng nhập admin |

**Điểm nhấn của tập này:** đây là tập "khoe tư duy thiết kế". Đừng chỉ gõ code — mỗi quyết định (decimal, softDelete, snapshot, partial index) đều phải nói rõ **vì sao**. Nhà tuyển dụng xem video này chính là để nghe phần "vì sao".
