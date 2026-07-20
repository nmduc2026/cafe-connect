# Phase 6 — KDS (màn quầy pha chế) + state machine

> **Mục tiêu:** Barista thấy ticket theo dạng kanban, đổi trạng thái từng món hoặc cả ticket; trạng thái đẩy ngược về khách.
> **Ước lượng:** 5–6h · **Demo cuối phase:** đặt món trên điện thoại → ~3s sau ticket hiện ở màn bếp → bấm "Đang làm" → ~4s sau khách thấy đổi.

> Vẫn dùng **polling**. Phase 7 mới thay bằng WebSocket. Cứ để độ trễ 3–4s trong tập này — nó tạo ra "trước/sau" rất rõ để tập 7 gây ấn tượng.

---

## Bước 1 — Quy tắc chuyển trạng thái

Trước khi code, chốt **máy trạng thái hợp lệ** (đây là logic nghiệp vụ, không phải chi tiết kỹ thuật):

```
pending ──▶ preparing ──▶ ready ──▶ served
   │            │           │
   └────────────┴───────────┴──▶ cancelled

served ──▶ (không đi đâu được nữa — trạng thái cuối)
```

Không cho phép: `served → preparing` (đã bưng ra rồi thì không "làm lại"), `cancelled → *`.
Cho phép **lùi một bậc** trong 60 giây (barista bấm nhầm) — chi tiết này rất "đời".

`app/Enums/OrderItemStatus.php`:

```php
public function canTransitionTo(self $target): bool
{
    return in_array($target, $this->allowedNext(), true);
}

public function allowedNext(): array
{
    return match ($this) {
        self::Pending   => [self::Preparing, self::Cancelled],
        self::Preparing => [self::Ready, self::Cancelled, self::Pending],
        self::Ready     => [self::Served, self::Cancelled, self::Preparing],
        self::Served, self::Cancelled => [],
    };
}

public function isFinal(): bool
{
    return in_array($this, [self::Served, self::Cancelled], true);
}

public function color(): string
{
    return match ($this) {
        self::Pending   => 'gray',
        self::Preparing => 'amber',
        self::Ready     => 'blue',
        self::Served    => 'green',
        self::Cancelled => 'red',
    };
}
```

`OrderService::updateItemStatus`:

```php
public function updateItemStatus(OrderItem $item, OrderItemStatus $status): OrderItem
{
    if (! $item->status->canTransitionTo($status)) {
        throw new BusinessException(
            "Không thể chuyển từ \"{$item->status->label()}\" sang \"{$status->label()}\""
        );
    }

    return DB::transaction(function () use ($item, $status) {
        $item->update(['status' => $status, 'status_changed_at' => now()]);

        // Cập nhật lại trạng thái order cha từ các món con
        $order = $item->order->load('items');
        $order->update(['status' => $this->deriveOrderStatus($order)]);

        // Hủy món thì phải tính lại tiền phiên
        if ($status === OrderItemStatus::Cancelled) {
            app(SessionServiceInterface::class)->recalculateTotal($order->diningSession);
        }

        // Phase 7 sẽ thêm: broadcast(new OrderItemStatusUpdated($item));

        return $item->fresh(['options', 'order']);
    });
}
```

---

## Bước 2 — API Kitchen

```
GET    /api/kitchen/tickets                     # món chưa served, gom theo bàn
PATCH  /api/kitchen/order-items/{id}/status     body: { status }
PATCH  /api/kitchen/orders/{id}/status          body: { status }   # đổi cả ticket
```

Bọc `middleware(['auth:api', 'can:order.update'])`.

`TicketController@index`:

```php
public function index()
{
    $orders = Order::query()
        ->whereHas('items', fn ($q) => $q->whereNotIn('status', ['served', 'cancelled']))
        ->whereHas('diningSession', fn ($q) => $q->where('status', 'open'))
        ->with([
            'diningSession.table',
            'items' => fn ($q) => $q->whereNotIn('status', ['served', 'cancelled'])
                                    ->with('options'),
        ])
        ->orderBy('created_at')          // đơn cũ nhất lên trước — FIFO, công bằng với khách
        ->get();

    return TicketResource::collection($orders)->additional(['message' => 'OK']);
}
```

`TicketResource` — chứa sẵn mọi thứ barista cần nhìn:

```php
return [
    'order_id'     => $this->id,
    'session_code' => $this->diningSession->code,
    'table_name'   => $this->diningSession->table->name,
    'note'         => $this->note,
    'created_at'   => $this->created_at->toIso8601String(),
    'waiting_minutes' => (int) $this->created_at->diffInMinutes(now()),
    'urgency'      => $this->urgencyLevel(),        // normal | warning | critical
    'status'       => $this->status->value,
    'items'        => OrderItemResource::collection($this->items),
];
```

