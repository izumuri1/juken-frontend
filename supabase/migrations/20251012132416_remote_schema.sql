
\restrict pMB8ZJles1f797Ul8cQ4h4rmyx7u6QSdEJUjyYNGwmcMP1YzlGUpbbbYSiMf4fj


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."exam_info" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "school_id" "uuid" NOT NULL,
    "deviation_value" numeric(4,1) NOT NULL,
    "judgment_date" "date",
    "judgment_result" character varying(20),
    "exam_candidate_sign" character varying(20),
    "application_start" "date",
    "application_end" "date",
    "application_method" "text",
    "application_note" "text",
    "fee_deadline" timestamp without time zone,
    "fee_payment_method" character varying(100),
    "fee_amount" integer,
    "fee_note" "text",
    "exam_start" timestamp without time zone NOT NULL,
    "exam_end" timestamp without time zone NOT NULL,
    "exam_venue" character varying(200) NOT NULL,
    "exam_subjects" "text" NOT NULL,
    "parent_waiting_area" character varying(200),
    "exam_note" "text",
    "announcement_time" timestamp without time zone,
    "announcement_method" character varying(100),
    "announcement_note" "text",
    "enrollment_start" timestamp without time zone,
    "enrollment_end" timestamp without time zone,
    "enrollment_method" character varying(100),
    "enrollment_note" "text",
    "admission_fee_deadline" timestamp without time zone,
    "admission_fee_payment_method" character varying(100),
    "admission_fee_amount" integer,
    "admission_fee_note" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "exam_info_check" CHECK (("exam_end" > "exam_start")),
    CONSTRAINT "exam_info_exam_candidate_sign_check" CHECK ((("exam_candidate_sign")::"text" = ANY ((ARRAY['受験'::character varying, '見送り'::character varying])::"text"[])))
);


ALTER TABLE "public"."exam_info" OWNER TO "postgres";


COMMENT ON TABLE "public"."exam_info" IS '受験情報。同じ学校でも複数回受験する場合があるため、学校に対して複数作成可能';



COMMENT ON COLUMN "public"."exam_info"."deviation_value" IS '偏差値（必須）';



COMMENT ON COLUMN "public"."exam_info"."judgment_date" IS '合否判定日';



COMMENT ON COLUMN "public"."exam_info"."judgment_result" IS '合否判定結果';



COMMENT ON COLUMN "public"."exam_info"."exam_candidate_sign" IS '受験候補サイン: 受験/見送り';



CREATE TABLE IF NOT EXISTS "public"."invitation_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "token" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_by" "uuid" NOT NULL,
    "expires_at" timestamp without time zone NOT NULL,
    "used_at" timestamp without time zone,
    "used_by" "uuid",
    "max_uses" integer DEFAULT 1 NOT NULL,
    "current_uses" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "invitation_tokens_check" CHECK (("current_uses" <= "max_uses"))
);


ALTER TABLE "public"."invitation_tokens" OWNER TO "postgres";


COMMENT ON TABLE "public"."invitation_tokens" IS 'ワークスペースへの招待トークン。有効期間24時間、利用回数1回';



COMMENT ON COLUMN "public"."invitation_tokens"."expires_at" IS '作成から24時間';



COMMENT ON COLUMN "public"."invitation_tokens"."max_uses" IS '利用可能回数';



CREATE TABLE IF NOT EXISTS "public"."school_details" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "school_id" "uuid" NOT NULL,
    "has_cafeteria" boolean,
    "has_uniform" boolean,
    "commute_route" "text",
    "commute_time" integer,
    "nearest_station" character varying(100),
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."school_details" OWNER TO "postgres";


COMMENT ON TABLE "public"."school_details" IS 'ユーザーが入力する学校の詳細情報。学校に対して1つ';



COMMENT ON COLUMN "public"."school_details"."has_cafeteria" IS '学食・購買の有無';



COMMENT ON COLUMN "public"."school_details"."has_uniform" IS '制服の有無';



COMMENT ON COLUMN "public"."school_details"."commute_route" IS '通学経路';



COMMENT ON COLUMN "public"."school_details"."commute_time" IS '自宅からの通学所要時間（分）';



COMMENT ON COLUMN "public"."school_details"."nearest_station" IS '最寄駅';



CREATE TABLE IF NOT EXISTS "public"."schools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "school_code" character varying(20) NOT NULL,
    "prefecture" character varying(10) NOT NULL,
    "establishment_type" character varying(20) NOT NULL,
    "name" character varying(100) NOT NULL,
    "address" "text" NOT NULL,
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."schools" OWNER TO "postgres";


COMMENT ON TABLE "public"."schools" IS '文科省の学校コードに基づく基礎データ。全ワークスペースで共有';



