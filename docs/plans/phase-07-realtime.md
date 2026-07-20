# Phase 7 — Real-time với Laravel Reverb

> **Mục tiêu:** Thay polling bằng WebSocket. Order bật lên màn bếp tức thì kèm âm thanh; trạng thái đẩy ngược về khách tức thì; gọi phục vụ / yêu cầu thanh toán.
> **Ước lượng:** 6–8h · **Demo cuối phase:** đặt món → ticket bật lên **dưới 200ms** + tiếng chuông. Tab Network: 0 request polling.

> **Đây là điểm kỹ thuật số 1 của dự án.** Tập video này là tập nên đầu tư nhiều nhất — cũng là clip nên cắt riêng làm Short.

---

## Bước 1 — Cài & cấu hình Reverb

```bash
docker compose exec app php artisan install:broadcasting
```

Lệnh này tạo `config/broadcasting.php`, `routes/channels.php`, và cài `laravel-echo` + `pusher-js` ở frontend.

`backend/.env`:

```dotenv
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=cafe-connect
REVERB_APP_KEY=local-key
REVERB_APP_SECRET=local-secret
REVERB_HOST=reverb
REVERB_PORT=8080
REVERB_SCHEME=http

# Frontend dùng host này để kết nối (khác REVERB_HOST vì trình duyệt ở ngoài Docker)
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

Thêm service vào `docker-compose.yml`:

```yaml
  reverb:
    build:
      context: ./backend
      dockerfile: Dockerfile
    volumes:
      - ./backend:/var/www/html
    ports:
      - "8080:8080"
    depends_on:
      - redis
    command: php artisan reverb:start --host=0.0.0.0 --port=8080
```

Dùng Redis làm backend scaling cho Reverb (`config/reverb.php`: `'scaling' => ['enabled' => true, 'channel' => 'reverb']`). Chưa cần cho demo nhưng cấu hình sẵn thì lên production không phải sửa.

```bash
docker compose up -d reverb
docker compose logs -f reverb     # kỳ vọng: "Reverb server started on 0.0.0.0:8080"
```

> **Vì sao Reverb chứ không Pusher/Soketi?** Cùng hệ sinh thái Laravel (không cần adapter), miễn phí, self-host được. Điểm cộng portfolio: **bạn tự vận hành hạ tầng real-time**, không phụ thuộc SaaS bên thứ ba. Nhưng cũng phải nói mặt trái trong video: tự host nghĩa là tự lo uptime, tự scale — có đánh đổi.

---

## Bước 2 — Định nghĩa kênh

`routes/channels.php`:

```php
// Kênh khách — public, nhưng code phiên là bí mật (6 ký tự random)
Broadcast::channel('session.{code}', fn () => true);

// Kênh nội bộ — private, cần JWT + permission
Broadcast::channel('kitchen', fn ($user) => $user->can('order.update'));
Broadcast::channel('staff',   fn ($user) => $user->can('order.view'));
Broadcast::channel('admin.orders', fn ($user) => $user->can('order.view'));
```

> **Vì sao `session.{code}` là public?** Khách không đăng nhập, không có token để authorize. Bảo mật ở chỗ `code` là 6 ký tự ngẫu nhiên từ tập 31 ký tự ≈ 900 triệu tổ hợp, và phiên chỉ sống vài giờ. Bàn cạnh không đoán được. **Nói rõ đánh đổi này trong video** — nêu được giới hạn của thiết kế mình chọn là dấu hiệu của kỹ sư chín chắn, không phải điểm yếu.

Broadcasting auth cần JWT — sửa `bootstrap/app.php` hoặc `routes/api.php`:

```php
Broadcast::routes(['middleware' => ['auth:api']]);
```

Và trong `config/broadcasting.php` đảm bảo endpoint là `/api/broadcasting/auth` để khớp CORS đã cấu hình ở Phase 0.

---

## Bước 3 — Events

```bash
docker compose exec app php artisan make:event OrderPlaced
docker compose exec app php artisan make:event OrderItemStatusUpdated
docker compose exec app php artisan make:event StaffCalled
docker compose exec app php artisan make:event BillRequested
docker compose exec app php artisan make:event SessionClosed
```

`app/Events/OrderPlaced.php`:

```php
class OrderPlaced implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('kitchen'),
            new PrivateChannel('admin.orders'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.placed';
    }

    /** Gửi payload đầy đủ để client render ngay, KHÔNG phải gọi API lại */
    public function broadcastWith(): array
    {
        return [
            'ticket' => (new TicketResource(
                $this->order->load('items.options', 'diningSession.table')
            ))->resolve(),
        ];
    }
}
```

> **Nguyên tắc quan trọng:** event mang **đủ dữ liệu để render**. Nếu chỉ gửi `{ order_id: 5 }` rồi client phải gọi `GET /api/kitchen/tickets`, ta đã đánh mất phần lớn lợi ích của WebSocket — vẫn một vòng HTTP nữa mới thấy được. Nói kỹ điều này trong video, nhiều người làm sai.

`OrderItemStatusUpdated` — bắn tới cả khách lẫn admin:

```php
public function broadcastOn(): array
{
    return [
        new Channel("session.{$this->item->order->diningSession->code}"),   // public
        new PrivateChannel('admin.orders'),
    ];
}

