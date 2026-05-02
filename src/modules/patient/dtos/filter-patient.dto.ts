import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InsuranceProviderType } from '../enums/insurance-provider.enum';

export class FilterPatientDto {
  @ApiPropertyOptional({
    description: 'Filter by first or last name (partial match)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by address (partial match)',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Filter by insurance provider type',
    enum: InsuranceProviderType,
    enumName: 'InsuranceProviderType',
  })
  @IsOptional()
  @IsEnum(InsuranceProviderType)
  insuranceProvider?: InsuranceProviderType;
}
