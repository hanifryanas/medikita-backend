import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Combined migration that:
 *  1. Creates the Department table with `isClinical` and `isClinic` flags.
 *  2. Seeds the initial set of departments (matches DepartmentSeeder).
 *  3. Replaces Employee.department (enum) with Employee.departmentId (FK).
 *  4. Adds Doctor.jobTitle column.
 */
export class AddDepartmentAndDoctorJobTitle1777884969185 implements MigrationInterface {
  name = 'AddDepartmentAndDoctorJobTitle1777884969185';

  private readonly seedDepartments: Array<{
    typeCode: string;
    displayName: string;
    isFeatured: boolean;
    isClinical: boolean;
    isClinic: boolean;
  }> = [
    // Operational units
    {
      typeCode: 'frontoffice',
      displayName: 'Front Office',
      isFeatured: false,
      isClinical: false,
      isClinic: false,
    },
    {
      typeCode: 'backoffice',
      displayName: 'Back Office',
      isFeatured: false,
      isClinical: false,
      isClinic: false,
    },
    {
      typeCode: 'services',
      displayName: 'Support Services',
      isFeatured: false,
      isClinical: false,
      isClinic: false,
    },
    // Clinical support units (no outpatient clinic)
    {
      typeCode: 'laboratory',
      displayName: 'Laboratory',
      isFeatured: false,
      isClinical: true,
      isClinic: false,
    },
    {
      typeCode: 'pharmacy',
      displayName: 'Pharmacy',
      isFeatured: false,
      isClinical: true,
      isClinic: false,
    },
    {
      typeCode: 'radiology',
      displayName: 'Radiology',
      isFeatured: false,
      isClinical: true,
      isClinic: false,
    },
    {
      typeCode: 'emergency',
      displayName: 'ER',
      isFeatured: true,
      isClinical: true,
      isClinic: false,
    },
    {
      typeCode: 'generalsurgery',
      displayName: 'Operating Theatre',
      isFeatured: true,
      isClinical: true,
      isClinic: false,
    },
    // Outpatient clinics (poli)
    {
      typeCode: 'cardiology',
      displayName: 'Heart Center',
      isFeatured: true,
      isClinical: true,
      isClinic: true,
    },
    {
      typeCode: 'dermatology',
      displayName: 'Skin & Aesthetic',
      isFeatured: true,
      isClinical: true,
      isClinic: true,
    },
    {
      typeCode: 'pediatrics',
      displayName: 'Children Care',
      isFeatured: true,
      isClinical: true,
      isClinic: true,
    },
    {
      typeCode: 'neurology',
      displayName: 'Neuroscience Center',
      isFeatured: true,
      isClinical: true,
      isClinic: true,
    },
    {
      typeCode: 'orthopedics',
      displayName: 'Bone, Joint, & Mobility Center',
      isFeatured: false,
      isClinical: true,
      isClinic: true,
    },
    {
      typeCode: 'obgyn',
      displayName: "Women's Health & Maternity Care",
      isFeatured: false,
      isClinical: true,
      isClinic: true,
    },
    {
      typeCode: 'oncology',
      displayName: 'Comprehensive Cancer Center',
      isFeatured: false,
      isClinical: true,
      isClinic: true,
    },
    {
      typeCode: 'otolaryngology',
      displayName: 'ENT (Ear, Nose, & Throat) Care',
      isFeatured: false,
      isClinical: true,
      isClinic: true,
    },
    {
      typeCode: 'ophthalmology',
      displayName: 'Eye Center',
      isFeatured: false,
      isClinical: true,
      isClinic: true,
    },
    {
      typeCode: 'urology',
      displayName: 'Urology Center',
      isFeatured: false,
      isClinical: true,
      isClinic: true,
    },
    {
      typeCode: 'internist',
      displayName: 'Internist & Adult Care Center',
      isFeatured: false,
      isClinical: true,
      isClinic: true,
    },
    {
      typeCode: 'psychiatry',
      displayName: 'Mental Health & Wellness',
      isFeatured: false,
      isClinical: true,
      isClinic: true,
    },
    {
      typeCode: 'physiatry',
      displayName: 'Physical Medicine & Rehabilitation',
      isFeatured: false,
      isClinical: true,
      isClinic: true,
    },
    {
      typeCode: 'pulmonology',
      displayName: 'Respiratory Care',
      isFeatured: false,
      isClinical: true,
      isClinic: true,
    },
    {
      typeCode: 'endocrinology',
      displayName: 'Diabetes & Endocrine Center',
      isFeatured: false,
      isClinical: true,
      isClinic: true,
    },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Department table
    await queryRunner.query(
      `CREATE TABLE "Department" (
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "departmentId" SERIAL NOT NULL,
        "typeCode" character varying(50) NOT NULL,
        "displayName" character varying(100) NOT NULL,
        "isFeatured" boolean NOT NULL DEFAULT false,
        "isClinical" boolean NOT NULL DEFAULT false,
        "isClinic" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        CONSTRAINT "UQ_Department_typeCode" UNIQUE ("typeCode"),
        CONSTRAINT "PK_Department_departmentId" PRIMARY KEY ("departmentId")
      )`,
    );

    // 2. Seed initial departments (must exist before Employee backfill)
    const values = this.seedDepartments
      .map(
        (d) =>
          `('${d.typeCode}', '${d.displayName.replace(/'/g, "''")}', ${d.isFeatured}, ${d.isClinical}, ${d.isClinic}, true)`,
      )
      .join(', ');
    await queryRunner.query(
      `INSERT INTO "Department" ("typeCode", "displayName", "isFeatured", "isClinical", "isClinic", "isActive")
       VALUES ${values}`,
    );

    // 3. Add nullable departmentId column on Employee
    await queryRunner.query(
      `ALTER TABLE "Employee" ADD "departmentId" integer`,
    );

    // 4. Backfill from old enum column. Map legacy enum values to new typeCodes.
    await queryRunner.query(
      `UPDATE "Employee" e
       SET "departmentId" = d."departmentId"
       FROM "Department" d
       WHERE d."typeCode" = CASE e."department"::text
         WHEN 'frontoffice' THEN 'frontoffice'
         WHEN 'backoffice' THEN 'backoffice'
         WHEN 'pharmacy' THEN 'pharmacy'
         WHEN 'radiology' THEN 'radiology'
         WHEN 'cardiology' THEN 'cardiology'
         WHEN 'pediatric' THEN 'pediatrics'
         WHEN 'obgyn' THEN 'obgyn'
         WHEN 'ent' THEN 'otolaryngology'
         WHEN 'ophthalmology' THEN 'ophthalmology'
         WHEN 'surgery' THEN 'generalsurgery'
         WHEN 'orthopedics' THEN 'orthopedics'
         WHEN 'urology' THEN 'urology'
         WHEN 'neurology' THEN 'neurology'
         WHEN 'emergencydepartment' THEN 'emergency'
         WHEN 'icu' THEN 'emergency'
         WHEN 'inpatient' THEN 'emergency'
         ELSE 'backoffice'
       END`,
    );

    // 5. Drop old enum column and type
    await queryRunner.query(`ALTER TABLE "Employee" DROP COLUMN "department"`);
    await queryRunner.query(`DROP TYPE "public"."Employee_department_enum"`);

    // 6. Enforce NOT NULL and add FK
    await queryRunner.query(
      `ALTER TABLE "Employee" ALTER COLUMN "departmentId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Employee" ADD CONSTRAINT "FK_Employee_Department" FOREIGN KEY ("departmentId") REFERENCES "Department"("departmentId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // 7. Add Doctor.jobTitle column
    await queryRunner.query(
      `ALTER TABLE "Doctor" ADD "jobTitle" character varying(100)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 7. Drop Doctor.jobTitle
    await queryRunner.query(`ALTER TABLE "Doctor" DROP COLUMN "jobTitle"`);

    // 6. Drop FK
    await queryRunner.query(
      `ALTER TABLE "Employee" DROP CONSTRAINT "FK_Employee_Department"`,
    );

    // 5. Recreate old enum type
    await queryRunner.query(
      `CREATE TYPE "public"."Employee_department_enum" AS ENUM('frontoffice', 'backoffice', 'obgyn', 'pediatric', 'ent', 'surgery', 'radiology', 'cardiology', 'neurology', 'orthopedics', 'urology', 'ophthalmology', 'emergencydepartment', 'pharmacy', 'icu', 'inpatient')`,
    );

    // 4. Add back nullable enum column
    await queryRunner.query(
      `ALTER TABLE "Employee" ADD "department" "public"."Employee_department_enum"`,
    );

    // 3. Backfill enum from Department.typeCode (best-effort reverse mapping)
    await queryRunner.query(
      `UPDATE "Employee" e
       SET "department" = (CASE d."typeCode"
         WHEN 'pediatrics' THEN 'pediatric'
         WHEN 'otolaryngology' THEN 'ent'
         WHEN 'generalsurgery' THEN 'surgery'
         WHEN 'emergency' THEN 'emergencydepartment'
         ELSE d."typeCode"
       END)::"public"."Employee_department_enum"
       FROM "Department" d
       WHERE d."departmentId" = e."departmentId"
         AND d."typeCode" IN (
           'frontoffice', 'backoffice', 'obgyn', 'pediatrics', 'otolaryngology',
           'generalsurgery', 'radiology', 'cardiology', 'neurology', 'orthopedics',
           'urology', 'ophthalmology', 'emergency', 'pharmacy'
         )`,
    );

    // Anything that doesn't map cleanly defaults to backoffice
    await queryRunner.query(
      `UPDATE "Employee" SET "department" = 'backoffice' WHERE "department" IS NULL`,
    );

    // 2. Enforce NOT NULL on enum column
    await queryRunner.query(
      `ALTER TABLE "Employee" ALTER COLUMN "department" SET NOT NULL`,
    );

    // 1. Drop departmentId column and Department table
    await queryRunner.query(
      `ALTER TABLE "Employee" DROP COLUMN "departmentId"`,
    );
    await queryRunner.query(`DROP TABLE "Department"`);
  }
}
