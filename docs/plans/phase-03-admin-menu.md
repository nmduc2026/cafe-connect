# Phase 3 — Admin quản lý menu

> **Mục tiêu:** Chủ quán CRUD được danh mục, món, nhóm tùy chọn và tùy chọn; bật/tắt "hết hàng" một chạm; upload ảnh món.
> **Ước lượng:** 6–8h · **Demo cuối phase:** thêm món "Trà đào cam sả" kèm ảnh, gắn nhóm Size + Topping, tắt hết hàng — tất cả trên UI, không đụng DB.

---

## Phạm vi API

```
GET    /api/menu                                    # public, cho khách (làm luôn ở phase này)

GET    /api/admin/categories
POST   /api/admin/categories
PUT    /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
POST   /api/admin/categories/reorder                # body: { ids: [3,1,2] }

GET    /api/admin/menu-items?category_id=&search=&page=
POST   /api/admin/menu-items
PUT    /api/admin/menu-items/{id}
DELETE /api/admin/menu-items/{id}
PATCH  /api/admin/menu-items/{id}/availability      # body: { is_available: bool }
POST   /api/admin/menu-items/{id}/image             # multipart

GET    /api/admin/menu-items/{id}/option-groups
POST   /api/admin/option-groups
PUT    /api/admin/option-groups/{id}
DELETE /api/admin/option-groups/{id}

POST   /api/admin/options
PUT    /api/admin/options/{id}
DELETE /api/admin/options/{id}
```

Tất cả route `admin/*` bọc trong:

```php
Route::middleware(['auth:api'])->prefix('admin')->group(function () {
    Route::middleware('can:menu.manage')->group(function () {
        // ... routes menu
    });
});
```

---

## Bước 1 — API Resources

Định hình JSON một lần, dùng cho cả admin lẫn khách.

```bash
docker compose exec app php artisan make:resource CategoryResource
docker compose exec app php artisan make:resource MenuItemResource
docker compose exec app php artisan make:resource OptionGroupResource
docker compose exec app php artisan make:resource OptionResource
```

```php
// MenuItemResource
return [
    'id' => $this->id,
    'category_id' => $this->category_id,
    'name' => $this->name,
    'description' => $this->description,
    'price' => (float) $this->price,
    'price_formatted' => number_format((float) $this->price, 0, ',', '.').'đ',
    'image_url' => $this->image_url,
    'is_available' => $this->is_available,
    'sort_order' => $this->sort_order,
    'option_groups' => OptionGroupResource::collection($this->whenLoaded('optionGroups')),
];
```

> **Trả cả `price` (số) lẫn `price_formatted` (chuỗi).** Frontend cần số để tính giỏ hàng, cần chuỗi để hiển thị. Format tiền VN ở backend đảm bảo mọi màn hình hiển thị giống nhau — nếu để mỗi component tự format sẽ có chỗ ra `39000`, chỗ ra `39.000đ`.

```php
// OptionGroupResource
return [
    'id' => $this->id,
    'name' => $this->name,
    'type' => $this->type,                 // single | multi
    'required' => $this->required,
    'min_select' => $this->min_select,
    'max_select' => $this->max_select,
    'options' => OptionResource::collection($this->whenLoaded('options')),
];
```

---

## Bước 2 — `GET /api/menu` (public)

`MenuController@index` — một request duy nhất trả toàn bộ menu lồng nhau. Khách mở app là có ngay, không phải gọi N request.

```php
public function index()
{
    $categories = Category::query()
        ->where('is_active', true)
        ->with(['menuItems' => fn ($q) => $q
            ->orderBy('sort_order')
            ->with('optionGroups.options'),
        ])
        ->orderBy('sort_order')
        ->get();

    return CategoryResource::collection($categories)
        ->additional(['message' => 'OK']);
}
```

> **Chú ý N+1.** Không có `with()` lồng ba tầng ở trên thì 25 món × mỗi món vài nhóm tùy chọn = hàng trăm query. Cài `barryvdh/laravel-debugbar` (dev only) và **quay cảnh số query giảm từ ~120 xuống 4** — demo rất trực quan.

