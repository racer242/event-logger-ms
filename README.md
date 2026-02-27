# Event Logger MS

Микросервис для сбора, обработки и хранения событий промо-портала системы управления лояльностью.

## Описание

Сервис предоставляет централизованный приём событий от всех компонентов платформы, гарантию доставки и сохранения значимых событий, а также поддержку аналитической обработки данных.

## Технологический стек

- **Framework**: NestJS 11
- **Database**: PostgreSQL (по умолчанию), MySQL, MariaDB, SQLite, MSSQL, Oracle, SAP Hana, Better-SQLite3
- **ORM**: TypeORM
- **Валидация**: class-validator, class-transformer
- **Документация**: Swagger (OpenAPI 3.0)

## Установка

```bash
npm install
```

## Настройка

Создайте файл `.env` с параметрами подключения к базе данных и настройками сервера:

```env
# Тип базы данных (поддерживаемые TypeORM значения)
# Возможные значения: mysql, mariadb, postgres, cockroachdb, sqlite, mssql, oracle, sap, better-sqlite3
DB_TYPE=postgres

# Настройки базы данных PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=admin
DB_DATABASE=MagePromoEventLog
DB_SCHEMA=public

# Порт сервера приложения
PORT=3000

# Автоматическая синхронизация схемы БД (true/false)
DB_SYNCHRONIZE=true
```

### Примеры для других баз данных

**MySQL/MariaDB:**
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=mage_promo_event_log
DB_SYNCHRONIZE=true
```

**SQLite:**
```env
DB_TYPE=sqlite
DB_DATABASE=./data/event-log.sqlite
DB_SYNCHRONIZE=true
```

**MSSQL:**
```env
DB_TYPE=mssql
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourPassword123
DB_DATABASE=MagePromoEventLog
DB_SYNCHRONIZE=true
```

## Запуск

```bash
# Development режим (с авто-перезагрузкой)
npm run start:dev

# Production режим
npm run start:prod

