# Phase 5 — Khách quét QR & gọi món

> **Mục tiêu:** Toàn bộ luồng khách — quét QR → mở phiên bàn → xem menu → chọn tùy chọn → giỏ hàng → đặt món với **snapshot giá**.
> **Ước lượng:** 8–10h · **Demo cuối phase:** quét QR giấy bằng điện thoại thật → gọi 3 món có topping → đơn nằm trong DB với giá đã snapshot.

> **Phase lớn nhất và quan trọng nhất.** Đây là nơi 2 trong 3 điểm kỹ thuật của dự án (dining session, snapshot giá) được hiện thực hóa. Cân nhắc chia làm 2 tập video.

---

## Bước 1 — `SessionServiceInterface`

`app/Services/Contracts/SessionServiceInterface.php`:

```php
interface SessionServiceInterface
{
    /** Tìm session open của bàn, tạo mới nếu chưa có. Chống race condition. */
    public function openForTable(Table $table): DiningSession;

    public function findByCode(string $code): ?DiningSession;

    /** Tính lại total từ toàn bộ order_items chưa hủy */
    public function recalculateTotal(DiningSession $session): DiningSession;

    public function close(DiningSession $session): DiningSession;
}
```

`app/Services/SessionService.php` — **phần đáng khoe nhất**:

```php
public function openForTable(Table $table): DiningSession
{
    return DB::transaction(function () use ($table) {
        // Khóa hàng bàn: hai khách quét cùng lúc thì người sau chờ người trước xong
        $table = Table::where('id', $table->id)->lockForUpdate()->first();

        $session = DiningSession::where('table_id', $table->id)
            ->where('status', SessionStatus::Open)
            ->first();

        if ($session) {
            return $session;      // đã có phiên → gắn khách vào phiên đó
        }

        $session = DiningSession::create([
            'table_id'  => $table->id,
            'code'      => $this->generateCode(),
            'status'    => SessionStatus::Open,
            'total'     => 0,
            'opened_at' => now(),
        ]);

        $table->update(['status' => TableStatus::Occupied]);

        return $session;
    });
}

private function generateCode(): string
{
    // Bỏ các ký tự dễ nhầm: 0/O, 1/I/L — nhân viên sẽ phải đọc mã này qua điện thoại
    $alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    do {
        $code = collect(range(1, 6))
            ->map(fn () => $alphabet[random_int(0, strlen($alphabet) - 1)])
            ->implode('');
    } while (DiningSession::where('code', $code)->exists());

    return $code;
}
```

> **Ba lớp bảo vệ chống race condition** — nói rõ cả ba trong video:
> 1. `DB::transaction` — nguyên tử
> 2. `lockForUpdate()` — khóa bi quan trên hàng bàn
> 3. **Partial unique index** ở DB (từ Phase 1) — lưới an toàn cuối cùng, kể cả khi code sai
>
> Bài toán rất thật: 4 người ngồi cùng bàn, cùng quét QR trong 2 giây. Không có 3 lớp này thì thành 4 phiên bàn, 4 hóa đơn.

`recalculateTotal`:

```php
public function recalculateTotal(DiningSession $session): DiningSession
{
    $total = $session->orderItems()
        ->where('order_items.status', '!=', OrderItemStatus::Cancelled)
        ->with('options')
        ->get()
        ->sum(fn (OrderItem $i) => (float) $i->line_total);

    $session->update(['total' => $total]);

    return $session->fresh();
}
```

---

## Bước 2 — `OrderServiceInterface` & snapshot giá

```php
interface OrderServiceInterface
{
    public function place(DiningSession $session, array $items, ?string $note = null): Order;
    public function updateItemStatus(OrderItem $item, OrderItemStatus $status): OrderItem;
    public function deriveOrderStatus(Order $order): OrderStatus;
    public function cancelItem(OrderItem $item, string $reason): OrderItem;
}
```

`OrderService::place()` — **trái tim của cả dự án**:

