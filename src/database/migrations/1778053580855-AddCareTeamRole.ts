import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCareTeamRole1778053580855 implements MigrationInterface {
  name = 'AddCareTeamRole1778053580855';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."User_role_enum" RENAME TO "User_role_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."User_role_enum" AS ENUM('user', 'staff', 'careteam', 'admin', 'superadmin')`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ALTER COLUMN "role" TYPE "public"."User_role_enum" USING "role"::"text"::"public"."User_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user'`,
    );
    await queryRunner.query(`DROP TYPE "public"."User_role_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."User_role_enum" RENAME TO "User_role_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."User_role_enum" AS ENUM('user', 'staff', 'admin', 'superadmin')`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ALTER COLUMN "role" TYPE "public"."User_role_enum" USING "role"::"text"::"public"."User_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user'`,
    );
    await queryRunner.query(`DROP TYPE "public"."User_role_enum_old"`);
  }
}
