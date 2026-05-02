import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPatient1777715187370 implements MigrationInterface {
  name = 'AddUserPatient1777715187370';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the explicit UserPatient join table (FKs added at the end).
    await queryRunner.query(
      `CREATE TABLE "UserPatient" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid NOT NULL, "patientId" uuid NOT NULL, "ordinal" integer NOT NULL DEFAULT 1, CONSTRAINT "PK_7ffb11c0708e0ac31ffa266c915" PRIMARY KEY ("userId", "patientId"))`,
    );

    // 2. Backfill UserPatient from existing Patient.userId links (each becomes ordinal 1 for that user).
    await queryRunner.query(
      `INSERT INTO "UserPatient" ("userId", "patientId", "ordinal") SELECT "userId", "patientId", 1 FROM "Patient" WHERE "userId" IS NOT NULL`,
    );

    // 3. Add new Patient profile columns as nullable so backfill can populate them.
    await queryRunner.query(
      `ALTER TABLE "Patient" ADD "identityNumber" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "Patient" ADD "firstName" character varying(25)`,
    );
    await queryRunner.query(
      `ALTER TABLE "Patient" ADD "lastName" character varying(25)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Patient_gender_enum" AS ENUM('male', 'female')`,
    );
    await queryRunner.query(
      `ALTER TABLE "Patient" ADD "gender" "public"."Patient_gender_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Patient" ADD "phoneNumber" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "Patient" ADD "dateOfBirth" date`);
    await queryRunner.query(
      `ALTER TABLE "Patient" ADD "address" character varying`,
    );

    // 4. Backfill Patient profile columns from the linked User row.
    //    "gender" needs an explicit cast since "User_gender_enum" and
    //    "Patient_gender_enum" are distinct PG types despite sharing labels.
    await queryRunner.query(`
            UPDATE "Patient" p
            SET "identityNumber" = u."identityNumber",
                "firstName"      = u."firstName",
                "lastName"       = u."lastName",
                "gender"         = u."gender"::text::"public"."Patient_gender_enum",
                "phoneNumber"    = u."phoneNumber",
                "dateOfBirth"    = u."dateOfBirth",
                "address"        = u."address"
            FROM "User" u
            WHERE p."userId" = u."userId"
        `);

    // 5. Drop the old single-user FK / UQ / column on Patient.
    await queryRunner.query(
      `ALTER TABLE "Patient" DROP CONSTRAINT "FK_fd38098a3964235e38f0223d2aa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Patient" DROP CONSTRAINT "UQ_fd38098a3964235e38f0223d2aa"`,
    );
    await queryRunner.query(`ALTER TABLE "Patient" DROP COLUMN "userId"`);

    // 6. Enforce NOT NULL on the populated columns (skip "address" — it's optional).
    await queryRunner.query(
      `ALTER TABLE "Patient" ALTER COLUMN "identityNumber" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Patient" ALTER COLUMN "firstName" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Patient" ALTER COLUMN "lastName" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Patient" ALTER COLUMN "gender" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Patient" ALTER COLUMN "phoneNumber" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Patient" ALTER COLUMN "dateOfBirth" SET NOT NULL`,
    );

    // 7. Wire up the join table FKs.
    await queryRunner.query(
      `ALTER TABLE "UserPatient" ADD CONSTRAINT "FK_ea0d544e50a090c0c5b5f7ca467" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserPatient" ADD CONSTRAINT "FK_918b54243404a3c7af8befde315" FOREIGN KEY ("patientId") REFERENCES "Patient"("patientId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Restore Patient.userId column (nullable so we can backfill before re-adding constraints).
    await queryRunner.query(`ALTER TABLE "Patient" ADD "userId" uuid`);

    // 2. Backfill the single-user link from UserPatient (pick the lowest ordinal per patient).
    await queryRunner.query(`
            UPDATE "Patient" p
            SET "userId" = sub."userId"
            FROM (
                SELECT DISTINCT ON ("patientId") "patientId", "userId"
                FROM "UserPatient"
                ORDER BY "patientId", "ordinal" ASC
            ) sub
            WHERE p."patientId" = sub."patientId"
        `);

    // 3. Drop the new Patient profile columns.
    await queryRunner.query(`ALTER TABLE "Patient" DROP COLUMN "address"`);
    await queryRunner.query(`ALTER TABLE "Patient" DROP COLUMN "dateOfBirth"`);
    await queryRunner.query(`ALTER TABLE "Patient" DROP COLUMN "phoneNumber"`);
    await queryRunner.query(`ALTER TABLE "Patient" DROP COLUMN "gender"`);
    await queryRunner.query(`DROP TYPE "public"."Patient_gender_enum"`);
    await queryRunner.query(`ALTER TABLE "Patient" DROP COLUMN "lastName"`);
    await queryRunner.query(`ALTER TABLE "Patient" DROP COLUMN "firstName"`);
    await queryRunner.query(
      `ALTER TABLE "Patient" DROP COLUMN "identityNumber"`,
    );

    // 4. Drop UserPatient join table.
    await queryRunner.query(
      `ALTER TABLE "UserPatient" DROP CONSTRAINT "FK_918b54243404a3c7af8befde315"`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserPatient" DROP CONSTRAINT "FK_ea0d544e50a090c0c5b5f7ca467"`,
    );
    await queryRunner.query(`DROP TABLE "UserPatient"`);

    // 5. Restore the single-user FK / UQ on Patient.
    await queryRunner.query(
      `ALTER TABLE "Patient" ADD CONSTRAINT "UQ_fd38098a3964235e38f0223d2aa" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "Patient" ADD CONSTRAINT "FK_fd38098a3964235e38f0223d2aa" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
