export interface EntityResult {
  legalName: string
  entityType: string
  status: string
  registeredAgent: { name: string; address: string } | null
  filingDate: string | null
  opencorporatesUrl: string
}

const OPENCORPORATES_BASE = 'https://api.opencorporates.com/v0.4'

export async function lookupBusinessEntity(
  name: string,
  state: string,
): Promise<EntityResult | null> {
  try {
    const jurisdiction = `us_${state.toLowerCase()}`
    const params = new URLSearchParams({
      q: name,
      jurisdiction_code: jurisdiction,
      per_page: '1',
    })
    const apiKey = process.env.OPENCORPORATES_API_KEY
    if (apiKey) params.set('api_token', apiKey)

    const res = await fetch(`${OPENCORPORATES_BASE}/companies/search?${params}`, {
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) return null

    const data = await res.json()
    const companies = data?.results?.companies
    if (!companies?.length) return null

    const co = companies[0].company
    return {
      legalName: co.name ?? name,
      entityType: co.company_type ?? 'Unknown',
      status: co.current_status ?? 'Unknown',
      registeredAgent: co.agent_name
        ? { name: co.agent_name, address: co.agent_address ?? '' }
        : null,
      filingDate: co.incorporation_date ?? null,
      opencorporatesUrl: co.opencorporates_url ?? '',
    }
  } catch {
    return null
  }
}