**Cache:** menu thay đổi hiếm nhưng đọc rất nhiều (mỗi khách quét QR đều gọi).

```php
$categories = Cache::remember('menu.public', now()->addMinutes(10), fn () => /* query trên */);
```

Xóa cache khi admin sửa menu — dùng Model Observer:

```bash
docker compose exec app php artisan make:observer MenuCacheObserver
```

Đăng ký observer cho `Category`, `MenuItem`, `ItemOptionGroup`, `ItemOption`; mọi sự kiện `saved`/`deleted` đều gọi `Cache::forget('menu.public')`.

**Lưu ý:** món `is_available = false` **vẫn trả về** (kèm cờ), không lọc bỏ. Khách cần thấy món đó tồn tại nhưng đang hết — vừa đúng UX vừa tránh khách hỏi "sao hôm nay không có Cold Brew".

---

## Bước 3 — Controllers admin

```bash
docker compose exec app php artisan make:controller CategoryController --api
docker compose exec app php artisan make:controller MenuItemController --api
docker compose exec app php artisan make:controller OptionGroupController --api
docker compose exec app php artisan make:controller OptionController --api
```

`MenuItemController` — mẫu cho các controller còn lại:

```php
public function index(Request $request)
{
    $items = MenuItem::query()
        ->when($request->category_id, fn ($q, $id) => $q->where('category_id', $id))
        ->when($request->search, fn ($q, $s) => $q->where('name', 'ilike', "%{$s}%"))
        ->with('category')
        ->orderBy('sort_order')
        ->paginate(20);

    return MenuItemResource::collection($items);
}

public function store(StoreMenuItemRequest $request)
{
    $item = MenuItem::create($request->validated());

    return (new MenuItemResource($item))
        ->additional(['message' => 'Đã thêm món'])
        ->response()->setStatusCode(201);
}

public function updateAvailability(MenuItem $menuItem, Request $request)
{
    $menuItem->update($request->validate(['is_available' => ['required', 'boolean']]));

    return (new MenuItemResource($menuItem))
        ->additional(['message' => $menuItem->is_available ? 'Đã bật lại món' : 'Đã đánh dấu hết hàng']);
}

public function destroy(MenuItem $menuItem)
{
    $menuItem->delete();   // soft delete
    return response()->json(['message' => 'Đã xóa món']);
}
```

> `ilike` là toán tử của Postgres (search không phân biệt hoa thường). Đây là lý do nữa để dev bằng đúng DB của production.

---

## Bước 4 — Form Requests (validation)

```bash
docker compose exec app php artisan make:request StoreMenuItemRequest
docker compose exec app php artisan make:request StoreOptionGroupRequest
```

```php
// StoreMenuItemRequest
public function rules(): array
{
    return [
        'category_id' => ['required', 'exists:categories,id'],
        'name'        => ['required', 'string', 'max:255'],
        'description' => ['nullable', 'string', 'max:1000'],
        'price'       => ['required', 'numeric', 'min:0', 'max:99999999'],
        'is_available'=> ['boolean'],
        'sort_order'  => ['integer', 'min:0'],
    ];
}

public function messages(): array
{
    return [
        'name.required'  => 'Tên món không được để trống',
        'price.required' => 'Vui lòng nhập giá',
        'price.min'      => 'Giá không được âm',
        'category_id.exists' => 'Danh mục không tồn tại',
    ];
}
```

> Viết `messages()` tiếng Việt cho **mọi** request. Frontend hiển thị thẳng thông báo từ backend, không maintain hai bộ message.

`StoreOptionGroupRequest` có validation liên trường đáng chú ý:

```php
public function rules(): array
{
    return [
        'menu_item_id' => ['required', 'exists:menu_items,id'],
        'name'       => ['required', 'string', 'max:100'],
        'type'       => ['required', Rule::enum(OptionGroupType::class)],
        'required'   => ['boolean'],
        'min_select' => ['integer', 'min:0'],
        'max_select' => ['integer', 'min:1', 'gte:min_select'],
    ];
}

public function after(): array
{
    return [function ($validator) {
        if ($this->type === 'single' && $this->max_select > 1) {
            $validator->errors()->add('max_select', 'Nhóm chọn một chỉ được tối đa 1 lựa chọn');
        }
        if ($this->boolean('required') && $this->min_select < 1) {
            $validator->errors()->add('min_select', 'Nhóm bắt buộc phải chọn tối thiểu 1');
        }
    }];
}
```

