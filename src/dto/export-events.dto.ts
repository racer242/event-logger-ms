import {
  IsUUID,
  IsISO8601,
  IsIn,
  IsOptional,
  IsArray,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExportEventsDto {
  @ApiProperty({
    description: 'ID кампании для экспорта (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  campaign_id: string;

  @ApiProperty({
    description: 'Начало периода экспорта (ISO8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsISO8601()
  date_from: string;

  @ApiProperty({
    description: 'Конец периода экспорта (ISO8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsISO8601()
  date_to: string;

  @ApiPropertyOptional({
    description: 'Формат экспорта',
    enum: ['csv', 'json'],
    default: 'csv',
  })
  @IsOptional()
  @IsIn(['csv', 'json'])
  format?: 'csv' | 'json' = 'csv';

  @ApiPropertyOptional({
    description: 'Фильтр по типам событий',
    example: ['page_view.home', 'registration.complete'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  event_types?: string[];

  @ApiPropertyOptional({
    description: 'Назначение экспорта',
    enum: ['s3', 'http'],
  })
  @IsOptional()
  @IsIn(['s3', 'http'])
  destination?: 's3' | 'http';
}