Thêm vào `Order` model:

```php
public function urgencyLevel(): string
{
    $minutes = $this->created_at->diffInMinutes(now());

    return match (true) {
        $minutes >= 15 => 'critical',
        $minutes >= 8  => 'warning',
        default        => 'normal',
    };
}
```

> **Ngưỡng 8/15 phút** lấy từ thực tế pha chế: một ly cà phê phin ~5 phút, trà sữa ~3 phút. Quá 8 phút là có gì đó kẹt, quá 15 phút là khách sắp phàn nàn. Con số cụ thể có căn cứ luôn tốt hơn con số tùy tiện — nói điều này trong video.

`updateStatus` cho cả ticket:

```php
public function updateOrderStatus(Order $order, Request $request)
{
    $status = OrderItemStatus::from($request->validate([
        'status' => ['required', Rule::enum(OrderItemStatus::class)],
    ])['status']);

    DB::transaction(function () use ($order, $status) {
        foreach ($order->items as $item) {
            // Bỏ qua món không chuyển được thay vì làm hỏng cả lô
            if ($item->status->canTransitionTo($status)) {
                $this->orders->updateItemStatus($item, $status);
            }
        }
    });

    return new TicketResource($order->fresh(['items.options', 'diningSession.table']));
}
```

---

## Bước 3 — Layout KDS

Màn KDS chạy trên **tablet/màn hình lớn treo ở quầy**, barista nhìn từ 1–2 mét, tay có thể ướt. Thiết kế phải:

- **Chữ to** — tên món ≥ 20px, số bàn ≥ 28px
- **Nút to** — tối thiểu 56px chiều cao
- **Tương phản cao** — nền tối, chữ sáng (quầy cafe thường thiếu sáng)
- **Không có thao tác nhỏ/phức tạp** — không drag-drop tinh vi, không dropdown nhiều tầng
- **Không cuộn ngang** — mọi thứ vừa một màn hình

```
┌───────────────────────────────────────────────────────────────┐
│ ☕ QUẦY PHA CHẾ          🔔  Đang chờ: 5 món      14:32       │
├───────────────┬───────────────────┬───────────────────────────┤
│  MỚI (2)      │  ĐANG LÀM (2)     │  SẴN SÀNG (1)             │
├───────────────┼───────────────────┼───────────────────────────┤
│┌─────────────┐│┌─────────────────┐│┌─────────────────────────┐│
││ BÀN 5   2ph │││ BÀN 3      6ph  │││ BÀN 1            9ph ⚠  ││
││─────────────│││─────────────────│││─────────────────────────││
││ 2× Trà sữa  │││ 1× Cold Brew    │││ 1× Cà phê sữa           ││
││ Size L,50%  │││ Size M          │││ Nóng, Size S            ││
││ +Trân châu  │││ "đậm giúp em"   │││                         ││
││ "ít đá"     │││                 │││                         ││
││─────────────│││─────────────────│││─────────────────────────││
││[ BẮT ĐẦU ]  │││[   XONG   ]     │││[   ĐÃ PHỤC VỤ   ]       ││
│└─────────────┘│└─────────────────┘│└─────────────────────────┘│
└───────────────┴───────────────────┴───────────────────────────┘
```

Mapping cột ↔ trạng thái:

| Cột | Chứa món có status | Nút hành động | Chuyển sang |
|---|---|---|---|
| MỚI | `pending` | "BẮT ĐẦU" | `preparing` |
| ĐANG LÀM | `preparing` | "XONG" | `ready` |
| SẴN SÀNG | `ready` | "ĐÃ PHỤC VỤ" | `served` (biến khỏi màn) |

> **Vì sao 3 cột chứ không phải drag-drop kanban?** Barista đang cầm ca sữa, tay ướt — không ai drag-drop được. Một nút to, một hành động rõ ràng. **Ràng buộc từ môi trường sử dụng quyết định thiết kế** — đây là điểm nói rất tốt trong video và trong phỏng vấn.

Màu viền ticket theo `urgency`: normal = xám, warning = vàng, critical = đỏ + nhấp nháy nhẹ.

---

## Bước 4 — `KdsBoard.vue`

```ts
const tickets = ref<Ticket[]>([])
let timer: ReturnType<typeof setInterval> | null = null

const byStatus = (status: string) =>
  tickets.value
    .map((t) => ({ ...t, items: t.items.filter((i) => i.status === status) }))
    .filter((t) => t.items.length > 0)

async function fetchTickets() {
  const { data } = await client.get('/kitchen/tickets')
  tickets.value = data.data
}

async function advance(item: OrderItem, next: string) {
  const previous = item.status
  item.status = next                         // optimistic
  try {
    await client.patch(`/kitchen/order-items/${item.id}/status`, { status: next })
    await fetchTickets()
  } catch (e: any) {
    item.status = previous
    toast.error(e.response?.data?.message ?? 'Không cập nhật được')
  }
}

onMounted(() => {
  fetchTickets()
  timer = setInterval(fetchTickets, 3000)
})
onUnmounted(() => timer && clearInterval(timer))
```

