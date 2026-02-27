import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Получение имени таблицы из .env файла
 */
function getEventLogTableName(): string {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/^\s*EVENT_LOG_TABLE_NAME\s*=\s*(.+)\s*$/m);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch (error) {
    // Игнорируем ошибки, используем значение по умолчанию
  }
  return 'event_logs';
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Настройка CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Глобальный префикс API
  app.setGlobalPrefix('api');

  // Глобальная валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Event Logger API')
    .setDescription(
      'Микросервис для сбора, обработки и хранения событий промо-портала системы управления лояльностью.\n\n' +
        '## Возможности\n' +
        '- Приём единичных и пакетных событий\n' +
        '- Автоматическое маскирование персональных данных\n' +
        '- Фильтрация и пагинация при запросе\n' +
        '- Экспорт данных в CSV/JSON\n' +
        '- Health check с метриками\n\n' +
        '## Типы событий\n' +
        'Сервис поддерживает 210+ типов событий включая:\n' +
        '- `page_view.*` — Просмотр страниц\n' +
        '- `registration.*` — Регистрация\n' +
        '- `auth.*` — Авторизация\n' +
        '- `activity.*` — Участие в активностях\n' +
        '- `prize.*` — Получение призов\n' +
        '- и многие другие',
    )
    .setVersion('1.0')
    .addTag(
      'События',
      'API для приёма, запроса и экспорта событий системы',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Event Logger API',
  });

  const port = configService.get<number>('PORT', 3000);
  const dbType = configService.get<string>('DB_TYPE', 'postgres');
  const dbHost = configService.get<string>('DB_HOST', 'localhost');
  const dbPort = configService.get<number>('DB_PORT', 5432);
  const dbName = configService.get<string>('DB_DATABASE', 'MagePromoEventLog');
  const dbSchema = configService.get<string>('DB_SCHEMA', 'public');
  const tableName = getEventLogTableName();

  await app.listen(+port);

  console.log('\n========================================');
  console.log('  Event Logger MS запущен');
  console.log('========================================');
  console.log(`  Порт сервера:      http://localhost:${port}`);
  console.log(`  Swagger UI:        http://localhost:${port}/api/docs`);
  console.log(`  Health check:      http://localhost:${port}/api/events/health`);
  console.log('----------------------------------------');
  console.log('  База данных:');
  console.log(`    Тип:             ${dbType}`);
  console.log(`    Хост:            ${dbHost}:${dbPort}`);
  console.log(`    База данных:     ${dbName}`);
  if (dbType === 'postgres') {
    console.log(`    Схема:           ${dbSchema}`);
  }
  console.log(`    Таблица:         ${tableName}`);
  console.log('========================================\n');
}
bootstrap();
