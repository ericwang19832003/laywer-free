-- Quick Resolve: demand letter delivery tracking
CREATE TABLE IF NOT EXISTS demand_letter_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  lob_letter_id text NOT NULL,
  tracking_number text,
  status text NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'mailed', 'in_transit', 'delivered', 'returned', 'failed')),
  recipient_name text NOT NULL,
  recipient_address jsonb NOT NULL,
  sender_address jsonb NOT NULL,
  amount_charged_cents integer NOT NULL,
  stripe_payment_id text,
  letter_content_url text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE demand_letter_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own deliveries"
  ON demand_letter_deliveries FOR SELECT
  USING (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own deliveries"
  ON demand_letter_deliveries FOR INSERT
  WITH CHECK (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()));

-- Index for cron job: find delivered letters older than 14 days
CREATE INDEX idx_deliveries_followup
  ON demand_letter_deliveries (status, delivered_at)
  WHERE status = 'delivered';

-- Add quick_resolve flag to cases for tracking entry point
ALTER TABLE cases ADD COLUMN IF NOT EXISTS entry_point text DEFAULT 'wizard'
  CHECK (entry_point IN ('wizard', 'quick_resolve'));
