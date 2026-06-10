import { useState } from 'react'
import { CITY_COUNTY_MAP } from '@/lib/courts/city-county-map'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronRight, Scale, HelpCircle, X } from 'lucide-react'
import type { CourtRecommendation } from '@lawyer-free/shared/rules/court-recommendation'
import type { State } from '@lawyer-free/shared/schemas/case'
import { getStateConfig } from '@/lib/states'
import { CourtSelector } from '@/components/courts/court-selector'

const TX_COURT_LABELS: Record<string, string> = {
  jp: 'JP Court (Small Claims)',
  county: 'County Court',
  district: 'District Court',
  federal: 'Federal Court',
}

const CA_COURT_LABELS: Record<string, string> = {
  small_claims: 'Small Claims Court',
  limited_civil: 'Limited Civil Court',
  unlimited_civil: 'Unlimited Civil Court',
  federal: 'Federal Court',
}

const NY_COURT_LABELS: Record<string, string> = {
  ny_small_claims: 'Small Claims Court',
  ny_civil: 'Civil Court',
  ny_family_court: 'Family Court',
  ny_supreme: 'Supreme Court',
  federal: 'Federal Court',
}

const FL_COURT_LABELS: Record<string, string> = {
  fl_small_claims: 'Small Claims Court',
  fl_county: 'County Court',
  fl_circuit: 'Circuit Court',
  federal: 'Federal Court',
}

const PA_COURT_LABELS: Record<string, string> = {
  pa_magisterial: 'Magisterial District Court',
  pa_common_pleas: 'Court of Common Pleas',
  federal: 'Federal Court',
}

const IL_COURT_LABELS: Record<string, string> = {
  il_small_claims: 'Circuit Court — Small Claims',
  il_circuit: 'Circuit Court',
  federal: 'Federal Court',
}

const OH_COURT_LABELS: Record<string, string> = {
  oh_small_claims: 'Small Claims Court',
  oh_municipal: 'Municipal Court',
  oh_common_pleas: 'Court of Common Pleas',
  federal: 'Federal Court',
}

const GA_COURT_LABELS: Record<string, string> = {
  ga_magistrate: 'Magistrate Court',
  ga_state_court: 'State Court',
  ga_superior: 'Superior Court',
  federal: 'Federal Court',
}

const NC_COURT_LABELS: Record<string, string> = {
  nc_small_claims: 'Small Claims (Magistrate)',
  nc_district: 'District Court',
  nc_superior: 'Superior Court',
  federal: 'Federal Court',
}

const MI_COURT_LABELS: Record<string, string> = {
  mi_small_claims: 'Small Claims Court',
  mi_district: 'District Court',
  mi_circuit: 'Circuit Court',
  federal: 'Federal Court',
}

const NJ_COURT_LABELS: Record<string, string> = {
  nj_small_claims: 'Small Claims Court',
  nj_special_civil: 'Special Civil Part',
  nj_civil: 'Superior Court — Civil Part',
  nj_family: 'Superior Court — Family Part',
  federal: 'Federal Court',
}

const VA_COURT_LABELS: Record<string, string> = {
  va_small_claims: 'Small Claims Division',
  va_general_district: 'General District Court',
  va_circuit: 'Circuit Court',
  va_jdr: 'J&DR District Court',
  federal: 'Federal Court',
}

const WA_COURT_LABELS: Record<string, string> = {
  wa_small_claims: 'Small Claims Court',
  wa_district: 'District Court',
  wa_superior: 'Superior Court',
  federal: 'Federal Court',
}

const AZ_COURT_LABELS: Record<string, string> = {
  az_small_claims: 'Small Claims Court',
  az_justice: 'Justice Court',
  az_superior: 'Superior Court',
  federal: 'Federal Court',
}

const CO_COURT_LABELS: Record<string, string> = {
  co_small_claims: 'Small Claims Court',
  co_county: 'County Court',
  co_district: 'District Court',
  federal: 'Federal Court',
}

const TN_COURT_LABELS: Record<string, string> = {
  tn_general_sessions: 'General Sessions Court',
  tn_circuit: 'Circuit Court',
  federal: 'Federal Court',
}

const IN_COURT_LABELS: Record<string, string> = {
  in_small_claims: 'Small Claims Court',
  in_circuit: 'Circuit / Superior Court',
  federal: 'Federal Court',
}

const MO_COURT_LABELS: Record<string, string> = {
  mo_small_claims: 'Small Claims Court',
  mo_associate_circuit: 'Associate Circuit Court',
  mo_circuit: 'Circuit Court',
  federal: 'Federal Court',
}

