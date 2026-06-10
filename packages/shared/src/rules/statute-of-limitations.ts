/**
 * Statute of Limitations rules by state and dispute type.
 *
 * Returns the SOL period in years. Each dispute type maps to a default
 * SOL; sub-types may override. Family law disputes generally have no
 * traditional SOL (marked as null).
 *
 * Sources:
 *  - TX: Tex. Civ. Prac. & Rem. Code §§ 16.001–16.070
 *  - CA: Cal. Code Civ. Proc. §§ 312–366.3
 *  - NY: CPLR §§ 201–218
 *  - FL: Fla. Stat. §§ 95.011–95.18
 *  - PA: 42 Pa. C.S. §§ 5501–5574
 *  - IL: 735 ILCS 5/13-201 through 5/13-215
 *  - OH: ORC §§ 2305.06–2305.131
 *  - GA: O.C.G.A. §§ 9-3-24 through 9-3-96
 *  - NC: N.C.G.S. §§ 1-47 through 1-56
 *  - MI: MCL §§ 600.5805–600.5855
 *  - NJ: N.J.S.A. 2A:14-1 through 2A:14-3
 *  - VA: Va. Code §§ 8.01-243 through 8.01-249
 *  - WA: RCW 4.16.010–4.16.190
 *  - AZ: A.R.S. §§ 12-541 through 12-548
 *  - CO: C.R.S. §§ 13-80-101 through 13-80-103.5
 *  - TN: TCA §§ 28-3-104, 28-3-105, 28-3-109
 *  - IN: IC §§ 34-11-2-4, 34-11-2-7, 34-11-2-9
 *  - MO: RSMo §§ 516.110, 516.120
 *  - MD: Md. Code, Cts. & Jud. Proc. §§ 5-101, 5-102
 *  - WI: Wis. Stat. §§ 893.43, 893.52, 893.54
 *  - MN: Minn. Stat. §§ 541.05, 541.07
 *  - SC: SC Code §§ 15-3-530, 36-2-725
 *  - AL: Ala. Code §§ 6-2-34, 6-2-38
 *  - LA: La. Civ. Code arts. 3492, 3499
 *  - KY: KRS §§ 413.090, 413.120, 413.125, 413.140
 *  - OR: ORS §§ 12.080, 12.110
 *  - NV: NRS §§ 11.190
 *  - CT: CGS §§ 52-576, 52-581, 52-584
 *  - MA: MGL c. 260, §§ 2, 2A
 *  - OK: 12 O.S. § 95
 *  - AR: A.C.A. §§ 16-56-105, 16-56-111, 16-56-115
 *  - MS: Miss. Code § 15-1-49
 *  - UT: Utah Code §§ 78B-2-307, 78B-2-309
 *  - NM: N.M. Stat. §§ 37-1-3, 37-1-4, 37-1-8
 *  - WV: W. Va. Code §§ 55-2-6, 55-2-12
 *  - DE: 10 Del. C. §§ 8106, 8119
 *  - RI: R.I. Gen. Laws §§ 9-1-13, 9-1-14
 *  - NH: RSA § 508:4
 *  - VT: 12 V.S.A. §§ 511, 512
 *  - ME: 14 M.R.S.A. § 752
 *  - IA: Iowa Code §§ 614.1(2), 614.1(4), 614.1(5)
 *  - KS: KSA §§ 60-511, 60-512, 60-513
 *  - NE: Neb. Rev. Stat. §§ 25-205, 25-206, 25-207
 *  - SD: SDCL §§ 15-2-13, 15-2-14
 *  - ND: NDCC § 28-01-16
 *  - MT: MCA §§ 27-2-202, 27-2-204, 27-2-207
 *  - WY: W.S. § 1-3-105
 *  - ID: Idaho Code §§ 5-216, 5-217, 5-218, 5-219
 *  - HI: HRS §§ 657-1, 657-7
 *  - AK: AS §§ 09.10.053, 09.10.070
 */

type State = 'TX' | 'CA' | 'NY' | 'FL' | 'PA' | 'IL' | 'OH' | 'GA' | 'NC' | 'MI' | 'NJ' | 'VA' | 'WA' | 'AZ' | 'CO'
  | 'TN' | 'IN' | 'MO' | 'MD' | 'WI' | 'MN' | 'SC' | 'AL' | 'LA' | 'KY'
  | 'OR' | 'NV' | 'CT' | 'MA' | 'OK' | 'AR' | 'MS' | 'UT' | 'NM' | 'WV'
  | 'DE' | 'RI' | 'NH' | 'VT' | 'ME' | 'IA' | 'KS' | 'NE' | 'SD' | 'ND'
  | 'MT' | 'WY' | 'ID' | 'HI' | 'AK'

// null = no SOL / not applicable (e.g., family law filings)
type SolYears = number | null

interface SolRule {
  default: SolYears
  overrides?: Record<string, SolYears>
  notes?: string
}

type SolRuleMap = Record<string, SolRule>

const TX_RULES: SolRuleMap = {
  personal_injury: {
    default: 2,
    notes: 'Tex. Civ. Prac. & Rem. Code § 16.003',
  },
  contract: {
    default: 4,
    overrides: { oral: 4, written: 4, employment: 2 },
    notes: 'Tex. Civ. Prac. & Rem. Code § 16.004',
  },
  property: {
    default: 2,
    overrides: { trespass: 2, boundary_dispute: 4, title_defect: 4 },
    notes: 'Tex. Civ. Prac. & Rem. Code § 16.003',
  },
  landlord_tenant: {
    default: 2,
    overrides: { security_deposit: 2, property_damage: 2, lease_termination: 4 },
    notes: 'Tex. Civ. Prac. & Rem. Code § 16.003',
  },
  small_claims: {
    default: 2,
    overrides: { breach_of_contract: 4, unpaid_loan: 4 },
    notes: 'Follows underlying cause of action SOL',
  },
  debt_collection: {
    default: 4,
    overrides: { medical_bills: 4, credit_card: 4, personal_loan: 4 },
    notes: 'Tex. Civ. Prac. & Rem. Code § 16.004',
  },
  real_estate: {
    default: 4,
    overrides: { fraud: 4, construction_defect: 10 },
    notes: 'Tex. Civ. Prac. & Rem. Code § 16.004; construction per § 16.009',
  },
  business: {
    default: 4,
    notes: 'Generally follows contract SOL',
  },
  family: {
    default: null,
    notes: 'Family law filings are not subject to traditional SOL',
  },
  other: {
    default: 2,
    overrides: {
      fraud: 4,
      defamation: 1,
      consumer_protection: 2,
      conversion: 2,
      unjust_enrichment: 4,
    },
    notes: 'Varies by cause of action',
  },
}

const CA_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'Cal. Code Civ. Proc. § 335.1' },
  contract: { default: 4, overrides: { oral: 2, written: 4 }, notes: 'Cal. Code Civ. Proc. §§ 337, 339' },
  property: { default: 3, notes: 'Cal. Code Civ. Proc. § 338' },
  landlord_tenant: { default: 2, notes: 'Cal. Code Civ. Proc. § 339' },
  small_claims: { default: 2, overrides: { breach_of_contract: 4 } },
  debt_collection: { default: 4 },
  real_estate: { default: 4, overrides: { construction_defect_latent: 10, construction_defect_patent: 4, construction_defect: 10 } },
  business: { default: 4 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 3, defamation: 1 } },
}