```php
public function place(DiningSession $session, array $items, ?string $note = null): Order
{
    if ($session->status !== SessionStatus::Open) {
        throw new BusinessException('Phiên bàn đã đóng, không thể gọi thêm món');
    }

    return DB::transaction(function () use ($session, $items, $note) {
        $order = $session->orders()->create([
            'status' => OrderStatus::Received,
            'note'   => $note,
        ]);

        foreach ($items as $line) {
            $menuItem = MenuItem::with('optionGroups.options')->findOrFail($line['menu_item_id']);

            // Kiểm tra tại thời điểm đặt — món có thể vừa hết trong lúc khách chọn
            if (! $menuItem->is_available) {
                throw new BusinessException("Món \"{$menuItem->name}\" vừa hết, vui lòng chọn món khác");
            }

            $orderItem = $order->items()->create([
                'menu_item_id'        => $menuItem->id,
                'name_snapshot'       => $menuItem->name,        // ← SNAPSHOT
                'unit_price_snapshot' => $menuItem->price,       // ← SNAPSHOT
                'quantity'            => $line['quantity'],
                'note'                => $line['note'] ?? null,
                'status'              => OrderItemStatus::Pending,
                'status_changed_at'   => now(),
            ]);

            $this->attachOptions($orderItem, $menuItem, $line['options'] ?? []);
        }

        app(SessionServiceInterface::class)->recalculateTotal($session);

        return $order->load('items.options');
    });
}
```

`attachOptions` — validate ràng buộc nhóm tùy chọn **ở backend**, không tin frontend:

```php
private function attachOptions(OrderItem $orderItem, MenuItem $menuItem, array $optionIds): void
{
    $selected = ItemOption::whereIn('id', $optionIds)
        ->whereHas('group', fn ($q) => $q->where('menu_item_id', $menuItem->id))
        ->with('group')
        ->get();

    // Chọn option không thuộc món này → chặn
    if ($selected->count() !== count($optionIds)) {
        throw new BusinessException('Tùy chọn không hợp lệ cho món này');
    }

    foreach ($menuItem->optionGroups as $group) {
        $count = $selected->where('option_group_id', $group->id)->count();

        if ($group->required && $count < max(1, $group->min_select)) {
            throw new BusinessException("Vui lòng chọn \"{$group->name}\" cho món {$menuItem->name}");
        }
        if ($count > $group->max_select) {
            throw new BusinessException("\"{$group->name}\" chỉ được chọn tối đa {$group->max_select}");
        }
    }

    foreach ($selected as $option) {
        $orderItem->options()->create([
            'item_option_id'        => $option->id,
            'name_snapshot'         => $option->name,           // ← SNAPSHOT
            'price_delta_snapshot'  => $option->price_delta,    // ← SNAPSHOT
        ]);
    }
}
```

> **Nguyên tắc vàng — quay cảnh này trong video:** frontend đã validate rồi, nhưng backend **vẫn phải validate lại**. Frontend validate là để UX; backend validate là để đúng. Mở Postman gửi thẳng request bỏ qua UI để chứng minh backend chặn.

`deriveOrderStatus` — theo đúng quy tắc ở [system_overview §5](../system_overview.md):

```php
public function deriveOrderStatus(Order $order): OrderStatus
{
    $statuses = $order->items->pluck('status');

    if ($statuses->every(fn ($s) => $s === OrderItemStatus::Cancelled)) {
        return OrderStatus::Cancelled;
    }

    $active = $statuses->reject(fn ($s) => $s === OrderItemStatus::Cancelled);

    if ($active->every(fn ($s) => $s === OrderItemStatus::Served)) {
        return OrderStatus::Completed;
    }
    if ($active->contains(fn ($s) => in_array($s, [OrderItemStatus::Preparing, OrderItemStatus::Ready]))) {
        return OrderStatus::InProgress;
    }

    return OrderStatus::Received;
}
```

> **Vì sao derive chứ không lưu tay?** Nếu lưu `order.status` thủ công, mỗi lần đổi trạng thái một món phải nhớ cập nhật cả order — quên một chỗ là dữ liệu lệch vĩnh viễn. Derive thì không thể lệch. Đây là câu trả lời phỏng vấn rất tốt: **"single source of truth"**.