const MD_COURT_LABELS: Record<string, string> = {
  md_district: 'District Court',
  md_circuit: 'Circuit Court',
  federal: 'Federal Court',
}

const WI_COURT_LABELS: Record<string, string> = {
  wi_small_claims: 'Circuit Court — Small Claims',
  wi_circuit: 'Circuit Court',
  federal: 'Federal Court',
}

const MN_COURT_LABELS: Record<string, string> = {
  mn_conciliation: 'Conciliation Court (Small Claims)',
  mn_district: 'District Court',
  federal: 'Federal Court',
}

const SC_COURT_LABELS: Record<string, string> = {
  sc_magistrate: 'Magistrate Court',
  sc_circuit: 'Circuit Court',
  federal: 'Federal Court',
}

const AL_COURT_LABELS: Record<string, string> = {
  al_small_claims: 'District Court — Small Claims',
  al_district: 'District Court',
  al_circuit: 'Circuit Court',
  federal: 'Federal Court',
}

const LA_COURT_LABELS: Record<string, string> = {
  la_small_claims: 'City Court — Small Claims',
  la_district: 'District Court',
  federal: 'Federal Court',
}

const KY_COURT_LABELS: Record<string, string> = {
  ky_small_claims: 'District Court — Small Claims',
  ky_district: 'District Court',
  ky_circuit: 'Circuit Court',
  federal: 'Federal Court',
}

const OR_COURT_LABELS: Record<string, string> = {
  or_small_claims: 'Small Claims Dept, Circuit Court',
  or_circuit: 'Circuit Court',
  federal: 'Federal Court',
}

const NV_COURT_LABELS: Record<string, string> = {
  nv_small_claims: 'Small Claims Court (Justice Court)',
  nv_district: 'District Court',
  federal: 'Federal Court',
}

const CT_COURT_LABELS: Record<string, string> = {
  ct_small_claims: 'Superior Court — Small Claims Session',
  ct_superior: 'Superior Court',
  federal: 'Federal Court',
}

const MA_COURT_LABELS: Record<string, string> = {
  ma_small_claims: 'Small Claims Session, District Court',
  ma_district: 'District Court / Superior Court',
  federal: 'Federal Court',
}

const OK_COURT_LABELS: Record<string, string> = {
  ok_small_claims: 'Small Claims Docket, District Court',
  ok_district: 'District Court',
  federal: 'Federal Court',
}

const AR_COURT_LABELS: Record<string, string> = {
  ar_small_claims: 'Small Claims Court (District Court)',
  ar_circuit: 'Circuit Court',
  federal: 'Federal Court',
}

const MS_COURT_LABELS: Record<string, string> = {
  ms_justice: 'Justice Court',
  ms_county: 'County Court',
  ms_circuit: 'Circuit Court',
  federal: 'Federal Court',
}

const UT_COURT_LABELS: Record<string, string> = {
  ut_small_claims: 'Justice Court — Small Claims',
  ut_district: 'District Court',
  federal: 'Federal Court',
}

const NM_COURT_LABELS: Record<string, string> = {
  nm_magistrate: 'Magistrate Court (or Metro Court in Bernalillo)',
  nm_district: 'District Court',
  federal: 'Federal Court',
}

const WV_COURT_LABELS: Record<string, string> = {
  wv_magistrate: 'Magistrate Court',
  wv_circuit: 'Circuit Court',
  federal: 'Federal Court',
}

const DE_COURT_LABELS: Record<string, string> = {
  de_jp: 'Justice of the Peace Court',
  de_common_pleas: 'Court of Common Pleas',
  de_superior: 'Superior Court',
  federal: 'Federal Court',
}

const RI_COURT_LABELS: Record<string, string> = {
  ri_small_claims: 'District Court Small Claims',
  ri_district: 'District Court',
  ri_superior: 'Superior Court',
  federal: 'Federal Court',
}

const NH_COURT_LABELS: Record<string, string> = {
  nh_small_claims: 'Circuit Court Small Claims',
  nh_superior: 'Superior Court',
  federal: 'Federal Court',
}

const VT_COURT_LABELS: Record<string, string> = {
  vt_small_claims: 'Small Claims Court',
  vt_superior: 'Superior Court',
  federal: 'Federal Court',
}

const ME_COURT_LABELS: Record<string, string> = {
  me_small_claims: 'District Court Small Claims',
  me_superior: 'Superior Court',
  federal: 'Federal Court',
}

const IA_COURT_LABELS: Record<string, string> = {
  ia_small_claims: 'Small Claims Court',
  ia_district: 'District Court',
  federal: 'Federal Court',
}