const NY_RULES: SolRuleMap = {
  personal_injury: { default: 3, notes: 'CPLR § 214' },
  contract: { default: 6, overrides: { oral: 6, written: 6 }, notes: 'CPLR § 213' },
  property: { default: 3, notes: 'CPLR § 214' },
  landlord_tenant: { default: 3 },
  small_claims: { default: 3, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, notes: 'CPLR § 213' },
  real_estate: { default: 6 },
  business: { default: 6 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 6, defamation: 1 } },
}

const FL_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'Fla. Stat. § 95.11(3)' },
  contract: { default: 5, overrides: { oral: 4, written: 5 }, notes: 'Fla. Stat. § 95.11(2)' },
  property: { default: 4, notes: 'Fla. Stat. § 95.11(3)' },
  landlord_tenant: { default: 4 },
  small_claims: { default: 4, overrides: { breach_of_contract: 5 } },
  debt_collection: { default: 5 },
  real_estate: { default: 5 },
  business: { default: 5 },
  family: { default: null },
  other: { default: 4, overrides: { fraud: 4, defamation: 2 } },
}

const PA_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: '42 Pa. C.S. § 5524' },
  contract: { default: 4, overrides: { oral: 4, written: 4 }, notes: '42 Pa. C.S. § 5525' },
  property: { default: 2, notes: '42 Pa. C.S. § 5524' },
  landlord_tenant: { default: 2 },
  small_claims: { default: 2, overrides: { breach_of_contract: 4 } },
  debt_collection: { default: 4 },
  real_estate: { default: 4 },
  business: { default: 4 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 2, defamation: 1 } },
}

// Illinois — 735 ILCS 5/13-xxx
const IL_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: '735 ILCS 5/13-202' },
  contract: { default: 5, overrides: { oral: 5, written: 10 }, notes: '735 ILCS 5/13-205 (oral/open account); 5/13-206 (written)' },
  property: { default: 5, notes: '735 ILCS 5/13-205' },
  landlord_tenant: { default: 5, overrides: { security_deposit: 5 }, notes: '735 ILCS 5/13-205 (oral lease); 5/13-206 (written lease)' },
  small_claims: { default: 2, overrides: { breach_of_contract: 5 } },
  debt_collection: { default: 5, overrides: { credit_card: 5, medical_bills: 10 }, notes: '735 ILCS 5/13-205 (open account); 5/13-206 (written)' },
  real_estate: { default: 5, overrides: { fraud: 5, construction_defect: 5 }, notes: '735 ILCS 5/13-205' },
  business: { default: 5 },
  family: { default: null },
  other: { default: 5, overrides: { fraud: 5, defamation: 1 }, notes: '735 ILCS 5/13-201 (defamation); 5/13-205 (general)' },
}

// Ohio — ORC § 2305.xxx
const OH_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'ORC § 2305.10' },
  contract: { default: 6, overrides: { oral: 4, written: 6 }, notes: 'ORC §§ 2305.06 (written); 2305.07 (oral)' },
  property: { default: 2, overrides: { real_property: 4 }, notes: 'ORC §§ 2305.10; 2305.09(D)' },
  landlord_tenant: { default: 6, overrides: { security_deposit: 6 }, notes: 'ORC § 2305.06' },
  small_claims: { default: 2, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: 'ORC § 2305.06' },
  real_estate: { default: 4, overrides: { fraud: 4 }, notes: 'ORC § 2305.09(C)' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 4, defamation: 1 }, notes: 'ORC § 2305.11(A) (defamation); ORC § 2305.09(C) (fraud)' },
}

// Georgia — O.C.G.A. § 9-3-xxx
const GA_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'O.C.G.A. § 9-3-33' },
  contract: { default: 4, overrides: { oral: 4, written: 6 }, notes: 'O.C.G.A. §§ 9-3-24 (written); 9-3-26 (oral)' },
  property: { default: 4, notes: 'O.C.G.A. § 9-3-32' },
  landlord_tenant: { default: 4, overrides: { security_deposit: 4 }, notes: 'O.C.G.A. § 9-3-26 or § 9-3-32' },
  small_claims: { default: 2, overrides: { breach_of_contract: 4 } },
  debt_collection: { default: 4, overrides: { credit_card: 4, medical_bills: 6 }, notes: 'O.C.G.A. §§ 9-3-25 (open account); 9-3-24 (written)' },
  real_estate: { default: 4, overrides: { fraud: 4 }, notes: 'O.C.G.A. § 9-3-96' },
  business: { default: 4 },
  family: { default: null },
  other: { default: 4, overrides: { fraud: 4, defamation: 1 }, notes: 'O.C.G.A. § 9-3-33 (defamation)' },
}

// North Carolina — N.C.G.S. § 1-52, § 1-47
const NC_RULES: SolRuleMap = {
  personal_injury: { default: 3, notes: 'N.C.G.S. § 1-52(5)' },
  contract: { default: 3, overrides: { oral: 3, written: 3, written_under_seal: 10 }, notes: 'N.C.G.S. §§ 1-52(1); 1-47(2) (under seal)' },
  property: { default: 3, notes: 'N.C.G.S. § 1-52(4)' },
  landlord_tenant: { default: 3, overrides: { security_deposit: 3 }, notes: 'N.C.G.S. § 1-52(1)' },
  small_claims: { default: 3, overrides: { breach_of_contract: 3 } },
  debt_collection: { default: 3, overrides: { credit_card: 3, medical_bills: 3 }, notes: 'N.C.G.S. § 1-52(1)' },
  real_estate: { default: 3, overrides: { fraud: 3 }, notes: 'N.C.G.S. § 1-52(9)' },
  business: { default: 3 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 3, defamation: 1 }, notes: 'N.C.G.S. § 1-54(3) (defamation)' },
}

// Michigan — MCL § 600.5805 et seq.
const MI_RULES: SolRuleMap = {
  personal_injury: { default: 3, notes: 'MCL § 600.5805(2)' },
  contract: { default: 6, overrides: { oral: 6, written: 6 }, notes: 'MCL § 600.5807(8)' },
  property: { default: 3, notes: 'MCL § 600.5805(2)' },
  landlord_tenant: { default: 6, overrides: { security_deposit: 6 }, notes: 'MCL § 600.5807(8)' },
  small_claims: { default: 3, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: 'MCL § 600.5807(8)' },
  real_estate: { default: 6, overrides: { fraud: 6 }, notes: 'MCL §§ 600.5807(8); 600.5855 (tolling)' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 6, defamation: 1 }, notes: 'MCL § 600.5805(9) (defamation)' },
}

// New Jersey — N.J.S.A. 2A:14-1 et seq.
const NJ_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'N.J.S.A. 2A:14-2(a)' },
  contract: { default: 6, overrides: { oral: 6, written: 6 }, notes: 'N.J.S.A. 2A:14-1' },
  property: { default: 6, notes: 'N.J.S.A. 2A:14-1' },
  landlord_tenant: { default: 6, overrides: { security_deposit: 6 }, notes: 'N.J.S.A. 2A:14-1; N.J.S.A. 46:8-21.1' },
  small_claims: { default: 2, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: 'N.J.S.A. 2A:14-1' },
  real_estate: { default: 6, overrides: { fraud: 6 }, notes: 'N.J.S.A. 2A:14-1' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 6, overrides: { fraud: 6, defamation: 1 }, notes: 'N.J.S.A. 2A:14-3 (defamation)' },
}