Tạo `app/Exceptions/BusinessException.php` render thành 400 kèm message tiếng Việt (khách đọc trực tiếp).

---

## Bước 3 — API public

```
POST   /api/sessions                        body: { qr_token }
GET    /api/sessions/{code}
POST   /api/sessions/{code}/orders          body: { items: [...], note? }
GET    /api/sessions/{code}/orders
```

`SessionController`:

```php
public function store(Request $request)
{
    $data = $request->validate(['qr_token' => ['required', 'string']]);

    $table = Table::where('qr_token', $data['qr_token'])->where('is_active', true)->first();

    if (! $table) {
        return response()->json(['message' => 'Mã QR không hợp lệ hoặc bàn đã ngừng phục vụ'], 404);
    }

    $session = $this->sessions->openForTable($table);

    return (new SessionResource($session->load('table')))
        ->additional(['message' => 'OK']);
}

public function show(string $code)
{
    $session = DiningSession::where('code', $code)
        ->with(['table', 'orders.items.options'])
        ->firstOr(fn () => abort(404, 'Không tìm thấy phiên bàn'));

    return new SessionResource($session);
}
```

**Rate limit cho route public** — không có auth thì phải chặn spam:

```php
Route::middleware('throttle:30,1')->group(function () {
    Route::post('/sessions', [SessionController::class, 'store']);
    Route::post('/sessions/{code}/orders', [OrderController::class, 'store'])
        ->middleware('throttle:10,1');   // đặt món: 10 lần/phút là quá đủ
});
```

`SessionResource` phải đủ để màn theo dõi render mà không gọi thêm API:

```php
return [
    'code' => $this->code,
    'status' => $this->status->value,
    'table_name' => $this->table->name,
    'total' => (float) $this->total,
    'total_formatted' => number_format((float) $this->total, 0, ',', '.').'đ',
    'opened_at' => $this->opened_at->toIso8601String(),
    'orders' => OrderResource::collection($this->whenLoaded('orders')),
];
```

`OrderItemResource`:

```php
return [
    'id' => $this->id,
    'name' => $this->name_snapshot,                 // dùng snapshot, KHÔNG join sang menu_items
    'unit_price' => (float) $this->unit_price_snapshot,
    'quantity' => $this->quantity,
    'note' => $this->note,
    'status' => $this->status->value,
    'status_label' => $this->status->label(),
    'line_total' => (float) $this->line_total,
    'line_total_formatted' => number_format((float) $this->line_total, 0, ',', '.').'đ',
    'options' => $this->options->map(fn ($o) => [
        'name' => $o->name_snapshot,
        'price_delta' => (float) $o->price_delta_snapshot,
    ]),
];
```

---

## Bước 4 — Frontend: sessionStore

`src/stores/session.ts`:

```ts
export const useSessionStore = defineStore('session', () => {
  const session = ref<Session | null>(null)
  const loading = ref(false)

  async function openFromQr(qrToken: string) {
    loading.value = true
    try {
      const { data } = await client.post('/sessions', { qr_token: qrToken })
      session.value = data.data
      localStorage.setItem('cc_session_code', data.data.code)
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    if (!session.value) return
    const { data } = await client.get(`/sessions/${session.value.code}`)
    session.value = data.data
  }

  return { session, loading, openFromQr, refresh }
})
```

---

## Bước 5 — cartStore (persist theo session code)

Điểm tinh tế: giỏ hàng lưu localStorage **theo `code` của phiên**. Bàn đóng phiên, phiên mới có code khác → giỏ cũ tự động không áp dụng.

`src/stores/cart.ts`:

