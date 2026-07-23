# Phase 2 — Auth JWT + RBAC + màn Login

> **Mục tiêu:** Nhân viên/chủ quán đăng nhập được bằng JWT, có phân quyền admin/staff, frontend giữ token và tự refresh khi hết hạn.
> **Ước lượng:** 4–5h · **Demo cuối phase:** login `admin@demo.com` → vào `/admin`, F5 vẫn ở trong, token hết hạn tự refresh, logout thì bị đá ra.

---

## Bước 1 — Cấu hình jwt-auth

```bash
docker compose exec app php artisan vendor:publish \
  --provider="PHPOpenSourceSaver\JWTAuth\Providers\LaravelServiceProvider"
docker compose exec app php artisan jwt:secret
```

`config/auth.php`:

```php
'defaults' => ['guard' => 'api', 'passwords' => 'users'],

'guards' => [
    'web' => ['driver' => 'session', 'provider' => 'users'],
    'api' => ['driver' => 'jwt', 'provider' => 'users'],
],
```

`.env` (thêm vào cả `.env.example`):

```dotenv
JWT_SECRET=            # sinh bằng jwt:secret
JWT_TTL=60             # access token sống 60 phút
JWT_REFRESH_TTL=20160  # refresh trong vòng 14 ngày
JWT_BLACKLIST_ENABLED=true
```

`app/Models/User.php` implement contract:

```php
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable, HasRoles;

    public function getJWTIdentifier(): mixed { return $this->getKey(); }

    /** Nhét roles vào payload để frontend không phải gọi thêm /me */
    public function getJWTCustomClaims(): array
    {
        return [
            'name'  => $this->name,
            'roles' => $this->getRoleNames()->toArray(),
        ];
    }
}
```

> **Vì sao JWT chứ không Sanctum?** Ba client (khách/bếp/admin) sẽ chạy ở domain khác backend (Vercel ↔ Fly.io). Cookie cross-domain rắc rối; Bearer token trong header thì không. Ngoài ra màn KDS có thể mở trên tablet ở chế độ kiosk — token trong localStorage tiện hơn cookie.

---

## Bước 2 — RBAC với spatie/laravel-permission

```bash
docker compose exec app php artisan vendor:publish \
  --provider="Spatie\Permission\PermissionServiceProvider"
docker compose exec app php artisan migrate
```

`config/permission.php`: đổi `'guard_name' => 'api'` trong phần default.

`database/seeders/RoleSeeder.php`:

```php
$permissions = [
    'menu.manage',      // CRUD danh mục, món, tùy chọn
    'table.manage',     // CRUD bàn, sinh QR
    'order.view',       // xem đơn live + lịch sử
    'order.update',     // đổi trạng thái món (KDS)
    'session.close',    // đóng bàn
    'payment.record',   // ghi nhận thanh toán
    'report.view',      // xem báo cáo
    'user.manage',      // quản lý nhân viên
];

foreach ($permissions as $p) {
    Permission::firstOrCreate(['name' => $p, 'guard_name' => 'api']);
}

$admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
$admin->syncPermissions($permissions);           // admin có tất cả

$staff = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'api']);
$staff->syncPermissions([
    'order.view', 'order.update', 'session.close', 'payment.record',
]);
```

Cập nhật `UserSeeder` gán role:

```php
User::firstOrCreate(['email' => 'admin@demo.com'], [
    'name' => 'Chủ quán', 'password' => Hash::make('password'),
])->assignRole('admin');

User::firstOrCreate(['email' => 'barista@demo.com'], [
    'name' => 'Barista', 'password' => Hash::make('password'),
])->assignRole('staff');
```

> **Chốt mô hình quyền:** dùng **permission** để check trong code (`can:menu.manage`), **role** chỉ là túi gom permission. Đừng bao giờ check `hasRole('admin')` rải rác trong controller — sau này thêm role "Quản lý ca" là phải sửa khắp nơi.

---

## Bước 3 — AuthController

```bash
docker compose exec app php artisan make:controller AuthController
docker compose exec app php artisan make:request LoginRequest
docker compose exec app php artisan make:resource UserResource
```

