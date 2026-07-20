# Phase 8 — Thanh toán & đóng bàn

> **Mục tiêu:** Thanh toán tiền mặt / chuyển khoản tại quầy, và thanh toán online qua VNPay sandbox; đóng phiên bàn, trả bàn về trạng thái trống.
> **Ước lượng:** 6–8h · **Demo cuối phase:** khách bấm "Thanh toán online" → chuyển sang VNPay sandbox → nhập thẻ test → quay về app thấy "Đã thanh toán", bàn tự trống.

---

## Bước 1 — `PaymentGatewayInterface`

Đây là chỗ áp dụng abstraction rõ ràng nhất — **chi tiết đáng khoe trong README**.

`app/Services/Contracts/PaymentGatewayInterface.php`:

```php
interface PaymentGatewayInterface
{
    /** Tên cổng: "vnpay", "stripe" */
    public function name(): string;

    /** Tạo giao dịch, trả về URL để redirect khách sang cổng */
    public function createCheckout(Payment $payment): string;

    /** Xác thực dữ liệu cổng trả về khi redirect (khách quay lại) */
    public function verifyReturn(array $payload): PaymentVerification;

    /** Xác thực webhook server-to-server — NGUỒN TIN CẬY để chốt paid */
    public function verifyWebhook(Request $request): PaymentVerification;
}
```

`app/Services/Payment/PaymentVerification.php` — DTO thống nhất kết quả giữa các cổng:

```php
final readonly class PaymentVerification
{
    public function __construct(
        public bool $valid,           // chữ ký hợp lệ?
        public bool $success,         // giao dịch thành công?
        public ?string $gatewayRef,   // mã giao dịch phía cổng
        public ?int $paymentId,       // id Payment của mình
        public float $amount,
        public array $raw = [],
        public ?string $message = null,
    ) {}
}
```

> **Vì sao cần DTO này?** VNPay trả `vnp_ResponseCode`, Stripe trả `payment_intent.status` — hai định dạng hoàn toàn khác nhau. Nếu controller phải biết cả hai thì abstraction vô nghĩa. DTO ép mọi cổng nói cùng một ngôn ngữ. **Đây là câu trả lời rất tốt cho câu hỏi phỏng vấn "kể về một lần bạn dùng abstraction hợp lý".**

---

## Bước 2 — VnpayGateway

Đăng ký tài khoản sandbox tại https://sandbox.vnpayment.vn/devreg — nhận `TmnCode` và `HashSecret`.

`.env`:

```dotenv
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL="${FRONTEND_URL}/payment/return"
```

`app/Services/Payment/VnpayGateway.php`:

```php
class VnpayGateway implements PaymentGatewayInterface
{
    public function name(): string { return 'vnpay'; }

    public function createCheckout(Payment $payment): string
    {
        $params = [
            'vnp_Version'    => '2.1.0',
            'vnp_Command'    => 'pay',
            'vnp_TmnCode'    => config('services.vnpay.tmn_code'),
            'vnp_Amount'     => (int) round($payment->amount * 100),   // VNPay dùng đơn vị ×100
            'vnp_CurrCode'   => 'VND',
            'vnp_TxnRef'     => (string) $payment->id,
            'vnp_OrderInfo'  => "Thanh toan don hang {$payment->diningSession->code}",
            'vnp_OrderType'  => 'other',
            'vnp_Locale'     => 'vn',
            'vnp_ReturnUrl'  => config('services.vnpay.return_url'),
            'vnp_IpAddr'     => request()->ip(),
            'vnp_CreateDate' => now()->format('YmdHis'),
            'vnp_ExpireDate' => now()->addMinutes(15)->format('YmdHis'),
        ];

        ksort($params);   // BẮT BUỘC: VNPay ký trên chuỗi đã sắp xếp theo key

        $hashData = collect($params)
            ->map(fn ($v, $k) => urlencode($k).'='.urlencode($v))
            ->implode('&');

        $secureHash = hash_hmac('sha512', $hashData, config('services.vnpay.hash_secret'));

        return config('services.vnpay.url').'?'.$hashData.'&vnp_SecureHash='.$secureHash;
    }

    public function verifyReturn(array $payload): PaymentVerification
    {
        return $this->verify($payload);
    }

    public function verifyWebhook(Request $request): PaymentVerification
    {
        return $this->verify($request->all());
    }

    private function verify(array $payload): PaymentVerification
    {
        $received = $payload['vnp_SecureHash'] ?? '';
        unset($payload['vnp_SecureHash'], $payload['vnp_SecureHashType']);

        ksort($payload);
        $hashData = collect($payload)
            ->map(fn ($v, $k) => urlencode($k).'='.urlencode($v))
            ->implode('&');

        $expected = hash_hmac('sha512', $hashData, config('services.vnpay.hash_secret'));

        // hash_equals: so sánh chống timing attack
        $valid = hash_equals($expected, $received);

        return new PaymentVerification(
            valid:      $valid,
            success:    $valid && ($payload['vnp_ResponseCode'] ?? null) === '00',
            gatewayRef: $payload['vnp_TransactionNo'] ?? null,
            paymentId:  isset($payload['vnp_TxnRef']) ? (int) $payload['vnp_TxnRef'] : null,
            amount:     (float) ($payload['vnp_Amount'] ?? 0) / 100,
            raw:        $payload,
            message:    $this->responseMessage($payload['vnp_ResponseCode'] ?? null),
        );
    }

    private function responseMessage(?string $code): string
    {
        return match ($code) {
            '00' => 'Giao dịch thành công',
            '24' => 'Khách hàng hủy giao dịch',
            '51' => 'Tài khoản không đủ số dư',
            '11' => 'Đã hết hạn chờ thanh toán',
            default => 'Giao dịch không thành công',
        };
    }
}
```