const KS_COURT_LABELS: Record<string, string> = {
  ks_small_claims: 'Small Claims Court',
  ks_district: 'District Court',
  federal: 'Federal Court',
}

const NE_COURT_LABELS: Record<string, string> = {
  ne_small_claims: 'County Court Small Claims',
  ne_county: 'County Court',
  ne_district: 'District Court',
  federal: 'Federal Court',
}

const SD_COURT_LABELS: Record<string, string> = {
  sd_small_claims: 'Small Claims Court',
  sd_circuit: 'Circuit Court',
  federal: 'Federal Court',
}

const ND_COURT_LABELS: Record<string, string> = {
  nd_small_claims: 'Small Claims Court',
  nd_district: 'District Court',
  federal: 'Federal Court',
}

const MT_COURT_LABELS: Record<string, string> = {
  mt_justice: 'Justice Court Small Claims',
  mt_district: 'District Court',
  federal: 'Federal Court',
}

const WY_COURT_LABELS: Record<string, string> = {
  wy_small_claims: 'Circuit Court Small Claims',
  wy_district: 'District Court',
  federal: 'Federal Court',
}

const ID_COURT_LABELS: Record<string, string> = {
  id_small_claims: 'Small Claims Court',
  id_magistrate: 'Magistrate Division',
  id_district: 'District Court',
  federal: 'Federal Court',
}

const HI_COURT_LABELS: Record<string, string> = {
  hi_small_claims: 'Small Claims Court',
  hi_district: 'District Court',
  hi_circuit: 'Circuit Court',
  federal: 'Federal Court',
}

const AK_COURT_LABELS: Record<string, string> = {
  ak_small_claims: 'District Court Small Claims',
  ak_district: 'District Court',
  federal: 'Federal Court',
}

function getCourtLabels(selectedState: State): Record<string, string> {
  switch (selectedState) {
    case 'PA': return PA_COURT_LABELS
    case 'FL': return FL_COURT_LABELS
    case 'NY': return NY_COURT_LABELS
    case 'CA': return CA_COURT_LABELS
    case 'IL': return IL_COURT_LABELS
    case 'OH': return OH_COURT_LABELS
    case 'GA': return GA_COURT_LABELS
    case 'NC': return NC_COURT_LABELS
    case 'MI': return MI_COURT_LABELS
    case 'NJ': return NJ_COURT_LABELS
    case 'VA': return VA_COURT_LABELS
    case 'WA': return WA_COURT_LABELS
    case 'AZ': return AZ_COURT_LABELS
    case 'CO': return CO_COURT_LABELS
    case 'TN': return TN_COURT_LABELS
    case 'IN': return IN_COURT_LABELS
    case 'MO': return MO_COURT_LABELS
    case 'MD': return MD_COURT_LABELS
    case 'WI': return WI_COURT_LABELS
    case 'MN': return MN_COURT_LABELS
    case 'SC': return SC_COURT_LABELS
    case 'AL': return AL_COURT_LABELS
    case 'LA': return LA_COURT_LABELS
    case 'KY': return KY_COURT_LABELS
    case 'OR': return OR_COURT_LABELS
    case 'NV': return NV_COURT_LABELS
    case 'CT': return CT_COURT_LABELS
    case 'MA': return MA_COURT_LABELS
    case 'OK': return OK_COURT_LABELS
    case 'AR': return AR_COURT_LABELS
    case 'MS': return MS_COURT_LABELS
    case 'UT': return UT_COURT_LABELS
    case 'NM': return NM_COURT_LABELS
    case 'WV': return WV_COURT_LABELS
    case 'DE': return DE_COURT_LABELS
    case 'RI': return RI_COURT_LABELS
    case 'NH': return NH_COURT_LABELS
    case 'VT': return VT_COURT_LABELS
    case 'ME': return ME_COURT_LABELS
    case 'IA': return IA_COURT_LABELS
    case 'KS': return KS_COURT_LABELS
    case 'NE': return NE_COURT_LABELS
    case 'SD': return SD_COURT_LABELS
    case 'ND': return ND_COURT_LABELS
    case 'MT': return MT_COURT_LABELS
    case 'WY': return WY_COURT_LABELS
    case 'ID': return ID_COURT_LABELS
    case 'HI': return HI_COURT_LABELS
    case 'AK': return AK_COURT_LABELS
    default: return TX_COURT_LABELS
  }
}