```php
class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $token = auth('api')->attempt($request->validated());

        if (! $token) {
            return response()->json(['message' => 'Email hoặc mật khẩu không đúng'], 401);
        }

        return $this->tokenResponse($token);
    }

    public function refresh()
    {
        return $this->tokenResponse(auth('api')->refresh());
    }

    public function logout()
    {
        auth('api')->logout();   // đưa token vào blacklist
        return response()->json(['message' => 'Đã đăng xuất']);
    }

    public function me()
    {
        return response()->json([
            'data' => new UserResource(auth('api')->user()),
            'message' => 'OK',
        ]);
    }

    private function tokenResponse(string $token)
    {
        return response()->json([
            'data' => [
                'access_token' => $token,
                'token_type'   => 'bearer',
                'expires_in'   => auth('api')->factory()->getTTL() * 60,
                'user'         => new UserResource(auth('api')->user()),
            ],
            'message' => 'OK',
        ]);
    }
}
```

`UserResource`:

```php
return [
    'id' => $this->id,
    'name' => $this->name,
    'email' => $this->email,
    'roles' => $this->getRoleNames(),
    'permissions' => $this->getAllPermissions()->pluck('name'),
];
```

> Trả cả `permissions` xuống frontend để ẩn/hiện menu sidebar. **Nhưng đây chỉ là UX** — backend vẫn phải check quyền ở mọi endpoint. Nhấn mạnh điều này trong video: ẩn nút không phải là bảo mật.

---

## Bước 4 — Routes & rate limit

`routes/api.php`:

```php
Route::prefix('auth')->group(function () {
    Route::post('login',   [AuthController::class, 'login'])
        ->middleware('throttle:5,1');                      // chống brute-force: 5 lần/phút
    Route::middleware('auth:api')->group(function () {
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::post('logout',  [AuthController::class, 'logout']);
        Route::get('me',       [AuthController::class, 'me']);
    });
});
```

Test bằng curl trước khi làm frontend:

```bash
curl -X POST localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"password"}'

curl localhost:8000/api/auth/me -H "Authorization: Bearer <token>"
```

---

## Bước 5 — Xử lý lỗi auth trả JSON

Mặc định Laravel redirect về route `login` khi chưa auth → API sẽ trả HTML 500. Sửa `bootstrap/app.php`:

```php
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->render(function (AuthenticationException $e, $request) {
        if ($request->is('api/*')) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }
    });
    $exceptions->render(function (AuthorizationException $e, $request) {
        if ($request->is('api/*')) {
            return response()->json(['message' => 'Không có quyền thực hiện'], 403);
        }
    });
})
```

---

## Bước 6 — Frontend: authStore (Pinia)

`frontend/src/types/auth.ts`:

```ts
export interface User {
  id: number
  name: string
  email: string
  roles: string[]
  permissions: string[]
}
```

`frontend/src/stores/auth.ts`:

```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { client } from '@/api/client'
import type { User } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('cc_token'))
  const user  = ref<User | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const can = (permission: string) => user.value?.permissions.includes(permission) ?? false

  function setToken(value: string | null) {
    token.value = value
    value ? localStorage.setItem('cc_token', value) : localStorage.removeItem('cc_token')
  }

  async function login(email: string, password: string) {
    const { data } = await client.post('/auth/login', { email, password })
    setToken(data.data.access_token)
    user.value = data.data.user
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const { data } = await client.get('/auth/me')
      user.value = data.data
    } catch {
      setToken(null)
      user.value = null
    }
  }

  async function logout() {
    try { await client.post('/auth/logout') } catch { /* token có thể đã hết hạn */ }
    setToken(null)
    user.value = null
  }

  return { token, user, isAuthenticated, can, login, logout, fetchMe, setToken }
})
```

---

## Bước 7 — Axios interceptor: gắn token + tự refresh

Đây là phần **kỹ thuật đáng quay nhất của phase**. Xử lý đúng bài toán: nhiều request cùng lúc bị 401 thì chỉ gọi refresh **một lần**, các request còn lại xếp hàng chờ.