> **Ba chi tiết bảo mật đáng dừng lại giải thích trong video:**
> 1. **`ksort` trước khi ký** — sai thứ tự là hash sai, và lỗi này báo rất mơ hồ ("chữ ký không hợp lệ"). Đây là lỗi số 1 khi tích hợp VNPay.
> 2. **`hash_equals` thay vì `===`** — chống timing attack. So sánh chuỗi thường trả về sớm khi gặp ký tự khác nhau, kẻ tấn công đo thời gian có thể dò từng ký tự chữ ký.
> 3. **Không bao giờ tin `vnp_Amount` từ client** — luôn đối chiếu với `payment->amount` trong DB.

`StripeGateway.php`: implement cùng interface nhưng `throw new NotImplementedException` ở mọi method, kèm comment mô tả sẽ làm gì. Mục đích là **chứng minh interface đúng đắn** — thêm cổng mới không đụng vào controller. Nói rõ trong video: đây là chủ ý, không phải làm dở.

---

## Bước 3 — `PaymentService`

```php
interface PaymentServiceInterface
{
    public function recordCounterPayment(DiningSession $s, PaymentMethod $m, float $amount): Payment;
    public function initiateOnline(DiningSession $s, string $gateway): array;   // ['payment' =>, 'redirect_url' =>]
    public function settle(PaymentVerification $v): Payment;
}
```

`recordCounterPayment` — tiền mặt / chuyển khoản, nhân viên bấm tại quầy:

```php
public function recordCounterPayment(DiningSession $session, PaymentMethod $method, float $amount): Payment
{
    if ($session->status === SessionStatus::Closed) {
        throw new BusinessException('Phiên bàn đã được thanh toán');
    }

    return DB::transaction(function () use ($session, $method, $amount) {
        app(SessionServiceInterface::class)->recalculateTotal($session);
        $session->refresh();

        if (abs($amount - (float) $session->total) > 0.01) {
            throw new BusinessException(
                'Số tiền không khớp. Tổng hóa đơn: '.number_format((float) $session->total, 0, ',', '.').'đ'
            );
        }

        $payment = $session->payments()->create([
            'method'  => $method,
            'amount'  => $amount,
            'status'  => PaymentStatus::Paid,
            'paid_at' => now(),
        ]);

        app(SessionServiceInterface::class)->close($session);

        return $payment;
    });
}
```

`settle` — chốt thanh toán online, phải **idempotent**:

```php
public function settle(PaymentVerification $v): Payment
{
    return DB::transaction(function () use ($v) {
        $payment = Payment::lockForUpdate()->findOrFail($v->paymentId);

        // Đã chốt rồi thì trả về luôn — webhook VNPay có thể gọi nhiều lần
        if ($payment->status === PaymentStatus::Paid) {
            return $payment;
        }

        // Đối chiếu số tiền — không tin dữ liệu từ ngoài
        if (abs($v->amount - (float) $payment->amount) > 0.01) {
            Log::warning('Payment amount mismatch', [
                'payment_id' => $payment->id,
                'expected' => $payment->amount, 'received' => $v->amount,
            ]);
            $payment->update(['status' => PaymentStatus::Failed, 'gateway_payload' => $v->raw]);
            throw new BusinessException('Số tiền giao dịch không khớp');
        }

        $payment->update([
            'status'          => $v->success ? PaymentStatus::Paid : PaymentStatus::Failed,
            'gateway_ref'     => $v->gatewayRef,
            'gateway_payload' => $v->raw,
            'paid_at'         => $v->success ? now() : null,
        ]);

        if ($v->success) {
            app(SessionServiceInterface::class)->close($payment->diningSession);
        }

        return $payment;
    });
}
```