// Virginia — Va. Code § 8.01-243 et seq.
const VA_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'Va. Code § 8.01-243(A)' },
  contract: { default: 5, overrides: { oral: 3, written: 5 }, notes: 'Va. Code §§ 8.01-246(A)(2) (written); 8.01-246(A)(4) (oral)' },
  property: { default: 5, notes: 'Va. Code § 8.01-243(B)' },
  landlord_tenant: { default: 1, overrides: { security_deposit: 1 }, notes: 'Va. Code § 55.1-1226; 1 year from move-out' },
  small_claims: { default: 2, overrides: { breach_of_contract: 5 } },
  debt_collection: { default: 5, overrides: { credit_card: 5, medical_bills: 3 }, notes: 'Va. Code §§ 8.01-246(A)(2); 8.01-246(B) (medical debt 3 yrs)' },
  real_estate: { default: 2, overrides: { fraud: 2 }, notes: 'Va. Code § 8.01-249(1) (discovery rule)' },
  business: { default: 5 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 2, defamation: 1 }, notes: 'Va. Code § 8.01-247.1 (defamation)' },
}

// Washington — RCW 4.16.xxx
const WA_RULES: SolRuleMap = {
  personal_injury: { default: 3, notes: 'RCW 4.16.080(2)' },
  contract: { default: 6, overrides: { oral: 3, written: 6 }, notes: 'RCW 4.16.040(1) (written); RCW 4.16.080(3) (oral)' },
  property: { default: 3, notes: 'RCW 4.16.080(1)' },
  landlord_tenant: { default: 3, overrides: { security_deposit: 3 }, notes: 'RCW 4.16.080(2); Silver v. Rudeen Mgmt. Co. (2021)' },
  small_claims: { default: 3, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 3 }, notes: 'RCW 4.16.040(1) (written); RCW 4.16.150 (open account)' },
  real_estate: { default: 3, overrides: { fraud: 3 }, notes: 'RCW 4.16.080(4) (discovery rule)' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 3, defamation: 2 }, notes: 'RCW 4.16.100(1) (defamation)' },
}

// Arizona — A.R.S. § 12-541 et seq.
const AZ_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'A.R.S. § 12-542' },
  contract: { default: 6, overrides: { oral: 3, written: 6 }, notes: 'A.R.S. §§ 12-548 (written/credit card); 12-543 (oral)' },
  property: { default: 2, notes: 'A.R.S. § 12-542' },
  landlord_tenant: { default: 2, overrides: { security_deposit: 2 }, notes: 'A.R.S. §§ 12-542; 12-543; 33-1321' },
  small_claims: { default: 2, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: 'A.R.S. § 12-548 (credit card expressly included since 2011)' },
  real_estate: { default: 3, overrides: { fraud: 3 }, notes: 'A.R.S. § 12-543(3) (discovery rule)' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 3, defamation: 1 }, notes: 'A.R.S. § 12-541(1) (defamation)' },
}

// Colorado — C.R.S. § 13-80-101 et seq.
const CO_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'C.R.S. § 13-80-102(1)(a)' },
  contract: { default: 3, overrides: { oral: 3, written: 3, written_liquidated: 6 }, notes: 'C.R.S. §§ 13-80-101(1)(a) (general); 13-80-103.5 (liquidated debt/promissory notes)' },
  property: { default: 2, notes: 'C.R.S. § 13-80-102(1)(b)' },
  landlord_tenant: { default: 3, overrides: { security_deposit: 3 }, notes: 'C.R.S. §§ 38-12-103; 13-80-101' },
  small_claims: { default: 2, overrides: { breach_of_contract: 3 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 3 }, notes: 'C.R.S. § 13-80-103.5 (liquidated debt); § 13-80-101 (general)' },
  real_estate: { default: 3, overrides: { fraud: 3 }, notes: 'C.R.S. § 13-80-101(1)(c) (discovery rule)' },
  business: { default: 3 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 3, defamation: 1 }, notes: 'C.R.S. § 13-80-103(1)(a) (defamation)' },
}

// Tennessee — TCA §§ 28-3-104, 28-3-105, 28-3-109
const TN_RULES: SolRuleMap = {
  personal_injury: { default: 1, notes: 'TCA § 28-3-104 — 1 year from date of injury' },
  contract: { default: 6, overrides: { oral: 6, written: 6 }, notes: 'TCA § 28-3-109' },
  property: { default: 3, notes: 'TCA § 28-3-105' },
  landlord_tenant: { default: 3, overrides: { security_deposit: 3 }, notes: 'TCA § 28-3-105' },
  small_claims: { default: 1, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 1 }, notes: 'TCA § 28-3-109; medical bills follow PI SOL' },
  real_estate: { default: 3, overrides: { fraud: 3 }, notes: 'TCA § 28-3-105' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 1, overrides: { fraud: 3, defamation: 1 }, notes: 'TCA § 28-3-104 (defamation)' },
}

// Indiana — IC §§ 34-11-2-4, 34-11-2-7, 34-11-2-9
const IN_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'IC § 34-11-2-4' },
  contract: { default: 6, overrides: { oral: 6, written: 6 }, notes: 'IC §§ 34-11-2-7 (oral); 34-11-2-9 (written money)' },
  property: { default: 6, notes: 'IC § 34-11-2-7' },
  landlord_tenant: { default: 6, overrides: { security_deposit: 6 }, notes: 'IC § 34-11-2-7' },
  small_claims: { default: 2, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: 'IC § 34-11-2-9' },
  real_estate: { default: 6, overrides: { fraud: 6 }, notes: 'IC § 34-11-2-7' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 6, defamation: 2 }, notes: 'IC § 34-15-1-2 (defamation)' },
}

// Missouri — RSMo §§ 516.110, 516.120
const MO_RULES: SolRuleMap = {
  personal_injury: { default: 5, notes: 'RSMo § 516.120(4)' },
  contract: { default: 5, overrides: { oral: 5, written: 5, written_liquidated: 10 }, notes: 'RSMo §§ 516.110 (written/liquidated); 516.120(1) (general)' },
  property: { default: 5, notes: 'RSMo § 516.120(4)' },
  landlord_tenant: { default: 5, overrides: { security_deposit: 5 }, notes: 'RSMo § 516.120(1)' },
  small_claims: { default: 5, overrides: { breach_of_contract: 5 } },
  debt_collection: { default: 10, overrides: { credit_card: 5, medical_bills: 5 }, notes: 'RSMo § 516.110 (written instrument); § 516.120 (open account)' },
  real_estate: { default: 5, overrides: { fraud: 5 }, notes: 'RSMo § 516.120' },
  business: { default: 5 },
  family: { default: null },
  other: { default: 5, overrides: { fraud: 5, defamation: 2 }, notes: 'RSMo § 516.145 (defamation)' },
}

