import type { BaseMessage } from '@langchain/core/messages'

export interface CaseContext {
  disputeType: string
  role: 'plaintiff' | 'defendant'
  county: string
  healthScore: number
  tasks: Array<{ task_key: string; status: string; title: string }>
  deadlines: Array<{ key: string; due_at: string; label: string }>
  evidenceCount: number
}

export interface AgentState {
  messages: BaseMessage[]
  caseId: string
  caseContext: CaseContext
  toolCallCount: number
}

export interface InitialStateInput {
  caseId: string
  disputeType: string
  role: string
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
      role: input.role as 'plaintiff' | 'defendant',
      county: input.county,
      healthScore: input.healthScore,
      tasks: input.tasks,
      deadlines: input.deadlines,
      evidenceCount: input.evidenceCount,
    },
  }
}