# Debug режим
npm run start:debug
```

## Swagger документация

После запуска приложения Swagger UI доступен по адресу:

```
http://localhost:3000/api/docs
```

Swagger предоставляет:
- Интерактивную документацию всех endpoints
- Возможность тестирования API прямо из браузера
- Примеры запросов и ответов
- Схемы всех DTO
- Описание всех типов событий

## API Endpoints

Все endpoints доступны с префиксом `/api`.

### Приём событий

#### POST /api/events
Приём единичного события

**Request:**
```json
{
  "event_type": "page_view.home",
  "user_id": "uuid (optional)",
  "campaign_id": "uuid (required)",
  "subcampaign_id": "uuid (optional)",
  "portal_id": "uuid (optional)",
  "activity_id": "uuid (optional)",
  "session_id": "uuid (optional)",
  "payload": "object (optional)",
  "device": {
    "type": "mobile|desktop",
    "os": "iOS|Android|Windows",
    "browser": "Safari|Chrome",
    "userAgent": "string",
    "ip": "string"
  },
  "timestamp": "ISO8601 string (optional)"
}
```

**Response:**
```json
{
  "event_id": "uuid",
  "status": "accepted"
}
```

#### POST /api/events/batch
Пакетный приём событий

**Request:**
```json
{
  "events": [
    {
      "event_type": "page_view.home",
      "campaign_id": "uuid"
    },
    {
      "event_type": "registration.start",
      "campaign_id": "uuid",
      "user_id": "uuid"
    }
  ]
}
```

**Response:**
```json
{
  "count": 2,
  "status": "accepted"
}
```

### Запрос событий

#### GET /api/events/query
Запрос событий с фильтрацией для аналитических целей

**Query Parameters:**
| Параметр | Обязательный | Описание |
|----------|--------------|----------|
| `campaign_id` | ✅ | Идентификатор кампании (UUID) |
| `event_type` | ❌ | Фильтр по типу события |
| `user_id` | ❌ | Фильтр по пользователю (UUID) |
| `date_from` | ❌ | Начало временного диапазона (ISO8601) |
| `date_to` | ❌ | Конец временного диапазона (ISO8601) |
| `limit` | ❌ | Количество результатов (1-1000, default: 100) |
| `offset` | ❌ | Смещение для пагинации (default: 0) |

**Параметры окружения:**

| Параметр | Обязательный | По умолчанию | Описание |
|----------|--------------|--------------|----------|
| `DB_TYPE` | ❌ | `postgres` | Тип базы данных (mysql, postgres, sqlite, mssql, oracle, sap, better-sqlite3) |
| `DB_HOST` | ✅ | - | Хост базы данных |
| `DB_PORT` | ✅ | - | Порт базы данных |
| `DB_USERNAME` | ✅ | - | Имя пользователя БД |
| `DB_PASSWORD` | ✅ | - | Пароль пользователя БД |
| `DB_DATABASE` | ✅ | - | Имя базы данных |
| `DB_SCHEMA` | ❌ | `public` | Схема БД (только для PostgreSQL) |
| `EVENT_LOG_TABLE_NAME` | ❌ | `event_logs` | Имя таблицы для хранения событий |
| `DB_SYNCHRONIZE` | ❌ | `true` | Автосинхронизация схемы БД |
| `PORT` | ❌ | `3000` | Порт HTTP-сервера |

**Response:**
```json
{
  "events": [
    {
      "id": "uuid",
      "event_type": "page_view.home",
      "campaign_id": "uuid",
      "timestamp": "2024-02-27T10:00:00Z",
      "payload": { "page": "main" }
    }
  ],
  "total_count": 150,
  "has_more": true
}
```

### Экспорт событий

#### POST /api/events/export
Инициация экспорта данных во внешнее хранилище

**Request:**
```json
{
  "campaign_id": "uuid (required)",
  "date_from": "ISO8601 date (required)",
  "date_to": "ISO8601 date (required)",
  "format": "csv|json (default: csv)",
  "event_types": ["array of strings (optional)"],
  "destination": "s3|http (required)"
}
```

**Response:**
```json
{
  "export_id": "uuid",
  "status": "processing",
  "estimated_completion": "ISO8601 timestamp"
}
```

### Health Check

#### GET /api/events/health
Проверка состояния сервиса и его зависимостей

**Response:**
```json
{
  "status": "healthy",
  "checks": {
    "storage": "ok",
    "queue": "ok",
    "cache": "ok"
  },
  "metrics": {
    "events_received_last_hour": 1500,
    "queue_depth": 10,
    "avg_processing_time_ms": 45
  }
}
```

## Типы событий

Сервис поддерживает 210+ типов событий, сгруппированных по категориям:

| Категория | Префикс | Описание |
|-----------|---------|----------|
| Page View | `page_view.*` | Просмотр страниц портала |
| Content Interaction | `content_interaction.*` | Взаимодействие с контентом |
| Registration | `registration.*` | Регистрация пользователя |
| Auth | `auth.*` | Авторизация и восстановление доступа |
| Receipt | `receipt.*` | Регистрация чеков покупок |
| Code | `code.*` | Регистрация кодов с упаковки |
| Activity | `activity.*` | Участие в активностях (мгновенные и с модерацией) |
| Prize | `prize.*` | Получение призов (электронные и физические) |
| Profile | `profile.*` | Личный кабинет пользователя |
| Return | `return.*` | Повторное участие |
| Exit | `exit.*` | Завершение взаимодействия |
| System | `system.error.*` | Системные ошибки |
| Notification | `notification.*` | Уведомления пользователей |
| Moderation | `moderation.*` | Модерация контента |
| Personalization | `personalization.*` | Персонализация |
| A/B Test | `ab.test.*` | A/B тестирование |
| Cohort | `cohort.*` | Когортный анализ |
| Chatbot | `chatbot.*` | Взаимодействие с чат-ботом |
| Admin | `admin.*` | Администрирование (активности, пользователи, кампании) |
| Security | `security.*` | Безопасность и аудит |
| Fraud | `fraud.*` | Фрод-мониторинг |

Полный список всех 210 событий см. в файле `src/event-types.ts`.

## Маскирование персональных данных

Сервис автоматически маскирует конфиденциальные данные согласно требованиям безопасности:

| Тип данных | Пример до | Пример после |
|------------|-----------|--------------|
| Телефон | `+7 (999) 123-45-67` | `+* (***) ***-**-67` |
| Email | `user@example.com` | `u**@example.com` |
| IP-адрес | `192.168.1.100` | `192.168.1.**` |
| Паспорт | `1234 567890` | `****7890` |
| Банковская карта | `1234567890123456` | `**** **** **** 3456` |

Маскирование применяется автоматически ко всем входящим событиям. Информация о замаскированных полях сохраняется в поле `masked_fields`.

## Структура проекта

```
src/
├── dto/                          # DTO для валидации запросов
│   ├── create-event.dto.ts       # DTO единичного события
│   ├── batch-events.dto.ts       # DTO пакетной загрузки
│   ├── query-events.dto.ts       # DTO запроса событий
│   └── export-events.dto.ts      # DTO экспорта
├── utils/
│   └── data-masking.ts           # Утилита маскирования данных
├── app.module.ts                 # Главный модуль приложения
├── event-log.entity.ts           # TypeORM entity событий
├── event-types.ts                # Справочник типов событий (210+)
├── event.module.ts               # Модуль событий
├── event.service.ts              # Сервис бизнес-логики
├── event.controller.ts           # REST контроллер
└── main.ts                       # Точка входа с настройкой Swagger
```

## Тестирование

```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Тесты с покрытием
npm run test:cov

