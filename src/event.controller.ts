import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { BatchEventsDto } from './dto/batch-events.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { ExportEventsDto } from './dto/export-events.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('События')
@Controller('events')
export class EventController {
  private readonly logger = new Logger(EventController.name);

  constructor(private readonly eventService: EventService) {}

  /**
   * POST /events - Приём единичного события
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Приём единичного события',
    description:
      'Создаёт новое событие в системе. Автоматически маскирует персональные данные (телефон, email, IP).',
  })
  @ApiBody({
    type: CreateEventDto,
    description: 'Данные события',
    examples: {
      pageView: {
        summary: 'Просмотр страницы',
        value: {
          event_type: 'page_view.home',
          campaign_id: '123e4567-e89b-12d3-a456-426614174000',
          user_id: '123e4567-e89b-12d3-a456-426614174001',
          session_id: '123e4567-e89b-12d3-a456-426614174002',
          payload: { page: 'main', referrer: 'google.com' },
          device: {
            type: 'mobile',
            os: 'iOS',
            browser: 'Safari',
          },
        },
      },
      registration: {
        summary: 'Регистрация пользователя',
        value: {
          event_type: 'registration.complete',
          campaign_id: '123e4567-e89b-12d3-a456-426614174000',
          user_id: '123e4567-e89b-12d3-a456-426614174001',
          payload: {
            phone: '+7 (999) 123-45-67',
            email: 'user@example.com',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Событие успешно принято',
    schema: {
      example: {
        event_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        status: 'accepted',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Ошибка валидации данных' })
  async create(@Body() dto: CreateEventDto) {
    this.logger.log(`Получено событие: ${dto.event_type}`);
    return this.eventService.create(dto);
  }

  /**
   * POST /events/batch - Пакетный приём событий
   */
  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Пакетный приём событий',
    description:
      'Принимает массив событий для массовой загрузки. Неверные события отклоняются, валидные сохраняются.',
  })
  @ApiBody({
    type: BatchEventsDto,
    description: 'Пакет событий',
    examples: {
      batch: {
        summary: 'Пакет из 3 событий',
        value: {
          events: [
            {
              event_type: 'page_view.home',
              campaign_id: '123e4567-e89b-12d3-a456-426614174000',
            },
            {
              event_type: 'page_view.rules',
              campaign_id: '123e4567-e89b-12d3-a456-426614174000',
            },
            {
              event_type: 'registration.start',
              campaign_id: '123e4567-e89b-12d3-a456-426614174000',
              user_id: '123e4567-e89b-12d3-a456-426614174001',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Пакет событий успешно принят',
    schema: {
      example: {
        count: 3,
        status: 'accepted',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Ошибка валидации данных' })
  async batch(@Body() batchDto: BatchEventsDto) {
    this.logger.log(`Получен пакет событий: ${batchDto.events.length} шт.`);
    return this.eventService.batchCreate(batchDto.events);
  }

  /**
   * GET /events/query - Запрос событий с фильтрацией
   */
  @Get('query')
  @ApiOperation({
    summary: 'Запрос событий с фильтрацией',
    description:
      'Возвращает события с возможностью фильтрации по campaign_id, event_type, user_id и временному диапазону.',
  })
  @ApiQuery({
    name: 'campaign_id',
    required: true,
    description: 'ID кампании для фильтрации',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'event_type',
    required: false,
    description: 'Фильтр по типу события',
    example: 'page_view.home',
  })
  @ApiQuery({
    name: 'user_id',
    required: false,
    description: 'Фильтр по ID пользователя',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    description: 'Начало временного диапазона',
    example: '2024-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    description: 'Конец временного диапазона',
    example: '2024-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Максимальное количество результатов (1-1000)',
    example: 100,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Смещение для пагинации',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'События найдены',
    schema: {
      example: {
        events: [
          {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            event_type: 'page_view.home',
            campaign_id: '123e4567-e89b-12d3-a456-426614174000',
            timestamp: '2024-02-27T10:00:00Z',
            payload: { page: 'main' },
          },
        ],
        total_count: 150,
        has_more: true,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Ошибка валидации параметров' })
  async query(@Query() queryDto: QueryEventsDto) {
    this.logger.log(`Запрос событий для кампании: ${queryDto.campaign_id}`);
    return this.eventService.query(queryDto);
  }

  /**
   * POST /events/export - Инициация экспорта событий
   */
  @Post('export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Инициация экспорта событий',
    description:
      'Запускает фоновый процесс экспорта событий в CSV или JSON формате.',
  })
  @ApiBody({
    type: ExportEventsDto,
    description: 'Параметры экспорта',
    examples: {
      export: {
        summary: 'Экспорт в JSON',
        value: {
          campaign_id: '123e4567-e89b-12d3-a456-426614174000',
          date_from: '2024-01-01T00:00:00Z',
          date_to: '2024-12-31T23:59:59Z',
          format: 'json',
          event_types: ['page_view.home', 'registration.complete'],
          destination: 's3',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Экспорт инициирован',
    schema: {
      example: {
        export_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        status: 'processing',
        estimated_completion: '2024-02-27T10:05:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Ошибка валидации данных' })
  async export(@Body() exportDto: ExportEventsDto) {
    this.logger.log(`Экспорт событий для кампании: ${exportDto.campaign_id}`);
    return this.eventService.export({
      campaign_id: exportDto.campaign_id,
      date_from: exportDto.date_from,
      date_to: exportDto.date_to,
      format: exportDto.format,
      event_types: exportDto.event_types,
    });
  }

  /**
   * GET /health - Проверка работоспособности сервиса
   */
  @Get('health')
  @ApiOperation({
    summary: 'Проверка работоспособности сервиса',
    description:
      'Возвращает статус сервиса, состояние зависимостей и метрики производительности.',
  })
  @ApiResponse({
    status: 200,
    description: 'Сервис работает нормально',
    schema: {
      example: {
        status: 'healthy',
        checks: {
          storage: 'ok',
          queue: 'ok',
          cache: 'ok',
        },
        metrics: {
          events_received_last_hour: 1500,
          queue_depth: 10,
          avg_processing_time_ms: 45,
        },
      },
    },
  })
  async health() {
    const metrics = await this.eventService.getMetrics();

    return {
      status: 'healthy',
      checks: {
        storage: 'ok',
        queue: 'ok',
        cache: 'ok',
      },
      metrics,
    };
  }
}
