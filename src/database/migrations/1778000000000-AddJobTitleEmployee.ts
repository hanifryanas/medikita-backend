import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJobTitleEmployee1778000000000 implements MigrationInterface {
  name = 'AddJobTitleEmployee1778000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Employee" ADD "jobTitle" character varying(100)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Employee" DROP COLUMN "jobTitle"`);
  }
}
