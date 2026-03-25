import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsString()
  category!: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  datasheet?: string;

  @IsString()
  @IsOptional()
  specs?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  shippingCost?: number;
}