```ts
export interface CartLine {
  uid: string                    // id cục bộ, vì cùng 1 món có thể có 2 dòng khác tùy chọn
  menu_item_id: number
  name: string
  unit_price: number
  quantity: number
  note: string
  options: { id: number; name: string; price_delta: number }[]
}

export const useCartStore = defineStore('cart', () => {
  const sessionCode = ref<string | null>(null)
  const lines = ref<CartLine[]>([])

  const storageKey = computed(() => `cc_cart_${sessionCode.value}`)

  const totalQuantity = computed(() => lines.value.reduce((s, l) => s + l.quantity, 0))
  const subtotal = computed(() =>
    lines.value.reduce((sum, l) => {
      const delta = l.options.reduce((d, o) => d + o.price_delta, 0)
      return sum + (l.unit_price + delta) * l.quantity
    }, 0),
  )

  /** Hai dòng gộp được khi cùng món, cùng tùy chọn, cùng ghi chú */
  function signature(line: Omit<CartLine, 'uid' | 'quantity'>) {
    const ids = line.options.map((o) => o.id).sort().join(',')
    return `${line.menu_item_id}|${ids}|${line.note.trim()}`
  }

  function add(line: Omit<CartLine, 'uid'>) {
    const sig = signature(line)
    const existing = lines.value.find((l) => signature(l) === sig)
    if (existing) {
      existing.quantity += line.quantity
    } else {
      lines.value.push({ ...line, uid: crypto.randomUUID() })
    }
    persist()
  }

  function setQuantity(uid: string, qty: number) {
    const line = lines.value.find((l) => l.uid === uid)
    if (!line) return
    qty <= 0 ? remove(uid) : ((line.quantity = qty), persist())
  }

  function remove(uid: string) {
    lines.value = lines.value.filter((l) => l.uid !== uid)
    persist()
  }

  function clear() {
    lines.value = []
    localStorage.removeItem(storageKey.value)
  }

  function bind(code: string) {
    sessionCode.value = code
    lines.value = JSON.parse(localStorage.getItem(`cc_cart_${code}`) ?? '[]')
  }

  function persist() {
    localStorage.setItem(storageKey.value, JSON.stringify(lines.value))
  }

  /** Payload gửi lên API */
  function toPayload() {
    return lines.value.map((l) => ({
      menu_item_id: l.menu_item_id,
      quantity: l.quantity,
      note: l.note || null,
      options: l.options.map((o) => o.id),
    }))
  }

  return { lines, subtotal, totalQuantity, add, setQuantity, remove, clear, bind, toPayload }
})
```

> **Logic gộp dòng bằng `signature`** đáng nói trong video: "Cà phê size L ít đường" và "Cà phê size L nhiều đường" là **hai dòng riêng**, nhưng thêm "Cà phê size L ít đường" lần thứ hai thì phải **cộng số lượng**, không tạo dòng mới. Nhiều app làm sai chỗ này.

---

## Bước 6 — CustomerLayout & luồng vào app

`src/layouts/CustomerLayout.vue`:

```
┌────────────────────────────┐
│ ☕ Bàn 5        Phiên A7K2QX│  ← header dính trên
├────────────────────────────┤
│                            │
│      <RouterView />        │
│                            │
├────────────────────────────┤
│ 🛒 3 món · 127.000đ  [Xem] │  ← thanh giỏ nổi dưới, ẩn khi giỏ rỗng
└────────────────────────────┘
```

Logic vào app trong `onMounted` của layout:

```ts
const route = useRoute()
const sessionStore = useSessionStore()
const cart = useCartStore()
const menu = useMenuStore()

onMounted(async () => {
  try {
    await sessionStore.openFromQr(route.params.qrToken as string)
    cart.bind(sessionStore.session!.code)
    await menu.load()
  } catch (e) {
    error.value = 'Mã QR không hợp lệ. Vui lòng gọi nhân viên hỗ trợ.'
  }
})
```