# Тесты в режиме watch
npm run test:watch
```

## Лимиты и ограничения

| Параметр | Значение |
|----------|----------|
| Максимальный размер `payload` | 10 KB |
| Рекомендуемый размер пакета | ≤ 100 событий |
| Максимальное значение `limit` для query | 1000 |
| Формат `event_type` | `category.action(.subaction)` |

## Валидация событий

Сервис отклоняет события при следующих нарушениях:

- Отсутствие обязательных полей (`event_type`, `campaign_id`)
- Некорректный формат `event_type` (должен соответствовать шаблону `category.action(.subaction)`, допускаются буквы, цифры, подчёркивания)
- Некорректный формат даты/времени
- Превышение допустимого размера `payload` (> 10 KB)
- Неверный формат UUID для идентификаторов

**Допустимые форматы event_type:**
- `page_view.home` ✅
- `registration.step.phone` ✅
- `A_B_Test.click` ✅
- `chatbot.personalization.suggest` ✅
- `invalid-event` ❌ (дефис не допускается)
- `123.start` ❌ (не может начинаться с цифры)

## Логирование

Сервис логирует:
- Все входящие события (тип и ID)
- Ошибки валидации
- Пакетные операции (количество обработанных событий)
- Запросы на экспорт

## Требования к инфраструктуре

- **Node.js**: 20+
- **Database**: PostgreSQL 14+ (или другая совместимая с TypeORM)
- **Память**: 512 MB минимум
- **CPU**: 1 ядро минимум

### Зависимости для различных баз данных

Для работы с разными типами баз данных могут потребоваться дополнительные пакеты:

```bash
# PostgreSQL (уже установлен)
npm install pg

# MySQL / MariaDB
npm install mysql2

# SQLite
npm install sqlite3

# MSSQL
npm install mssql

# Oracle
npm install oracledb

# SAP Hana
npm install @sap/hana-client
```

**Примечание:** Переменные окружения из `.env` загружаются автоматически при старте приложения. Для корректной работы `EVENT_LOG_TABLE_NAME` убедитесь, что файл `.env` существует до запуска приложения.

## Лицензия

UNLICENSED
