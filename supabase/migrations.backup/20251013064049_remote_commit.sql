alter table "public"."exam_info" drop constraint "exam_info_exam_candidate_sign_check";

alter table "public"."tasks" drop constraint "tasks_task_type_check";

alter table "public"."workspace_members" drop constraint "workspace_members_role_check";

alter table "public"."exam_info" add constraint "exam_info_exam_candidate_sign_check" CHECK (((exam_candidate_sign)::text = ANY ((ARRAY['受験'::character varying, '見送り'::character varying])::text[]))) not valid;

alter table "public"."exam_info" validate constraint "exam_info_exam_candidate_sign_check";

alter table "public"."tasks" add constraint "tasks_task_type_check" CHECK (((task_type)::text = ANY ((ARRAY['application'::character varying, 'fee_payment'::character varying, 'exam'::character varying, 'announcement'::character varying, 'enrollment'::character varying, 'admission_fee'::character varying])::text[]))) not valid;

alter table "public"."tasks" validate constraint "tasks_task_type_check";

alter table "public"."workspace_members" add constraint "workspace_members_role_check" CHECK (((role)::text = ANY ((ARRAY['owner'::character varying, 'member'::character varying])::text[]))) not valid;

alter table "public"."workspace_members" validate constraint "workspace_members_role_check";


