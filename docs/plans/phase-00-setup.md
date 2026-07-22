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

Bật API routes (Laravel 11+ không tạo `routes/api.php` mặc định). Tạo file rỗng
`backend/routes/api.php` — nội dung sẽ điền ở Bước 5 — rồi khai báo trong
`bootstrap/app.php`:

```php
->withRouting(
    api: __DIR__.'/../routes/api.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

Dọn phần frontend của Laravel — dự án này backend là API thuần:

```bash
rm -rf resources routes/web.php vite.config.js package.json
```

> **Không chạy `php artisan install:api`** dù tài liệu Laravel khuyên vậy: lệnh đó
> kéo theo Sanctum và migration `personal_access_tokens`, còn ta auth bằng JWT.
>
> Không khai báo `web:` cũng không sao — `health: '/up'` vẫn được đăng ký, và
> `HandleCors` nằm sẵn trong global middleware của Laravel 11+.
>
> Phase 4 cần trang in Blade thì tạo lại `resources/views/` lúc đó; Phase 7 thêm
> `->withBroadcasting()`.

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

Sửa `config/app.php`:

```php
'timezone' => env('APP_TIMEZONE', 'Asia/Ho_Chi_Minh'),
```

Copy nguyên nội dung `.env` sang `backend/.env.example`, giữ `APP_KEY` rỗng.

> **Vì sao Postgres ngay từ đầu?** Production sẽ dùng Neon (Postgres). Dev bằng MySQL rồi deploy Postgres là công thức gặp lỗi lệch kiểu dữ liệu ở phút chót. Thống nhất một loại DB từ đầu.
>
> `DB_USERNAME` phải trùng `POSTGRES_USER` ở Bước 4. `APP_TIMEZONE` phải có giá trị,
> để rỗng thì `env()` trả chuỗi rỗng chứ không rơi về default. `SESSION_DRIVER` giữ
> mặc định `database` — không có route `web` nên nó không được dùng tới.

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

> **Cài sẵn cả gd lẫn imagick** dù đều cho QR: `simple-qrcode` khai báo `ext-gd` ở
> `require` nên thiếu gd là composer fail lúc build; còn `QrCode::format('png')`
> lại gọi `ImagickImageBackEnd` nên thiếu imagick thì build vẫn xanh mà tới Phase 4
> endpoint `qr.png` mới chết. `ext-redis` cho `CACHE_STORE=redis` ở Bước 3.
>
> **Hai tầng `composer install`** để tận dụng cache layer: sửa code app không làm
> tải lại vendor. `--no-scripts` ở tầng đầu là bắt buộc vì chưa có file `artisan`.
>
> Compose bind-mount `.:/var/www/html` nên `vendor/` host đè lên `vendor/` trong
> image — về sau cài package phải chạy `docker compose exec app composer require ...`.

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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'data' => [
        'app' => config('app.name'),
        'time' => now()->toDateTimeString(),
        'db' => DB::connection()->getPdo() ? 'ok' : 'down',
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

Scaffold bằng CLI của shadcn-vue — một lệnh ra sẵn Vite + TS + Tailwind 4 + theme.
Đặt tên project là `frontend`:

```bash
cd d:/Work/Profile/cafe-connect
npx shadcn-vue@latest init --preset a27HcWka --template vite --pointer
cd frontend
npm install axios pinia vue-router@4
npm install -D @types/node
```

Thêm `types` và `vite.config.ts` vào `frontend/tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    // ...
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue", "vite.config.ts"]
}
```

Thêm `server` vào `frontend/vite.config.ts`, giữ nguyên phần preset sinh ra:

```ts
  server: {
    host: true, // để điện thoại trong cùng LAN truy cập được — cần cho Phase 5
    port: 5173,
  },
```

Thêm script vào `frontend/package.json`:

```json
"type-check": "vue-tsc --noEmit"
```

Tạo `frontend/.env` và `frontend/.env.example` cùng nội dung:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api
```

Tạo `frontend/src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

> Khai từng biến `VITE_*` để `import.meta.env` được gợi ý và bắt lỗi typo.
>
> Shim `*.vue` là để TS server của VS Code resolve được `import ... from '*.vue'`
> trong file `.ts` — nó không đọc `.vue`, chỉ Volar và `vue-tsc` đọc được. Thiếu shim
> thì `src/router/index.ts` đỏ hết dòng `import()` dù `npm run type-check` vẫn sạch.

Thêm `dist` và `*.tsbuildinfo` vào `frontend/.gitignore`.

```bash
npm run type-check
```

**Checkpoint:** `type-check` chạy sạch.

> Preset `a27HcWka` (style `reka-vega`, font Geist, base color neutral) đặt CSS ở
> `src/assets/index.css` và sinh `tsconfig.json` phẳng một file — khác `npm create vite`,
> mọi đường dẫn từ đây bám theo preset. Preset cũng không sinh `vite-env.d.ts` và
> `vite.config.ts` của nó dùng `node:url` — nên phải tự thêm cả hai thứ trên,
> nếu không TS báo lỗi ở `vite.config.ts` và `src/api/client.ts`.

---

## Bước 8 — Component shadcn-vue

Preset đã cấu hình sẵn `components.json`, chỉ cần thêm component:

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
import './assets/index.css'

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
cd ../frontend
cp .env.example .env
npm install && npm run dev
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