public function broadcastAs(): string { return 'order-item.status-updated'; }

public function broadcastWith(): array
{
    return [
        'order_item' => (new OrderItemResource($this->item->load('options')))->resolve(),
        'order_id'   => $this->item->order_id,
        'session_total' => (float) $this->item->order->diningSession->total,
    ];
}
```

`StaffCalled` / `BillRequested`:

```php
class StaffCalled implements ShouldBroadcast
{
    public function __construct(public DiningSession $session, public ?string $reason = null) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('staff'), new PrivateChannel('admin.orders')];
    }

    public function broadcastAs(): string { return 'staff.called'; }

    public function broadcastWith(): array
    {
        return [
            'session_code' => $this->session->code,
            'table_name'   => $this->session->table->name,
            'reason'       => $this->reason,
            'called_at'    => now()->toIso8601String(),
        ];
    }
}
```

---

## Bước 4 — Bắn event từ service

Chèn vào `OrderService`:

```php
// cuối place(), SAU khi transaction commit
public function place(DiningSession $session, array $items, ?string $note = null): Order
{
    $order = DB::transaction(function () use (...) { /* ... như Phase 5 ... */ });

    broadcast(new OrderPlaced($order));      // ← ngoài transaction

    return $order;
}
```

> **Bắn event ngoài transaction, không phải trong.** Nếu bắn bên trong rồi transaction rollback, màn bếp đã hiển thị một đơn không tồn tại. Đây là bug rất khó lần ra — **quay cảnh giải thích, thậm chí demo bằng cách cố tình throw exception sau khi broadcast**.
>
> Cách khác nếu muốn dùng event trong transaction: `DB::afterCommit()` hoặc để event listener implement `ShouldHandleEventsAfterCommit`.

Tương tự trong `updateItemStatus`, thêm sau transaction:

```php
broadcast(new OrderItemStatusUpdated($item));
```

**Queue cho broadcast:** đổi `implements ShouldBroadcast` → `ShouldBroadcastNow` cho các event cần độ trễ thấp nhất (`OrderPlaced`, `OrderItemStatusUpdated`), hoặc giữ `ShouldBroadcast` + chạy queue worker. Với demo, `ShouldBroadcastNow` đơn giản hơn và đủ nhanh.

Nếu dùng queue thì thêm service worker vào compose:

```yaml
  queue:
    build: { context: ./backend, dockerfile: Dockerfile }
    volumes: [./backend:/var/www/html]
    depends_on: [redis, db]
    command: php artisan queue:work --tries=3
