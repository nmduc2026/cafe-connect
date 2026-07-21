# Phase 0 — Khởi tạo dự án & môi trường

> **Mục tiêu:** Từ repo trống đến chỗ `docker compose up` là có Laravel 12 API + Vue 3 chạy song song, gọi được nhau qua HTTP.
> **Ước lượng:** 3–4h · **Demo cuối phase:** mở `localhost:5173` thấy trang Vue hiển thị chuỗi trả về từ `GET /api/health` của Laravel.

---

## Kết quả mong đợi

```
cafe-connect/
├── backend/          # Laravel 12
│   ├── docker-compose.yml
│   └── docker/
│       └── Dockerfile
├── frontend/         # Vue 3 + Vite + TS + Tailwind + shadcn-vue
├── docs/
└── README.md
```

---

## Bước 1 — Chuẩn bị repo

```bash
cd d:/Work/Profile/cafe-connect
```

Tạo `.gitignore` ở gốc:

```gitignore
node_modules/
vendor/
.env
.env.*.local
/backend/storage/*.key
/backend/public/storage
/frontend/dist
.DS_Store
*.log
```

> Lưu ý: **không** commit `.env`, nhưng **phải** commit `.env.example` của cả backend lẫn frontend — người xem video sẽ clone repo về chạy.

---

## Bước 2 — Khởi tạo backend Laravel 12

```bash
composer create-project laravel/laravel backend
cd backend
php artisan --version   # kỳ vọng: Laravel Framework 12.x
```

Cài các package sẽ dùng xuyên suốt (cài luôn một lượt cho gọn, dùng dần ở các phase sau):

```bash
composer require php-open-source-saver/jwt-auth
composer require spatie/laravel-permission
composer require simplesoftwareio/simple-qrcode
composer require laravel/reverb
```

Bật API routes (Laravel 11+ không tạo `routes/api.php` mặc định). **Không dùng
`php artisan install:api`** — lệnh đó kéo theo Sanctum và migration
`personal_access_tokens`, trong khi dự án này auth bằng JWT. Tự tạo
`routes/api.php` rỗng rồi khai báo trong `bootstrap/app.php`:

```php
->withRouting(
    api: __DIR__.'/../routes/api.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

Không khai báo `web:` vì backend là API thuần. Xóa luôn `routes/web.php`,
`resources/`, `vite.config.js`, `package.json` của Laravel — frontend là dự án Vue
riêng. (Phase 4 cần trang in Blade thì tạo lại `resources/views/` lúc đó;
Phase 7 broadcasting sẽ thêm `->withBroadcasting()`.)

> `health: '/up'` vẫn hoạt động dù không có `web.php`, và `HandleCors` đã nằm sẵn
> trong global middleware của Laravel 11+ nên CORS không cần đăng ký thêm.

---

## Bước 3 — Cấu hình database Postgres

Sửa `backend/.env`:

```dotenv
APP_NAME="Cafe connect"
APP_URL=http://localhost:8000
APP_TIMEZONE="Asia/Ho_Chi_Minh"

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=cafe_connect
DB_USERNAME=cafe
DB_PASSWORD=123456

REDIS_CLIENT=phpredis
REDIS_HOST=redis
REDIS_PORT=6379

CACHE_STORE=redis
QUEUE_CONNECTION=redis

FRONTEND_URL=http://localhost:5173
```

Và sửa `config/app.php`: `'timezone' => env('APP_TIMEZONE', 'Asia/Ho_Chi_Minh'),`

> `DB_USERNAME` phải **trùng `POSTGRES_USER`** trong `docker-compose.yml` ở Bước 4
> (`cafe`), nếu không `/api/health` sẽ không bao giờ trả `db: ok`. Nếu đã lỡ `up`
> với user khác thì phải `docker compose down -v` mới init lại được volume.
>
> `APP_TIMEZONE` phải có giá trị thật, **không để rỗng** — `env('APP_TIMEZONE', ...)`
> với dòng `APP_TIMEZONE=` trả về chuỗi rỗng chứ không rơi về default.
>
> `SESSION_DRIVER` để nguyên mặc định `database`: backend không có route `web`,
> `StartSession` không bao giờ chạy, auth bằng JWT trong header nên giá trị này
> không ảnh hưởng gì.

Copy nguyên nội dung này sang `backend/.env.example` (giữ `APP_KEY` rỗng — người
clone repo sẽ tự `php artisan key:generate`. **Không commit key thật.**)

> **Vì sao Postgres ngay từ đầu?** Production sẽ dùng Neon (Postgres). Dev bằng MySQL rồi deploy Postgres là công thức gặp lỗi lệch kiểu dữ liệu ở phút chót. Thống nhất một loại DB từ đầu.

---

## Bước 4 — Docker Compose

Tạo `backend/docker-compose.yml`:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile
    volumes:
      - .:/var/www/html
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    command: php artisan serve --host=0.0.0.0 --port=8000

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: cafe_connect
      POSTGRES_USER: cafe
      POSTGRES_PASSWORD: 123456
    ports:
      - "5433:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cafe -d cafe_connect"]
      interval: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    ports:
      - "6380:6379"

volumes:
  pgdata:
```

