import type Anthropic from '@anthropic-ai/sdk'

export interface CaseContext {
  disputeType: string
  role: 'plaintiff' | 'defendant'
  county: string
  healthScore: number
  tasks: Array<{ task_key: string; status: string; title: string }>
  deadlines: Array<{ key: string; due_at: string; label: string }>
  evidenceCount: number
}

export interface AgentToolDefinition {
  type: 'function'
  function: {
    name: string
    description?: string
    parameters?: Record<string, unknown>
  }
}

export interface AgentTool {
  name: string
  definition: AgentToolDefinition
  invoke: (args: Record<string, unknown>) => Promise<string>
}

export interface AgentState {
  messages: Anthropic.MessageParam[]
  caseId: string
  caseContext: CaseContext
  toolCallCount: number
}

export interface InitialStateInput {
  caseId: string
  disputeType: string
  role: 'plaintiff' | 'defendant'
  county: string
  healthScore: number
  tasks: CaseContext['tasks']
  deadlines: CaseContext['deadlines']
  evidenceCount: number
}

export function createInitialState(input: InitialStateInput): AgentState {
  return {
    messages: [],
    caseId: input.caseId,
    toolCallCount: 0,
    caseContext: {
      disputeType: input.disputeType,
      role: input.role,
      county: input.county,
      healthScore: input.healthScore,
      tasks: input.tasks,
      deadlines: input.deadlines,
      evidenceCount: input.evidenceCount,
    },
  }
}