```

---

## Bước 5 — API gọi phục vụ & yêu cầu thanh toán

```php
// POST /api/sessions/{code}/call-staff
public function callStaff(string $code, Request $request)
{
    $session = $this->requireOpenSession($code);

    $reason = $request->validate([
        'reason' => ['nullable', 'string', 'max:200'],
    ])['reason'] ?? null;

    // Chống spam: 1 lần / 30 giây / phiên
    $key = "call-staff:{$session->code}";
    if (Cache::has($key)) {
        return response()->json([
            'message' => 'Nhân viên đã được báo, vui lòng đợi trong giây lát',
        ], 429);
    }
    Cache::put($key, true, now()->addSeconds(30));

    broadcast(new StaffCalled($session->load('table'), $reason));

    return response()->json(['message' => 'Đã gọi nhân viên, vui lòng đợi trong giây lát']);
}
```

`request-bill` tương tự, bắn `BillRequested`, cooldown 60 giây.

> Rate limit ở đây **không phải để chống hacker** mà để chống trẻ con nghịch bấm 50 lần làm quầy loạn chuông. Lý do rất đời — nói ra trong video sẽ thấy bạn nghĩ tới vận hành thật.

---

## Bước 6 — Frontend: composable `useEcho`

`src/lib/echo.ts`:

```ts
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

let instance: Echo<'reverb'> | null = null

export function getEcho(): Echo<'reverb'> {
  if (instance) return instance

  instance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT),
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${import.meta.env.VITE_API_BASE_URL}/broadcasting/auth`,
    auth: {
      headers: { Authorization: `Bearer ${localStorage.getItem('cc_token') ?? ''}` },
    },
  })

  return instance
}

export function disconnectEcho() {
  instance?.disconnect()
  instance = null
}
```

`src/composables/useEcho.ts` — wrapper tự dọn dẹp khi unmount:

```ts
export function useChannel(
  channel: string,
  events: Record<string, (payload: any) => void>,
  options: { private?: boolean } = {},
) {
  const connected = ref(false)

  onMounted(() => {
    const echo = getEcho()
    const ch = options.private ? echo.private(channel) : echo.channel(channel)

    Object.entries(events).forEach(([name, handler]) => {
      ch.listen(`.${name}`, handler)     // dấu chấm đầu vì đã dùng broadcastAs()
    })

    echo.connector.pusher.connection.bind('connected',    () => (connected.value = true))
    echo.connector.pusher.connection.bind('disconnected', () => (connected.value = false))
  })

  onUnmounted(() => {
    options.private ? getEcho().leave(channel) : getEcho().leaveChannel(channel)
  })

  return { connected }
}
```

> Lưu ý **dấu chấm** trước tên event (`.order.placed`). Khi backend dùng `broadcastAs()`, Echo cần tiền tố `.` để hiểu đây là tên tùy chỉnh chứ không phải class name đầy đủ. Đây là bẫy kinh điển — dành 1 phút trong video nói về nó, sẽ cứu người xem khỏi 2 tiếng debug.

---

## Bước 7 — KDS: thay polling bằng WebSocket

`KdsBoard.vue`:

```ts
const tickets = ref<Ticket[]>([])
const { play } = useNotificationSound()

// Vẫn tải lần đầu bằng HTTP — WebSocket chỉ mang thay đổi, không mang trạng thái ban đầu
onMounted(fetchTickets)

const { connected } = useChannel('kitchen', {
  'order.placed': ({ ticket }) => {
    tickets.value = [...tickets.value, ticket]
    play()
    highlight(ticket.order_id)
  },
  'order-item.status-updated': ({ order_item, order_id }) => {
    const ticket = tickets.value.find((t) => t.order_id === order_id)
    if (!ticket) return
    const idx = ticket.items.findIndex((i) => i.id === order_item.id)
    if (idx !== -1) ticket.items[idx] = order_item
    // Món đã served/cancelled thì bỏ khỏi màn
    ticket.items = ticket.items.filter((i) => !['served', 'cancelled'].includes(i.status))
    if (ticket.items.length === 0) {
      tickets.value = tickets.value.filter((t) => t.order_id !== order_id)
    }
  },
}, { private: true })

// ⚠️ FALLBACK: mất kết nối thì quay lại polling
watch(connected, (isConnected) => {
  isConnected ? stopPolling() : startPolling(5000)
})

// Đồng bộ lại toàn bộ mỗi 60s để tự sửa nếu lỡ miss event
useIntervalFn(fetchTickets, 60_000)
```

