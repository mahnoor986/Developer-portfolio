import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"title" varchar NOT NULL,
  	"problem" varchar NOT NULL,
  	"outcome" varchar NOT NULL,
  	"ask_option_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_why_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_why_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "services_kicker" varchar DEFAULT 'What I do';
  ALTER TABLE "site_settings" ADD COLUMN "services_heading_lead" varchar DEFAULT 'Services';
  ALTER TABLE "site_settings" ADD COLUMN "services_heading_accent" varchar DEFAULT 'that grow your business';
  ALTER TABLE "site_settings" ADD COLUMN "services_intro" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "services_problem_label" varchar DEFAULT 'The problem';
  ALTER TABLE "site_settings" ADD COLUMN "services_outcome_label" varchar DEFAULT 'What you get';
  ALTER TABLE "site_settings" ADD COLUMN "services_ask_label" varchar DEFAULT 'Ask about this';
  ALTER TABLE "site_settings" ADD COLUMN "services_note" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "why_kicker" varchar DEFAULT 'Why work with me';
  ALTER TABLE "site_settings" ADD COLUMN "why_heading_lead" varchar DEFAULT 'Why';
  ALTER TABLE "site_settings" ADD COLUMN "why_heading_accent" varchar DEFAULT 'clients pick me';
  ALTER TABLE "site_settings" ADD COLUMN "menu_services" varchar DEFAULT 'Services';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_services_kicker" varchar DEFAULT 'What I do';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_services_heading_lead" varchar DEFAULT 'Services';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_services_heading_accent" varchar DEFAULT 'that grow your business';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_services_intro" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_services_problem_label" varchar DEFAULT 'The problem';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_services_outcome_label" varchar DEFAULT 'What you get';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_services_ask_label" varchar DEFAULT 'Ask about this';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_services_note" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_why_kicker" varchar DEFAULT 'Why work with me';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_why_heading_lead" varchar DEFAULT 'Why';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_why_heading_accent" varchar DEFAULT 'clients pick me';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_menu_services" varchar DEFAULT 'Services';
  ALTER TABLE "services" ADD CONSTRAINT "services_ask_option_id_contact_options_id_fk" FOREIGN KEY ("ask_option_id") REFERENCES "public"."contact_options"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_why_items" ADD CONSTRAINT "site_settings_why_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_why_items" ADD CONSTRAINT "_site_settings_v_version_why_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services__order_idx" ON "services" USING btree ("_order");
  CREATE INDEX "services_ask_option_idx" ON "services" USING btree ("ask_option_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "site_settings_why_items_order_idx" ON "site_settings_why_items" USING btree ("_order");
  CREATE INDEX "site_settings_why_items_parent_id_idx" ON "site_settings_why_items" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_why_items_order_idx" ON "_site_settings_v_version_why_items" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_why_items_parent_id_idx" ON "_site_settings_v_version_why_items" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_why_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_settings_v_version_why_items" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services" CASCADE;
  DROP TABLE "site_settings_why_items" CASCADE;
  DROP TABLE "_site_settings_v_version_why_items" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_services_fk";
  
  DROP INDEX "payload_locked_documents_rels_services_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "services_id";
  ALTER TABLE "site_settings" DROP COLUMN "services_kicker";
  ALTER TABLE "site_settings" DROP COLUMN "services_heading_lead";
  ALTER TABLE "site_settings" DROP COLUMN "services_heading_accent";
  ALTER TABLE "site_settings" DROP COLUMN "services_intro";
  ALTER TABLE "site_settings" DROP COLUMN "services_problem_label";
  ALTER TABLE "site_settings" DROP COLUMN "services_outcome_label";
  ALTER TABLE "site_settings" DROP COLUMN "services_ask_label";
  ALTER TABLE "site_settings" DROP COLUMN "services_note";
  ALTER TABLE "site_settings" DROP COLUMN "why_kicker";
  ALTER TABLE "site_settings" DROP COLUMN "why_heading_lead";
  ALTER TABLE "site_settings" DROP COLUMN "why_heading_accent";
  ALTER TABLE "site_settings" DROP COLUMN "menu_services";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_services_kicker";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_services_heading_lead";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_services_heading_accent";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_services_intro";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_services_problem_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_services_outcome_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_services_ask_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_services_note";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_why_kicker";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_why_heading_lead";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_why_heading_accent";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_menu_services";`)
}
