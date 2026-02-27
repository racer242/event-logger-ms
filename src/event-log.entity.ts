import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Получение имени таблицы из .env файла
 * Читает файл напрямую, так как entity инициализируется до загрузки ConfigModule
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

@Entity(getEventLogTableName())
export class EventLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'event_type' })
  event_type: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  user_id?: string;

  @Index()
  @Column({ name: 'campaign_id', type: 'uuid' })
  campaign_id: string;

  @Index()
  @Column({ name: 'subcampaign_id', type: 'uuid', nullable: true })
  subcampaign_id?: string;

  @Index()
  @Column({ name: 'portal_id', type: 'uuid', nullable: true })
  portal_id?: string;

  @Index()
  @Column({ name: 'activity_id', type: 'uuid', nullable: true })
  activity_id?: string;

  @Index()
  @Column({ name: 'session_id', type: 'uuid', nullable: true })
  session_id?: string;

  @Column({ type: 'jsonb', nullable: true })
  payload?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  device?: {
    type?: string;
    os?: string;
    browser?: string;
    userAgent?: string;
    ip?: string;
  };

  @Index()
  @Column({ name: 'timestamp', type: 'timestamptz' })
  timestamp: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @Column({ name: 'processed', default: false })
  processed: boolean;

  @Column({ name: 'masked_fields', type: 'jsonb', nullable: true })
  masked_fields?: Record<string, string>;
}
