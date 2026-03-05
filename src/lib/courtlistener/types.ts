export interface CLSearchFilters {
  jurisdiction?: string
  court?: string
  filed_after?: string
  filed_before?: string
}

export interface CLSearchResult {
  cluster_id: number
  case_name: string
  court_id: string
  court_name: string
  date_filed: string
  citations: string[]
  snippet: string
}

export interface CLClusterDetail {
  id: number
  case_name: string
  court_id: string
  court: string
  date_filed: string
  citations: string[]
  sub_opinions: { id: number; type: string }[]
}

export interface CLOpinionDetail {
  id: number
  cluster_id: number
  type: string
  plain_text: string
  html_with_citations: string
}

export const OPINION_TYPE_MAP: Record<string, string> = {
  '010combined': 'majority',
  '020lead': 'majority',
  '025plurality': 'plurality',
  '030concurrence': 'concurring',
  '040dissent': 'dissenting',
  '050addendum': 'addendum',
  '060remittitur': 'remittitur',
  '070rehearing': 'rehearing',
  '080on-motion': 'on-motion',
  '090per-curiam': 'per-curiam',
}
