-- 学校詳細情報テーブルに公式サイトURLカラムを追加
ALTER TABLE "public"."school_details"
ADD COLUMN "official_website" character varying(255) NULL;

COMMENT ON COLUMN "public"."school_details"."official_website" IS '公式サイトURL';