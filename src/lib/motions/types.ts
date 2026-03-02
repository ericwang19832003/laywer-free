import { ZodType } from 'zod'

export interface FieldConfig {
  key: string
  type:
    | 'text'
    | 'textarea'
    | 'date'
    | 'number'
    | 'checkbox'
    | 'select'
    | 'party-picker'
    | 'dynamic-list'
  label: string
  placeholder?: string
  helperText?: string
  required?: boolean
  section: number
  sectionTitle?: string
  options?: { label: string; value: string }[]
  listItemFields?: FieldConfig[]
  showWhen?: { field: string; value: unknown }
}

export type MotionCategory = 'discovery' | 'pretrial' | 'trial' | 'post_trial'

export interface MotionConfig {
  key: string
  title: string
  description: string
  reassurance: string
  category: MotionCategory

  fields: FieldConfig[]
  schema: ZodType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Each config's buildPrompt
  // accepts its own typed facts; Zod validates at runtime before the call.
  buildPrompt: (facts: any) => { system: string; user: string }
  documentType: string

  taskKey?: string // if it can appear as a gatekeeper task
}
