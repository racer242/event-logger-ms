import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';

export class BatchEventsDto {
  @ApiProperty({
    description: 'Массив событий для пакетной загрузки',
    type: [CreateEventDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventDto)
  @ArrayMinSize(1, { message: 'Массив событий не может быть пустым' })
  events: CreateEventDto[];
}
