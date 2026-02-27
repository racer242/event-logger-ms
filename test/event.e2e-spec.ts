import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { EventLog } from './../src/event-log.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('Event Logger API (e2e)', () => {
  let app: INestApplication;
  let eventRepository: Repository<EventLog>;

  const testCampaignId = '123e4567-e89b-12d3-a456-426614174000';
  const testUserId = '123e4567-e89b-12d3-a456-426614174001';
  const testSessionId = '123e4567-e89b-12d3-a456-426614174002';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    eventRepository = moduleFixture.get<Repository<EventLog>>(
      getRepositoryToken(EventLog),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await eventRepository.clear();
  });

  describe('GET /api/events/health', () => {
    it('должен возвращать статус healthy', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/events/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.checks).toBeDefined();
      expect(response.body.metrics).toBeDefined();
    });
  });

  describe('POST /api/events', () => {
    it('должен принимать валидное событие', async () => {
      const eventData = {
        event_type: 'page_view.home',
        campaign_id: testCampaignId,
        user_id: testUserId,
        session_id: testSessionId,
        payload: { page: 'main' },
        device: {
          type: 'mobile',
          os: 'iOS',
          browser: 'Safari',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/api/events')
        .send(eventData)
        .expect(200);

      expect(response.body.event_id).toBeDefined();
      expect(response.body.status).toBe('accepted');
    });

    it('должен отклонять событие без campaign_id', async () => {
      const eventData = {
        event_type: 'page_view.home',
        user_id: testUserId,
      };

      await request(app.getHttpServer())
        .post('/api/events')
        .send(eventData)
        .expect(400);
    });

    it('должен отклонять событие с неверным форматом event_type', async () => {
      const eventData = {
        event_type: 'invalid_event',
        campaign_id: testCampaignId,
      };

      await request(app.getHttpServer())
        .post('/api/events')
        .send(eventData)
        .expect(400);
    });

    it('должен маскировать персональные данные', async () => {
      const eventData = {
        event_type: 'registration.step.phone',
        campaign_id: testCampaignId,
        user_id: testUserId,
        payload: {
          phone: '+7 (999) 123-45-67',
          email: 'user@example.com',
        },
      };

      await request(app.getHttpServer())
        .post('/api/events')
        .send(eventData)
        .expect(200);

      const savedEvent = await eventRepository.findOne({
        where: { user_id: testUserId },
      });
      expect(savedEvent).toBeDefined();
      expect(savedEvent?.payload?.['phone']).not.toBe('+7 (999) 123-45-67');
      expect(savedEvent?.payload?.['email']).not.toBe('user@example.com');
    });
  });

  describe('POST /api/events/batch', () => {
    it('должен принимать пакет событий', async () => {
      const eventsData = {
        events: [
          {
            event_type: 'page_view.home',
            campaign_id: testCampaignId,
          },
          {
            event_type: 'page_view.rules',
            campaign_id: testCampaignId,
          },
          {
            event_type: 'registration.start',
            campaign_id: testCampaignId,
            user_id: testUserId,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/events/batch')
        .send(eventsData)
        .expect(200);

      expect(response.body.count).toBe(3);
      expect(response.body.status).toBe('accepted');
    });

    it('должен отклонять пустой массив событий', async () => {
      const eventsData = {
        events: [],
      };

      await request(app.getHttpServer())
        .post('/api/events/batch')
        .send(eventsData)
        .expect(400);
    });
  });

  describe('GET /api/events/query', () => {
    beforeEach(async () => {
      // Создадим тестовые события
      await eventRepository.save([
        eventRepository.create({
          event_type: 'page_view.home',
          campaign_id: testCampaignId,
          user_id: testUserId,
          timestamp: new Date(),
        }),
        eventRepository.create({
          event_type: 'registration.start',
          campaign_id: testCampaignId,
          user_id: testUserId,
          timestamp: new Date(),
        }),
      ]);
    });

    it('должен возвращать события по campaign_id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/events/query?campaign_id=${testCampaignId}`)
        .expect(200);

      expect(response.body.events).toBeDefined();
      expect(response.body.total_count).toBe(2);
      expect(response.body.has_more).toBe(false);
    });

    it('должен поддерживать фильтрацию по event_type', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/api/events/query?campaign_id=${testCampaignId}&event_type=page_view.home`,
        )
        .expect(200);

      expect(response.body.total_count).toBe(1);
    });

    it('должен поддерживать пагинацию', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/api/events/query?campaign_id=${testCampaignId}&limit=1&offset=0`,
        )
        .expect(200);

      expect(response.body.events.length).toBe(1);
      expect(response.body.has_more).toBe(true);
    });
  });

  describe('POST /api/events/export', () => {
    it('должен инициировать экспорт событий', async () => {
      const exportData = {
        campaign_id: testCampaignId,
        date_from: '2024-01-01T00:00:00Z',
        date_to: '2024-12-31T23:59:59Z',
        format: 'json',
      };

      const response = await request(app.getHttpServer())
        .post('/api/events/export')
        .send(exportData)
        .expect(200);

      expect(response.body.export_id).toBeDefined();
      expect(response.body.status).toBe('processing');
      expect(response.body.estimated_completion).toBeDefined();
    });

    it('должен отклонять экспорт без обязательных полей', async () => {
      const exportData = {
        campaign_id: testCampaignId,
      };

      await request(app.getHttpServer())
        .post('/api/events/export')
        .send(exportData)
        .expect(400);
    });
  });
});