> **Hai cơ chế an toàn ở trên là điểm đáng khoe nhất phase:**
> 1. **Fallback về polling** khi WebSocket rớt — WiFi quán cafe không ổn định, không được để màn bếp đứng hình.
> 2. **Reconcile định kỳ 60s** — nếu lỡ miss một event (rớt mạng đúng lúc bắn), 60 giây sau sẽ tự đúng lại.
>
> Nhiều dự án portfolio làm WebSocket "chạy được là xong". Có xử lý mất kết nối mới là làm thật. **Đây là câu chuyện rất tốt cho phỏng vấn.**

Thêm **chỉ báo kết nối** góc màn KDS:

```
🟢 Đã kết nối     /     🟡 Đang kết nối lại...     /     🔴 Mất kết nối — đang dùng chế độ dự phòng
```

---

## Bước 8 — Âm thanh báo

`src/composables/useNotificationSound.ts`:

```ts
export function useNotificationSound(src = '/sounds/new-order.mp3') {
  const audio = new Audio(src)
  audio.volume = 0.7
  const unlocked = ref(false)

  /** Trình duyệt chặn autoplay tới khi user tương tác — mở khóa bằng click đầu tiên */
  function unlock() {
    audio.play().then(() => {
      audio.pause()
      audio.currentTime = 0
      unlocked.value = true
    }).catch(() => {})
  }

  onMounted(() => {
    document.addEventListener('click', unlock, { once: true })
  })

  function play() {
    if (!unlocked.value) return
    audio.currentTime = 0
    audio.play().catch(() => {})
  }

  return { play, unlocked }
}
```

Vì `unlocked` ban đầu là `false`, hiện banner ở KDS:

> 🔔 **Bấm vào đây để bật âm thanh báo đơn mới**

Bấm một lần là xong cả ca làm việc.

> **Chính sách autoplay của trình duyệt** là thứ ai làm KDS/dashboard cũng vấp. Quay cảnh này: không xử lý → console báo `NotAllowedError`, không có tiếng. Rồi sửa bằng unlock-on-click. Rất hữu ích cho người xem.

Chọn âm thanh: tiếng chuông ngắn 0.5–1s, dễ chịu, không giật mình. Tải từ freesound.org (giấy phép CC0) và **để file trong repo** — link ngoài sẽ chết.

---

## Bước 9 — Khách: nhận trạng thái real-time

`OrderStatusView.vue` — bỏ `setInterval`, thay bằng:

```ts
useChannel(`session.${code}`, {
  'order-item.status-updated': ({ order_item, session_total }) => {
    // Cập nhật đúng món trong danh sách
    for (const order of session.value!.orders) {
      const idx = order.items.findIndex((i) => i.id === order_item.id)
      if (idx !== -1) {
        order.items[idx] = order_item
        break
      }
    }
    session.value!.total = session_total

    if (order_item.status === 'ready') {
      toast.success(`${order_item.name} đã sẵn sàng!`)
      vibrate()
    }
  },
  'session.closed': () => {
    toast.info('Cảm ơn quý khách! Phiên đã kết thúc.')
    router.push({ name: 'thank-you' })
  },
})

function vibrate() {
  navigator.vibrate?.([100, 50, 100])    // rung nhẹ trên điện thoại
}
```

> `navigator.vibrate` là chi tiết nhỏ nhưng khiến demo trên điện thoại thật rất "wow" — khách bỏ điện thoại trong túi, món xong thì rung nhẹ.

Frontend khách **không cần token** (kênh public) nên `useEcho` phải chấp nhận trường hợp không có `Authorization`.

---

## Bước 10 — Khách: nút gọi phục vụ & thanh toán

Trong `CustomerLayout`, thanh dưới thêm 2 nút:

```
┌────────────────────────────┐
│ 🔔 Gọi nhân viên   💳 Tính tiền │
└────────────────────────────┘
```

