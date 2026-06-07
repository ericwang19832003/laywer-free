export interface QuestionOption {
  value: string
  label: string
  description?: string
}

export interface QuestionDef {
  id: string
  prompt: string
  helpText?: string
  type: 'yes_no' | 'single_choice' | 'info' | 'text' | 'multi_select'
  options?: QuestionOption[]
  placeholder?: string
  /** When set, renders a third option on yes_no questions for cases that genuinely don't apply */
  notApplicable?: string
  /** For info type: overrides the default "Got it →" button label */
  acknowledgeLabel?: string
  /** For multi_select type: label for the "none of the above" option */
  noneLabel?: string
  /** Return false to skip this question based on prior answers */
  showIf?: (answers: Record<string, string>) => boolean
  /** For info type: compute prompt dynamically from current answers (overrides prompt) */
  promptFn?: (answers: Record<string, string>) => string
}

export interface SummaryItem {
  status: 'done' | 'needed' | 'info'
  text: string
}

export interface StepReference {
  label: string
  url: string
}

export interface GuidedStepConfig {
  title: string
  reassurance: string
  questions: QuestionDef[]
  generateSummary: (answers: Record<string, string>) => SummaryItem[]
  references?: StepReference[]
}