`frontend/src/api/client.ts`:

```ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { Accept: 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let queue: Array<(token: string | null) => void> = []

function flushQueue(token: string | null) {
  queue.forEach((cb) => cb(token))
  queue = []
}

client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Chỉ xử lý 401, và không lặp vô hạn khi chính /auth/refresh trả 401
    if (error.response?.status !== 401 || original._retry
        || original.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Đang có request khác refresh → xếp hàng chờ
      return new Promise((resolve, reject) => {
        queue.push((token) => {
          if (!token) return reject(error)
          original.headers.Authorization = `Bearer ${token}`
          resolve(client(original))
        })
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const { data } = await client.post('/auth/refresh')
      const newToken = data.data.access_token
      localStorage.setItem('cc_token', newToken)
      flushQueue(newToken)
      original.headers.Authorization = `Bearer ${newToken}`
      return client(original)
    } catch (e) {
      flushQueue(null)
      localStorage.removeItem('cc_token')
      window.location.href = '/admin/login'
      return Promise.reject(e)
    } finally {
      isRefreshing = false
    }
  },
)
```

---

## Bước 8 — Màn Login

```bash
cd frontend && npx shadcn-vue@latest add input label form sonner
```

`src/views/admin/LoginView.vue` — form email/password, hiện lỗi 401 bằng toast, disable nút khi đang gửi, và **nút "Điền tài khoản demo"** (rất hữu ích cho nhà tuyển dụng bấm thử và cho chính bạn khi quay video).

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

const email = ref(''), password = ref(''), loading = ref(false)
const auth = useAuthStore()
const router = useRouter()

function fillDemo() { email.value = 'admin@demo.com'; password.value = 'password' }

async function submit() {
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/admin')
  } catch (e: any) {
    toast.error(e.response?.data?.message ?? 'Đăng nhập thất bại')
  } finally {
    loading.value = false
  }
}
</script>
```

---

## Bước 9 — Route guard

`src/router/index.ts`:

```ts
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Khôi phục user sau khi F5 (có token nhưng chưa có user trong memory)
  if (auth.token && !auth.user) await auth.fetchMe()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && auth.isAuthenticated) {
    return auth.landingRoute
  }
  if (to.meta.permission && !auth.can(to.meta.permission as string)) {
    return to.path === auth.landingRoute ? false : auth.landingRoute
  }
})
```

Route KDS `/kitchen` cũng đặt `meta: { requiresAuth: true, permission: 'order.update' }`.

> **Đừng redirect cứng về `/admin`.** `/admin` redirect tiếp sang `/admin/menu` (cần `menu.manage`), mà role `staff` không có quyền đó → guard lại đá về `/admin` → **vòng lặp redirect vô hạn, staff không đăng nhập được**. Landing route phải là màn đầu tiên user *có quyền vào*:
>
> ```ts
> // stores/auth.ts
> const landingRoute = computed(() => {
>   if (can('menu.manage')) return '/admin/menu/items'
>   if (can('order.view'))  return '/admin/orders/live'
>   return '/admin/profile'
> })
> ```
>
> Đây là hệ quả trực tiếp của quyết định "Staff dùng chung màn admin" ở `system_overview.md` §2 — admin và staff vào cùng `/admin` nhưng thấy hai thứ khác nhau. Xem `docs/design/06_staff_flow.md` §6.
>
> Cũng vì vậy route `/admin` **không** đặt `redirect: '/admin/menu'` tĩnh như ở Phase 0, mà `redirect: () => useAuthStore().landingRoute`.

---

## Bước 10 — AdminLayout

Sidebar + header có tên user và nút Đăng xuất. Menu sidebar render theo `auth.can(...)`:

| Mục | Permission | Route | Staff thấy? |
|---|---|---|---|
| Quản lý menu | `menu.manage` | `/admin/menu/items` | ❌ |
| Quản lý bàn | `table.manage` | `/admin/tables` | ❌ |
| Đơn hàng | `order.view` | `/admin/orders/live` | ✅ |
| Lịch sử đơn | `order.view` | `/admin/orders/history` | ✅ |
| Báo cáo | `report.view` | `/admin/reports` | ❌ |

Không có permission thì **ẩn hẳn** mục khỏi sidebar, không disable. Role `staff` vì vậy chỉ thấy 2 mục — đó chính là "màn Staff", không cần layout riêng.

Các route con này chưa có view — tạo file placeholder, sẽ điền ở Phase 3, 4, 6, 9.

---

## Bước 11 — Test

`tests/Feature/AuthTest.php`:

```php
it('đăng nhập thành công trả về access token', function () {
    $user = User::factory()->create(['password' => Hash::make('password')]);

    $this->postJson('/api/auth/login', [
        'email' => $user->email, 'password' => 'password',
    ])->assertOk()->assertJsonStructure(['data' => ['access_token', 'expires_in', 'user']]);
});

