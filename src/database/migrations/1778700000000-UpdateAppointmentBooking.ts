import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAppointmentBooking1778700000000 implements MigrationInterface {
  name = 'UpdateAppointmentBooking1778700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Existing appointment rows are not compatible with the new schema; drop them.
    await queryRunner.query(`DELETE FROM "AppointmentNurse"`);
    await queryRunner.query(`DELETE FROM "Appointment"`);

    await queryRunner.query(
      `ALTER TABLE "Appointment" ADD "date" date NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointment" ADD "timeSlot" character varying(5) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointment" ALTER COLUMN "startTime" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointment" ALTER COLUMN "endTime" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Mirror up(): cannot restore NOT NULL on startTime/endTime while
    // rows contain NULLs created under the new schema.
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
  }
}
