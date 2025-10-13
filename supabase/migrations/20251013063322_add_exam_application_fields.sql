-- 受験申込期限と受験申込用資材のカラムを追加
ALTER TABLE "public"."exam_info"
ADD COLUMN "application_deadline" timestamp without time zone,
ADD COLUMN "application_materials" text;

-- カラムにコメントを追加
COMMENT ON COLUMN "public"."exam_info"."application_deadline" IS '受験申込期限（年月日時刻）';
COMMENT ON COLUMN "public"."exam_info"."application_materials" IS '受験申込用資材（証明写真等）';