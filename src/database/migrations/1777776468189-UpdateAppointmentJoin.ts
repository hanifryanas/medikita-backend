import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAppointmentJoin1777776468189 implements MigrationInterface {
  name = 'UpdateAppointmentJoin1777776468189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "AppointmentNurse" ("appointmentId" uuid NOT NULL, "nurseId" uuid NOT NULL, CONSTRAINT "PK_acaa300228124bb42045c5b6388" PRIMARY KEY ("appointmentId", "nurseId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_15c7d54b706e9765e5d9eeb8ce" ON "AppointmentNurse" ("appointmentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bc9bea99ba14ab297806c26425" ON "AppointmentNurse" ("nurseId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointment" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointment" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointment" ADD "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserPatient" ALTER COLUMN "ordinal" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "AppointmentNurse" ADD CONSTRAINT "FK_15c7d54b706e9765e5d9eeb8cea" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("appointmentId") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "AppointmentNurse" ADD CONSTRAINT "FK_bc9bea99ba14ab297806c26425e" FOREIGN KEY ("nurseId") REFERENCES "Nurse"("nurseId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "AppointmentNurse" DROP CONSTRAINT "FK_bc9bea99ba14ab297806c26425e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "AppointmentNurse" DROP CONSTRAINT "FK_15c7d54b706e9765e5d9eeb8cea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserPatient" ALTER COLUMN "ordinal" SET DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointment" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointment" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointment" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bc9bea99ba14ab297806c26425"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_15c7d54b706e9765e5d9eeb8ce"`,
    );
    await queryRunner.query(`DROP TABLE "AppointmentNurse"`);
  }
}