> **Idempotency là khái niệm bắt buộc phải nói trong video.** VNPay có thể gọi webhook 2–3 lần cho cùng một giao dịch (retry khi timeout). Không xử lý thì phiên bị đóng 2 lần, báo cáo doanh thu đếm đôi. Kết hợp `lockForUpdate` + kiểm tra trạng thái là đủ.

`SessionService::close`:

```php
public function close(DiningSession $session): DiningSession
{
    return DB::transaction(function () use ($session) {
        // Món chưa phục vụ xong thì cảnh báo — nhưng vẫn cho đóng (khách có thể đã hủy miệng)
        $pending = $session->orderItems()
            ->whereNotIn('order_items.status', ['served', 'cancelled'])->count();

        $session->update(['status' => SessionStatus::Closed, 'closed_at' => now()]);
        $session->table->update(['status' => TableStatus::Available]);

        broadcast(new SessionClosed($session, $pending));

        return $session->fresh();
    });
}
```

---

## Bước 4 — API

```
# Tại quầy (staff)
POST  /api/admin/sessions/{code}/pay      body: { method: "cash"|"bank_transfer", amount }
POST  /api/admin/sessions/{code}/close    # đóng không thanh toán (khách bỏ đi, hủy bàn)

# Online (khách)
POST  /api/sessions/{code}/checkout       body: { gateway: "vnpay" }
GET   /api/payments/{gateway}/return      # cổng redirect khách về
POST  /api/payments/{gateway}/webhook     # cổng gọi server-to-server
POST  /api/sessions/{code}/request-bill   # đã làm ở Phase 7
```

`PaymentController`:

```php
public function checkout(string $code, Request $request)
{
    $gateway = $request->validate([
        'gateway' => ['required', Rule::in(['vnpay'])],
    ])['gateway'];

    $session = DiningSession::where('code', $code)->open()->firstOrFail();

    app(SessionServiceInterface::class)->recalculateTotal($session);
    $session->refresh();

    if ((float) $session->total <= 0) {
        return response()->json(['message' => 'Chưa có món nào để thanh toán'], 400);
    }

    // Có giao dịch pending còn hạn thì dùng lại, tránh tạo rác
    $payment = $session->payments()
        ->where('status', PaymentStatus::Pending)
        ->where('created_at', '>', now()->subMinutes(15))
        ->first()
        ?? $session->payments()->create([
            'method' => PaymentMethod::from($gateway),
            'amount' => $session->total,
            'status' => PaymentStatus::Pending,
        ]);

    return response()->json(['data' => [
        'payment_id'   => $payment->id,
        'redirect_url' => $this->gateway->createCheckout($payment),
    ], 'message' => 'OK']);
}

public function return(string $gateway, Request $request)
{
    $verification = $this->gateway->verifyReturn($request->all());

    if (! $verification->valid) {
        return redirect(config('app.frontend_url').'/payment/result?status=invalid');
    }

    // Return URL chỉ để điều hướng UX. Nguồn tin cậy là webhook.
    // Nhưng sandbox VNPay không luôn gọi webhook nên vẫn settle ở đây cho demo.
    $payment = app(PaymentServiceInterface::class)->settle($verification);

    return redirect(config('app.frontend_url')
        ."/payment/result?status={$payment->status->value}&code={$payment->diningSession->code}");
}

public function webhook(string $gateway, Request $request)
{
    $verification = $this->gateway->verifyWebhook($request);

    if (! $verification->valid) {
        return response()->json(['RspCode' => '97', 'Message' => 'Invalid signature']);
    }

    try {
        app(PaymentServiceInterface::class)->settle($verification);
        return response()->json(['RspCode' => '00', 'Message' => 'Confirm Success']);
    } catch (\Throwable $e) {
        Log::error('Payment webhook failed', ['error' => $e->getMessage()]);
        return response()->json(['RspCode' => '99', 'Message' => 'Unknown error']);
    }
}
```