**Đồng hồ chờ phải chạy client-side**, không chờ poll:

```ts
// composables/useElapsed.ts
export function useElapsed(createdAt: string) {
  const minutes = ref(0)
  const tick = () => {
    minutes.value = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  }
  let id: number
  onMounted(() => { tick(); id = window.setInterval(tick, 10_000) })
  onUnmounted(() => clearInterval(id))
  return minutes
}
```

Nếu chỉ dựa vào `waiting_minutes` từ API thì số phút đứng im giữa hai lần poll — nhìn như app bị treo.

---

## Bước 5 — Phát hiện ticket mới (chuẩn bị cho âm thanh ở Phase 7)

```ts
const knownOrderIds = ref(new Set<number>())
const isFirstLoad = ref(true)

watch(tickets, (list) => {
  const incoming = list.filter((t) => !knownOrderIds.value.has(t.order_id))

  if (!isFirstLoad.value && incoming.length > 0) {
    onNewTicket(incoming)      // Phase 7: phát âm thanh + hiệu ứng
  }

  list.forEach((t) => knownOrderIds.value.add(t.order_id))
  isFirstLoad.value = false
})
```

> `isFirstLoad` rất quan trọng: không có nó thì mở màn KDS lần đầu sẽ báo "có 8 đơn mới" dù chúng đã ở đó từ lâu.

Ở phase này `onNewTicket` chỉ làm hiệu ứng highlight viền ticket 3 giây. Âm thanh để Phase 7.

---

## Bước 6 — Màn admin `OrdersLiveView.vue`

Cùng dữ liệu nhưng góc nhìn quản lý — **theo bàn**, không theo món:

```
┌──────────────────────────────────────────────────────────┐
│ Đơn hàng đang mở                    [Tất cả][Live][Lịch sử]│
├──────────────────────────────────────────────────────────┤
│ Bàn 5 · A7K2QX · 12 phút                       158.000đ  │
│   2× Trà sữa trân châu  [Đang làm]                       │
│   1× Cà phê sữa         [Sẵn sàng]                       │
│                              [Xem chi tiết] [Đóng bàn]   │
├──────────────────────────────────────────────────────────┤
│ Bàn 3 · B4M9PX · 34 phút                        87.000đ  │
│   ...                                                     │
└──────────────────────────────────────────────────────────┘
```

Nút "Đóng bàn" sẽ nối vào API thanh toán ở Phase 8 — hiện tại để `disabled` với tooltip "Sẽ có ở phần thanh toán".

Tab "Lịch sử": `GET /api/admin/orders?status=closed&from=&to=` có phân trang.

---

## Bước 7 — Test

```php
it('cho phép chuyển pending → preparing', function () {
    $item = OrderItem::factory()->create(['status' => 'pending']);

    $this->actingAs($this->staff, 'api')
        ->patchJson("/api/kitchen/order-items/{$item->id}/status", ['status' => 'preparing'])
        ->assertOk()
        ->assertJsonPath('data.status', 'preparing');
});

it('chặn chuyển served → preparing', function () {
    $item = OrderItem::factory()->create(['status' => 'served']);

    $this->actingAs($this->staff, 'api')
        ->patchJson("/api/kitchen/order-items/{$item->id}/status", ['status' => 'preparing'])
        ->assertStatus(400);
});

it('cập nhật trạng thái món thì order cha tự derive theo', function () {
    $order = Order::factory()->create(['status' => 'received']);
    $a = OrderItem::factory()->for($order)->create(['status' => 'pending']);
    OrderItem::factory()->for($order)->create(['status' => 'pending']);

    $this->actingAs($this->staff, 'api')
        ->patchJson("/api/kitchen/order-items/{$a->id}/status", ['status' => 'preparing']);

    expect($order->fresh()->status)->toBe(OrderStatus::InProgress);
});

it('hủy món thì trừ khỏi tổng tiền phiên', function () {
    $session = DiningSession::factory()->create();
    $order = Order::factory()->for($session, 'diningSession')->create();
    $a = OrderItem::factory()->for($order)->create(['unit_price_snapshot' => 30000, 'quantity' => 1]);
    OrderItem::factory()->for($order)->create(['unit_price_snapshot' => 50000, 'quantity' => 1]);
    app(SessionServiceInterface::class)->recalculateTotal($session);
    expect((float) $session->fresh()->total)->toBe(80000.0);

    $this->actingAs($this->staff, 'api')
        ->patchJson("/api/kitchen/order-items/{$a->id}/status", ['status' => 'cancelled']);

    expect((float) $session->fresh()->total)->toBe(50000.0);
});

it('ticket không hiện món đã served', function () {
    $order = Order::factory()->create();
    OrderItem::factory()->for($order)->create(['status' => 'served']);
    OrderItem::factory()->for($order)->create(['status' => 'pending']);

    $this->actingAs($this->staff, 'api')
        ->getJson('/api/kitchen/tickets')
        ->assertJsonCount(1, 'data.0.items');
});

it('ticket sắp xếp FIFO — đơn cũ trước', function () {
    $old = Order::factory()->create(['created_at' => now()->subMinutes(20)]);
    $new = Order::factory()->create(['created_at' => now()->subMinutes(2)]);
    OrderItem::factory()->for($old)->create(['status' => 'pending']);
    OrderItem::factory()->for($new)->create(['status' => 'pending']);

    $this->actingAs($this->staff, 'api')
        ->getJson('/api/kitchen/tickets')
        ->assertJsonPath('data.0.order_id', $old->id);
});
```