Bấm "Gọi nhân viên" mở sheet chọn lý do nhanh (chip): *Thêm nước · Thêm đá · Dọn bàn · Khác*. Gửi kèm `reason` — barista/phục vụ biết mang gì ra, không phải chạy tới hỏi.

Sau khi gọi: nút chuyển sang trạng thái đếm ngược 30s (`Đã gọi (28s)`) — cùng cooldown với backend, tránh khách bấm rồi bị từ chối 429.

---

## Bước 11 — Màn Staff nhận thông báo

Bổ sung vào `AdminLayout`: toast + badge chuông ở header, lắng nghe kênh `staff`:

```ts
useChannel('staff', {
  'staff.called': ({ table_name, reason }) => {
    play()
    toast(`🔔 ${table_name} gọi nhân viên`, {
      description: reason ?? 'Không có ghi chú',
      duration: 15000,
      action: { label: 'Đã xử lý', onClick: () => dismiss(table_name) },
    })
  },
  'bill.requested': ({ table_name, total_formatted }) => {
    play()
    toast(`💳 ${table_name} yêu cầu thanh toán`, {
      description: `Tổng: ${total_formatted}`,
      duration: 30000,
    })
  },
}, { private: true })
```

---

## Bước 12 — Test

Laravel test broadcast bằng cách assert event được dispatch, không cần WebSocket thật:

```php
it('bắn OrderPlaced tới kênh kitchen khi khách đặt món', function () {
    Event::fake([OrderPlaced::class]);

    $session = DiningSession::factory()->create();
    $item = MenuItem::factory()->create();

    $this->postJson("/api/sessions/{$session->code}/orders", [
        'items' => [['menu_item_id' => $item->id, 'quantity' => 1]],
    ])->assertCreated();

    Event::assertDispatched(OrderPlaced::class, function ($e) {
        $channels = collect($e->broadcastOn())->map->name;
        return $channels->contains('private-kitchen')
            && $channels->contains('private-admin.orders');
    });
});

it('không bắn event nếu transaction thất bại', function () {
    Event::fake([OrderPlaced::class]);
    $session = DiningSession::factory()->create();

    $this->postJson("/api/sessions/{$session->code}/orders", [
        'items' => [['menu_item_id' => 999999, 'quantity' => 1]],   // món không tồn tại
    ])->assertStatus(404);

    Event::assertNotDispatched(OrderPlaced::class);
});

it('payload event đủ dữ liệu để render, không cần gọi API thêm', function () {
    $order = Order::factory()->hasItems(2)->create();

    $payload = (new OrderPlaced($order))->broadcastWith();

    expect($payload['ticket'])->toHaveKeys(['table_name', 'items', 'waiting_minutes'])
        ->and($payload['ticket']['items'])->toHaveCount(2);
});

it('giới hạn gọi nhân viên 1 lần mỗi 30 giây', function () {
    $session = DiningSession::factory()->create();

    $this->postJson("/api/sessions/{$session->code}/call-staff")->assertOk();
    $this->postJson("/api/sessions/{$session->code}/call-staff")->assertStatus(429);
});

it('chặn kênh kitchen với user không có quyền', function () {
    $customer = User::factory()->create();     // không role

    $this->actingAs($customer, 'api')
        ->postJson('/api/broadcasting/auth', ['channel_name' => 'private-kitchen'])
        ->assertForbidden();
});
```

---

## Definition of Done

- [ ] `docker compose logs reverb` thấy kết nối từ client
- [ ] Đặt món → ticket xuất hiện **dưới 200ms**, có tiếng chuông
- [ ] KDS đổi trạng thái → khách thấy **tức thì**, có toast + rung khi món sẵn sàng
- [ ] Mở tab Network trên KDS: **không còn request polling định kỳ**
- [ ] **Ngắt WiFi laptop** → chỉ báo chuyển đỏ, tự fallback polling, màn vẫn cập nhật (chậm hơn)
- [ ] **Bật WiFi lại** → tự kết nối lại, chỉ báo chuyển xanh, quay về real-time
- [ ] Gọi nhân viên từ điện thoại → toast bật ở màn admin kèm lý do
- [ ] Bấm gọi 2 lần liên tiếp → lần 2 bị chặn kèm đếm ngược trên UI
- [ ] User không quyền không join được kênh `private-kitchen`
- [ ] Test pass
- [ ] Commit: `feat(realtime): Laravel Reverb + fallback polling + âm thanh báo`