// Maryland — Md. Code, Cts. & Jud. Proc. §§ 5-101, 5-102
const MD_RULES: SolRuleMap = {
  personal_injury: { default: 3, notes: 'Md. Code, CJP § 5-101' },
  contract: { default: 3, overrides: { oral: 3, written: 3, written_under_seal: 12 }, notes: 'Md. Code, CJP §§ 5-101 (general); 5-102 (under seal = 12 years)' },
  property: { default: 3, notes: 'Md. Code, CJP § 5-101' },
  landlord_tenant: { default: 3, overrides: { security_deposit: 3 }, notes: 'Md. Code, CJP § 5-101' },
  small_claims: { default: 3, overrides: { breach_of_contract: 3 } },
  debt_collection: { default: 3, overrides: { credit_card: 3, medical_bills: 3 }, notes: 'Md. Code, CJP § 5-101' },
  real_estate: { default: 3, overrides: { fraud: 3 }, notes: 'Md. Code, CJP § 5-101' },
  business: { default: 3 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 3, defamation: 1 }, notes: 'Md. Code, CJP § 5-105 (defamation)' },
}

// Wisconsin — Wis. Stat. §§ 893.43, 893.52, 893.54
const WI_RULES: SolRuleMap = {
  personal_injury: { default: 3, notes: 'Wis. Stat. § 893.54(1)' },
  contract: { default: 6, overrides: { oral: 6, written: 6 }, notes: 'Wis. Stat. § 893.43' },
  property: { default: 6, notes: 'Wis. Stat. § 893.52' },
  landlord_tenant: { default: 6, overrides: { security_deposit: 6 }, notes: 'Wis. Stat. § 893.43' },
  small_claims: { default: 3, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: 'Wis. Stat. § 893.43' },
  real_estate: { default: 6, overrides: { fraud: 6 }, notes: 'Wis. Stat. § 893.43' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 6, defamation: 2 }, notes: 'Wis. Stat. § 893.57 (defamation)' },
}

// Minnesota — Minn. Stat. §§ 541.05, 541.07
const MN_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'Minn. Stat. § 541.07(1)' },
  contract: { default: 6, overrides: { oral: 6, written: 6 }, notes: 'Minn. Stat. § 541.05, subd. 1(1)' },
  property: { default: 6, notes: 'Minn. Stat. § 541.05, subd. 1(5)' },
  landlord_tenant: { default: 6, overrides: { security_deposit: 6 }, notes: 'Minn. Stat. § 541.05' },
  small_claims: { default: 2, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: 'Minn. Stat. § 541.05, subd. 1(1)' },
  real_estate: { default: 6, overrides: { fraud: 6 }, notes: 'Minn. Stat. § 541.05' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 6, defamation: 2 }, notes: 'Minn. Stat. § 541.07(1) (defamation)' },
}

// South Carolina — SC Code §§ 15-3-530, 36-2-725
const SC_RULES: SolRuleMap = {
  personal_injury: { default: 3, notes: 'SC Code § 15-3-530' },
  contract: { default: 3, overrides: { oral: 3, written: 3, ucc_goods: 4 }, notes: 'SC Code §§ 15-3-530; 36-2-725 (UCC goods)' },
  property: { default: 3, notes: 'SC Code § 15-3-530' },
  landlord_tenant: { default: 3, overrides: { security_deposit: 3 }, notes: 'SC Code § 15-3-530' },
  small_claims: { default: 3, overrides: { breach_of_contract: 3 } },
  debt_collection: { default: 3, overrides: { credit_card: 3, medical_bills: 3 }, notes: 'SC Code § 15-3-530' },
  real_estate: { default: 3, overrides: { fraud: 3 }, notes: 'SC Code § 15-3-530' },
  business: { default: 3 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 3, defamation: 2 }, notes: 'SC Code § 15-3-550 (defamation)' },
}

// Alabama — Ala. Code §§ 6-2-34, 6-2-38
const AL_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'Ala. Code § 6-2-38(l)' },
  contract: { default: 6, overrides: { oral: 6, written: 6, written_under_seal: 10 }, notes: 'Ala. Code §§ 6-2-34(9) (unsealed); 6-2-33(1) (under seal)' },
  property: { default: 6, notes: 'Ala. Code § 6-2-34(8)' },
  landlord_tenant: { default: 6, overrides: { security_deposit: 6 }, notes: 'Ala. Code § 6-2-34' },
  small_claims: { default: 2, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: 'Ala. Code § 6-2-34(9)' },
  real_estate: { default: 6, overrides: { fraud: 6 }, notes: 'Ala. Code § 6-2-34' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 6, defamation: 2 }, notes: 'Ala. Code § 6-2-38(k) (defamation)' },
}

// Louisiana — La. Civ. Code arts. 3492 (as amended 2024), 3499
const LA_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'La. Civ. Code art. 3492 (2 years for incidents on/after July 1, 2024; 1 year prior)' },
  contract: { default: 10, overrides: { oral: 10, written: 10 }, notes: 'La. Civ. Code art. 3499' },
  property: { default: 2, notes: 'La. Civ. Code art. 3492 (delictual action)' },
  landlord_tenant: { default: 10, overrides: { security_deposit: 2 }, notes: 'La. Civ. Code art. 3499 (contract); art. 3492 (tort)' },
  small_claims: { default: 2, overrides: { breach_of_contract: 10 } },
  debt_collection: { default: 10, overrides: { credit_card: 10, medical_bills: 10 }, notes: 'La. Civ. Code art. 3499' },
  real_estate: { default: 10, overrides: { fraud: 5 }, notes: 'La. Civ. Code art. 3499; 3492 (fraud); La. R.S. 9:5622 (construction defect)' },
  business: { default: 10 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 5, defamation: 1 }, notes: 'La. Civ. Code art. 3492 (delict); art. 3546 (defamation)' },
}

// Kentucky — KRS §§ 413.090, 413.120, 413.125, 413.140
const KY_RULES: SolRuleMap = {
  personal_injury: { default: 1, notes: 'KRS § 413.140(1)(a) — 1 year from date of injury' },
  contract: { default: 5, overrides: { oral: 5, written: 5 }, notes: 'KRS § 413.120(1)' },
  property: { default: 2, notes: 'KRS § 413.125 (personal property damage)' },
  landlord_tenant: { default: 5, overrides: { security_deposit: 5 }, notes: 'KRS § 413.120(1)' },
  small_claims: { default: 1, overrides: { breach_of_contract: 5 } },
  debt_collection: { default: 5, overrides: { credit_card: 5, medical_bills: 1 }, notes: 'KRS § 413.120; medical bills follow PI SOL' },
  real_estate: { default: 5, overrides: { fraud: 5 }, notes: 'KRS § 413.120' },
  business: { default: 5 },
  family: { default: null },
  other: { default: 1, overrides: { fraud: 5, defamation: 1 }, notes: 'KRS § 413.140(1)(d) (defamation)' },
}