COMMENT ON COLUMN "public"."schools"."school_code" IS '文科省学校コード';



COMMENT ON COLUMN "public"."schools"."establishment_type" IS '設立区分（国立・公立・私立等）';



COMMENT ON COLUMN "public"."schools"."latitude" IS '緯度（地図表示用）';



COMMENT ON COLUMN "public"."schools"."longitude" IS '経度（地図表示用）';



CREATE TABLE IF NOT EXISTS "public"."target_schools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "school_id" "uuid" NOT NULL,
    "event_date" "date",
    "event_name" character varying(100),
    "participants" character varying(200),
    "access_method" "text",
    "talked_with" character varying(200),
    "child_aspiration" integer,
    "child_impression" "text" NOT NULL,
    "parent_aspiration" integer,
    "parent_impression" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "target_schools_child_aspiration_check" CHECK ((("child_aspiration" >= 1) AND ("child_aspiration" <= 5))),
    CONSTRAINT "target_schools_parent_aspiration_check" CHECK ((("parent_aspiration" >= 1) AND ("parent_aspiration" <= 5)))
);


ALTER TABLE "public"."target_schools" OWNER TO "postgres";


COMMENT ON TABLE "public"."target_schools" IS '学校説明会等の参加記録。学校に対して複数作成可能';



COMMENT ON COLUMN "public"."target_schools"."event_date" IS '学校イベント参加日';



COMMENT ON COLUMN "public"."target_schools"."event_name" IS '参加イベント';



COMMENT ON COLUMN "public"."target_schools"."participants" IS '参加者';



COMMENT ON COLUMN "public"."target_schools"."access_method" IS '行き方';



COMMENT ON COLUMN "public"."target_schools"."talked_with" IS 'しゃべった相手';



COMMENT ON COLUMN "public"."target_schools"."child_aspiration" IS '志望度（子供）1-5等';



COMMENT ON COLUMN "public"."target_schools"."child_impression" IS '感想（子供）必須';



COMMENT ON COLUMN "public"."target_schools"."parent_aspiration" IS '志望度（親）1-5等';



COMMENT ON COLUMN "public"."target_schools"."parent_impression" IS '感想（親）';



CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "exam_info_id" "uuid" NOT NULL,
    "task_type" character varying(30) NOT NULL,
    "assigned_to" "uuid",
    "is_completed" boolean DEFAULT false NOT NULL,
    "completed_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "tasks_task_type_check" CHECK ((("task_type")::"text" = ANY ((ARRAY['application'::character varying, 'fee_payment'::character varying, 'exam'::character varying, 'announcement'::character varying, 'enrollment'::character varying, 'admission_fee'::character varying])::"text"[])))
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


COMMENT ON TABLE "public"."tasks" IS '受験に関するタスク管理（受験申込、受験料支払、受験、合格発表、入学申込、入学金支払）';



COMMENT ON COLUMN "public"."tasks"."task_type" IS 'application/fee_payment/exam/announcement/enrollment/admission_fee';



COMMENT ON COLUMN "public"."tasks"."assigned_to" IS '担当者';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" character varying(255) NOT NULL,
    "username" character varying(20) NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "users_username_check" CHECK ((("char_length"(("username")::"text") >= 2) AND ("char_length"(("username")::"text") <= 20)))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'Supabase Authと連携。メールアドレス・ユーザー名で管理';



COMMENT ON COLUMN "public"."users"."username" IS '2-20文字';



CREATE TABLE IF NOT EXISTS "public"."workspace_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" character varying(20) DEFAULT 'member'::character varying NOT NULL,
    "joined_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "workspace_members_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['owner'::character varying, 'member'::character varying])::"text"[])))
);


ALTER TABLE "public"."workspace_members" OWNER TO "postgres";


COMMENT ON TABLE "public"."workspace_members" IS 'ワークスペースとユーザーの多対多リレーション';



COMMENT ON COLUMN "public"."workspace_members"."role" IS 'owner/member';



CREATE TABLE IF NOT EXISTS "public"."workspaces" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(30) NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "workspaces_name_check" CHECK (("char_length"(("name")::"text") <= 30))
);


ALTER TABLE "public"."workspaces" OWNER TO "postgres";


COMMENT ON TABLE "public"."workspaces" IS '中学受験情報を共有・検討する場';



COMMENT ON COLUMN "public"."workspaces"."name" IS '30文字以下、半角英数字・ひらがな・カタカナ・漢字・スペース・-・_';



ALTER TABLE ONLY "public"."exam_info"
    ADD CONSTRAINT "exam_info_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitation_tokens"
    ADD CONSTRAINT "invitation_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitation_tokens"
    ADD CONSTRAINT "invitation_tokens_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."school_details"
    ADD CONSTRAINT "school_details_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."school_details"
    ADD CONSTRAINT "school_details_workspace_id_school_id_key" UNIQUE ("workspace_id", "school_id");