**Mobile-first bắt buộc:**
- Vùng chạm tối thiểu 44×44px
- `padding-bottom: env(safe-area-inset-bottom)` cho thanh giỏ (iPhone có notch dưới)
- Font tối thiểu 16px cho input — nhỏ hơn Safari sẽ tự zoom khi focus, rất khó chịu
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`

---

## Bước 7 — `MenuView.vue`

```
┌────────────────────────────┐
│ 🔍 Tìm món...              │
├────────────────────────────┤
│ [Cà phê][Trà][Đá xay][Bánh]│ ← tab dính, cuộn ngang
├────────────────────────────┤
│ ┌──┐ Cà phê sữa            │
│ │▨ │ Phin đậm pha sữa đặc  │
│ └──┘ 29.000đ          [+]  │
│ ┌──┐ Cold Brew             │
│ │▨ │ Ủ lạnh 12 tiếng       │
│ └──┘ 45.000đ    [Hết hàng] │ ← ảnh xám, nút mờ, không bấm được
└────────────────────────────┘
```

Chi tiết cần có:
- **Tab danh mục dính** khi cuộn; bấm tab thì cuộn mượt tới section tương ứng
- **Lazy load ảnh** (`loading="lazy"`) + placeholder mờ trong lúc tải
- Món hết hàng: `grayscale` ảnh, badge "Hết hàng", `pointer-events: none`
- Ô tìm kiếm lọc client-side (menu đã có sẵn trong store, không cần gọi API)

---

## Bước 8 — `ItemDetailSheet.vue` — chọn tùy chọn

Bottom sheet trượt lên (dùng `Drawer` của shadcn-vue) — trên mobile luôn tốt hơn dialog giữa màn hình.

```
┌────────────────────────────┐
│        [ảnh món lớn]       │
│ Trà sữa trân châu  42.000đ │
│ Trà ô long, trân châu...   │
├────────────────────────────┤
│ Size *              chọn 1 │
│ ○ S  +0đ                   │
│ ● M  +7.000đ               │
│ ○ L  +12.000đ              │
├────────────────────────────┤
│ Mức đường *         chọn 1 │
│ ○ 0%  ● 50%  ○ 100%        │
├────────────────────────────┤
│ Topping        tối đa 3    │
│ ☑ Trân châu đen  +8.000đ   │
│ ☐ Kem cheese    +12.000đ   │
├────────────────────────────┤
│ Ghi chú: [ít đá giúp em  ] │
├────────────────────────────┤
│  [−] 2 [+]   Thêm 106.000đ │ ← giá cập nhật theo thời gian thực
└────────────────────────────┘
```

Logic quan trọng:

```ts
const selected = ref<Record<number, number[]>>({})   // groupId -> optionIds

// Nhóm bắt buộc: chọn sẵn option đầu tiên để khách không phải thao tác thừa
onMounted(() => {
  item.option_groups?.forEach((g) => {
    selected.value[g.id] = g.required && g.options.length ? [g.options[0].id] : []
  })
})

function toggle(group: OptionGroup, optionId: number) {
  const current = selected.value[group.id]
  if (group.type === 'single') {
    selected.value[group.id] = [optionId]
    return
  }
  if (current.includes(optionId)) {
    selected.value[group.id] = current.filter((id) => id !== optionId)
  } else if (current.length < group.max_select) {
    selected.value[group.id] = [...current, optionId]
  } else {
    toast.warning(`${group.name} chỉ chọn tối đa ${group.max_select}`)
  }
}

const canAdd = computed(() =>
  (item.option_groups ?? []).every((g) =>
    !g.required || selected.value[g.id]?.length >= Math.max(1, g.min_select),
  ),
)

