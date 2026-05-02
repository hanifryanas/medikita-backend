import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';

export class UpdatePatientDto extends PartialType(
  OmitType(CreatePatientDto, [
    'userId',
    'identityNumber',
    'firstName',
    'lastName',
    'gender',
  ] as const),
) {}