> **Webhook phải nằm ngoài middleware CSRF và auth** — cổng thanh toán không có token của bạn. Bảo mật dựa hoàn toàn vào **xác thực chữ ký**. Nhấn mạnh điều này: endpoint public nhưng không hề mất an toàn, vì không ai giả được chữ ký khi không có `HashSecret`.
>
> **VNPay trả về định dạng RspCode riêng**, không phải HTTP status thông thường. Đây là thứ chỉ biết khi đọc tài liệu — chỉ ra trong video để người xem hiểu tầm quan trọng của việc đọc docs cổng thanh toán.

---

## Bước 5 — Frontend: màn thanh toán của khách

`BillView.vue` — mở khi bấm "Tính tiền":

```
┌────────────────────────────┐
│ ← Hóa đơn         Bàn 5    │
├────────────────────────────┤
│ 2× Trà sữa trân châu  84k  │
│    Size L · 50% · Trân châu│
│ 1× Cà phê sữa         29k  │
│ 1× Cold Brew          45k  │
├────────────────────────────┤
│ Tổng cộng          158.000đ│
├────────────────────────────┤
│ Chọn cách thanh toán:      │
│ ┌────────────────────────┐ │
│ │ 💳 Thanh toán online    │ │
│ │    Qua VNPay            │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ 💵 Thanh toán tại quầy  │ │
│ │    Gọi nhân viên tới    │ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

Bấm online:

```ts
async function payOnline() {
  loading.value = true
  try {
    const { data } = await client.post(`/sessions/${code}/checkout`, { gateway: 'vnpay' })
    // Lưu code trước khi rời app — quay về từ VNPay là app load lại từ đầu
    localStorage.setItem('cc_pending_payment', code)
    window.location.href = data.data.redirect_url
  } catch (e: any) {
    toast.error(e.response?.data?.message ?? 'Không tạo được giao dịch')
    loading.value = false
  }
}
```

Bấm tại quầy → gọi `request-bill` (đã có ở Phase 7) → hiện màn chờ: *"Đã báo nhân viên. Vui lòng đợi trong giây lát."*

`PaymentResultView.vue` (`/payment/result`) — xử lý 3 trạng thái:

| `status` | Hiển thị |
|---|---|
| `paid` | ✅ Thanh toán thành công · Cảm ơn quý khách! · nút "Về trang chủ" |
| `failed` | ❌ Thanh toán không thành công · lý do · nút "Thử lại" · nút "Thanh toán tại quầy" |
| `invalid` | ⚠️ Không xác thực được giao dịch · "Vui lòng liên hệ nhân viên" |

> **Bẫy dễ gặp:** khách quay về từ VNPay là app khởi động lại, `sessionStore` trống. Phải đọc `code` từ URL query (hoặc localStorage) rồi `GET /api/sessions/{code}` để lấy lại trạng thái. Nếu quên, khách sẽ thấy màn trắng ngay sau khi trả tiền — trải nghiệm tệ nhất có thể.

---

## Bước 6 — Frontend: màn thanh toán tại quầy

Trong `OrdersLiveView.vue`, nút "Đóng bàn" (đã disable từ Phase 6) giờ mở dialog:

```
┌──────────────────────────────────────┐
│ Thanh toán — Bàn 5 (A7K2QX)          │
├──────────────────────────────────────┤
│ 2× Trà sữa trân châu           84.000│
│ 1× Cà phê sữa                  29.000│
│ 1× Cold Brew                   45.000│
│ ─────────────────────────────────────│
│ TỔNG CỘNG                    158.000đ│
├──────────────────────────────────────┤
│ ⚠️ Còn 1 món chưa phục vụ xong        │
├──────────────────────────────────────┤
│ Hình thức:  [ Tiền mặt ] [Chuyển khoản]│
│                                       │
│ Khách đưa: [    200.000    ]          │
│ Tiền thừa:      42.000đ               │
├──────────────────────────────────────┤
│           [Hủy]  [XÁC NHẬN THANH TOÁN]│
└──────────────────────────────────────┘
```

**Ô "tiền khách đưa" + tính tiền thừa** là chi tiết nhỏ nhưng thu ngân dùng mỗi ngày. Thêm nút gợi ý nhanh: `[Đủ tiền] [200k] [500k]`. Chi tiết này cho thấy bạn nghĩ từ người dùng thật, không chỉ từ database.

Cảnh báo món chưa phục vụ: nếu có, checkbox xác nhận *"Tôi xác nhận đóng bàn dù còn món chưa xong"* mới cho bấm.

---

## Bước 7 — Test

```php
it('ghi nhận thanh toán tiền mặt và đóng phiên', function () {
    $session = DiningSession::factory()->hasOrders(1)->create(['total' => 100000]);

    $this->actingAs($this->staff, 'api')
        ->postJson("/api/admin/sessions/{$session->code}/pay", [
            'method' => 'cash', 'amount' => 100000,
        ])->assertOk();

    expect($session->fresh()->status)->toBe(SessionStatus::Closed)
        ->and($session->table->fresh()->status)->toBe(TableStatus::Available)
        ->and($session->payments()->first()->status)->toBe(PaymentStatus::Paid);
});

