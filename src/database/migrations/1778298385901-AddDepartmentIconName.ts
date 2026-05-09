import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDepartmentIconName1778298385901 implements MigrationInterface {
    name = 'AddDepartmentIconName1778298385901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Employee" DROP CONSTRAINT "FK_Employee_Department"`);
        await queryRunner.query(`ALTER TABLE "MedicalRecordCounter" DROP CONSTRAINT "CHK_05f71dcc9eea5ee8e97df597ef"`);
        await queryRunner.query(`ALTER TABLE "Department" ADD "iconName" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "MedicalRecordCounter" ADD CONSTRAINT "CHK_a269e4c072eaa50d77897889e8" CHECK ("lastSequence" >= 0 AND "lastSequence" <= 999999)`);
        await queryRunner.query(`ALTER TABLE "Employee" ADD CONSTRAINT "FK_9e6414e021aa19c44de3d5f9a79" FOREIGN KEY ("departmentId") REFERENCES "Department"("departmentId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Employee" DROP CONSTRAINT "FK_9e6414e021aa19c44de3d5f9a79"`);
        await queryRunner.query(`ALTER TABLE "MedicalRecordCounter" DROP CONSTRAINT "CHK_a269e4c072eaa50d77897889e8"`);
        await queryRunner.query(`ALTER TABLE "Department" DROP COLUMN "iconName"`);
        await queryRunner.query(`ALTER TABLE "MedicalRecordCounter" ADD CONSTRAINT "CHK_05f71dcc9eea5ee8e97df597ef" CHECK ((("lastSequence" >= 0) AND ("lastSequence" <= 999999)))`);
        await queryRunner.query(`ALTER TABLE "Employee" ADD CONSTRAINT "FK_Employee_Department" FOREIGN KEY ("departmentId") REFERENCES "Department"("departmentId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
