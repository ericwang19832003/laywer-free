CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'deadline_approaching', 'task_unlocked', 'email_sent',
    'email_failed', 'escalation_triggered'
  )),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread
  ON public.notifications (user_id, read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Service can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);