---

## Bước 5 — Upload ảnh món

MVP dùng disk `public` (local); Phase 9 chuyển sang Cloudflare R2 chỉ bằng đổi config.

```bash
docker compose exec app php artisan storage:link
```

```php
public function uploadImage(MenuItem $menuItem, Request $request)
{
    $request->validate([
        'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
    ], [
        'image.max' => 'Ảnh không được vượt quá 2MB',
    ]);

    // Xóa ảnh cũ để không rác storage
    if ($menuItem->image_url) {
        Storage::disk(config('filesystems.default'))->delete($menuItem->image_path);
    }

    $path = $request->file('image')->store('menu-items', config('filesystems.default'));

    $menuItem->update([
        'image_path' => $path,
        'image_url'  => Storage::disk(config('filesystems.default'))->url($path),
    ]);

    return new MenuItemResource($menuItem);
}
```

> Cần thêm cột `image_path` (migration nhỏ). Lưu **cả path lẫn url**: path để xóa/di chuyển file, url để trả cho frontend. Chỉ lưu url thì sau này đổi CDN là hỏng hết.

---

## Bước 6 — Frontend: API layer & types

`src/types/menu.ts`:

```ts
export interface Option {
  id: number
  name: string
  price_delta: number
  is_available: boolean
}

export interface OptionGroup {
  id: number
  name: string
  type: 'single' | 'multi'
  required: boolean
  min_select: number
  max_select: number
  options: Option[]
}

export interface MenuItem {
  id: number
  category_id: number
  name: string
  description: string | null
  price: number
  price_formatted: string
  image_url: string | null
  is_available: boolean
  sort_order: number
  option_groups?: OptionGroup[]
}

export interface Category {
  id: number
  name: string
  sort_order: number
  is_active: boolean
  menu_items?: MenuItem[]
}
```

`src/api/menu.ts`:

```ts
import { client } from './client'

export const menuApi = {
  publicMenu:  () => client.get('/menu'),

  categories:  () => client.get('/admin/categories'),
  createCategory: (payload: Partial<Category>) => client.post('/admin/categories', payload),
  updateCategory: (id: number, payload: Partial<Category>) => client.put(`/admin/categories/${id}`, payload),
  deleteCategory: (id: number) => client.delete(`/admin/categories/${id}`),

  items: (params?: Record<string, unknown>) => client.get('/admin/menu-items', { params }),
  createItem: (payload: Partial<MenuItem>) => client.post('/admin/menu-items', payload),
  updateItem: (id: number, payload: Partial<MenuItem>) => client.put(`/admin/menu-items/${id}`, payload),
  deleteItem: (id: number) => client.delete(`/admin/menu-items/${id}`),
  toggleAvailability: (id: number, is_available: boolean) =>
    client.patch(`/admin/menu-items/${id}/availability`, { is_available }),
  uploadImage: (id: number, file: File) => {
    const fd = new FormData()
    fd.append('image', file)
    return client.post(`/admin/menu-items/${id}/image`, fd)
  },
}
```

---

## Bước 7 — Màn `MenuManageView.vue`

Bố cục hai cột:

```
┌──────────────┬─────────────────────────────────────────┐
│ DANH MỤC     │  [Tìm món...]          [+ Thêm món]     │
│              │                                          │
│ • Cà phê  (5)│  ┌────┐ Cà phê sữa        29.000đ  [⚫]  │
│ • Trà     (4)│  │ảnh │ Phin đậm pha sữa   ✎  🗑         │
│ • Đá xay  (3)│  └────┘                                  │
│ • Bánh    (3)│  ┌────┐ Cold Brew         45.000đ  [⚪]  │
│              │  │ảnh │ Ủ lạnh 12 tiếng    ✎  🗑         │
│ [+ Danh mục] │  └────┘  ← mờ đi vì đang hết hàng        │
└──────────────┴─────────────────────────────────────────┘
```

Component cần thêm:

