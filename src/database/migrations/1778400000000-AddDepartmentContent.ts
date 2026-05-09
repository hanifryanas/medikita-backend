import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDepartmentContent1778400000000 implements MigrationInterface {
  name = 'AddDepartmentContent1778400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Department" ADD "content" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Department" DROP COLUMN "content"`);
  }
}