const livePrice = computed(() => {
  const delta = allSelectedOptions.value.reduce((s, o) => s + o.price_delta, 0)
  return (item.price + delta) * quantity.value
})
```

> **Chốt nhóm bắt buộc theo mặc định** là chi tiết UX nhỏ tạo khác biệt lớn: khách chỉ cần bấm "Thêm" là xong với món đơn giản, thay vì phải chọn Size + Đường + Đá mỗi lần.

---

## Bước 9 — `CartView.vue` & đặt món

```
┌────────────────────────────┐
│ ← Giỏ hàng                 │
├────────────────────────────┤
│ Trà sữa trân châu     84k  │
│ Size M · 50% đường ·       │
│ Trân châu đen              │
│ "ít đá giúp em"            │
│ [−] 2 [+]              🗑  │
├────────────────────────────┤
│ Cà phê sữa            29k  │
│ Size S · Nóng              │
│ [−] 1 [+]              🗑  │
├────────────────────────────┤
│ Tạm tính          113.000đ │
│ Đã gọi trước đó    45.000đ │  ← nếu session đã có order
│ Tổng cộng         158.000đ │
├────────────────────────────┤
│ Ghi chú cho quán: [      ] │
│       [ GỌI MÓN ]          │
└────────────────────────────┘
```

Xử lý đặt món:

```ts
async function placeOrder() {
  if (submitting.value) return          // chặn double-tap
  submitting.value = true
  try {
    await client.post(`/sessions/${session.code}/orders`, {
      items: cart.toPayload(),
      note: orderNote.value || null,
    })
    cart.clear()
    toast.success('Đã gửi đơn tới quầy pha chế!')
    router.push({ name: 'order-status', params: { code: session.code } })
  } catch (e: any) {
    // Backend trả 400 kèm message tiếng Việt: "Món X vừa hết..."
    toast.error(e.response?.data?.message ?? 'Không gửi được đơn, thử lại')
    await menu.load()                   // reload menu để cập nhật món hết hàng
  } finally {
    submitting.value = false
  }
}
```

---

## Bước 10 — `OrderStatusView.vue` (polling)

Real-time thật sẽ làm ở Phase 7; ở đây dùng polling 4 giây — **luồng chạy được trước, tối ưu sau**.

```ts
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  sessionStore.refresh()
  timer = setInterval(() => {
    // Không poll khi tab ẩn — tiết kiệm pin điện thoại khách
    if (document.visibilityState === 'visible') sessionStore.refresh()
  }, 4000)
})

onUnmounted(() => timer && clearInterval(timer))
```

Giao diện: timeline theo từng đợt gọi món, mỗi món có badge trạng thái màu:

| Trạng thái | Màu | Nhãn |
|---|---|---|
| pending | xám | Đã nhận |
| preparing | vàng | Đang pha chế |
| ready | xanh dương | Sẵn sàng |
| served | xanh lá | Đã phục vụ |
| cancelled | đỏ | Đã hủy |

Cộng thêm: nút **"Gọi thêm món"** quay lại menu, và hiển thị tổng tiền phiên hiện tại.

---

## Bước 11 — Test

`tests/Feature/PlaceOrderTest.php`:

```php
it('snapshot giá tại thời điểm đặt, không đổi khi menu đổi giá', function () {
    $item = MenuItem::factory()->create(['name' => 'Cà phê sữa', 'price' => 29000]);
    $session = DiningSession::factory()->create();

    $this->postJson("/api/sessions/{$session->code}/orders", [
        'items' => [['menu_item_id' => $item->id, 'quantity' => 2]],
    ])->assertCreated();

    // Admin tăng giá và đổi tên món
    $item->update(['price' => 35000, 'name' => 'Cà phê sữa đá']);

    $orderItem = OrderItem::first();
    expect((float) $orderItem->unit_price_snapshot)->toBe(29000.0)
        ->and($orderItem->name_snapshot)->toBe('Cà phê sữa')
        ->and((float) $session->fresh()->total)->toBe(58000.0);
});

it('cùng bàn quét QR nhiều lần chỉ tạo một session', function () {
    $table = Table::factory()->create();

    $a = $this->postJson('/api/sessions', ['qr_token' => $table->qr_token])->json('data.code');
    $b = $this->postJson('/api/sessions', ['qr_token' => $table->qr_token])->json('data.code');

    expect($a)->toBe($b);
    expect(DiningSession::where('table_id', $table->id)->count())->toBe(1);
});

it('gọi thêm nhiều lần đều gộp vào một session', function () {
    $session = DiningSession::factory()->create();
    $item = MenuItem::factory()->create(['price' => 30000]);

    foreach (range(1, 3) as $_) {
        $this->postJson("/api/sessions/{$session->code}/orders", [
            'items' => [['menu_item_id' => $item->id, 'quantity' => 1]],
        ])->assertCreated();
    }

    expect($session->orders()->count())->toBe(3)
        ->and((float) $session->fresh()->total)->toBe(90000.0);
});