```bash
npx shadcn-vue@latest add dialog switch select textarea table alert-dialog tabs skeleton
```

**Các hành vi bắt buộc có:**

1. **Toggle hết hàng ngay tại danh sách** — dùng `Switch`, cập nhật **optimistic** (đổi UI trước, gọi API sau, lỗi thì revert). Đây là thao tác barista dùng nhiều nhất trong ngày, không được bắt mở dialog.
2. **Dialog thêm/sửa món** dùng chung một component, phân biệt bằng prop `item?: MenuItem`.
3. **Xóa** phải qua `AlertDialog` xác nhận, nội dung ghi rõ tên món.
4. **Upload ảnh** có preview trước khi lưu.
5. **Skeleton loading** khi fetch, không để màn trắng.

Ví dụ optimistic toggle:

```ts
async function toggleAvailability(item: MenuItem) {
  const previous = item.is_available
  item.is_available = !previous            // đổi UI ngay
  try {
    await menuApi.toggleAvailability(item.id, item.is_available)
    toast.success(item.is_available ? 'Đã bật lại món' : 'Đã đánh dấu hết hàng')
  } catch {
    item.is_available = previous           // lỗi thì trả về như cũ
    toast.error('Không cập nhật được, thử lại')
  }
}
```

---

## Bước 8 — Quản lý nhóm tùy chọn

Đây là phần UI phức tạp nhất phase — **cấu trúc lồng 2 tầng**: món → nhóm → lựa chọn.

Đặt trong một **tab riêng của dialog sửa món** (`Tabs`: "Thông tin" | "Tùy chọn"), chỉ hiện khi món đã tồn tại (cần `menu_item_id`).

```
Tùy chọn của "Trà sữa trân châu"

┌─────────────────────────────────────────────┐
│ Size                       [Chọn 1] [Bắt buộc] ✎ 🗑 │
│   • S              +0đ                       │
│   • M         +7.000đ                        │
│   • L        +12.000đ                        │
│   [+ Thêm lựa chọn]                          │
├─────────────────────────────────────────────┤
│ Topping              [Chọn nhiều, tối đa 3]  ✎ 🗑 │
│   • Trân châu đen  +8.000đ                   │
│   • Kem cheese    +12.000đ                   │
│   [+ Thêm lựa chọn]                          │
└─────────────────────────────────────────────┘
[+ Thêm nhóm tùy chọn]
```

**Gợi ý giảm việc:** thêm nút **"Sao chép nhóm tùy chọn từ món khác"** — chọn món nguồn, copy toàn bộ nhóm + lựa chọn sang. Quán có 10 loại trà sữa dùng chung nhóm Topping thì tính năng này tiết kiệm rất nhiều thao tác, và là chi tiết cho thấy bạn nghĩ từ góc nhìn người dùng thật.

```php
// POST /api/admin/menu-items/{id}/copy-options   body: { source_item_id }
public function copyOptions(MenuItem $menuItem, Request $request)
{
    $source = MenuItem::with('optionGroups.options')->findOrFail($request->source_item_id);

    DB::transaction(function () use ($menuItem, $source) {
        foreach ($source->optionGroups as $group) {
            $new = $menuItem->optionGroups()->create($group->only([
                'name', 'type', 'required', 'min_select', 'max_select', 'sort_order',
            ]));
            $new->options()->createMany(
                $group->options->map->only(['name', 'price_delta', 'sort_order'])->all()
            );
        }
    });

    return new MenuItemResource($menuItem->load('optionGroups.options'));
}
```

---

## Bước 9 — Test

`tests/Feature/AdminMenuTest.php`:

