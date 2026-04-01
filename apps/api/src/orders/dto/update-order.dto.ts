import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateOrderDto {
    @IsString()
    @IsOptional()
    status?: string;

    @IsString()
    @IsOptional()
    trackingUrl?: string;
}
