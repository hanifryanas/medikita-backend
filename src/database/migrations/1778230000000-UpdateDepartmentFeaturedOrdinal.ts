import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateDepartmentFeaturedOrdinal1778230000000 implements MigrationInterface {
  name = 'UpdateDepartmentFeaturedOrdinal1778230000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'Department',
      new TableColumn({
        name: 'featuredOrdinal',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'Department',
      new TableColumn({
        name: 'description',
        type: 'text',
        isNullable: true,
      }),
    );

    // Migrate isFeatured data to featuredOrdinal
    await queryRunner.query(
      `UPDATE "Department" SET "featuredOrdinal" = sub.rn
       FROM (
         SELECT "departmentId", ROW_NUMBER() OVER (ORDER BY "departmentId") AS rn
         FROM "Department"
         WHERE "isFeatured" = true
       ) sub
       WHERE "Department"."departmentId" = sub."departmentId"`,
    );

    await queryRunner.dropColumn('Department', 'isFeatured');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'Department',
      new TableColumn({
        name: 'isFeatured',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.query(
      `UPDATE "Department" SET "isFeatured" = true WHERE "featuredOrdinal" IS NOT NULL`,
    );

    await queryRunner.dropColumn('Department', 'description');
    await queryRunner.dropColumn('Department', 'featuredOrdinal');
  }
}