// Oregon — ORS §§ 12.080, 12.110
const OR_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'ORS § 12.110(1)' },
  contract: { default: 6, overrides: { oral: 6, written: 6 }, notes: 'ORS § 12.080(1)' },
  property: { default: 6, notes: 'ORS § 12.080(1)' },
  landlord_tenant: { default: 6, overrides: { security_deposit: 6 }, notes: 'ORS § 12.080(1)' },
  small_claims: { default: 2, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: 'ORS § 12.080(1)' },
  real_estate: { default: 6, overrides: { fraud: 2 }, notes: 'ORS § 12.080; § 12.110 (fraud 2yr)' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 2, defamation: 1 }, notes: 'ORS § 12.120 (defamation 1yr)' },
}

// Nevada — NRS § 11.190
const NV_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'NRS § 11.190(4)(e)' },
  contract: { default: 6, overrides: { oral: 4, written: 6 }, notes: 'NRS § 11.190(1) (written); § 11.190(2) (oral/implied)' },
  property: { default: 3, notes: 'NRS § 11.190(3)' },
  landlord_tenant: { default: 4, overrides: { security_deposit: 4 }, notes: 'NRS § 11.190(2)' },
  small_claims: { default: 2, overrides: { breach_of_contract: 4 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: 'NRS § 11.190(1) (written contract)' },
  real_estate: { default: 6, overrides: { fraud: 3 }, notes: 'NRS § 11.190; § 11.190(3) (fraud)' },
  business: { default: 4 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 3, defamation: 2 }, notes: 'NRS § 11.190(4)(e)' },
}

// Connecticut — CGS §§ 52-576, 52-581, 52-584
const CT_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'CGS § 52-584' },
  contract: { default: 6, overrides: { oral: 3, written: 6 }, notes: 'CGS § 52-576 (written 6yr); § 52-581 (oral/executory 3yr)' },
  property: { default: 2, notes: 'CGS § 52-584' },
  landlord_tenant: { default: 6, overrides: { security_deposit: 2 }, notes: 'CGS § 52-576; § 52-584 (tort)' },
  small_claims: { default: 2, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: 'CGS § 52-576' },
  real_estate: { default: 6, overrides: { fraud: 3 }, notes: 'CGS § 52-576' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 3, defamation: 2 }, notes: 'CGS § 52-597 (defamation)' },
}

// Massachusetts — MGL c. 260, §§ 2, 2A
const MA_RULES: SolRuleMap = {
  personal_injury: { default: 3, notes: 'MGL c. 260, § 2A' },
  contract: { default: 6, overrides: { oral: 6, written: 6 }, notes: 'MGL c. 260, § 2' },
  property: { default: 3, notes: 'MGL c. 260, § 2A' },
  landlord_tenant: { default: 6, overrides: { security_deposit: 3 }, notes: 'MGL c. 260, §§ 2, 2A' },
  small_claims: { default: 3, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: 'MGL c. 260, § 2' },
  real_estate: { default: 6, overrides: { fraud: 3 }, notes: 'MGL c. 260, §§ 2, 2A' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 3, defamation: 3 }, notes: 'MGL c. 260, § 4 (defamation)' },
}

// Oklahoma — 12 O.S. § 95
const OK_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: '12 O.S. § 95(A)(3)' },
  contract: { default: 5, overrides: { oral: 3, written: 5 }, notes: '12 O.S. § 95(A)(1) (written 5yr); § 95(A)(2) (oral 3yr)' },
  property: { default: 2, notes: '12 O.S. § 95(A)(3)' },
  landlord_tenant: { default: 5, overrides: { security_deposit: 5 }, notes: '12 O.S. § 95(A)(1)' },
  small_claims: { default: 2, overrides: { breach_of_contract: 5 } },
  debt_collection: { default: 5, overrides: { credit_card: 5, medical_bills: 5 }, notes: '12 O.S. § 95(A)(1)' },
  real_estate: { default: 5, overrides: { fraud: 2 }, notes: '12 O.S. § 95(A)(1)' },
  business: { default: 3 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 2, defamation: 1 }, notes: '12 O.S. § 95(A)(4) (libel/slander 1yr)' },
}

// Arkansas — A.C.A. §§ 16-56-105, 16-56-111, 16-56-115
const AR_RULES: SolRuleMap = {
  personal_injury: { default: 3, notes: 'A.C.A. § 16-56-105(3)' },
  contract: { default: 5, overrides: { oral: 3, written: 5 }, notes: 'A.C.A. § 16-56-111 (written 5yr); § 16-56-105(1) (oral 3yr)' },
  property: { default: 3, notes: 'A.C.A. § 16-56-105(4)' },
  landlord_tenant: { default: 5, overrides: { security_deposit: 5 }, notes: 'A.C.A. § 16-56-111' },
  small_claims: { default: 3, overrides: { breach_of_contract: 5 } },
  debt_collection: { default: 5, overrides: { credit_card: 5, medical_bills: 5 }, notes: 'A.C.A. § 16-56-111' },
  real_estate: { default: 5, overrides: { fraud: 5 }, notes: 'A.C.A. § 16-56-111' },
  business: { default: 5 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 5, defamation: 3 }, notes: 'A.C.A. § 16-56-105' },
}

// Mississippi — Miss. Code § 15-1-49 (general 3yr catchall)
const MS_RULES: SolRuleMap = {
  personal_injury: { default: 3, notes: 'Miss. Code § 15-1-49' },
  contract: { default: 3, overrides: { oral: 3, written: 3 }, notes: 'Miss. Code § 15-1-49 (3yr catchall)' },
  property: { default: 3, notes: 'Miss. Code § 15-1-49' },
  landlord_tenant: { default: 3, overrides: { security_deposit: 3 }, notes: 'Miss. Code § 15-1-49' },
  small_claims: { default: 3, overrides: { breach_of_contract: 3 } },
  debt_collection: { default: 3, overrides: { credit_card: 3, medical_bills: 3 }, notes: 'Miss. Code § 15-1-49' },
  real_estate: { default: 3, overrides: { fraud: 3 }, notes: 'Miss. Code § 15-1-49' },
  business: { default: 3 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 3, defamation: 1 }, notes: 'Miss. Code § 15-1-35 (defamation 1yr)' },
}

// Utah — Utah Code §§ 78B-2-307, 78B-2-309
const UT_RULES: SolRuleMap = {
  personal_injury: { default: 4, notes: 'Utah Code § 78B-2-307(3)' },
  contract: { default: 6, overrides: { oral: 4, written: 6 }, notes: 'Utah Code § 78B-2-309(2) (written 6yr); § 78B-2-307(1) (oral 4yr)' },
  property: { default: 3, notes: 'Utah Code § 78B-2-305(3)' },
  landlord_tenant: { default: 6, overrides: { security_deposit: 6 }, notes: 'Utah Code § 78B-2-309(2)' },
  small_claims: { default: 4, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: 'Utah Code § 78B-2-309(2)' },
  real_estate: { default: 6, overrides: { fraud: 3 }, notes: 'Utah Code § 78B-2-309; § 78B-2-305' },
  business: { default: 4 },
  family: { default: null },
  other: { default: 4, overrides: { fraud: 3, defamation: 1 }, notes: 'Utah Code § 78B-2-302(2) (defamation 1yr)' },
}