> Cổng host dùng `5433`/`6380` để không đụng Postgres/Redis đang cài sẵn trên máy.
> Service `reverb` sẽ được thêm ở **Phase 7**, chưa cần bây giờ.
> Các lệnh `docker compose` trong toàn bộ tài liệu đều chạy từ thư mục `backend/`.

Tạo `backend/docker/Dockerfile`:

```dockerfile
FROM php:8.3-cli-alpine

RUN apk add --no-cache \
    postgresql-dev libzip-dev icu-dev oniguruma-dev git unzip \
    freetype-dev libjpeg-turbo-dev libpng-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_pgsql zip intl bcmath pcntl

# imagick: QrCode::format('png') dùng ImagickImageBackEnd, không dùng gd
# redis: driver cho cache/queue/broadcast (REDIS_CLIENT=phpredis)
RUN apk add --no-cache imagemagick \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS imagemagick-dev \
    && yes '' | pecl install imagick redis \
    && docker-php-ext-enable imagick redis \
    && apk del .build-deps

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Cache layer Composer: chỉ đổi khi composer.json/lock đổi
COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-scripts

COPY . .
RUN composer install --no-interaction --prefer-dist

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
```

> **Vì sao cài sẵn gd/imagick/redis ngay từ Phase 0** dù mãi Phase 4 và Phase 7 mới
> dùng: `composer install` kiểm tra platform requirement. `simplesoftwareio/simple-qrcode`
> khai báo `"ext-gd"` trong `require`, thiếu là **build fail ngay**. Còn `imagick` thì
> composer không ép (nằm ở `suggest`) nhưng runtime mới là chỗ cần —
> `QrCode::format('png')` gọi `ImagickImageBackEnd`, không đụng gd. Tức là gd cho
> qua cửa cài đặt, imagick mới thực sự vẽ được ảnh; thiếu nó thì build xanh mà tới
> Phase 4 endpoint `qr.png` mới chết. `ext-redis` tương tự: `CACHE_STORE=redis` +
> `REDIS_CLIENT=phpredis` mà thiếu ext thì request đầu tiên chạm cache đã `Class "Redis" not found`.

> **Hai tầng `composer install`** để tận dụng cache layer Docker: tầng đầu chỉ copy
> `composer.json`/`composer.lock` nên sửa code app không làm tải lại vendor.
> `--no-scripts` ở tầng này là bắt buộc — chưa có file `artisan` thì
> `post-autoload-dump` (`artisan package:discover`) sẽ lỗi. Tầng sau chạy lại đầy đủ
> để dump autoload và discover package.

> **Lưu ý về bind mount:** compose mount `.:/var/www/html`, tức `vendor/` trên host
> **đè lên** `vendor/` đã build trong image. Nên ở dev luôn cài package **từ trong
> container** — `docker compose exec app composer require ...` — chứ đừng chạy
> composer trên máy host, tránh vendor bị resolve theo bộ extension của Windows.

Tạo `backend/.dockerignore` để build image nhanh hơn (không copy `vendor/`, cache, log…):

```gitignore
/vendor
/node_modules
.env
.env.*
!.env.example
storage/logs/*
storage/framework/cache/*
storage/framework/sessions/*
storage/framework/views/*
bootstrap/cache/*
.git
.gitignore
.gitattributes
.phpunit.result.cache
phpunit.xml
docker-compose.yml
README.md
tests
```

Chạy thử:

```bash
cd backend
docker compose up -d --build
docker compose exec app php artisan migrate
curl http://localhost:8000/up
```

**Checkpoint:** `/up` trả về trang health check của Laravel.

---

## Bước 5 — Endpoint `/api/health`

`backend/routes/api.php`:

```php
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'data' => [
        'app' => config('app.name'),
        'time' => now()->toIso8601String(),
        'db' => \DB::connection()->getPdo() ? 'ok' : 'down',
    ],
    'message' => 'OK',
]));
```

```bash
curl http://localhost:8000/api/health
```

---

## Bước 6 — CORS

`backend/config/cors.php` (chạy `php artisan config:publish cors` nếu chưa có):

```php
'paths' => ['api/*', 'broadcasting/auth'],
'allowed_methods' => ['*'],
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
'allowed_headers' => ['*'],
'supports_credentials' => false,
```

> `supports_credentials = false` vì ta dùng **JWT trong header**, không dùng cookie. Đơn giản hơn và không cần Sanctum stateful domain.

---

## Bước 7 — Khởi tạo frontend Vue 3

```bash
cd d:/Work/Profile/cafe-connect
npm create vite@latest frontend -- --template vue-ts
cd frontend
npm install
npm install axios pinia vue-router
npm install -D tailwindcss @tailwindcss/vite
```

`frontend/vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    host: true,     // để điện thoại trong cùng LAN truy cập được — cần cho Phase 5
    port: 5173,
  },
})
```

`frontend/src/style.css`:

```css
@import "tailwindcss";
```