ALTER TABLE ONLY "public"."schools"
    ADD CONSTRAINT "schools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schools"
    ADD CONSTRAINT "schools_school_code_key" UNIQUE ("school_code");



ALTER TABLE ONLY "public"."target_schools"
    ADD CONSTRAINT "target_schools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workspace_members"
    ADD CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workspace_members"
    ADD CONSTRAINT "workspace_members_workspace_id_user_id_key" UNIQUE ("workspace_id", "user_id");



ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_exam_info_deviation_value" ON "public"."exam_info" USING "btree" ("deviation_value");



CREATE INDEX "idx_exam_info_exam_candidate_sign" ON "public"."exam_info" USING "btree" ("exam_candidate_sign");



CREATE INDEX "idx_exam_info_exam_start" ON "public"."exam_info" USING "btree" ("exam_start");



CREATE INDEX "idx_exam_info_school_id" ON "public"."exam_info" USING "btree" ("school_id");



CREATE INDEX "idx_exam_info_workspace_id" ON "public"."exam_info" USING "btree" ("workspace_id");



CREATE INDEX "idx_invitation_tokens_expires_at" ON "public"."invitation_tokens" USING "btree" ("expires_at");



CREATE INDEX "idx_invitation_tokens_token" ON "public"."invitation_tokens" USING "btree" ("token");



CREATE INDEX "idx_invitation_tokens_workspace_id" ON "public"."invitation_tokens" USING "btree" ("workspace_id");



CREATE INDEX "idx_school_details_school_id" ON "public"."school_details" USING "btree" ("school_id");



CREATE INDEX "idx_school_details_workspace_id" ON "public"."school_details" USING "btree" ("workspace_id");



CREATE INDEX "idx_schools_name" ON "public"."schools" USING "btree" ("name");



CREATE INDEX "idx_schools_prefecture" ON "public"."schools" USING "btree" ("prefecture");



CREATE INDEX "idx_schools_school_code" ON "public"."schools" USING "btree" ("school_code");



CREATE INDEX "idx_target_schools_child_aspiration" ON "public"."target_schools" USING "btree" ("child_aspiration");



CREATE INDEX "idx_target_schools_event_date" ON "public"."target_schools" USING "btree" ("event_date");



CREATE INDEX "idx_target_schools_school_id" ON "public"."target_schools" USING "btree" ("school_id");



CREATE INDEX "idx_target_schools_workspace_id" ON "public"."target_schools" USING "btree" ("workspace_id");



CREATE INDEX "idx_tasks_assigned_to" ON "public"."tasks" USING "btree" ("assigned_to");



CREATE INDEX "idx_tasks_exam_info_id" ON "public"."tasks" USING "btree" ("exam_info_id");



CREATE INDEX "idx_tasks_is_completed" ON "public"."tasks" USING "btree" ("is_completed");



CREATE INDEX "idx_tasks_task_type" ON "public"."tasks" USING "btree" ("task_type");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_username" ON "public"."users" USING "btree" ("username");



CREATE INDEX "idx_workspace_members_user_id" ON "public"."workspace_members" USING "btree" ("user_id");



CREATE INDEX "idx_workspace_members_workspace_id" ON "public"."workspace_members" USING "btree" ("workspace_id");



CREATE INDEX "idx_workspaces_owner_id" ON "public"."workspaces" USING "btree" ("owner_id");