it('từ chối khi số tiền không khớp tổng hóa đơn', function () {
    $session = DiningSession::factory()->create(['total' => 100000]);

    $this->actingAs($this->staff, 'api')
        ->postJson("/api/admin/sessions/{$session->code}/pay", ['method' => 'cash', 'amount' => 50000])
        ->assertStatus(400);
});

it('không thanh toán được phiên đã đóng', function () {
    $session = DiningSession::factory()->create(['status' => 'closed', 'total' => 100000]);

    $this->actingAs($this->staff, 'api')
        ->postJson("/api/admin/sessions/{$session->code}/pay", ['method' => 'cash', 'amount' => 100000])
        ->assertStatus(400);
});

it('tạo URL VNPay có chữ ký hợp lệ', function () {
    $payment = Payment::factory()->create(['amount' => 158000]);

    $url = app(PaymentGatewayInterface::class)->createCheckout($payment);
    parse_str(parse_url($url, PHP_URL_QUERY), $params);

    expect($params['vnp_Amount'])->toBe('15800000')          // ×100
        ->and($params['vnp_TxnRef'])->toBe((string) $payment->id)
        ->and($params)->toHaveKey('vnp_SecureHash');

    // Chữ ký tự verify được
    expect(app(PaymentGatewayInterface::class)->verifyReturn($params)->valid)->toBeTrue();
});

it('từ chối chữ ký sai', function () {
    $payment = Payment::factory()->create(['amount' => 100000]);
    $url = app(PaymentGatewayInterface::class)->createCheckout($payment);
    parse_str(parse_url($url, PHP_URL_QUERY), $params);
    $params['vnp_Amount'] = '1';                              // sửa tiền

    expect(app(PaymentGatewayInterface::class)->verifyReturn($params)->valid)->toBeFalse();
});

it('webhook gọi nhiều lần chỉ chốt một lần — idempotent', function () {
    $session = DiningSession::factory()->create(['total' => 100000]);
    $payment = Payment::factory()->for($session, 'diningSession')
        ->create(['amount' => 100000, 'status' => 'pending']);

    $verification = new PaymentVerification(
        valid: true, success: true, gatewayRef: 'VNP123',
        paymentId: $payment->id, amount: 100000.0,
    );

    $service = app(PaymentServiceInterface::class);
    $service->settle($verification);
    $service->settle($verification);         // gọi lại
    $service->settle($verification);         // và lại

    expect(Payment::where('dining_session_id', $session->id)->where('status', 'paid')->count())
        ->toBe(1)
        ->and($session->fresh()->closed_at)->not->toBeNull();
});

it('đánh dấu failed khi số tiền webhook không khớp', function () {
    $payment = Payment::factory()->create(['amount' => 100000, 'status' => 'pending']);

    $v = new PaymentVerification(
        valid: true, success: true, gatewayRef: 'X',
        paymentId: $payment->id, amount: 1000.0,      // sai
    );

    expect(fn () => app(PaymentServiceInterface::class)->settle($v))
        ->toThrow(BusinessException::class);
    expect($payment->fresh()->status)->toBe(PaymentStatus::Failed);
});