// New Mexico — N.M. Stat. §§ 37-1-3, 37-1-4, 37-1-8
const NM_RULES: SolRuleMap = {
  personal_injury: { default: 3, notes: 'N.M. Stat. § 37-1-8' },
  contract: { default: 6, overrides: { oral: 4, written: 6 }, notes: 'N.M. Stat. § 37-1-3 (written 6yr); § 37-1-4 (oral 4yr)' },
  property: { default: 4, notes: 'N.M. Stat. § 37-1-4' },
  landlord_tenant: { default: 6, overrides: { security_deposit: 6 }, notes: 'N.M. Stat. § 37-1-3' },
  small_claims: { default: 3, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: 'N.M. Stat. § 37-1-3' },
  real_estate: { default: 6, overrides: { fraud: 4 }, notes: 'N.M. Stat. §§ 37-1-3, 37-1-4' },
  business: { default: 4 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 4, defamation: 3 }, notes: 'N.M. Stat. § 37-1-8' },
}

// West Virginia — W. Va. Code §§ 55-2-6, 55-2-12
const WV_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'W. Va. Code § 55-2-12(b)' },
  contract: { default: 10, overrides: { oral: 5, written: 10 }, notes: 'W. Va. Code § 55-2-6 (written 10yr — tied for longest nationally); oral contracts 5yr' },
  property: { default: 2, notes: 'W. Va. Code § 55-2-12(a)' },
  landlord_tenant: { default: 10, overrides: { security_deposit: 2 }, notes: 'W. Va. Code § 55-2-6 (contract); § 55-2-12 (tort)' },
  small_claims: { default: 2, overrides: { breach_of_contract: 10 } },
  debt_collection: { default: 10, overrides: { credit_card: 10, medical_bills: 10 }, notes: 'W. Va. Code § 55-2-6' },
  real_estate: { default: 10, overrides: { fraud: 2 }, notes: 'W. Va. Code §§ 55-2-6, 55-2-12' },
  business: { default: 5 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 2, defamation: 1 }, notes: 'W. Va. Code § 55-2-12; § 55-2-12(d) (defamation 1yr)' },
}

// Delaware — 10 Del. C. §§ 8106, 8119
const DE_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: '10 Del. C. § 8119' },
  contract: { default: 3, overrides: { oral: 3, written: 3 }, notes: '10 Del. C. § 8106' },
  property: { default: 2, notes: '10 Del. C. § 8119' },
  landlord_tenant: { default: 3, overrides: { security_deposit: 3 }, notes: '10 Del. C. § 8106' },
  small_claims: { default: 2, overrides: { breach_of_contract: 3 } },
  debt_collection: { default: 3, overrides: { credit_card: 3, medical_bills: 3 }, notes: '10 Del. C. § 8106' },
  real_estate: { default: 3, overrides: { fraud: 3 }, notes: '10 Del. C. § 8106' },
  business: { default: 3 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 3, defamation: 2 }, notes: '10 Del. C. § 8119' },
}

// Rhode Island — R.I. Gen. Laws §§ 9-1-13, 9-1-14
const RI_RULES: SolRuleMap = {
  personal_injury: { default: 3, notes: 'R.I. Gen. Laws § 9-1-14' },
  contract: { default: 10, overrides: { oral: 10, written: 10 }, notes: 'R.I. Gen. Laws § 9-1-13 (10yr catchall); contracts under seal: 20yr' },
  property: { default: 10, notes: 'R.I. Gen. Laws § 9-1-13' },
  landlord_tenant: { default: 10, overrides: { security_deposit: 10 }, notes: 'R.I. Gen. Laws § 9-1-13' },
  small_claims: { default: 3, overrides: { breach_of_contract: 10 } },
  debt_collection: { default: 10, overrides: { credit_card: 10, medical_bills: 10 }, notes: 'R.I. Gen. Laws § 9-1-13' },
  real_estate: { default: 10, overrides: { fraud: 10 }, notes: 'R.I. Gen. Laws § 9-1-13' },
  business: { default: 10 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 10, defamation: 3 }, notes: 'R.I. Gen. Laws § 9-1-14' },
}

// New Hampshire — RSA § 508:4
const NH_RULES: SolRuleMap = {
  personal_injury: { default: 3, notes: 'RSA § 508:4 (discovery rule applies)' },
  contract: { default: 3, overrides: { oral: 3, written: 3 }, notes: 'RSA § 508:4; contracts under seal: 20yr' },
  property: { default: 3, notes: 'RSA § 508:4' },
  landlord_tenant: { default: 3, overrides: { security_deposit: 3 }, notes: 'RSA § 508:4' },
  small_claims: { default: 3, overrides: { breach_of_contract: 3 } },
  debt_collection: { default: 3, overrides: { credit_card: 3, medical_bills: 3 }, notes: 'RSA § 508:4' },
  real_estate: { default: 3, overrides: { fraud: 3 }, notes: 'RSA § 508:4' },
  business: { default: 3 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 3, defamation: 3 }, notes: 'RSA § 508:4' },
}

// Vermont — 12 V.S.A. §§ 511, 512
const VT_RULES: SolRuleMap = {
  personal_injury: { default: 3, notes: '12 V.S.A. § 512(4)' },
  contract: { default: 6, overrides: { oral: 6, written: 6 }, notes: '12 V.S.A. § 511' },
  property: { default: 3, notes: '12 V.S.A. § 512(5)' },
  landlord_tenant: { default: 6, overrides: { security_deposit: 3 }, notes: '12 V.S.A. §§ 511, 512' },
  small_claims: { default: 3, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: '12 V.S.A. § 511' },
  real_estate: { default: 6, overrides: { fraud: 3 }, notes: '12 V.S.A. §§ 511, 512' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 3, defamation: 3 }, notes: '12 V.S.A. § 512' },
}

// Maine — 14 M.R.S.A. § 752
const ME_RULES: SolRuleMap = {
  personal_injury: { default: 6, notes: '14 M.R.S.A. § 752 (6yr general limit; note: UCC goods: 4yr under 11 M.R.S.A. § 2-725)' },
  contract: { default: 6, overrides: { oral: 6, written: 6 }, notes: '14 M.R.S.A. § 752' },
  property: { default: 6, notes: '14 M.R.S.A. § 752' },
  landlord_tenant: { default: 6, overrides: { security_deposit: 6 }, notes: '14 M.R.S.A. § 752' },
  small_claims: { default: 6, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: '14 M.R.S.A. § 752' },
  real_estate: { default: 6, overrides: { fraud: 6 }, notes: '14 M.R.S.A. § 752' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 6, overrides: { fraud: 6, defamation: 2 }, notes: '14 M.R.S.A. § 752; § 753 (defamation 2yr)' },
}

// Iowa — Iowa Code §§ 614.1(2), 614.1(4), 614.1(5)
const IA_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'Iowa Code § 614.1(2)' },
  contract: { default: 10, overrides: { oral: 5, written: 10 }, notes: 'Iowa Code § 614.1(5) (written 10yr); § 614.1(4) (oral 5yr)' },
  property: { default: 5, notes: 'Iowa Code § 614.1(4)' },
  landlord_tenant: { default: 10, overrides: { security_deposit: 10 }, notes: 'Iowa Code § 614.1(5)' },
  small_claims: { default: 2, overrides: { breach_of_contract: 10 } },
  debt_collection: { default: 10, overrides: { credit_card: 10, medical_bills: 10 }, notes: 'Iowa Code § 614.1(5)' },
  real_estate: { default: 10, overrides: { fraud: 5 }, notes: 'Iowa Code §§ 614.1(5), 614.1(4)' },
  business: { default: 5 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 5, defamation: 2 }, notes: 'Iowa Code § 614.1(2)' },
}

