import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAppointmentCheckInTime1778800000000 implements MigrationInterface {
  name = 'AddAppointmentCheckInTime1778800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "checkInTime" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "checkInTime"`,
    );
  }
}
