import {
  IsString,
  IsOptional,
  IsUUID,
  IsObject,
  IsISO8601,
  ValidateNested,
  IsNotEmpty,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeviceDto {
  @ApiPropertyOptional({
    description: 'Тип устройства',
    example: 'mobile',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Операционная система',
    example: 'iOS',
  })
  @IsOptional()
  @IsString()
  os?: string;

  @ApiPropertyOptional({
    description: 'Браузер',
    example: 'Safari',
  })
  @IsOptional()
  @IsString()
  browser?: string;

  @ApiPropertyOptional({
    description: 'User Agent строка',
    example: 'Mozilla/5.0...',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'IP-адрес пользователя (будет маскирован)',
    example: '192.168.1.100',
  })
  @IsOptional()
  @IsString()
  ip?: string;
}

export class CreateEventDto {
  @ApiProperty({
    description: 'Тип события в формате category.action(.subaction)',
    example: 'page_view.home',
    pattern: '^[a-zA-Z_]+[a-zA-Z0-9_]*(\\.[a-zA-Z_]+[a-zA-Z0-9_]*)*$',
  })
  @IsNotEmpty({ message: 'event_type является обязательным полем' })
  @IsString()
  @Matches(/^[a-zA-Z_]+[a-zA-Z0-9_]*(\.[a-zA-Z_]+[a-zA-Z0-9_]*)*$/, {
    message: 'event_type должен быть в формате category.action(.subaction)',
  })
  event_type: string;

  @ApiPropertyOptional({
    description: 'ID пользователя (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiProperty({
    description: 'ID кампании (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'campaign_id является обязательным полем' })
  @IsUUID()
  campaign_id: string;

  @ApiPropertyOptional({
    description: 'ID подкампании (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  subcampaign_id?: string;

  @ApiPropertyOptional({
    description: 'ID портала (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID()
  portal_id?: string;

  @ApiPropertyOptional({
    description: 'ID активности (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @IsOptional()
  @IsUUID()
  activity_id?: string;

  @ApiPropertyOptional({
    description: 'ID сессии (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174004',
  })
  @IsOptional()
  @IsUUID()
  session_id?: string;

  @ApiPropertyOptional({
    description: 'Дополнительные данные события (макс. 10 KB)',
    example: { page: 'main', referrer: 'google.com' },
  })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Информация об устройстве',
    type: DeviceDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceDto)
  device?: DeviceDto;

  @ApiPropertyOptional({
    description: 'Время события (ISO8601). По умолчанию - серверное время',
    example: '2024-02-27T10:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  timestamp?: string;
}
