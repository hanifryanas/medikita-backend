import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPhotoUrlUser1778053580856 implements MigrationInterface {
  name = 'AddPhotoUrlUser1778053580856';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'User',
      new TableColumn({
        name: 'photoUrl',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'Employee',
      new TableColumn({
        name: 'photoUrl',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('Employee', 'photoUrl');
    await queryRunner.dropColumn('User', 'photoUrl');
  }
}
