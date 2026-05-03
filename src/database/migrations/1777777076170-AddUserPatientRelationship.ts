import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPatientRelationship1777777076170 implements MigrationInterface {
  name = 'AddUserPatientRelationship1777777076170';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."UserPatient_relationship_enum" AS ENUM('self', 'spouse', 'child', 'parent', 'sibling', 'other')`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserPatient" ADD "relationship" "public"."UserPatient_relationship_enum" NOT NULL DEFAULT 'self'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "UserPatient" DROP COLUMN "relationship"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."UserPatient_relationship_enum"`,
    );
  }
}