it('từ chối sai mật khẩu', function () {
    $user = User::factory()->create();
    $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'sai'])
        ->assertStatus(401);
});

it('chặn truy cập route cần quyền khi thiếu permission', function () {
    $staff = User::factory()->create();
    $staff->assignRole('staff');

    $this->actingAs($staff, 'api')
        ->getJson('/api/admin/categories')
        ->assertStatus(403);
});
```

Test thứ ba sẽ đỏ cho tới Phase 3 (chưa có route đó) — **đó là chủ ý**, viết trước rồi Phase 3 làm cho xanh.

---

## Definition of Done

- [ ] Login qua curl trả token; `/auth/me` trả đúng roles + permissions
- [ ] Login trên UI → vào `/admin`; **F5 không bị đá ra**
- [ ] Truy cập `/admin` khi chưa login → chuyển về `/admin/login`
- [ ] Sửa `JWT_TTL=1` (1 phút), chờ hết hạn, bấm một action → tự refresh, không văng ra (nhớ trả về 60 sau khi test)
- [ ] Sidebar admin hiện đủ 4 mục; login bằng `barista@demo.com` thì các mục thiếu quyền bị ẩn
- [ ] Logout → token vào blacklist, dùng lại token cũ trả 401
- [ ] Commit: `feat(auth): JWT + RBAC + màn login admin`

---

## Kịch bản quay video — Tập 2: "Đăng nhập & phân quyền"

| Thời lượng | Nội dung |
|---|---|
| 0:00–2:00 | Vì sao chọn **JWT thay vì Sanctum** cho dự án này — vẽ sơ đồ: FE ở Vercel, BE ở Fly.io, hai domain khác nhau |
| 2:00–6:00 | Cài jwt-auth, `jwt:secret`, implement `JWTSubject`. Giải thích custom claims |
| 6:00–11:00 | spatie/laravel-permission. Nhấn mạnh: **check permission chứ đừng check role**, nói rõ vì sao |
| 11:00–15:00 | AuthController + test bằng curl/Postman **trước khi** đụng frontend. Đây là thói quen tốt nên khoe |
| 15:00–18:00 | Sửa exception handler trả JSON thay vì HTML — quay cảnh lỗi HTML trước, rồi sửa |
| 18:00–25:00 | **Điểm nhấn kỹ thuật của tập:** interceptor tự refresh token. Vẽ sơ đồ 3 request cùng bị 401, giải thích vì sao cần hàng đợi, nếu không thì gọi refresh 3 lần và 2 lần sau thất bại |
| 25:00–30:00 | Màn login + guard + sidebar theo quyền |
| 30:00–34:00 | **Demo:** đặt `JWT_TTL=1`, ngồi chờ 1 phút trên camera, bấm nút → mở DevTools Network cho thấy 401 → refresh → request gốc chạy lại thành công. Cảnh này rất "đã" |
| 34:00–36:00 | Login bằng barista cho thấy sidebar ẩn bớt mục. Nhắc lại: ẩn UI không phải bảo mật, backend vẫn chặn |
| 36:00–37:00 | Chốt tập, preview: quản lý menu |
