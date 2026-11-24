import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" ADD COLUMN "case_study_client" varchar;
  ALTER TABLE "projects" ADD COLUMN "case_study_problem" varchar;
  ALTER TABLE "projects" ADD COLUMN "case_study_result" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_case_study_client" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_case_study_problem" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_case_study_result" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "case_client_label" varchar DEFAULT 'Client';
  ALTER TABLE "site_settings" ADD COLUMN "case_problem_label" varchar DEFAULT 'The problem';
  ALTER TABLE "site_settings" ADD COLUMN "case_built_label" varchar DEFAULT 'What I built';
  ALTER TABLE "site_settings" ADD COLUMN "case_result_label" varchar DEFAULT 'Result';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_case_client_label" varchar DEFAULT 'Client';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_case_problem_label" varchar DEFAULT 'The problem';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_case_built_label" varchar DEFAULT 'What I built';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_case_result_label" varchar DEFAULT 'Result';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DROP COLUMN "case_study_client";
  ALTER TABLE "projects" DROP COLUMN "case_study_problem";
  ALTER TABLE "projects" DROP COLUMN "case_study_result";
  ALTER TABLE "_projects_v" DROP COLUMN "version_case_study_client";
  ALTER TABLE "_projects_v" DROP COLUMN "version_case_study_problem";
  ALTER TABLE "_projects_v" DROP COLUMN "version_case_study_result";
  ALTER TABLE "site_settings" DROP COLUMN "case_client_label";
  ALTER TABLE "site_settings" DROP COLUMN "case_problem_label";
  ALTER TABLE "site_settings" DROP COLUMN "case_built_label";
  ALTER TABLE "site_settings" DROP COLUMN "case_result_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_case_client_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_case_problem_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_case_built_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_case_result_label";`)
}