---

## Kịch bản quay video — Tập 7: "Real-time thật sự"

> **Tập quan trọng nhất của series.** Đầu tư dựng hình, âm thanh, và cắt clip riêng cho Short/Reel.

| Thời lượng | Nội dung |
|---|---|
| 0:00–1:00 | **Mở bằng kết quả trước.** Chiếu ngay demo cuối 15 giây: đặt món → ticket bật + chuông. Rồi mới nói "hôm nay chúng ta làm cái này" |
| 1:00–5:00 | **Vì sao polling tệ.** Mở Network tab của bản Phase 6, cho thấy hàng trăm request rác. Tính nhẩm: 20 bàn × 1 request/3s = 400 request/phút chỉ để hỏi "có gì mới không". Con số cụ thể rất thuyết phục |
| 5:00–11:00 | Cài Reverb, thêm service Docker, chạy lần đầu. Giải thích vì sao chọn Reverb — và **nói cả mặt trái**: tự host thì tự lo uptime |
| 11:00–17:00 | Kênh + authorization. **Giải thích quyết định `session.{code}` là public** — khách không có token, bảo mật dựa vào code random 900 triệu tổ hợp. Nêu rõ đánh đổi, đừng giấu |
| 17:00–24:00 | Events. **Điểm nhấn:** `broadcastWith` phải mang đủ dữ liệu render. Demo cả hai cách: chỉ gửi id → client phải gọi API lại (chậm) vs gửi đủ → render ngay |
| 24:00–29:00 | **Bẫy số 1 — bắn event trong transaction.** Cố tình để broadcast trong transaction rồi throw exception sau đó → màn bếp hiện ticket "ma" không có trong DB. Sửa bằng cách chuyển ra ngoài. Đây là loại bug thật, người xem sẽ nhớ rất lâu |
| 29:00–35:00 | Frontend Echo + composable. **Bẫy số 2 — dấu chấm trước tên event.** Quên chấm → im lặng hoàn toàn, không lỗi gì. Demo lỗi rồi sửa |
| 35:00–40:00 | **Bẫy số 3 — autoplay policy.** Không có tiếng, console `NotAllowedError`. Sửa bằng unlock-on-click + banner |
| 40:00–48:00 | **Đoạn đáng giá nhất — xử lý mất kết nối.** Implement fallback polling + reconcile 60s. Nói thẳng: "Đây là chỗ phân biệt demo và sản phẩm. WiFi quán cafe rớt suốt." |
| 48:00–53:00 | Gọi nhân viên / đòi bill + rate limit. Giải thích lý do rất đời: chống trẻ con nghịch bấm |
| 53:00–62:00 | **DEMO LỚN — quay 3 màn hình:** <br>1. Đặt món trên điện thoại → ticket bật tức thì + chuông (quay chậm lại, zoom vào độ trễ) <br>2. Bấm "XONG" trên KDS → điện thoại rung + toast (để điện thoại lên bàn, quay thấy nó rung) <br>3. **Rút dây mạng laptop** → chỉ báo đỏ → vẫn chạy bằng polling → cắm lại → xanh → real-time trở lại <br>4. Bấm "Gọi nhân viên" → toast bật ở màn admin |
| 62:00–65:00 | So sánh trước/sau: Network tab Phase 6 (hàng trăm request) vs Phase 7 (một kết nối WS). Chốt tập |

**Cắt clip riêng cho Short/Reel (30–45 giây):** đặt món trên điện thoại → ticket bật + chuông → bấm xong → điện thoại rung. Không lời thoại, chỉ nhạc nền và text overlay. Clip này có khả năng lan truyền cao nhất trong cả series.