it('từ chối khi thiếu nhóm tùy chọn bắt buộc', function () {
    $item = MenuItem::factory()->create();
    $group = ItemOptionGroup::factory()->for($item)->create([
        'name' => 'Size', 'required' => true, 'type' => 'single', 'min_select' => 1, 'max_select' => 1,
    ]);
    ItemOption::factory()->for($group, 'group')->create();
    $session = DiningSession::factory()->create();

    $this->postJson("/api/sessions/{$session->code}/orders", [
        'items' => [['menu_item_id' => $item->id, 'quantity' => 1, 'options' => []]],
    ])->assertStatus(400)
      ->assertJsonPath('message', 'Vui lòng chọn "Size" cho món '.$item->name);
});

it('từ chối option của món khác', function () {
    $itemA = MenuItem::factory()->create();
    $itemB = MenuItem::factory()->create();
    $groupB = ItemOptionGroup::factory()->for($itemB)->create();
    $optionB = ItemOption::factory()->for($groupB, 'group')->create();
    $session = DiningSession::factory()->create();

    $this->postJson("/api/sessions/{$session->code}/orders", [
        'items' => [['menu_item_id' => $itemA->id, 'quantity' => 1, 'options' => [$optionB->id]]],
    ])->assertStatus(400);
});

it('từ chối đặt món đã hết hàng', function () {
    $item = MenuItem::factory()->unavailable()->create();
    $session = DiningSession::factory()->create();

    $this->postJson("/api/sessions/{$session->code}/orders", [
        'items' => [['menu_item_id' => $item->id, 'quantity' => 1]],
    ])->assertStatus(400);
});

it('không cho gọi món khi phiên đã đóng', function () {
    $session = DiningSession::factory()->create(['status' => 'closed']);
    $item = MenuItem::factory()->create();

    $this->postJson("/api/sessions/{$session->code}/orders", [
        'items' => [['menu_item_id' => $item->id, 'quantity' => 1]],
    ])->assertStatus(400);
});
```

`tests/Unit/DeriveOrderStatusTest.php` — bảng test cho state machine:

```php
dataset('statuses', [
    'tất cả served → completed'     => [['served', 'served'], OrderStatus::Completed],
    'có preparing → in_progress'    => [['pending', 'preparing'], OrderStatus::InProgress],
    'có ready → in_progress'        => [['pending', 'ready'], OrderStatus::InProgress],
    'tất cả pending → received'     => [['pending', 'pending'], OrderStatus::Received],
    'tất cả cancelled → cancelled'  => [['cancelled', 'cancelled'], OrderStatus::Cancelled],
    'bỏ qua cancelled khi derive'   => [['served', 'cancelled'], OrderStatus::Completed],
]);

