export interface ConfidenceBreakdown {
  case_created: number        // 20 pts
  intake_completed: number     // 10 pts
  evidence_uploaded: number    // 10 pts
  filing_prep_done: number     // 10 pts
  filed_with_court: number     // 5 pts
  served_defendant: number     // 5 pts
  no_missed_deadlines: number  // 5 pts
  evidence_3plus: number       // 5 pts
  discovery_created: number    // 5 pts
  tasks_current: number        // 5 pts
  research_saved: number       // 5 pts
  notes_added: number          // 5 pts
  trial_binder: number         // 5 pts
  courtroom_prep: number       // 5 pts
}

export interface ConfidenceResult {
  score: number
  breakdown: ConfidenceBreakdown
}
