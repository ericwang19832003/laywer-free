-- ============================================
-- Discovery Example Library
-- Reusable example discovery items (RFP/ROG/RFA) grouped by dispute type.
-- Read-only to authenticated users; only service role can modify.
-- ============================================

CREATE TABLE public.discovery_examples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction text DEFAULT 'TX',
  dispute_type text NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('rfp', 'rog', 'rfa')),
  title text NOT NULL,
  example_text text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_discovery_examples_lookup
  ON public.discovery_examples (jurisdiction, dispute_type, item_type);

-- ============================================
-- RLS: authenticated users can SELECT only
-- ============================================

ALTER TABLE public.discovery_examples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read discovery examples"
  ON public.discovery_examples FOR SELECT
  TO authenticated
  USING (true);

-- No INSERT/UPDATE/DELETE policies for authenticated role.
-- Only service_role (bypasses RLS) can modify rows.

-- ============================================
-- Seed: Texas general examples
-- ============================================

INSERT INTO public.discovery_examples (jurisdiction, dispute_type, item_type, title, example_text, sort_order) VALUES
  -- RFP
  ('TX', 'general', 'rfp', 'Communications between parties',
   'All communications between the parties relating to the events described in the complaint.', 1),
  ('TX', 'general', 'rfp', 'Documents and materials relating to incident',
   'All documents, photographs, recordings, or other materials relating to the incident.', 2),
  ('TX', 'general', 'rfp', 'Contracts and agreements',
   'Any contracts, agreements, or written understandings between the parties.', 3),

  -- ROG
  ('TX', 'general', 'rog', 'Persons with knowledge',
   'Identify all persons with knowledge of the events described in the complaint.', 1),
  ('TX', 'general', 'rog', 'Description of events',
   'Describe in detail your understanding of the events at issue.', 2),
  ('TX', 'general', 'rog', 'Defenses and factual basis',
   'Identify any defenses you contend apply and the factual basis for each.', 3),

  -- RFA
  ('TX', 'general', 'rfa', 'Presence at location',
   'Admit that you were present at the location on the date in question.', 1),
  ('TX', 'general', 'rfa', 'Receipt of communications',
   'Admit that you received communications from the plaintiff regarding this matter.', 2),
  ('TX', 'general', 'rfa', 'Document authenticity',
   'Admit that the attached document is a true and accurate copy.', 3);