CREATE OR REPLACE TRIGGER "update_exam_info_updated_at" BEFORE UPDATE ON "public"."exam_info" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_school_details_updated_at" BEFORE UPDATE ON "public"."school_details" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_schools_updated_at" BEFORE UPDATE ON "public"."schools" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_target_schools_updated_at" BEFORE UPDATE ON "public"."target_schools" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tasks_updated_at" BEFORE UPDATE ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workspaces_updated_at" BEFORE UPDATE ON "public"."workspaces" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."exam_info"
    ADD CONSTRAINT "exam_info_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exam_info"
    ADD CONSTRAINT "exam_info_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitation_tokens"
    ADD CONSTRAINT "invitation_tokens_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitation_tokens"
    ADD CONSTRAINT "invitation_tokens_used_by_fkey" FOREIGN KEY ("used_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invitation_tokens"
    ADD CONSTRAINT "invitation_tokens_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."school_details"
    ADD CONSTRAINT "school_details_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."school_details"
    ADD CONSTRAINT "school_details_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."target_schools"
    ADD CONSTRAINT "target_schools_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."target_schools"
    ADD CONSTRAINT "target_schools_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_exam_info_id_fkey" FOREIGN KEY ("exam_info_id") REFERENCES "public"."exam_info"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_members"
    ADD CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_members"
    ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "workspaces_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can view schools" ON "public"."schools" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can create workspaces" ON "public"."workspaces" FOR INSERT WITH CHECK (("owner_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own profile" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own profile" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Workspace members can manage exam info" ON "public"."exam_info" USING (("workspace_id" IN ( SELECT "workspace_members"."workspace_id"
   FROM "public"."workspace_members"
  WHERE ("workspace_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Workspace members can manage school details" ON "public"."school_details" USING (("workspace_id" IN ( SELECT "workspace_members"."workspace_id"
   FROM "public"."workspace_members"
  WHERE ("workspace_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Workspace members can manage target schools" ON "public"."target_schools" USING (("workspace_id" IN ( SELECT "workspace_members"."workspace_id"
   FROM "public"."workspace_members"
  WHERE ("workspace_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Workspace members can manage tasks" ON "public"."tasks" USING (("exam_info_id" IN ( SELECT "exam_info"."id"
   FROM "public"."exam_info"
  WHERE ("exam_info"."workspace_id" IN ( SELECT "workspace_members"."workspace_id"
           FROM "public"."workspace_members"
          WHERE ("workspace_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Workspace members can view exam info" ON "public"."exam_info" FOR SELECT USING (("workspace_id" IN ( SELECT "workspace_members"."workspace_id"
   FROM "public"."workspace_members"
  WHERE ("workspace_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Workspace members can view members" ON "public"."workspace_members" FOR SELECT USING (("workspace_id" IN ( SELECT "workspace_members_1"."workspace_id"
   FROM "public"."workspace_members" "workspace_members_1"
  WHERE ("workspace_members_1"."user_id" = "auth"."uid"()))));



CREATE POLICY "Workspace members can view school details" ON "public"."school_details" FOR SELECT USING (("workspace_id" IN ( SELECT "workspace_members"."workspace_id"
   FROM "public"."workspace_members"
  WHERE ("workspace_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Workspace members can view target schools" ON "public"."target_schools" FOR SELECT USING (("workspace_id" IN ( SELECT "workspace_members"."workspace_id"
   FROM "public"."workspace_members"
  WHERE ("workspace_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Workspace members can view tasks" ON "public"."tasks" FOR SELECT USING (("exam_info_id" IN ( SELECT "exam_info"."id"
   FROM "public"."exam_info"
  WHERE ("exam_info"."workspace_id" IN ( SELECT "workspace_members"."workspace_id"
           FROM "public"."workspace_members"
          WHERE ("workspace_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Workspace members can view workspaces" ON "public"."workspaces" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members"
  WHERE (("workspace_members"."workspace_id" = "workspaces"."id") AND ("workspace_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Workspace owners can manage invitation tokens" ON "public"."invitation_tokens" USING (("workspace_id" IN ( SELECT "workspaces"."id"
   FROM "public"."workspaces"
  WHERE ("workspaces"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Workspace owners can update workspaces" ON "public"."workspaces" FOR UPDATE USING (("owner_id" = "auth"."uid"()));



ALTER TABLE "public"."exam_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invitation_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."school_details" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schools" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."target_schools" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workspace_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workspaces" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."exam_info" TO "anon";
GRANT ALL ON TABLE "public"."exam_info" TO "authenticated";
GRANT ALL ON TABLE "public"."exam_info" TO "service_role";



GRANT ALL ON TABLE "public"."invitation_tokens" TO "anon";
GRANT ALL ON TABLE "public"."invitation_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."invitation_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."school_details" TO "anon";
GRANT ALL ON TABLE "public"."school_details" TO "authenticated";
GRANT ALL ON TABLE "public"."school_details" TO "service_role";



GRANT ALL ON TABLE "public"."schools" TO "anon";
GRANT ALL ON TABLE "public"."schools" TO "authenticated";
GRANT ALL ON TABLE "public"."schools" TO "service_role";



GRANT ALL ON TABLE "public"."target_schools" TO "anon";
GRANT ALL ON TABLE "public"."target_schools" TO "authenticated";
GRANT ALL ON TABLE "public"."target_schools" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."workspace_members" TO "anon";
GRANT ALL ON TABLE "public"."workspace_members" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_members" TO "service_role";



GRANT ALL ON TABLE "public"."workspaces" TO "anon";
GRANT ALL ON TABLE "public"."workspaces" TO "authenticated";
GRANT ALL ON TABLE "public"."workspaces" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























\unrestrict pMB8ZJles1f797Ul8cQ4h4rmyx7u6QSdEJUjyYNGwmcMP1YzlGUpbbbYSiMf4fj

RESET ALL;