`frontend/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## Bước 8 — shadcn-vue

```bash
npx shadcn-vue@latest init
```

Trả lời prompt: TypeScript = yes, base color = Slate, alias `@/components` và `@/lib/utils`.

Thêm vài component nền để test:

```bash
npx shadcn-vue@latest add button card badge
```

**Checkpoint:** thư mục `src/components/ui/` có `button`, `card`, `badge`.

---

## Bước 9 — Axios client + kiểm tra kết nối FE ↔ BE

`frontend/src/api/client.ts`:

```ts
import axios from 'axios'

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { Accept: 'application/json' },
})

// interceptor gắn Bearer token sẽ được thêm ở Phase 2
```

`frontend/src/App.vue` — trang tạm để nghiệm thu phase:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { client } from '@/api/client'
import { Button } from '@/components/ui/button'

const health = ref<string>('đang kiểm tra...')

async function check() {
  try {
    const { data } = await client.get('/health')
    health.value = `${data.data.app} · db=${data.data.db} · ${data.data.time}`
  } catch (e) {
    health.value = 'Không kết nối được backend'
  }
}
onMounted(check)
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center gap-4">
    <h1 class="text-2xl font-bold">cafe-connect</h1>
    <p class="text-sm text-muted-foreground">{{ health }}</p>
    <Button @click="check">Kiểm tra lại</Button>
  </main>
</template>
```

```bash
npm run dev
```

---

## Bước 10 — Router & 3 layout rỗng

Dựng sẵn khung 3 app để các phase sau chỉ việc điền vào.

`frontend/src/router/index.ts`:

```ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/t/demo' },

  // Customer — không cần đăng nhập
  {
    path: '/t/:qrToken',
    component: () => import('@/layouts/CustomerLayout.vue'),
    children: [
      { path: '', name: 'menu', component: () => import('@/views/customer/MenuView.vue') },
    ],
  },

  // Kitchen
  {
    path: '/kitchen',
    component: () => import('@/layouts/KitchenLayout.vue'),
    children: [
      { path: '', name: 'kds', component: () => import('@/views/kitchen/KdsBoard.vue') },
    ],
  },

  // Admin
  { path: '/admin/login', name: 'login', component: () => import('@/views/admin/LoginView.vue') },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/menu' },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

Tạo file rỗng-tối-thiểu cho từng layout/view được tham chiếu ở trên (mỗi file chỉ cần `<template><RouterView /></template>` hoặc một `<div>` tên màn hình) để router không lỗi.

`frontend/src/main.ts`:

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router'
import App from './App.vue'
import './style.css'

createApp(App).use(createPinia()).use(router).mount('#app')
```

---

## Bước 11 — README khởi điểm

Viết `README.md` ở gốc với: mô tả 3 dòng, ảnh sơ đồ kiến trúc (để trống, điền ở Phase 9), và **hướng dẫn chạy local**:

```bash
git clone <repo> && cd cafe-connect
cp backend/.env.example backend/.env
cd backend
docker compose up -d --build
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
cd ../frontend && npm install && npm run dev
```

---

## Definition of Done

- [ ] `cd backend && docker compose up -d --build` chạy sạch từ máy chưa có gì
- [ ] `curl localhost:8000/api/health` trả JSON có `db: ok`
- [ ] `npm run dev` → `localhost:5173` hiển thị chuỗi health lấy từ backend (không lỗi CORS)
- [ ] Truy cập `localhost:5173` từ **điện thoại cùng WiFi** cũng thấy trang (dùng IP LAN)
- [ ] 3 route `/t/demo`, `/kitchen`, `/admin/login` đều mở được, không lỗi console
- [ ] Đã commit: `chore(setup): khởi tạo Laravel 12 + Vue 3 + Docker`

---

## Kịch bản quay video — Tập 0: "Dựng nền"

| Thời lượng | Nội dung |
|---|---|
| 0:00–1:30 | Giới thiệu dự án: quét QR gọi món ở quán cafe. Chiếu sơ đồ 10 phase. Nói rõ 3 điểm kỹ thuật sẽ khoe: real-time, dining session, snapshot giá |
| 1:30–4:00 | `composer create-project` + cài package. **Tua nhanh** phần tải |
| 4:00–8:00 | Viết `backend/docker-compose.yml`, `docker/Dockerfile`, `.dockerignore` — giải thích vì sao chọn Postgres từ đầu, vì sao map cổng 5433 |
| 8:00–10:00 | `docker compose up` lần đầu. Nếu lỗi thì **giữ nguyên lỗi trong video** và debug — đây là phần người xem thích nhất |
| 10:00–14:00 | Khởi tạo Vue + Tailwind + shadcn-vue |
| 14:00–17:00 | Nối FE ↔ BE, gặp lỗi CORS, sửa `config/cors.php` — **cố ý quay đoạn này**, ai cũng từng dính |
| 17:00–19:00 | Demo cuối: trang Vue hiện `cafe-connect · db=ok`. Mở điện thoại quét IP LAN cho thấy chạy được trên mobile |
| 19:00–20:00 | Chốt tập, preview tập sau: thiết kế database |

**Chuẩn bị trước khi bấm quay:** đã `composer` và `npm install` sẵn một lần ở thư mục khác để cache tải về, tránh chờ 5 phút trong video.