---

## Definition of Done

- [ ] Mở `/kitchen` thấy 3 cột đúng dữ liệu từ seeder
- [ ] Đặt món trên điện thoại → **trong 3s** ticket hiện ở cột MỚI
- [ ] Bấm "BẮT ĐẦU" → ticket chuyển cột; **trong 4s** khách thấy "Đang pha chế"
- [ ] Bấm hết tới "ĐÃ PHỤC VỤ" → ticket biến khỏi màn KDS, khách thấy "Đã phục vụ"
- [ ] Đồng hồ chờ **đếm liên tục**, không đứng im giữa các lần poll
- [ ] Ticket quá 8 phút đổi viền vàng, quá 15 phút đỏ (test bằng cách sửa `created_at` trong DB)
- [ ] Ticket mới có hiệu ứng highlight; mở màn lần đầu thì **không** highlight tất cả
- [ ] Màn admin `/admin/orders` hiển thị theo bàn
- [ ] Test pass
- [ ] Commit: `feat(kds): màn quầy pha chế + state machine trạng thái món`

---

## Kịch bản quay video — Tập 6: "Màn hình quầy pha chế"

| Thời lượng | Nội dung |
|---|---|
| 0:00–2:00 | Nhắc: tập trước đơn đã vào DB nhưng barista chưa thấy. Hôm nay làm màn cho họ |
| 2:00–8:00 | **Vẽ máy trạng thái lên bảng/slide trước khi code.** Giải thích vì sao chặn `served → preparing`, vì sao cho lùi một bậc (bấm nhầm) |
| 8:00–14:00 | Implement `canTransitionTo` + `updateItemStatus`. Nhấn: derive lại order cha, và hủy món thì tính lại tiền |
| 14:00–19:00 | API tickets. Giải thích **FIFO** (công bằng với khách) và ngưỡng cảnh báo 8/15 phút lấy từ thời gian pha thật |
| 19:00–26:00 | **Đoạn giá trị nhất của tập — thiết kế UI theo ràng buộc thực tế.** Nói rõ: barista đứng cách 1–2m, tay ướt, quầy thiếu sáng → chữ to, nút to, nền tối, **không drag-drop**. Đây là kiểu tư duy nhà tuyển dụng đánh giá rất cao |
| 26:00–35:00 | Dựng `KdsBoard.vue` 3 cột |
| 35:00–39:00 | Đồng hồ chờ client-side. **Demo lỗi trước:** chỉ dùng số từ API → số đứng im 3 giây một lần, nhìn như treo. Rồi sửa bằng `useElapsed` |
| 39:00–43:00 | Phát hiện ticket mới + cờ `isFirstLoad`. Demo lỗi: bỏ cờ đi → mở màn báo 8 đơn mới. Rồi sửa |
| 43:00–50:00 | **Demo cuối — chia màn hình 3 khung:** điện thoại (khách) │ màn KDS │ màn admin. Đặt món → đếm to "một, hai, ba" → ticket hiện. Bấm BẮT ĐẦU → đếm → khách đổi trạng thái |
| 50:00–53:00 | **Chốt tập có chủ đích:** "Các bạn thấy độ trễ 3 giây kia chứ? Đó là vì mình đang polling — cứ 3 giây hỏi server một lần, kể cả khi không có gì mới. Tập sau mình sẽ bỏ nó đi và làm real-time thật bằng WebSocket." Mở tab Network cho thấy hàng chục request rác → tạo động lực xem tập sau |

**Setup quay:** cần OBS với 3 nguồn — scrcpy (màn hình Android) hoặc QuickTime (iPhone), cộng 2 cửa sổ trình duyệt. Dựng sẵn scene này vì Phase 7, 8 sẽ dùng lại.
