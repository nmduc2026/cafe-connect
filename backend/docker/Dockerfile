FROM php:8.3-cli-alpine

RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    git \
    unzip \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        gd \
        pdo \
        pdo_pgsql \
        zip \
        intl \
        bcmath \
        pcntl

# imagick: QrCode::format('png') dùng ImagickImageBackEnd, không dùng gd
# redis: driver cho cache/queue/broadcast (REDIS_CLIENT=phpredis)
RUN apk add --no-cache imagemagick \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS imagemagick-dev \
    && yes '' | pecl install imagick redis \
    && docker-php-ext-enable imagick redis \
    && apk del .build-deps

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Cache layer Composer 
COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-scripts

COPY . .
RUN composer install --no-interaction --prefer-dist

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]