interface RecommendationStepProps {
  recommendation: CourtRecommendation
  selectedState?: State
  county: string
  onCountyChange: (county: string) => void
  caseName: string
  onCaseNameChange: (name: string) => void
  onAccept: (courtOverride: string | null) => void
  loading: boolean
}

export function RecommendationStep({
  recommendation,
  selectedState = 'TX',
  county,
  onCountyChange,
  caseName,
  onCaseNameChange,
  onAccept,
  loading,
}: RecommendationStepProps) {
  const [showOverride, setShowOverride] = useState(false)
  const [override, setOverride] = useState('')
  const [showCourtBrowser, setShowCourtBrowser] = useState(false)
  const [showCityLookup, setShowCityLookup] = useState(false)
  const [cityQuery, setCityQuery] = useState('')

  const courtLabels = getCourtLabels(selectedState)
  const config = getStateConfig(selectedState)
  const COUNTY_PLACEHOLDERS: Partial<Record<State, string>> = {
    PA: 'e.g. Allegheny County',
    FL: 'e.g. Miami-Dade County',
    NY: 'e.g. Kings County',
    CA: 'e.g. Los Angeles County',
    IL: 'e.g. Cook County',
    OH: 'e.g. Franklin County',
    GA: 'e.g. Fulton County',
    NC: 'e.g. Wake County',
    MI: 'e.g. Wayne County',
    NJ: 'e.g. Bergen County',
    VA: 'e.g. Fairfax County',
    WA: 'e.g. King County',
    AZ: 'e.g. Maricopa County',
    CO: 'e.g. Denver County',
    TN: 'e.g. Shelby County',
    IN: 'e.g. Marion County',
    MO: 'e.g. St. Louis County',
    MD: 'e.g. Montgomery County',
    WI: 'e.g. Milwaukee County',
    MN: 'e.g. Hennepin County',
    SC: 'e.g. Richland County',
    AL: 'e.g. Jefferson County',
    LA: 'e.g. Orleans Parish',
    KY: 'e.g. Jefferson County',
    OR: 'e.g. Multnomah County',
    NV: 'e.g. Clark County',
    CT: 'e.g. Hartford County',
    MA: 'e.g. Middlesex County',
    OK: 'e.g. Oklahoma County',
    AR: 'e.g. Pulaski County',
    MS: 'e.g. Hinds County',
    UT: 'e.g. Salt Lake County',
    NM: 'e.g. Bernalillo County',
    WV: 'e.g. Kanawha County',
    DE: 'e.g. New Castle County',
    RI: 'e.g. Providence County',
    NH: 'e.g. Hillsborough County',
    VT: 'e.g. Chittenden County',
    ME: 'e.g. Cumberland County',
    IA: 'e.g. Polk County',
    KS: 'e.g. Johnson County',
    NE: 'e.g. Douglas County',
    SD: 'e.g. Minnehaha County',
    ND: 'e.g. Cass County',
    MT: 'e.g. Yellowstone County',
    WY: 'e.g. Laramie County',
    ID: 'e.g. Ada County',
    HI: 'e.g. Honolulu County',
    AK: 'e.g. Anchorage Borough',
  }
  const countyPlaceholder = COUNTY_PLACEHOLDERS[selectedState] ?? 'e.g. Travis County'

  const recommendedLabel = courtLabels[recommendation.recommended] ?? recommendation.recommended

  const cityResults = cityQuery.length >= 2
    ? Object.entries(CITY_COUNTY_MAP[selectedState] ?? {})
        .filter(([city]) => city.includes(cityQuery.toLowerCase()))
        .map(([city, county]) => ({
          city: city.replace(/(^|[\s-])(.)/g, (_, sep, ch) => sep + ch.toUpperCase()),
          county,
        }))
        .filter((result, idx, arr) => arr.findIndex(r => r.county === result.county) === idx)
        .slice(0, 5)
    : []

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="case-name">Name your case</Label>
        <div className="relative">
          <Input
            id="case-name"
            value={caseName}
            onChange={(e) => onCaseNameChange(e.target.value.slice(0, 80))}
            placeholder="e.g. Auto Accident — May 2026"
            className="pr-8"
            autoFocus
            onFocus={(e) => e.target.select()}
          />
          {caseName && (
            <button
              type="button"
              onClick={() => onCaseNameChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-warm-muted hover:text-warm-text transition-colors"
              aria-label="Clear name"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-xs text-warm-muted">{80 - caseName.length} characters remaining</p>
      </div>
      <div className="rounded-lg border border-warm-border bg-white p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
            Our recommendation
          </p>
          {recommendation.confidence === 'high' ? (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
              High confidence
            </span>
          ) : (
            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
              Review suggested
            </span>
          )}
        </div>
        <p className="text-base font-semibold text-warm-text">
          {recommendedLabel}
        </p>
        <p className="text-sm text-warm-text leading-relaxed">
          {recommendation.reasoning}
        </p>
        {recommendation.alternativeNote && (
          <p className="text-sm text-warm-muted italic">
            {recommendation.alternativeNote}
          </p>
        )}
        {selectedState === 'NY' && recommendation.recommended === 'ny_supreme' && (
          <div className="flex items-start gap-2 p-2 bg-blue-50 rounded text-xs text-blue-700 mt-2">
            <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>In New York, Supreme Court is the main trial court — not the highest court.</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="county">Which county will you file in? <span className="font-normal text-warm-muted">(optional)</span></Label>
        <p className="text-xs text-warm-muted -mt-1">
          Usually where the defendant lives or the incident occurred.
        </p>
        <Input
          id="county"
          value={county}
          onChange={(e) => {
            onCountyChange(e.target.value)
            setCityQuery('')
            setShowCityLookup(false)
          }}
          placeholder={countyPlaceholder}
        />
        {!showCityLookup ? (
          <button
            type="button"
            className="text-xs text-calm-indigo hover:underline"
            onClick={() => setShowCityLookup(true)}
          >
            Not sure? Find by city →
          </button>
        ) : (
          <div className="space-y-2 rounded-md border border-warm-border bg-warm-bg p-3">
            <p className="text-xs font-medium text-warm-text">Enter the city where the defendant lives or the incident occurred:</p>
            <Input
              autoFocus
              placeholder="e.g. Houston"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              className="text-sm"
            />
            {cityResults.length > 0 && (
              <ul className="space-y-1">
                {cityResults.map(({ city, county: c }) => (
                  <li key={city}>
                    <button
                      type="button"
                      className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-warm-border transition-colors"
                      onClick={() => {
                        onCountyChange(c)
                        setShowCityLookup(false)
                        setCityQuery('')
                      }}
                    >
                      <span className="font-medium">{city}</span>
                      <span className="text-warm-muted"> → {c} County</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {cityQuery.length >= 2 && cityResults.length === 0 && (
              <p className="text-xs text-warm-muted">No match found. Try a nearby city or enter the county manually above.</p>
            )}
            <button
              type="button"
              className="text-xs text-warm-muted hover:text-warm-text"
              onClick={() => { setShowCityLookup(false); setCityQuery('') }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {!showOverride && !showCourtBrowser ? (
        <div className="space-y-2">
          <Button
            type="button"
            className="w-full"
            onClick={() => onAccept(null)}
            disabled={loading || !caseName.trim()}
          >
            {loading ? 'Creating...' : 'Get Started'}
          </Button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCourtBrowser(true)}
              className="flex-1 text-center text-xs text-warm-muted hover:text-warm-text transition-colors py-1 flex items-center justify-center gap-1"
            >
              <Scale className="h-3 w-3" />
              Browse Courts
            </button>
            <button
              type="button"
              onClick={() => setShowOverride(true)}
              className="flex-1 text-center text-xs text-warm-muted hover:text-warm-text transition-colors py-1 flex items-center justify-center gap-1"
            >
              Choose Different Court
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      ) : showCourtBrowser ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-warm-text">Browse all {selectedState} courts</p>
            <button
              type="button"
              onClick={() => setShowCourtBrowser(false)}
              className="text-xs text-calm-indigo hover:underline"
            >
              Back to recommendation
            </button>
          </div>
          <CourtSelector state={selectedState} compact={true} showHeader={false} />
        </div>
      ) : (
        <div className="space-y-3">
          <Label htmlFor="court-override">Select your preferred court</Label>
          <Select value={override} onValueChange={setOverride}>
            <SelectTrigger className="w-full" id="court-override">
              <SelectValue placeholder="Select a court" />
            </SelectTrigger>
            <SelectContent>
              {config.courtTypes.map((ct) => (
                <SelectItem key={ct.value} value={ct.value}>
                  {ct.label}
                </SelectItem>
              ))}
              <SelectItem value="federal">Federal Court</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            className="w-full"
            onClick={() => onAccept(override || null)}
            disabled={loading || !override || !caseName.trim()}
          >
            {loading ? 'Creating...' : 'Get Started'}
          </Button>
          <button
            type="button"
            onClick={() => setShowOverride(false)}
            className="w-full text-center text-xs text-warm-muted hover:text-warm-text transition-colors py-1"
          >
            Use recommended court
          </button>
        </div>
      )}
    </div>
  )
}