// Kansas — KSA §§ 60-511, 60-512, 60-513
const KS_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'KSA § 60-513' },
  contract: { default: 5, overrides: { oral: 3, written: 5 }, notes: 'KSA § 60-511 (written 5yr); § 60-512 (oral 3yr)' },
  property: { default: 2, notes: 'KSA § 60-513(b)' },
  landlord_tenant: { default: 5, overrides: { security_deposit: 5 }, notes: 'KSA § 60-511' },
  small_claims: { default: 2, overrides: { breach_of_contract: 5 } },
  debt_collection: { default: 5, overrides: { credit_card: 5, medical_bills: 5 }, notes: 'KSA § 60-511' },
  real_estate: { default: 5, overrides: { fraud: 2 }, notes: 'KSA §§ 60-511, 60-513' },
  business: { default: 3 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 2, defamation: 1 }, notes: 'KSA § 60-514(a) (defamation 1yr)' },
}

// Nebraska — Neb. Rev. Stat. §§ 25-205, 25-206, 25-207
const NE_RULES: SolRuleMap = {
  personal_injury: { default: 4, notes: 'Neb. Rev. Stat. § 25-207' },
  contract: { default: 5, overrides: { oral: 4, written: 5 }, notes: 'Neb. Rev. Stat. § 25-205 (written 5yr); § 25-206 (oral 4yr)' },
  property: { default: 4, notes: 'Neb. Rev. Stat. § 25-207' },
  landlord_tenant: { default: 5, overrides: { security_deposit: 5 }, notes: 'Neb. Rev. Stat. § 25-205' },
  small_claims: { default: 4, overrides: { breach_of_contract: 5 } },
  debt_collection: { default: 5, overrides: { credit_card: 5, medical_bills: 5 }, notes: 'Neb. Rev. Stat. § 25-205' },
  real_estate: { default: 5, overrides: { fraud: 4 }, notes: 'Neb. Rev. Stat. §§ 25-205, 25-207' },
  business: { default: 4 },
  family: { default: null },
  other: { default: 4, overrides: { fraud: 4, defamation: 1 }, notes: 'Neb. Rev. Stat. § 25-208 (defamation 1yr)' },
}

// South Dakota — SDCL §§ 15-2-13, 15-2-14
const SD_RULES: SolRuleMap = {
  personal_injury: { default: 3, notes: 'SDCL § 15-2-14(3)' },
  contract: { default: 6, overrides: { oral: 6, written: 6 }, notes: 'SDCL § 15-2-13(1) — SD uses same 6yr for both written and oral contracts' },
  property: { default: 6, notes: 'SDCL § 15-2-13' },
  landlord_tenant: { default: 6, overrides: { security_deposit: 6 }, notes: 'SDCL § 15-2-13' },
  small_claims: { default: 3, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: 'SDCL § 15-2-13' },
  real_estate: { default: 6, overrides: { fraud: 3 }, notes: 'SDCL §§ 15-2-13, 15-2-14' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 3, defamation: 2 }, notes: 'SDCL § 20-11-5 (defamation 2yr)' },
}

// North Dakota — NDCC § 28-01-16
const ND_RULES: SolRuleMap = {
  personal_injury: { default: 6, notes: 'NDCC § 28-01-16(5) — ND applies uniform 6yr to all civil claims' },
  contract: { default: 6, overrides: { oral: 6, written: 6 }, notes: 'NDCC § 28-01-16(1),(2)' },
  property: { default: 6, notes: 'NDCC § 28-01-16(5)' },
  landlord_tenant: { default: 6, overrides: { security_deposit: 6 }, notes: 'NDCC § 28-01-16' },
  small_claims: { default: 6, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: 'NDCC § 28-01-16' },
  real_estate: { default: 6, overrides: { fraud: 6 }, notes: 'NDCC § 28-01-16' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 6, overrides: { fraud: 6, defamation: 2 }, notes: 'NDCC § 28-01-18(3) (defamation 2yr)' },
}

// Montana — MCA §§ 27-2-202, 27-2-204, 27-2-207
const MT_RULES: SolRuleMap = {
  personal_injury: { default: 3, notes: 'MCA § 27-2-204(2)' },
  contract: { default: 8, overrides: { oral: 5, written: 8 }, notes: 'MCA § 27-2-202(1) (written 8yr); § 27-2-202(2) (oral 5yr)' },
  property: { default: 2, notes: 'MCA § 27-2-207' },
  landlord_tenant: { default: 8, overrides: { security_deposit: 8 }, notes: 'MCA § 27-2-202(1)' },
  small_claims: { default: 3, overrides: { breach_of_contract: 8 } },
  debt_collection: { default: 8, overrides: { credit_card: 8, medical_bills: 8 }, notes: 'MCA § 27-2-202(1)' },
  real_estate: { default: 8, overrides: { fraud: 2 }, notes: 'MCA §§ 27-2-202, 27-2-207' },
  business: { default: 5 },
  family: { default: null },
  other: { default: 3, overrides: { fraud: 2, defamation: 2 }, notes: 'MCA § 27-2-204(2); § 27-2-204(3) (defamation 2yr)' },
}

// Wyoming — W.S. § 1-3-105
const WY_RULES: SolRuleMap = {
  personal_injury: { default: 4, notes: 'W.S. § 1-3-105(a)(iv)(C)' },
  contract: { default: 10, overrides: { oral: 8, written: 10 }, notes: 'W.S. § 1-3-105(a)(i) (written 10yr); § 1-3-105(a)(ii) (oral 8yr) — among longest nationally' },
  property: { default: 4, notes: 'W.S. § 1-3-105(a)(iv)(C)' },
  landlord_tenant: { default: 10, overrides: { security_deposit: 10 }, notes: 'W.S. § 1-3-105(a)(i)' },
  small_claims: { default: 4, overrides: { breach_of_contract: 10 } },
  debt_collection: { default: 10, overrides: { credit_card: 10, medical_bills: 10 }, notes: 'W.S. § 1-3-105(a)(i)' },
  real_estate: { default: 10, overrides: { fraud: 4 }, notes: 'W.S. § 1-3-105' },
  business: { default: 8 },
  family: { default: null },
  other: { default: 4, overrides: { fraud: 4, defamation: 1 }, notes: 'W.S. § 1-3-105(a)(iv)(C); § 1-3-105(a)(v) (defamation 1yr)' },
}

// Idaho — Idaho Code §§ 5-216, 5-217, 5-218, 5-219
const ID_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'Idaho Code § 5-219(4)' },
  contract: { default: 5, overrides: { oral: 4, written: 5 }, notes: 'Idaho Code § 5-216 (written 5yr); § 5-217 (oral 4yr)' },
  property: { default: 3, notes: 'Idaho Code § 5-218' },
  landlord_tenant: { default: 5, overrides: { security_deposit: 5 }, notes: 'Idaho Code § 5-216' },
  small_claims: { default: 2, overrides: { breach_of_contract: 5 } },
  debt_collection: { default: 5, overrides: { credit_card: 5, medical_bills: 5 }, notes: 'Idaho Code § 5-216' },
  real_estate: { default: 5, overrides: { fraud: 3 }, notes: 'Idaho Code §§ 5-216, 5-218' },
  business: { default: 4 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 3, defamation: 2 }, notes: 'Idaho Code § 5-219(4); § 5-219(5) (defamation 2yr)' },
}

