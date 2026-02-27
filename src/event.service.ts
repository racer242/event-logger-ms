import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { EventLog } from './event-log.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { DataMaskingService } from './utils/data-masking';
import { isValidEventType } from './event-types';

export interface EventResponse {
  event_id: string;
  status: string;
}

export interface BatchEventResponse {
  count: number;
  status: string;
}

export interface QueryEventResponse {
  events: EventLog[];
  total_count: number;
  has_more: boolean;
}

export interface ExportEventResponse {
  export_id: string;
  status: string;
  estimated_completion?: string;
}

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  private readonly MAX_PAYLOAD_SIZE = 10240; // 10 KB

  constructor(
    @InjectRepository(EventLog)
    private readonly eventRepository: Repository<EventLog>,
  ) {}

  /**
   * Создание единичного события
   */
  async create(dto: CreateEventDto): Promise<EventResponse> {
    this.validateEventType(dto.event_type);
    this.validatePayloadSize(dto.payload);

    const { masked: maskedPayload, maskedFields } = DataMaskingService.maskObject(
      dto.payload || {},
    );

    // Маскирование IP в device
    if (dto.device?.ip) {
      dto.device.ip = DataMaskingService.maskIp(dto.device.ip);
    }

    const event = this.eventRepository.create({
      event_type: dto.event_type,
      user_id: dto.user_id,
      campaign_id: dto.campaign_id,
      subcampaign_id: dto.subcampaign_id,
      portal_id: dto.portal_id,
      activity_id: dto.activity_id,
      session_id: dto.session_id,
      payload: maskedPayload,
      device: dto.device,
      timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      processed: false,
      masked_fields: maskedFields,
    });

    await this.eventRepository.save(event);

    this.logger.log(`Событие ${dto.event_type} сохранено с ID: ${event.id}`);

    return {
      event_id: event.id,
      status: 'accepted',
    };
  }

  /**
   * Пакетное создание событий
   */
  async batchCreate(events: CreateEventDto[]): Promise<BatchEventResponse> {
    const savedEvents: EventLog[] = [];

    for (const dto of events) {
      try {
        this.validateEventType(dto.event_type);
        this.validatePayloadSize(dto.payload);

        const { masked: maskedPayload, maskedFields } = DataMaskingService.maskObject(
          dto.payload || {},
        );

        if (dto.device?.ip) {
          dto.device.ip = DataMaskingService.maskIp(dto.device.ip);
        }

        const event = this.eventRepository.create({
          event_type: dto.event_type,
          user_id: dto.user_id,
          campaign_id: dto.campaign_id,
          subcampaign_id: dto.subcampaign_id,
          portal_id: dto.portal_id,
          activity_id: dto.activity_id,
          session_id: dto.session_id,
          payload: maskedPayload,
          device: dto.device,
          timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
          processed: false,
          masked_fields: maskedFields,
        });

        savedEvents.push(event);
      } catch (error) {
        this.logger.warn(`Событие отклонено: ${error.message}`);
      }
    }

    if (savedEvents.length > 0) {
      await this.eventRepository.save(savedEvents);
    }

    this.logger.log(`Пакетно сохранено ${savedEvents.length} событий`);

    return {
      count: savedEvents.length,
      status: 'accepted',
    };
  }

  /**
   * Запрос событий с фильтрацией
   */
  async query(dto: QueryEventsDto): Promise<QueryEventResponse> {
    const where: FindOptionsWhere<EventLog> = {
      campaign_id: dto.campaign_id,
    };

    if (dto.event_type) {
      where.event_type = dto.event_type;
    }

    if (dto.user_id) {
      where.user_id = dto.user_id;
    }

    if (dto.date_from || dto.date_to) {
      where.timestamp = Between(
        dto.date_from ? new Date(dto.date_from) : new Date(0),
        dto.date_to ? new Date(dto.date_to) : new Date(),
      );
    }

    const limit = dto.limit ?? 100;
    const offset = dto.offset ?? 0;

    const [events, total] = await this.eventRepository.findAndCount({
      where,
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });

    const hasMore = total > offset + limit;

    return {
      events,
      total_count: total,
      has_more: hasMore,
    };
  }

  /**
   * Инициация экспорта событий
   */
  async export(dto: {
    campaign_id: string;
    date_from: string;
    date_to: string;
    format?: 'csv' | 'json';
    event_types?: string[];
  }): Promise<ExportEventResponse> {
    // В реальной реализации здесь будет запуск фоновой задачи
    const exportId = crypto.randomUUID();
    const estimatedCompletion = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

    this.logger.log(`Инициирован экспорт ${exportId} для кампании ${dto.campaign_id}`);

    return {
      export_id: exportId,
      status: 'processing',
      estimated_completion: estimatedCompletion.toISOString(),
    };
  }

  /**
   * Получение метрик для health check
   */
  async getMetrics() {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [eventsLastHour, queueDepth] = await Promise.all([
      this.eventRepository.count({
        where: {
          created_at: Between(hourAgo, now),
        },
      }),
      this.eventRepository.count({
        where: {
          processed: false,
        },
      }),
    ]);

    // Среднее время обработки (заглушка - в реальности нужно считать разницу между created_at и processed_at)
    const avgProcessingTimeMs = 50;

    return {
      events_received_last_hour: eventsLastHour,
      queue_depth: queueDepth,
      avg_processing_time_ms: avgProcessingTimeMs,
    };
  }

  /**
   * Проверка типа события
   */
  private validateEventType(eventType: string): void {
    if (!isValidEventType(eventType)) {
      this.logger.warn(`Неизвестный тип события: ${eventType}`);
      // Не выбрасываем ошибку, а только логируем - система должна принимать любые события
    }
  }

  /**
   * Проверка размера payload
   */
  private validatePayloadSize(payload?: Record<string, unknown>): void {
    if (!payload) return;

    const size = Buffer.byteLength(JSON.stringify(payload), 'utf8');
    if (size > this.MAX_PAYLOAD_SIZE) {
      throw new BadRequestException(
        `Размер payload (${size} байт) превышает лимит ${this.MAX_PAYLOAD_SIZE} байт`,
      );
    }
  }
}
