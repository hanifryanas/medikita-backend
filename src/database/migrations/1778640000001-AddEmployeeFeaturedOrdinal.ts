import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddEmployeeFeaturedOrdinal1778640000001 implements MigrationInterface {
  name = 'AddEmployeeFeaturedOrdinal1778640000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'Employee',
      new TableColumn({
        name: 'featuredOrdinal',
        type: 'int',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('Employee', 'featuredOrdinal');
  }
}
