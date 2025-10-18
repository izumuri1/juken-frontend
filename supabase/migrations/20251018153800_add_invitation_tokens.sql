-- 招待トークンテーブル作成
CREATE TABLE IF NOT EXISTS public.invitation_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  token uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES public.users(id),
  expires_at timestamp NOT NULL,
  used_at timestamp NULL,
  used_by uuid NULL REFERENCES public.users(id),
  max_uses int NOT NULL DEFAULT 1,
  current_uses int NOT NULL DEFAULT 0,
  created_at timestamp DEFAULT now()
);

-- インデックス追加（既に存在する場合はスキップ）
CREATE INDEX IF NOT EXISTS idx_invitation_tokens_workspace ON public.invitation_tokens(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invitation_tokens_token ON public.invitation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invitation_tokens_expires ON public.invitation_tokens(expires_at);

-- RLSポリシー設定
ALTER TABLE public.invitation_tokens ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除してから作成（冪等性を保つ）
DROP POLICY IF EXISTS "Workspace owners can create tokens" ON public.invitation_tokens;
CREATE POLICY "Workspace owners can create tokens"
  ON public.invitation_tokens
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces 
      WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can read active tokens" ON public.invitation_tokens;
CREATE POLICY "Anyone can read active tokens"
  ON public.invitation_tokens
  FOR SELECT
  USING (
    expires_at > now() 
    AND current_uses < max_uses
  );

DROP POLICY IF EXISTS "Token creators can update" ON public.invitation_tokens;
CREATE POLICY "Token creators can update"
  ON public.invitation_tokens
  FOR UPDATE
  USING (created_by = auth.uid());

-- 【追加】未認証ユーザー（anon）も招待トークンを読み取れるようにする
-- Supabaseの anon ロールに SELECT 権限を付与
GRANT SELECT ON public.invitation_tokens TO anon;
GRANT SELECT ON public.invitation_tokens TO authenticated;