it('đóng phiên thì bắn SessionClosed', function () {
    Event::fake([SessionClosed::class]);
    $session = DiningSession::factory()->create();

    app(SessionServiceInterface::class)->close($session);

    Event::assertDispatched(SessionClosed::class);
});
```

---

## Bước 8 — Thẻ test VNPay sandbox

Lưu vào README để người xem tự thử:

| Trường | Giá trị |
|---|---|
| Ngân hàng | NCB |
| Số thẻ | `9704198526191432198` |
| Tên chủ thẻ | `NGUYEN VAN A` |
| Ngày phát hành | `07/15` |
| OTP | `123456` |

---

## Definition of Done

- [ ] Thanh toán tiền mặt tại quầy → phiên đóng, bàn về "Trống", có tính tiền thừa
- [ ] Nhập sai số tiền → bị chặn kèm thông báo tổng đúng
- [ ] Khách bấm "Thanh toán online" → sang VNPay sandbox → nhập thẻ test → **quay về app thấy "Thành công"**
- [ ] Sau khi thanh toán online, bàn tự chuyển "Trống", khách thấy màn cảm ơn (qua `SessionClosed`)
- [ ] Gọi lại webhook thủ công 3 lần (Postman) → chỉ 1 payment `paid`, phiên không đóng lại lần hai
- [ ] Sửa `vnp_Amount` trong URL return → hệ thống từ chối
- [ ] Đóng bàn còn món chưa xong → phải tick xác nhận
- [ ] Quét lại QR bàn vừa đóng → **tạo phiên mới, giỏ hàng trống**
- [ ] Test pass
- [ ] Commit: `feat(payment): tiền mặt/chuyển khoản tại quầy + VNPay sandbox`

---

## Kịch bản quay video — Tập 8: "Thanh toán"

| Thời lượng | Nội dung |
|---|---|
| 0:00–2:00 | Ba hình thức sẽ làm: tiền mặt, chuyển khoản, VNPay online |
| 2:00–9:00 | **`PaymentGatewayInterface` + DTO `PaymentVerification`.** Điểm nhấn: VNPay và Stripe trả dữ liệu khác nhau hoàn toàn, DTO ép chúng nói cùng ngôn ngữ. Cho xem `StripeGateway` rỗng và giải thích: đây là chủ ý, chứng minh thêm cổng mới không đụng controller |
| 9:00–14:00 | Đăng ký VNPay sandbox trên màn hình, lấy TmnCode/HashSecret (che secret đi!). Đọc lướt tài liệu — cho người xem thấy quy trình đọc docs cổng thanh toán |
| 14:00–22:00 | `createCheckout`. **Ba chi tiết dừng lại kỹ:** `ksort` (lỗi số 1 khi tích hợp), `amount × 100`, `ExpireDate` |
| 22:00–28:00 | `verify`. **`hash_equals` chống timing attack** — giải thích cơ chế: so sánh chuỗi thường thoát sớm, kẻ tấn công đo thời gian dò từng ký tự. Đây là kiến thức bảo mật gây ấn tượng |
| 28:00–36:00 | **Điểm nhấn lớn nhất của tập — idempotency.** Vẽ tình huống: VNPay timeout, retry webhook 3 lần. Không xử lý → phiên đóng 3 lần, doanh thu đếm gấp 3. Rồi implement `lockForUpdate` + kiểm tra trạng thái |
| 36:00–41:00 | Return URL vs Webhook: cái nào là nguồn tin cậy? (Webhook — vì khách có thể đóng trình duyệt trước khi redirect về). Giải thích webhook không cần auth nhưng vẫn an toàn nhờ chữ ký |
| 41:00–48:00 | Frontend: màn hóa đơn + màn kết quả. **Bẫy:** quay về từ VNPay thì app load lại từ đầu, phải khôi phục session từ URL — demo lỗi màn trắng rồi sửa |
| 48:00–54:00 | Dialog thanh toán tại quầy + ô tiền khách đưa/tiền thừa. Nói: chi tiết này thu ngân dùng mỗi ngày, thiếu là họ phải bấm máy tính |
| 54:00–62:00 | **DEMO LỚN:** <br>1. Điện thoại: gọi 3 món → bấm Tính tiền → Thanh toán online → **sang trang VNPay thật** → nhập thẻ test → OTP → quay về "Thành công" <br>2. Cắt sang màn admin: bàn tự chuyển "Trống" theo thời gian thực <br>3. Quét lại QR bàn đó → phiên mới hoàn toàn |
| 62:00–66:00 | **Demo idempotency bằng Postman:** copy request webhook, gửi 3 lần → mở DB cho thấy vẫn chỉ 1 payment `paid`. Cảnh này rất thuyết phục về mặt kỹ thuật |
| 66:00–68:00 | Chốt: "Còn một tập nữa — báo cáo doanh thu và đưa lên internet." |

**Lưu ý an toàn khi quay:** che `VNPAY_HASH_SECRET` bằng blur hoặc dùng giá trị giả trong lúc quay. Nhắc người xem về `.env` không commit — đây là lỗi bảo mật phổ biến nhất của dev mới.
