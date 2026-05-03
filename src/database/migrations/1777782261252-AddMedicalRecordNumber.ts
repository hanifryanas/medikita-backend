import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMedicalRecordNumber1777782261252 implements MigrationInterface {
  name = 'AddMedicalRecordNumber1777782261252';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "MedicalRecordCounter" ("yearMonth" character varying(6) NOT NULL, "lastSequence" integer NOT NULL DEFAULT '0', CONSTRAINT "CHK_05f71dcc9eea5ee8e97df597ef" CHECK ("lastSequence" >= 0 AND "lastSequence" <= 999999), CONSTRAINT "PK_4d8d35738446827e2f70296ebe4" PRIMARY KEY ("yearMonth"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "Patient" ADD "medicalRecordNumber" character varying(12)`,
    );

    // Backfill existing patients using current year/month and sequential numbers.
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

    const existingPatients: { patientId: string }[] = await queryRunner.query(
      `SELECT "patientId" FROM "Patient" ORDER BY "createdAt" ASC`,
    );

    for (let index = 0; index < existingPatients.length; index++) {
      const sequence = index + 1;
      const medicalRecordNumber = `${yearMonth}${String(sequence).padStart(6, '0')}`;
      await queryRunner.query(
        `UPDATE "Patient" SET "medicalRecordNumber" = $1 WHERE "patientId" = $2`,
        [medicalRecordNumber, existingPatients[index].patientId],
      );
    }

    if (existingPatients.length > 0) {
      await queryRunner.query(
        `INSERT INTO "MedicalRecordCounter" ("yearMonth", "lastSequence") VALUES ($1, $2)
         ON CONFLICT ("yearMonth") DO UPDATE SET "lastSequence" = EXCLUDED."lastSequence"`,
        [yearMonth, existingPatients.length],
      );
    }

    await queryRunner.query(
      `ALTER TABLE "Patient" ALTER COLUMN "medicalRecordNumber" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Patient" ADD CONSTRAINT "UQ_2893a41ce39c9520106cfc3d746" UNIQUE ("medicalRecordNumber")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Patient" DROP CONSTRAINT "UQ_2893a41ce39c9520106cfc3d746"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Patient" DROP COLUMN "medicalRecordNumber"`,
    );
    await queryRunner.query(`DROP TABLE "MedicalRecordCounter"`);
  }
}
