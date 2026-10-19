import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_image_position" AS ENUM('center', 'center top', 'center bottom', 'left center', 'right center');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_image_position" AS ENUM('center', 'center top', 'center bottom', 'left center', 'right center');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_skills_category" AS ENUM('fe', 'be', 'tl');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_messages_status" AS ENUM('new', 'read', 'replied', 'spam', 'archived');
  CREATE TYPE "public"."enum_site_settings_default_vibe" AS ENUM('violet', 'aqua', 'blush');
  CREATE TYPE "public"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_version_default_vibe" AS ENUM('violet', 'aqua', 'blush');
  CREATE TYPE "public"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"title" varchar,
  	"category" varchar,
  	"year" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"image_position" "enum_projects_image_position" DEFAULT 'center',
  	"primary_link_label" varchar,
  	"primary_link_url" varchar,
  	"secondary_link_label" varchar,
  	"secondary_link_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_title" varchar,
  	"version_category" varchar,
  	"version_year" varchar,
  	"version_description" varchar,
  	"version_image_id" integer,
  	"version_image_position" "enum__projects_v_version_image_position" DEFAULT 'center',
  	"version_primary_link_label" varchar,
  	"version_primary_link_url" varchar,
  	"version_secondary_link_label" varchar,
  	"version_secondary_link_url" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_projects_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "skills" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar NOT NULL,
  	"category" "enum_skills_category" NOT NULL,
  	"blurb" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "process_steps" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "process_steps_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "experience" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"title" varchar NOT NULL,
  	"period" varchar NOT NULL,
  	"organization" varchar,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"excerpt" varchar,
  	"cover_id" integer,
  	"content" jsonb,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_cover_id" integer,
  	"version_content" jsonb,
  	"version_slug" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"project_type" varchar,
  	"message" varchar NOT NULL,
  	"status" "enum_messages_status" DEFAULT 'new' NOT NULL,
  	"notes" varchar,
  	"page_url" varchar,
  	"ip_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contact_options" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"label" varchar NOT NULL,
  	"visible" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"skills_id" integer,
  	"process_steps_id" integer,
  	"experience_id" integer,
  	"posts_id" integer,
  	"media_id" integer,
  	"messages_id" integer,
  	"contact_options_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_marquee" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"word" varchar
  );
  
  CREATE TABLE "site_settings_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "site_settings_exploring" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar DEFAULT 'Mahnoor',
  	"full_name" varchar DEFAULT 'Mahnoor Siddiqui',
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"default_vibe" "enum_site_settings_default_vibe" DEFAULT 'violet',
  	"available" boolean DEFAULT true,
  	"availability_text" varchar DEFAULT 'Available for new projects',
  	"intro" varchar,
  	"intro_muted" varchar,
  	"hero_label" varchar DEFAULT 'Mahnoor, developer',
  	"tagline" varchar DEFAULT '[ full-stack & games ]',
  	"year" varchar DEFAULT '2026',
  	"about_kicker" varchar DEFAULT 'About me',
  	"manifesto" varchar,
  	"about_text" jsonb,
  	"photo_id" integer,
  	"photo_alt" varchar,
  	"photo_tag_name" varchar DEFAULT 'Mahnoor',
  	"photo_tag_role" varchar DEFAULT 'developer',
  	"work_heading_lead" varchar DEFAULT 'Selected',
  	"work_heading_accent" varchar DEFAULT 'work',
  	"work_intro" varchar,
  	"toolkit_heading_lead" varchar DEFAULT 'My',
  	"toolkit_heading_accent" varchar DEFAULT 'toolkit',
  	"toolkit_overview_tab" varchar DEFAULT 'Overview',
  	"toolkit_title" varchar,
  	"toolkit_text" varchar,
  	"frontend_tab_label" varchar DEFAULT 'Frontend',
  	"frontend_title" varchar DEFAULT 'Frontend',
  	"frontend_count_word" varchar DEFAULT 'skills',
  	"frontend_text" varchar,
  	"frontend_card_text" varchar,
  	"backend_tab_label" varchar DEFAULT 'Backend',
  	"backend_title" varchar DEFAULT 'Backend',
  	"backend_count_word" varchar DEFAULT 'skills',
  	"backend_text" varchar,
  	"backend_card_text" varchar,
  	"tools_tab_label" varchar DEFAULT 'Tools',
  	"tools_title" varchar DEFAULT 'Tools',
  	"tools_count_word" varchar DEFAULT 'tools',
  	"tools_text" varchar,
  	"tools_card_text" varchar,
  	"exploring_label" varchar DEFAULT 'Currently exploring',
  	"process_kicker" varchar DEFAULT 'How I build',
  	"process_heading_lead" varchar DEFAULT 'From idea
  to',
  	"process_heading_accent" varchar DEFAULT 'launch',
  	"process_intro" varchar,
  	"experience_heading_lead" varchar DEFAULT 'My',
  	"experience_heading_accent" varchar DEFAULT 'experience',
  	"experience_intro" varchar,
  	"blog_kicker" varchar DEFAULT 'From the blog',
  	"blog_heading_lead" varchar DEFAULT 'Notes &',
  	"blog_heading_accent" varchar DEFAULT 'writing',
  	"blog_intro" varchar DEFAULT 'Things I learned while building, breaking and fixing my projects.',
  	"blog_all_label" varchar DEFAULT 'All posts',
  	"blog_read_label" varchar DEFAULT 'Read post',
  	"blog_back_label" varchar DEFAULT 'Back to all posts',
  	"blog_empty_text" varchar DEFAULT 'No posts yet. Check back soon.',
  	"contact_kicker" varchar DEFAULT 'Start a project',
  	"contact_heading_lead" varchar DEFAULT 'Got an idea?
  Let''s make it',
  	"contact_heading_accent" varchar DEFAULT 'real.',
  	"contact_subtext" varchar,
  	"options_label" varchar DEFAULT 'What do you need?',
  	"name_label" varchar DEFAULT 'Your name',
  	"email_label" varchar DEFAULT 'Your email',
  	"message_label" varchar DEFAULT 'Tell me about your project',
  	"send_label" varchar DEFAULT 'Send message',
  	"form_note" varchar DEFAULT 'I usually reply within a day or two.',
  	"success_message" varchar DEFAULT 'Thanks! Your message is on its way. I''ll get back to you soon.',
  	"error_message" varchar DEFAULT 'Add your name, a valid email and a short message, then send again.',
  	"rate_limit_message" varchar DEFAULT 'You''ve sent a few messages already. Please try again in an hour.',
  	"send_error_message" varchar DEFAULT 'Something went wrong while sending. Please try again, or email me directly.',
  	"location" varchar,
  	"email_card_title" varchar DEFAULT 'Email',
  	"copy_email_label" varchar DEFAULT 'Copy email',
  	"copied_label" varchar DEFAULT 'Copied',
  	"socials_title" varchar DEFAULT 'Find me online',
  	"email" varchar,
  	"github_url" varchar,
  	"linkedin_url" varchar,
  	"cta_label" varchar DEFAULT 'Let''s collab',
  	"footer_text" varchar,
  	"cv_id" integer,
  	"cv_label" varchar DEFAULT 'Download CV',
  	"cv_title" varchar DEFAULT 'CV',
  	"menu_about" varchar DEFAULT 'About',
  	"menu_work" varchar DEFAULT 'Work',
  	"menu_toolkit" varchar DEFAULT 'Toolkit',
  	"menu_process" varchar DEFAULT 'How I Build',
  	"menu_experience" varchar DEFAULT 'Experience',
  	"menu_contact" varchar DEFAULT 'Let''s Collab',
  	"menu_blog" varchar DEFAULT 'Blog',
  	"menu_say_hi" varchar DEFAULT 'Say Hi',
  	"menu_socials" varchar DEFAULT 'Socials',
  	"vibes_label" varchar DEFAULT 'Pick a vibe',
  	"vibe_toast" varchar DEFAULT 'Vibe switched to {vibe}',
  	"loader_label" varchar DEFAULT 'Loading the vibe',
  	"gravity_on" varchar DEFAULT 'Turn on gravity',
  	"gravity_on_hint" varchar DEFAULT 'Then grab the letters and throw them',
  	"gravity_off" varchar DEFAULT 'Put it back',
  	"gravity_off_hint" varchar DEFAULT 'Grab a letter and throw it',
  	"scroll_badge" varchar DEFAULT 'SCROLL TO EXPLORE • SCROLL TO EXPLORE • ',
  	"sphere_hint" varchar DEFAULT 'Drag to spin',
  	"step_label" varchar DEFAULT 'Step {n} of {total}',
  	"cursor_open" varchar DEFAULT 'Open',
  	"cursor_drag" varchar DEFAULT 'Drag',
  	"cursor_throw" varchar DEFAULT 'Throw',
  	"back_to_top" varchar DEFAULT 'BACK TO TOP • BEAM ME UP • BACK TO TOP • BEAM ME UP • ',
  	"_status" "enum_site_settings_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_site_settings_v_version_marquee" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"word" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_exploring" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_name" varchar DEFAULT 'Mahnoor',
  	"version_full_name" varchar DEFAULT 'Mahnoor Siddiqui',
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_default_vibe" "enum__site_settings_v_version_default_vibe" DEFAULT 'violet',
  	"version_available" boolean DEFAULT true,
  	"version_availability_text" varchar DEFAULT 'Available for new projects',
  	"version_intro" varchar,
  	"version_intro_muted" varchar,
  	"version_hero_label" varchar DEFAULT 'Mahnoor, developer',
  	"version_tagline" varchar DEFAULT '[ full-stack & games ]',
  	"version_year" varchar DEFAULT '2026',
  	"version_about_kicker" varchar DEFAULT 'About me',
  	"version_manifesto" varchar,
  	"version_about_text" jsonb,
  	"version_photo_id" integer,
  	"version_photo_alt" varchar,
  	"version_photo_tag_name" varchar DEFAULT 'Mahnoor',
  	"version_photo_tag_role" varchar DEFAULT 'developer',
  	"version_work_heading_lead" varchar DEFAULT 'Selected',
  	"version_work_heading_accent" varchar DEFAULT 'work',
  	"version_work_intro" varchar,
  	"version_toolkit_heading_lead" varchar DEFAULT 'My',
  	"version_toolkit_heading_accent" varchar DEFAULT 'toolkit',
  	"version_toolkit_overview_tab" varchar DEFAULT 'Overview',
  	"version_toolkit_title" varchar,
  	"version_toolkit_text" varchar,
  	"version_frontend_tab_label" varchar DEFAULT 'Frontend',
  	"version_frontend_title" varchar DEFAULT 'Frontend',
  	"version_frontend_count_word" varchar DEFAULT 'skills',
  	"version_frontend_text" varchar,
  	"version_frontend_card_text" varchar,
  	"version_backend_tab_label" varchar DEFAULT 'Backend',
  	"version_backend_title" varchar DEFAULT 'Backend',
  	"version_backend_count_word" varchar DEFAULT 'skills',
  	"version_backend_text" varchar,
  	"version_backend_card_text" varchar,
  	"version_tools_tab_label" varchar DEFAULT 'Tools',
  	"version_tools_title" varchar DEFAULT 'Tools',
  	"version_tools_count_word" varchar DEFAULT 'tools',
  	"version_tools_text" varchar,
  	"version_tools_card_text" varchar,
  	"version_exploring_label" varchar DEFAULT 'Currently exploring',
  	"version_process_kicker" varchar DEFAULT 'How I build',
  	"version_process_heading_lead" varchar DEFAULT 'From idea
  to',
  	"version_process_heading_accent" varchar DEFAULT 'launch',
  	"version_process_intro" varchar,
  	"version_experience_heading_lead" varchar DEFAULT 'My',
  	"version_experience_heading_accent" varchar DEFAULT 'experience',
  	"version_experience_intro" varchar,
  	"version_blog_kicker" varchar DEFAULT 'From the blog',
  	"version_blog_heading_lead" varchar DEFAULT 'Notes &',
  	"version_blog_heading_accent" varchar DEFAULT 'writing',
  	"version_blog_intro" varchar DEFAULT 'Things I learned while building, breaking and fixing my projects.',
  	"version_blog_all_label" varchar DEFAULT 'All posts',
  	"version_blog_read_label" varchar DEFAULT 'Read post',
  	"version_blog_back_label" varchar DEFAULT 'Back to all posts',
  	"version_blog_empty_text" varchar DEFAULT 'No posts yet. Check back soon.',
  	"version_contact_kicker" varchar DEFAULT 'Start a project',
  	"version_contact_heading_lead" varchar DEFAULT 'Got an idea?
  Let''s make it',
  	"version_contact_heading_accent" varchar DEFAULT 'real.',
  	"version_contact_subtext" varchar,
  	"version_options_label" varchar DEFAULT 'What do you need?',
  	"version_name_label" varchar DEFAULT 'Your name',
  	"version_email_label" varchar DEFAULT 'Your email',
  	"version_message_label" varchar DEFAULT 'Tell me about your project',
  	"version_send_label" varchar DEFAULT 'Send message',
  	"version_form_note" varchar DEFAULT 'I usually reply within a day or two.',
  	"version_success_message" varchar DEFAULT 'Thanks! Your message is on its way. I''ll get back to you soon.',
  	"version_error_message" varchar DEFAULT 'Add your name, a valid email and a short message, then send again.',
  	"version_rate_limit_message" varchar DEFAULT 'You''ve sent a few messages already. Please try again in an hour.',
  	"version_send_error_message" varchar DEFAULT 'Something went wrong while sending. Please try again, or email me directly.',
  	"version_location" varchar,
  	"version_email_card_title" varchar DEFAULT 'Email',
  	"version_copy_email_label" varchar DEFAULT 'Copy email',
  	"version_copied_label" varchar DEFAULT 'Copied',
  	"version_socials_title" varchar DEFAULT 'Find me online',
  	"version_email" varchar,
  	"version_github_url" varchar,
  	"version_linkedin_url" varchar,
  	"version_cta_label" varchar DEFAULT 'Let''s collab',
  	"version_footer_text" varchar,
  	"version_cv_id" integer,
  	"version_cv_label" varchar DEFAULT 'Download CV',
  	"version_cv_title" varchar DEFAULT 'CV',
  	"version_menu_about" varchar DEFAULT 'About',
  	"version_menu_work" varchar DEFAULT 'Work',
  	"version_menu_toolkit" varchar DEFAULT 'Toolkit',
  	"version_menu_process" varchar DEFAULT 'How I Build',
  	"version_menu_experience" varchar DEFAULT 'Experience',
  	"version_menu_contact" varchar DEFAULT 'Let''s Collab',
  	"version_menu_blog" varchar DEFAULT 'Blog',
  	"version_menu_say_hi" varchar DEFAULT 'Say Hi',
  	"version_menu_socials" varchar DEFAULT 'Socials',
  	"version_vibes_label" varchar DEFAULT 'Pick a vibe',
  	"version_vibe_toast" varchar DEFAULT 'Vibe switched to {vibe}',
  	"version_loader_label" varchar DEFAULT 'Loading the vibe',
  	"version_gravity_on" varchar DEFAULT 'Turn on gravity',
  	"version_gravity_on_hint" varchar DEFAULT 'Then grab the letters and throw them',
  	"version_gravity_off" varchar DEFAULT 'Put it back',
  	"version_gravity_off_hint" varchar DEFAULT 'Grab a letter and throw it',
  	"version_scroll_badge" varchar DEFAULT 'SCROLL TO EXPLORE • SCROLL TO EXPLORE • ',
  	"version_sphere_hint" varchar DEFAULT 'Drag to spin',
  	"version_step_label" varchar DEFAULT 'Step {n} of {total}',
  	"version_cursor_open" varchar DEFAULT 'Open',
  	"version_cursor_drag" varchar DEFAULT 'Drag',
  	"version_cursor_throw" varchar DEFAULT 'Throw',
  	"version_back_to_top" varchar DEFAULT 'BACK TO TOP • BEAM ME UP • BACK TO TOP • BEAM ME UP • ',
  	"version__status" "enum__site_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "email_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"notify_email" varchar DEFAULT 'mahnoorrr41@gmail.com' NOT NULL,
  	"auto_reply_enabled" boolean DEFAULT false,
  	"auto_reply_subject" varchar DEFAULT 'Thanks for your message',
  	"auto_reply_body" varchar DEFAULT 'Hi {name},
  
  Thanks for getting in touch! I''ve received your message and I''ll get back to you within a couple of days.
  
  Mahnoor',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "projects" ADD CONSTRAINT "projects_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_texts" ADD CONSTRAINT "projects_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_texts" ADD CONSTRAINT "_projects_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "process_steps_texts" ADD CONSTRAINT "process_steps_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_texts" ADD CONSTRAINT "posts_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_texts" ADD CONSTRAINT "_posts_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_process_steps_fk" FOREIGN KEY ("process_steps_id") REFERENCES "public"."process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_experience_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_messages_fk" FOREIGN KEY ("messages_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_options_fk" FOREIGN KEY ("contact_options_id") REFERENCES "public"."contact_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_marquee" ADD CONSTRAINT "site_settings_marquee_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_facts" ADD CONSTRAINT "site_settings_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_exploring" ADD CONSTRAINT "site_settings_exploring_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_cv_id_media_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_marquee" ADD CONSTRAINT "_site_settings_v_version_marquee_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_facts" ADD CONSTRAINT "_site_settings_v_version_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_exploring" ADD CONSTRAINT "_site_settings_v_version_exploring_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_cv_id_media_id_fk" FOREIGN KEY ("version_cv_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "projects__order_idx" ON "projects" USING btree ("_order");
  CREATE INDEX "projects_image_idx" ON "projects" USING btree ("image_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX "projects_texts_order_parent" ON "projects_texts" USING btree ("order","parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version__order_idx" ON "_projects_v" USING btree ("version__order");
  CREATE INDEX "_projects_v_version_version_image_idx" ON "_projects_v" USING btree ("version_image_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_autosave_idx" ON "_projects_v" USING btree ("autosave");
  CREATE INDEX "_projects_v_texts_order_parent" ON "_projects_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "skills__order_idx" ON "skills" USING btree ("_order");
  CREATE INDEX "skills_updated_at_idx" ON "skills" USING btree ("updated_at");
  CREATE INDEX "skills_created_at_idx" ON "skills" USING btree ("created_at");
  CREATE INDEX "process_steps__order_idx" ON "process_steps" USING btree ("_order");
  CREATE INDEX "process_steps_updated_at_idx" ON "process_steps" USING btree ("updated_at");
  CREATE INDEX "process_steps_created_at_idx" ON "process_steps" USING btree ("created_at");
  CREATE INDEX "process_steps_texts_order_parent" ON "process_steps_texts" USING btree ("order","parent_id");
  CREATE INDEX "experience__order_idx" ON "experience" USING btree ("_order");
  CREATE INDEX "experience_updated_at_idx" ON "experience" USING btree ("updated_at");
  CREATE INDEX "experience_created_at_idx" ON "experience" USING btree ("created_at");
  CREATE INDEX "posts_cover_idx" ON "posts" USING btree ("cover_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_texts_order_parent" ON "posts_texts" USING btree ("order","parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_cover_idx" ON "_posts_v" USING btree ("version_cover_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_texts_order_parent" ON "_posts_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "messages_ip_hash_idx" ON "messages" USING btree ("ip_hash");
  CREATE INDEX "messages_updated_at_idx" ON "messages" USING btree ("updated_at");
  CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");
  CREATE INDEX "contact_options__order_idx" ON "contact_options" USING btree ("_order");
  CREATE INDEX "contact_options_updated_at_idx" ON "contact_options" USING btree ("updated_at");
  CREATE INDEX "contact_options_created_at_idx" ON "contact_options" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_skills_id_idx" ON "payload_locked_documents_rels" USING btree ("skills_id");
  CREATE INDEX "payload_locked_documents_rels_process_steps_id_idx" ON "payload_locked_documents_rels" USING btree ("process_steps_id");
  CREATE INDEX "payload_locked_documents_rels_experience_id_idx" ON "payload_locked_documents_rels" USING btree ("experience_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("messages_id");
  CREATE INDEX "payload_locked_documents_rels_contact_options_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_options_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_marquee_order_idx" ON "site_settings_marquee" USING btree ("_order");
  CREATE INDEX "site_settings_marquee_parent_id_idx" ON "site_settings_marquee" USING btree ("_parent_id");
  CREATE INDEX "site_settings_facts_order_idx" ON "site_settings_facts" USING btree ("_order");
  CREATE INDEX "site_settings_facts_parent_id_idx" ON "site_settings_facts" USING btree ("_parent_id");
  CREATE INDEX "site_settings_exploring_order_idx" ON "site_settings_exploring" USING btree ("_order");
  CREATE INDEX "site_settings_exploring_parent_id_idx" ON "site_settings_exploring" USING btree ("_parent_id");
  CREATE INDEX "site_settings_photo_idx" ON "site_settings" USING btree ("photo_id");
  CREATE INDEX "site_settings_cv_idx" ON "site_settings" USING btree ("cv_id");
  CREATE INDEX "site_settings__status_idx" ON "site_settings" USING btree ("_status");
  CREATE INDEX "_site_settings_v_version_marquee_order_idx" ON "_site_settings_v_version_marquee" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_marquee_parent_id_idx" ON "_site_settings_v_version_marquee" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_facts_order_idx" ON "_site_settings_v_version_facts" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_facts_parent_id_idx" ON "_site_settings_v_version_facts" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_exploring_order_idx" ON "_site_settings_v_version_exploring" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_exploring_parent_id_idx" ON "_site_settings_v_version_exploring" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_version_photo_idx" ON "_site_settings_v" USING btree ("version_photo_id");
  CREATE INDEX "_site_settings_v_version_version_cv_idx" ON "_site_settings_v" USING btree ("version_cv_id");
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_latest_idx" ON "_site_settings_v" USING btree ("latest");
  CREATE INDEX "_site_settings_v_autosave_idx" ON "_site_settings_v" USING btree ("autosave");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_texts" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_texts" CASCADE;
  DROP TABLE "skills" CASCADE;
  DROP TABLE "process_steps" CASCADE;
  DROP TABLE "process_steps_texts" CASCADE;
  DROP TABLE "experience" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_texts" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_texts" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "messages" CASCADE;
  DROP TABLE "contact_options" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_marquee" CASCADE;
  DROP TABLE "site_settings_facts" CASCADE;
  DROP TABLE "site_settings_exploring" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "_site_settings_v_version_marquee" CASCADE;
  DROP TABLE "_site_settings_v_version_facts" CASCADE;
  DROP TABLE "_site_settings_v_version_exploring" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "email_settings" CASCADE;
  DROP TYPE "public"."enum_projects_image_position";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_image_position";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum_skills_category";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_messages_status";
  DROP TYPE "public"."enum_site_settings_default_vibe";
  DROP TYPE "public"."enum_site_settings_status";
  DROP TYPE "public"."enum__site_settings_v_version_default_vibe";
  DROP TYPE "public"."enum__site_settings_v_version_status";`)
}