// Hawaii — HRS §§ 657-1, 657-7
const HI_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'HRS § 657-7' },
  contract: { default: 6, overrides: { oral: 6, written: 6 }, notes: 'HRS § 657-1(1)' },
  property: { default: 2, notes: 'HRS § 657-7' },
  landlord_tenant: { default: 6, overrides: { security_deposit: 6 }, notes: 'HRS § 657-1(1)' },
  small_claims: { default: 2, overrides: { breach_of_contract: 6 } },
  debt_collection: { default: 6, overrides: { credit_card: 6, medical_bills: 6 }, notes: 'HRS § 657-1(1)' },
  real_estate: { default: 6, overrides: { fraud: 6 }, notes: 'HRS § 657-1' },
  business: { default: 6 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 6, defamation: 2 }, notes: 'HRS § 657-7; § 657-4 (defamation 2yr)' },
}

// Alaska — AS §§ 09.10.053, 09.10.070
const AK_RULES: SolRuleMap = {
  personal_injury: { default: 2, notes: 'AS § 09.10.070(a)' },
  contract: { default: 3, overrides: { oral: 3, written: 3 }, notes: 'AS § 09.10.053' },
  property: { default: 2, notes: 'AS § 09.10.070(a)(3) (personal property); § 09.10.050 (real property: 6yr)' },
  landlord_tenant: { default: 3, overrides: { security_deposit: 3 }, notes: 'AS § 09.10.053' },
  small_claims: { default: 2, overrides: { breach_of_contract: 3 } },
  debt_collection: { default: 3, overrides: { credit_card: 3, medical_bills: 3 }, notes: 'AS § 09.10.053' },
  real_estate: { default: 6, overrides: { fraud: 3 }, notes: 'AS § 09.10.050 (real property 6yr)' },
  business: { default: 3 },
  family: { default: null },
  other: { default: 2, overrides: { fraud: 3, defamation: 2 }, notes: 'AS § 09.10.070; § 09.10.070(a)(2) (defamation 2yr)' },
}

const SOL_BY_STATE: Record<State, SolRuleMap> = {
  TX: TX_RULES,
  CA: CA_RULES,
  NY: NY_RULES,
  FL: FL_RULES,
  PA: PA_RULES,
  IL: IL_RULES,
  OH: OH_RULES,
  GA: GA_RULES,
  NC: NC_RULES,
  MI: MI_RULES,
  NJ: NJ_RULES,
  VA: VA_RULES,
  WA: WA_RULES,
  AZ: AZ_RULES,
  CO: CO_RULES,
  TN: TN_RULES,
  IN: IN_RULES,
  MO: MO_RULES,
  MD: MD_RULES,
  WI: WI_RULES,
  MN: MN_RULES,
  SC: SC_RULES,
  AL: AL_RULES,
  LA: LA_RULES,
  KY: KY_RULES,
  OR: OR_RULES,
  NV: NV_RULES,
  CT: CT_RULES,
  MA: MA_RULES,
  OK: OK_RULES,
  AR: AR_RULES,
  MS: MS_RULES,
  UT: UT_RULES,
  NM: NM_RULES,
  WV: WV_RULES,
  DE: DE_RULES,
  RI: RI_RULES,
  NH: NH_RULES,
  VT: VT_RULES,
  ME: ME_RULES,
  IA: IA_RULES,
  KS: KS_RULES,
  NE: NE_RULES,
  SD: SD_RULES,
  ND: ND_RULES,
  MT: MT_RULES,
  WY: WY_RULES,
  ID: ID_RULES,
  HI: HI_RULES,
  AK: AK_RULES,
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SolResult {
  /** SOL period in years, or null if not applicable */
  years: number | null
  /** Expiration date (null if no SOL or no incident date) */
  expiresAt: Date | null
  /** Days remaining until expiration (negative = expired) */
  daysRemaining: number | null
  /** Warning level for UI display */
  level: 'expired' | 'critical' | 'warning' | 'caution' | 'safe' | 'not_applicable'
  /** Statutory citation or note */
  notes: string | null
}

/**
 * Calculate statute of limitations for a case.
 *
 * @param state - Two-letter state code
 * @param disputeType - Main dispute type
 * @param subType - Optional sub-type for override lookup
 * @param incidentDate - Date the incident/breach occurred (ISO string or Date)
 * @param now - Current date (for testing)
 */
export function calculateSol(
  state: string,
  disputeType: string,
  subType?: string | null,
  incidentDate?: string | Date | null,
  now: Date = new Date()
): SolResult {
  const stateRules = SOL_BY_STATE[state.toUpperCase() as State]
  if (!stateRules) {
    return { years: null, expiresAt: null, daysRemaining: null, level: 'not_applicable', notes: `No SOL data for state: ${state}` }
  }

  const rule = stateRules[disputeType]
  if (!rule) {
    return { years: null, expiresAt: null, daysRemaining: null, level: 'not_applicable', notes: `No SOL rule for dispute type: ${disputeType}` }
  }

  // Look up years: sub-type override → default
  const overrideYears = subType ? rule.overrides?.[subType] : undefined
  const years: SolYears = overrideYears ?? rule.default

  if (years === null) {
    return { years: null, expiresAt: null, daysRemaining: null, level: 'not_applicable', notes: rule.notes ?? null }
  }

  if (!incidentDate) {
    return { years, expiresAt: null, daysRemaining: null, level: 'caution', notes: rule.notes ?? null }
  }

  const incident = typeof incidentDate === 'string' ? new Date(incidentDate) : incidentDate
  if (isNaN(incident.getTime())) {
    return { years, expiresAt: null, daysRemaining: null, level: 'caution', notes: rule.notes ?? null }
  }

  const expiresAt = new Date(incident)
  expiresAt.setFullYear(expiresAt.getFullYear() + years)

  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

  let level: SolResult['level']
  if (daysRemaining <= 0) {
    level = 'expired'
  } else if (daysRemaining <= 30) {
    level = 'critical'
  } else if (daysRemaining <= 90) {
    level = 'warning'
  } else if (daysRemaining <= 180) {
    level = 'caution'
  } else {
    level = 'safe'
  }

  return { years, expiresAt, daysRemaining, level, notes: rule.notes ?? null }
}

/**
 * Get the SOL period for a state/dispute without incident date.
 * Useful for display purposes (e.g., "2-year statute of limitations applies").
 */
export function getSolYears(state: string, disputeType: string, subType?: string | null): number | null {
  const stateRules = SOL_BY_STATE[state.toUpperCase() as State]
  if (!stateRules) return null
  const rule = stateRules[disputeType]
  if (!rule) return null
  const overrideYears = subType ? rule.overrides?.[subType] : undefined
  return overrideYears ?? rule.default
}
