import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAppointmentBooking1778700000000 implements MigrationInterface {
  name = 'UpdateAppointmentBooking1778700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "AppointmentNurse"`);
    await queryRunner.query(`DELETE FROM "Appointment"`);

    await queryRunner.query(
      `ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "date" date NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "timeSlot" character varying(5) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointment" ALTER COLUMN "startTime" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointment" ALTER COLUMN "endTime" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "AppointmentNurse"`);
    await queryRunner.query(`DELETE FROM "Appointment"`);

    await queryRunner.query(
      `ALTER TABLE "Appointment" ALTER COLUMN "endTime" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointment" ALTER COLUMN "startTime" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "Appointment" DROP COLUMN "timeSlot"`);
    await queryRunner.query(`ALTER TABLE "Appointment" DROP COLUMN "date"`);
    await queryRunner.query(
      `ALTER TABLE "Appointment" ADD "date" TIMESTAMP NOT NULL`,
    );
  }
}
