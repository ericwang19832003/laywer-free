export interface QuestionOption {
  value: string
  label: string
}

export interface QuestionDef {
  id: string
  prompt: string
  helpText?: string
  type: 'yes_no' | 'single_choice' | 'info' | 'text'
  options?: QuestionOption[]
  placeholder?: string
  /** Return false to skip this question based on prior answers */
  showIf?: (answers: Record<string, string>) => boolean
}

export interface SummaryItem {
  status: 'done' | 'needed' | 'info'
  text: string
}

export interface GuidedStepConfig {
  title: string
  reassurance: string
  questions: QuestionDef[]
  generateSummary: (answers: Record<string, string>) => SummaryItem[]
}