```php
beforeEach(function () {
    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

it('admin tạo được món mới', function () {
    $cat = Category::factory()->create();

    $this->actingAs($this->admin, 'api')
        ->postJson('/api/admin/menu-items', [
            'category_id' => $cat->id, 'name' => 'Cà phê muối', 'price' => 35000,
        ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Cà phê muối')
        ->assertJsonPath('data.price_formatted', '35.000đ');
});

it('từ chối giá âm', function () {
    $cat = Category::factory()->create();

    $this->actingAs($this->admin, 'api')
        ->postJson('/api/admin/menu-items', ['category_id' => $cat->id, 'name' => 'X', 'price' => -1])
        ->assertStatus(422)
        ->assertJsonValidationErrors('price');
});

it('staff không có quyền sửa menu', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');

    $this->actingAs($staff, 'api')
        ->postJson('/api/admin/menu-items', [])
        ->assertStatus(403);
});

it('menu public trả về đủ cấu trúc lồng và không dính N+1', function () {
    Category::factory()->count(3)->hasMenuItems(5)->create();

    DB::enableQueryLog();
    $this->getJson('/api/menu')->assertOk()
        ->assertJsonStructure(['data' => [['id', 'name', 'menu_items' => [['id', 'price_formatted', 'option_groups']]]]]);
    expect(count(DB::getQueryLog()))->toBeLessThan(6);
});

it('xóa cache menu khi admin sửa món', function () {
    $this->getJson('/api/menu');
    expect(Cache::has('menu.public'))->toBeTrue();

    MenuItem::factory()->create();
    expect(Cache::has('menu.public'))->toBeFalse();
});
```

Test cuối cùng (đếm query < 6) là **cách hay để chứng minh mình quan tâm hiệu năng** — nhớ nhắc trong README.

---

## Definition of Done

- [ ] `GET /api/menu` trả toàn bộ menu lồng nhau trong **< 6 query**
- [ ] Admin thêm/sửa/xóa danh mục và món trên UI, có toast phản hồi
- [ ] Toggle hết hàng chạy optimistic, tắt mạng thì tự revert
- [ ] Upload được ảnh món, có preview, ảnh cũ bị xóa khỏi storage
- [ ] Thêm được nhóm tùy chọn Size (single, bắt buộc) và Topping (multi, max 3)
- [ ] Sao chép nhóm tùy chọn giữa hai món hoạt động
- [ ] Sửa món → cache menu bị xóa → `GET /api/menu` trả dữ liệu mới ngay
- [ ] Toàn bộ test Phase 3 pass, và test 403 từ Phase 2 giờ đã xanh
- [ ] Commit: `feat(menu): admin CRUD menu + tùy chọn + upload ảnh`

---

## Kịch bản quay video — Tập 3: "Quản lý menu"

| Thời lượng | Nội dung |
|---|---|
| 0:00–1:30 | Nhắc vị trí trong roadmap. Hôm nay: màn admin đầu tiên có ích thật |
| 1:30–6:00 | API Resources. Giải thích vì sao trả **cả số lẫn chuỗi đã format** — kèm ví dụ hai màn hình format lệch nhau |
| 6:00–13:00 | `GET /api/menu`. **Điểm nhấn:** bật Debugbar, chạy khi chưa có eager loading → ~120 query. Thêm `with()` lồng → 4 query. Quay rõ con số trên màn hình |
| 13:00–17:00 | Cache + Observer tự xóa cache. Demo: sửa giá món → refresh app khách → thấy giá mới ngay |
| 17:00–22:00 | Controllers + Form Request. Nhấn `messages()` tiếng Việt, giải thích tránh duplicate message hai phía |
| 22:00–27:00 | Upload ảnh. Giải thích vì sao lưu cả `image_path` lẫn `image_url` |
| 27:00–38:00 | Dựng UI: danh sách hai cột, dialog thêm/sửa. Tua nhanh phần lặp |
| 38:00–43:00 | **Optimistic update** cho toggle hết hàng. Mở DevTools **throttle mạng thành offline**, bấm toggle → thấy UI revert + toast lỗi. Cảnh này rất thuyết phục |
| 43:00–52:00 | UI nhóm tùy chọn lồng 2 tầng — phần khó nhất. Rồi demo "sao chép tùy chọn từ món khác" |
| 52:00–56:00 | Chạy test suite, đặc biệt test đếm query |
| 56:00–58:00 | Demo tổng: thêm món mới có ảnh + tùy chọn từ đầu tới cuối. Preview tập sau: sinh QR |

**Lưu ý quay:** tập này dài, cân nhắc **cắt làm 2 phần** (3a: backend API + cache; 3b: giao diện admin). Người xem YouTube khó ngồi hết 1 tiếng.