it('derive đúng trạng thái order', function (array $itemStatuses, OrderStatus $expected) {
    $order = Order::factory()->create();
    foreach ($itemStatuses as $s) {
        OrderItem::factory()->for($order)->create(['status' => $s]);
    }
    expect(app(OrderServiceInterface::class)->deriveOrderStatus($order->load('items')))
        ->toBe($expected);
})->with('statuses');
```

---

## Definition of Done

- [ ] Quét QR bằng **điện thoại thật** → mở app, hiện đúng tên bàn
- [ ] 2 điện thoại cùng quét 1 bàn → **cùng một mã phiên**
- [ ] Chọn món có nhóm bắt buộc → nhóm đầu tự chọn sẵn, giá cập nhật realtime khi đổi tùy chọn
- [ ] Thêm cùng món + cùng tùy chọn 2 lần → gộp thành 1 dòng số lượng 2
- [ ] Thêm cùng món khác tùy chọn → 2 dòng riêng
- [ ] F5 giữa chừng → giỏ hàng còn nguyên
- [ ] Đặt món → DB có `order_items` với `name_snapshot`, `unit_price_snapshot`
- [ ] **Đổi giá món trên admin → hóa đơn cũ giữ nguyên giá** (demo tay, không chỉ test)
- [ ] Gọi thêm lần 2, lần 3 → cùng session, total cộng dồn
- [ ] Postman gửi request bỏ qua validation frontend → backend vẫn chặn
- [ ] Toàn bộ test pass
- [ ] Commit: `feat(order): luồng khách gọi món + dining session + snapshot giá`

---

## Kịch bản quay video — Tập 5 (nên chia 2 phần)

### Tập 5a — "Dining session & snapshot giá" (backend)

| Thời lượng | Nội dung |
|---|---|
| 0:00–3:00 | **Đặt vấn đề trước khi code.** Vẽ 2 tình huống: (1) 4 người cùng bàn cùng quét QR → nếu sai thì 4 hóa đơn; (2) khách gọi lúc 19h giá 29k, quán tăng giá 20h, tính tiền 21h → tính giá nào? Đây là hai vấn đề tập này giải quyết |
| 3:00–12:00 | `SessionService::openForTable`. **Điểm nhấn số 1:** giải thích 3 lớp chống race condition. Demo bằng cách chạy 2 request song song (dùng `xargs -P` hoặc script) → chỉ 1 session được tạo |
| 12:00–16:00 | `generateCode` — bỏ ký tự dễ nhầm 0/O/1/I/L. Chi tiết nhỏ nhưng cho thấy nghĩ tới người dùng thật đọc mã qua điện thoại |
| 16:00–26:00 | `OrderService::place`. **Điểm nhấn số 2 — snapshot giá.** Gõ chậm 2 dòng `name_snapshot`/`unit_price_snapshot`, dừng lại giải thích kỹ. Đây là đoạn nên cắt riêng làm Short/Reel |
| 26:00–32:00 | Validate tùy chọn ở backend. **Mở Postman gửi option của món khác** → backend chặn. Nhấn: "frontend validate cho đẹp, backend validate cho đúng" |
| 32:00–37:00 | `deriveOrderStatus`. Giải thích vì sao derive thay vì lưu tay — single source of truth |
| 37:00–43:00 | Chạy test suite. **Đặc biệt quay test snapshot:** đổi giá món xong assert hóa đơn cũ không đổi. Test này là bằng chứng trực quan nhất |

### Tập 5b — "Giao diện khách" (frontend)

| Thời lượng | Nội dung |
|---|---|
| 0:00–2:00 | Nhắc lại API đã có, hôm nay dựng UI mobile |
| 2:00–8:00 | `cartStore`. **Điểm nhấn:** hàm `signature` gộp dòng. Demo: thêm "Trà sữa size L ít đường" 2 lần → gộp; thêm "size L nhiều đường" → dòng mới |
| 8:00–13:00 | Persist giỏ theo `code` phiên. Demo F5 giữa chừng không mất giỏ |
| 13:00–22:00 | MenuView mobile-first. Nói về vùng chạm 44px, font 16px chống Safari auto-zoom, `safe-area-inset` cho iPhone |
| 22:00–33:00 | ItemDetailSheet — bottom sheet, giá cập nhật realtime, tự chọn sẵn nhóm bắt buộc |
| 33:00–40:00 | CartView + đặt món. Xử lý lỗi "món vừa hết" — **demo bằng cách tắt món trên tab admin rồi bấm đặt trên điện thoại** |
| 40:00–45:00 | OrderStatusView với polling. Nói rõ: "đây là bản tạm, tuần sau thay bằng WebSocket". Chỉ ra tối ưu nhỏ: không poll khi tab ẩn |
| 45:00–52:00 | **Demo cuối — quay bằng camera phụ:** cầm điện thoại thật, quét QR giấy in từ tập trước, chọn trà sữa full topping, đặt món. Rồi chuyển sang màn hình laptop mở TablePlus, chỉ vào dòng `order_items` với `unit_price_snapshot` |
| 52:00–54:00 | Chốt: "Đơn đã vào hệ thống, nhưng barista chưa thấy gì cả. Tập sau: màn hình quầy pha chế." |
