import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

/* ------------------------------------------------------------------ */
/*  State data                                                        */
/* ------------------------------------------------------------------ */

interface StateInfo {
  name: string
  slug: string
  limit: string
  limitAmount: number
  courtWebsite: string
  courtWebsiteLabel: string
  filingFee: string
  statuteOfLimitations: string
  steps: { num: number; title: string; desc: string }[]
  tips: string[]
}

const STATES: Record<string, StateInfo> = {
  california: {
    name: 'California',
    slug: 'california',
    limit: '$12,500',
    limitAmount: 12500,
    courtWebsite: 'https://www.courts.ca.gov/smallclaims.htm',
    courtWebsiteLabel: 'California Courts – Small Claims',
    filingFee: '$30–$75',
    statuteOfLimitations: '2–4 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'California small claims court handles disputes up to $12,500 for individuals ($6,250 for corporations). Common cases include unpaid debts, property damage, security deposit disputes, and breach of contract.' },
      { num: 2, title: 'Identify the correct court', desc: 'File in the county where the defendant lives or where the dispute occurred. California has small claims divisions in every Superior Court.' },
      { num: 3, title: 'Complete the required forms', desc: 'Fill out Form SC-100 (Plaintiff\'s Claim and ORDER to Go to Small Claims Court). You can get forms from your local courthouse or the California Courts website.' },
      { num: 4, title: 'File your claim and pay the fee', desc: 'File your completed forms with the court clerk. Filing fees range from $30 to $75 depending on the amount you\'re claiming.' },
      { num: 5, title: 'Serve the defendant', desc: 'The defendant must be served at least 15 days before the hearing (25 days if out of county). You cannot serve the papers yourself — use a friend, process server, or the sheriff.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather contracts, receipts, photos, text messages, and any other documentation. Organize everything chronologically and bring copies for the judge and defendant.' },
      { num: 7, title: 'Attend your hearing', desc: 'Arrive early, dress professionally, and present your case clearly. The judge will usually mail the decision within a few days. In California, the defendant can appeal but the plaintiff cannot.' },
    ],
    tips: [
      'California does not allow attorneys to represent parties in small claims court — you must represent yourself.',
      'You can file up to 2 claims over $2,500 per year in small claims court.',
      'If you win and the defendant doesn\'t pay, you can file for a wage garnishment or bank levy.',
    ],
  },
  texas: {
    name: 'Texas',
    slug: 'texas',
    limit: '$20,000',
    limitAmount: 20000,
    courtWebsite: 'https://www.txcourts.gov/programs-services/self-help/',
    courtWebsiteLabel: 'Texas Courts – Self-Help Resources',
    filingFee: '$35–$100',
    statuteOfLimitations: '2–4 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Texas small claims court (officially Justice Court) handles disputes up to $20,000. This includes unpaid debts, property damage, landlord-tenant disputes, and breach of contract.' },
      { num: 2, title: 'Identify the correct Justice Court', desc: 'File in the precinct where the defendant lives or where the obligation was to be performed. Each Texas county has one or more Justice of the Peace courts.' },
      { num: 3, title: 'Complete the petition', desc: 'Fill out a Small Claims Petition. Many Texas Justice Courts provide fill-in-the-blank forms. Include the defendant\'s full name, address, the amount claimed, and a brief description of why they owe you.' },
      { num: 4, title: 'File your claim and pay the fee', desc: 'File your petition with the Justice Court clerk. Filing fees typically range from $35 to $100 depending on the county and amount claimed.' },
      { num: 5, title: 'Serve the defendant', desc: 'The court will typically arrange service through a constable or sheriff. The defendant must be served at least 10 days before the hearing date.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Organize all contracts, invoices, photos, correspondence, and receipts. Texas allows witnesses — bring anyone who can support your version of events.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the Justice of the Peace. Be concise, stick to the facts, and let your evidence speak. The judge usually decides on the spot or within a few days.' },
    ],
    tips: [
      'Texas raised its small claims limit to $20,000, one of the highest in the nation.',
      'Either party may appeal a small claims judgment to County Court within 21 days.',
      'You can request a jury trial in Texas small claims court if you prefer.',
    ],
  },
  florida: {
    name: 'Florida',
    slug: 'florida',
    limit: '$8,000',
    limitAmount: 8000,
    courtWebsite: 'https://www.flcourts.gov/Resources-Services/Court-Improvement/Family-Courts/Self-Help-Information',
    courtWebsiteLabel: 'Florida Courts – Self-Help',
    filingFee: '$55–$300',
    statuteOfLimitations: '4–5 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Florida small claims court handles disputes up to $8,000. Common cases include unpaid loans, property damage, security deposit disputes, and breach of contract.' },
      { num: 2, title: 'Identify the correct county court', desc: 'File in the county where the defendant lives or where the incident occurred. Florida\'s small claims cases are heard in the County Court division.' },
      { num: 3, title: 'Complete the Statement of Claim', desc: 'Fill out a Statement of Claim form available from your county clerk\'s office. Include the defendant\'s name, address, amount owed, and a clear description of your claim.' },
      { num: 4, title: 'File your claim and pay the fee', desc: 'File your Statement of Claim with the county clerk. Filing fees range from $55 to $300 depending on the amount you\'re claiming.' },
      { num: 5, title: 'Serve the defendant', desc: 'Florida requires formal service of process — typically through the sheriff\'s office or a certified process server. The defendant must be served before the pre-trial conference.' },
      { num: 6, title: 'Attend the pre-trial conference', desc: 'Florida requires a pre-trial mediation conference before trial. Many cases settle at this stage. If mediation fails, the case proceeds to trial.' },
      { num: 7, title: 'Present your case at trial', desc: 'Bring all evidence, organized and labeled. Present your case clearly and concisely. The judge will typically render a decision at the end of the hearing.' },
    ],
    tips: [
      'Florida requires pre-trial mediation in small claims cases — many disputes settle without ever going to trial.',
      'You can have an attorney represent you in Florida small claims court, but it is not required.',
      'If you win, Florida allows you to recover your filing fees and service costs from the defendant.',
    ],
  },
  'new-york': {
    name: 'New York',
    slug: 'new-york',
    limit: '$10,000',
    limitAmount: 10000,
    courtWebsite: 'https://nycourts.gov/courts/nyc/smallclaims/',
    courtWebsiteLabel: 'New York Courts – Small Claims',
    filingFee: '$15–$20',
    statuteOfLimitations: '3–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'New York small claims court handles disputes up to $10,000 ($5,000 in town and village courts). Cases include unpaid debts, property damage, and breach of contract.' },
      { num: 2, title: 'Identify the correct court', desc: 'In New York City, file in the small claims part of the Civil Court in the borough where the defendant lives or works. Outside NYC, file in your local City, Town, or Village Court.' },
      { num: 3, title: 'File your claim', desc: 'You can file in person at the court clerk\'s office or, in NYC, online through the court\'s electronic filing system. Provide the defendant\'s name, address, and a brief description of your claim.' },
      { num: 4, title: 'Pay the filing fee', desc: 'Filing fees are $15 for claims up to $1,000 and $20 for claims over $1,000 — among the lowest in the nation.' },
      { num: 5, title: 'The court serves the defendant', desc: 'In New York, the court handles service by sending the defendant a notice by certified and regular mail. This is a major convenience compared to other states.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Organize contracts, receipts, photographs, and correspondence. Bring originals plus copies. If you have witnesses, confirm they can attend the hearing date.' },
      { num: 7, title: 'Attend your hearing', desc: 'Small claims hearings in New York are typically held in the evening to accommodate working people. An arbitrator or judge will hear your case. Decisions are usually mailed within a few days.' },
    ],
    tips: [
      'New York small claims courts hold evening sessions — you won\'t need to miss work.',
      'The court handles serving the defendant for you, saving time and money.',
      'Only individuals can file in small claims court — businesses must use Commercial Small Claims.',
    ],
  },
  illinois: {
    name: 'Illinois',
    slug: 'illinois',
    limit: '$10,000',
    limitAmount: 10000,
    courtWebsite: 'https://www.illinoiscourts.gov/self-help/',
    courtWebsiteLabel: 'Illinois Courts – Self-Help',
    filingFee: '$40–$75',
    statuteOfLimitations: '3–5 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Illinois small claims court handles disputes up to $10,000. Common cases include unpaid debts, property damage, security deposit disputes, and breach of contract.' },
      { num: 2, title: 'Identify the correct court', desc: 'File in the county where the defendant lives or where the transaction took place. Small claims cases are heard in the Circuit Court\'s small claims division.' },
      { num: 3, title: 'Complete the complaint form', desc: 'Fill out a Small Claims Complaint form from your county\'s Circuit Court clerk. Include the defendant\'s name, address, amount claimed, and a clear statement of your claim.' },
      { num: 4, title: 'File your complaint and pay the fee', desc: 'File your completed complaint with the Circuit Court clerk. Filing fees typically range from $40 to $75 depending on the county.' },
      { num: 5, title: 'Serve the defendant', desc: 'The defendant must be served with a copy of the complaint and summons. You can use the sheriff\'s office, a private process server, or certified mail in most counties.' },
      { num: 6, title: 'Attend court-ordered mediation (if required)', desc: 'Some Illinois counties require or offer mediation before trial. This is an opportunity to resolve the dispute without a formal hearing.' },
      { num: 7, title: 'Present your case at trial', desc: 'Bring all supporting documents, organized clearly. Present your case to the judge, who will typically issue a ruling at the end of the hearing or shortly after.' },
    ],
    tips: [
      'Cook County (Chicago) has specific small claims procedures — check the Circuit Court of Cook County website for local rules.',
      'Illinois allows attorneys in small claims court, but many people represent themselves successfully.',
      'If the defendant doesn\'t show up, you can win a default judgment — but you still need to prove your damages.',
    ],
  },
  ohio: {
    name: 'Ohio',
    slug: 'ohio',
    limit: '$6,000',
    limitAmount: 6000,
    courtWebsite: 'https://www.ohiocourts.gov/index.cfm/resources/for-the-public/ohio-courts-self-help-center/',
    courtWebsiteLabel: 'Ohio Courts – Self-Help Center',
    filingFee: '$30–$75',
    statuteOfLimitations: '2–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Ohio small claims court handles disputes up to $6,000. Common cases include unpaid debts, property damage, security deposits, and breach of contract.' },
      { num: 2, title: 'Identify the correct court', desc: 'File in the Municipal Court or County Court where the defendant lives or where the dispute occurred. Ohio has small claims divisions in both court types.' },
      { num: 3, title: 'Complete the complaint form', desc: 'Obtain a small claims complaint form from your local Municipal or County Court clerk. Include the defendant\'s full legal name, address, the amount claimed, and the basis for your claim.' },
      { num: 4, title: 'File your complaint and pay the fee', desc: 'File with the court clerk and pay the filing fee, typically $30–$75 depending on the court and amount. The clerk will assign a hearing date.' },
      { num: 5, title: 'Serve the defendant', desc: 'In Ohio, the court usually handles service by certified mail. If certified mail fails, you may need to arrange for personal service through a process server or sheriff.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather contracts, receipts, photos, bank statements, and any written correspondence. Ohio small claims hearings are informal — bring organized originals and copies.' },
      { num: 7, title: 'Attend your hearing', desc: 'Arrive early and be prepared to explain your case clearly. The magistrate or judge typically issues a ruling at the hearing or within a few days.' },
    ],
    tips: [
      'Ohio\'s $6,000 limit is lower than many states — if your claim exceeds it, consider filing in Municipal Court instead.',
      'Attorneys are not allowed to represent parties in Ohio small claims court unless both sides agree.',
      'If you win, Ohio provides enforcement tools including wage garnishment and bank account levies.',
    ],
  },
  georgia: {
    name: 'Georgia',
    slug: 'georgia',
    limit: '$15,000',
    limitAmount: 15000,
    courtWebsite: 'https://georgiacourts.gov/courts/magistrate-court/',
    courtWebsiteLabel: 'Georgia Courts – Magistrate Court',
    filingFee: '$45–$75',
    statuteOfLimitations: '2–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Georgia\'s Magistrate Court handles "small claims" disputes up to $15,000. Common cases include unpaid debts, property damage, security deposits, and breach of contract.' },
      { num: 2, title: 'Identify the correct Magistrate Court', desc: 'File in the county where the defendant resides or where the contract was to be performed. Georgia has Magistrate Courts in every county.' },
      { num: 3, title: 'Complete the Statement of Claim', desc: 'Fill out a Statement of Claim form from the Magistrate Court clerk. You\'ll need the defendant\'s full name, address, amount sought, and a description of your claim.' },
      { num: 4, title: 'File your claim and pay the fee', desc: 'File the completed form with the Magistrate Court clerk. Filing fees typically range from $45 to $75 depending on the county and claim amount.' },
      { num: 5, title: 'Serve the defendant', desc: 'The court typically issues a summons served by certified mail or a marshal/sheriff. The defendant has 30 days to respond.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Bring contracts, invoices, photos, receipts, and correspondence. Georgia Magistrate Court is informal — the judge will hear both sides without strict rules of evidence.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case clearly and factually. The magistrate will typically rule at the hearing or within a short time. Judgments can be enforced through garnishment or liens.' },
    ],
    tips: [
      'Georgia\'s $15,000 limit is one of the highest in the nation — making Magistrate Court useful for mid-size disputes.',
      'Attorneys are permitted in Georgia Magistrate Court, but many parties self-represent successfully.',
      'If the defendant defaults (doesn\'t appear), request a default judgment from the clerk after the deadline passes.',
    ],
  },
  'north-carolina': {
    name: 'North Carolina',
    slug: 'north-carolina',
    limit: '$10,000',
    limitAmount: 10000,
    courtWebsite: 'https://www.nccourts.gov/help-topics/small-claims',
    courtWebsiteLabel: 'NC Courts – Small Claims',
    filingFee: '$96',
    statuteOfLimitations: '3 years for most claims',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'North Carolina small claims court (heard by a Magistrate in District Court) handles disputes up to $10,000. Common cases include unpaid debts, property damage, and breach of contract.' },
      { num: 2, title: 'Identify the correct Magistrate', desc: 'File in the county where the defendant lives or where the obligation arose. Each county\'s District Court has magistrates who hear small claims cases.' },
      { num: 3, title: 'Complete the complaint form', desc: 'File a Magistrate\'s Summons (form AOC-CVM-200) with the clerk of court. Provide the defendant\'s name and address, the amount claimed, and a brief explanation.' },
      { num: 4, title: 'Pay the filing fee', desc: 'NC charges a flat $96 filing fee for small claims regardless of the claim amount.' },
      { num: 5, title: 'Serve the defendant', desc: 'The Sheriff\'s office handles service in NC. The defendant is served with the summons and complaint before the hearing date.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather and organize all relevant documents, photos, and receipts. Bring written statements from witnesses if they cannot attend. NC hearings are typically brief.' },
      { num: 7, title: 'Attend your hearing', desc: 'The magistrate will hear both sides and issue a judgment, usually on the spot. Either party can appeal to District Court within 27 days.' },
    ],
    tips: [
      'North Carolina\'s flat $96 filing fee applies regardless of the amount you\'re claiming.',
      'Appeals from magistrate decisions go to District Court — you get a brand new trial (de novo).',
      'Attorneys are not allowed to represent parties in NC magistrate (small claims) hearings.',
    ],
  },
  michigan: {
    name: 'Michigan',
    slug: 'michigan',
    limit: '$7,000',
    limitAmount: 7000,
    courtWebsite: 'https://courts.michigan.gov/self-help/center/pages/small-claims.aspx',
    courtWebsiteLabel: 'Michigan Courts – Small Claims',
    filingFee: '$30–$70',
    statuteOfLimitations: '3–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Michigan small claims court handles disputes up to $7,000. Common cases include unpaid debts, property damage, security deposits, and minor contract disputes.' },
      { num: 2, title: 'Identify the correct District Court', desc: 'File in the District Court for the county or district where the defendant lives or where the dispute arose. Michigan\'s small claims division is part of District Court.' },
      { num: 3, title: 'Complete the affidavit and claim', desc: 'Fill out the Affidavit and Claim (DC 84 form). You\'ll need the defendant\'s legal name, address, amount claimed, and a brief statement of the facts.' },
      { num: 4, title: 'File your claim and pay the fee', desc: 'File with the District Court clerk. Filing fees range from $30 to $70 depending on the amount of your claim.' },
      { num: 5, title: 'Serve the defendant', desc: 'The court schedules a hearing date and typically serves the defendant by first-class mail. The court will notify you if service fails.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Organize receipts, contracts, photos, and any written communications. Michigan small claims hearings are informal but bring copies of everything for the judge and defendant.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the judge or magistrate. Decisions are typically made at the hearing. Either party may appeal to Circuit Court within 21 days.' },
    ],
    tips: [
      'Attorneys are not allowed to represent parties in Michigan small claims court.',
      'You can file up to 5 small claims per calendar year in Michigan.',
      'If you win, Michigan offers enforcement tools including garnishment of wages and bank accounts.',
    ],
  },
  'new-jersey': {
    name: 'New Jersey',
    slug: 'new-jersey',
    limit: '$5,000',
    limitAmount: 5000,
    courtWebsite: 'https://www.njcourts.gov/self-help/small-claims',
    courtWebsiteLabel: 'NJ Courts – Small Claims',
    filingFee: '$35–$50',
    statuteOfLimitations: '2–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'New Jersey small claims court (Special Civil Part) handles disputes up to $5,000 for individuals and $10,000 for certain commercial claims. Common cases include unpaid debts and property damage.' },
      { num: 2, title: 'Identify the correct court', desc: 'File in the Special Civil Part of the Superior Court in the county where the defendant lives or where the transaction occurred.' },
      { num: 3, title: 'Complete the complaint form', desc: 'Fill out a Special Civil Part Complaint form (available at the courthouse or online). Include the defendant\'s name, address, amount claimed, and the basis for your claim.' },
      { num: 4, title: 'File your complaint and pay the fee', desc: 'File with the Special Civil Part clerk. Filing fees are $35 for claims up to $500 and $50 for claims up to $5,000.' },
      { num: 5, title: 'Serve the defendant', desc: 'NJ uses certified mail for service, handled by the court. If certified mail is returned unclaimed, you may need to arrange personal service.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather all documents, photos, and correspondence supporting your claim. NJ allows attorneys in small claims, so be prepared if the other side brings one.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case clearly and concisely. The judge typically decides at the hearing. Appeals must be filed within 45 days.' },
    ],
    tips: [
      'New Jersey allows attorneys in Special Civil Part cases — if the other side brings one, request a brief adjournment to consult one yourself.',
      'Mediation is often available and free through the court — consider it before your hearing date.',
      'NJ offers "track 1" (under $500) and "track 2" ($500–$5,000) with different fee structures.',
    ],
  },
  virginia: {
    name: 'Virginia',
    slug: 'virginia',
    limit: '$5,000',
    limitAmount: 5000,
    courtWebsite: 'https://www.vacourts.gov/courts/gd/home.html',
    courtWebsiteLabel: 'Virginia Courts – General District Court',
    filingFee: '$30–$75',
    statuteOfLimitations: '2–5 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Virginia\'s General District Court handles small claims up to $5,000 (with a simplified "small claims" track for cases under $5,000). Common cases include unpaid debts, property damage, and contract disputes.' },
      { num: 2, title: 'Identify the correct General District Court', desc: 'File in the General District Court in the city or county where the defendant lives, works, or where the incident occurred.' },
      { num: 3, title: 'Complete the warrant in debt or motion for judgment', desc: 'For small claims, file a Warrant in Debt form (DC-412) from the court clerk. Include the defendant\'s name, address, amount, and the reason you\'re owed money.' },
      { num: 4, title: 'File your claim and pay the fee', desc: 'File the completed form with the General District Court clerk. Filing fees typically range from $30 to $75 depending on the claim amount and court.' },
      { num: 5, title: 'Serve the defendant', desc: 'Virginia uses a sheriff or process server for service. The defendant must be served before the return date shown on the warrant.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Bring all relevant documents, receipts, contracts, and photos. Virginia allows witnesses — subpoenas are available if needed.' },
      { num: 7, title: 'Attend your hearing', desc: 'The judge will hear both sides and usually rules immediately. Either party can appeal to Circuit Court within 10 days of judgment.' },
    ],
    tips: [
      'Virginia\'s General District Court handles both the small claims track and larger civil claims up to $25,000.',
      'Appeals from General District Court are heard de novo (brand new trial) in Circuit Court.',
      'Virginia\'s 10-day appeal window is very short — act quickly if you need to appeal.',
    ],
  },
  washington: {
    name: 'Washington',
    slug: 'washington',
    limit: '$10,000',
    limitAmount: 10000,
    courtWebsite: 'https://www.courts.wa.gov/court_dir/?fa=court_dir.county',
    courtWebsiteLabel: 'Washington Courts – Court Directory',
    filingFee: '$35–$70',
    statuteOfLimitations: '3–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Washington small claims court handles disputes up to $10,000. Common cases include unpaid debts, property damage, security deposits, and breach of contract.' },
      { num: 2, title: 'Identify the correct District Court', desc: 'File in the District Court for the county where the defendant lives or where the dispute arose. Washington\'s small claims division is part of District Court.' },
      { num: 3, title: 'Complete the Notice of Small Claim', desc: 'Fill out a Notice of Small Claim form from your District Court clerk. You\'ll need the defendant\'s name, address, the amount you\'re claiming, and a brief description.' },
      { num: 4, title: 'File your claim and pay the fee', desc: 'File with the District Court clerk. Fees typically range from $35 to $70 depending on the county and amount claimed.' },
      { num: 5, title: 'Serve the defendant', desc: 'Washington allows service by certified mail, process server, or sheriff. The defendant must receive notice at least 10 days before the hearing.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Bring organized copies of all contracts, receipts, photos, and communications. Washington allows witnesses — confirm their availability for your hearing date.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to a judge or court commissioner. Decisions are usually issued the same day. Either party may appeal to Superior Court within 30 days.' },
    ],
    tips: [
      'Washington does not allow attorneys to represent parties in small claims court.',
      'If you win and the defendant can\'t pay, Washington offers garnishment and judgment lien options.',
      'King County (Seattle area) has a busy small claims docket — expect longer wait times for hearing dates.',
    ],
  },
  arizona: {
    name: 'Arizona',
    slug: 'arizona',
    limit: '$3,500',
    limitAmount: 3500,
    courtWebsite: 'https://www.azcourts.gov/selfservicecenter/Small-Claims',
    courtWebsiteLabel: 'Arizona Courts – Small Claims',
    filingFee: '$25–$65',
    statuteOfLimitations: '2–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Arizona small claims court handles disputes up to $3,500. Common cases include unpaid debts, property damage, security deposit disputes, and minor contract breaches.' },
      { num: 2, title: 'Identify the correct Justice Court', desc: 'File in the Justice Court for the precinct where the defendant lives or where the transaction occurred. Arizona has Justice Courts in each county with a small claims division.' },
      { num: 3, title: 'Complete the complaint form', desc: 'Fill out a Small Claims Complaint from the Justice Court. Provide the defendant\'s name, address, amount, and a clear statement of why they owe you money.' },
      { num: 4, title: 'File your complaint and pay the fee', desc: 'File with the Justice Court clerk. Fees range from $25 to $65 depending on the amount claimed.' },
      { num: 5, title: 'Serve the defendant', desc: 'The court typically serves the defendant by certified mail. If that fails, you may need to arrange personal service through a process server or constable.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Bring contracts, receipts, photos, and any correspondence. Arizona small claims hearings are informal — bring copies for the judge and defendant.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case concisely. The judge typically rules at the hearing. Appeals to Superior Court must be filed within 5 days of judgment.' },
    ],
    tips: [
      'Arizona\'s $3,500 limit is relatively low — if your claim is larger, consider filing in Justice Court\'s Civil division (up to $10,000).',
      'Attorneys are not permitted to represent parties in Arizona small claims court.',
      'Arizona\'s 5-day appeal window is among the shortest in the nation — act immediately if you plan to appeal.',
    ],
  },
  tennessee: {
    name: 'Tennessee',
    slug: 'tennessee',
    limit: '$25,000',
    limitAmount: 25000,
    courtWebsite: 'https://www.tncourts.gov/programs/self-help-center',
    courtWebsiteLabel: 'Tennessee Courts – Self-Help Center',
    filingFee: '$150–$300',
    statuteOfLimitations: '1–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Tennessee General Sessions Court handles civil disputes up to $25,000 in most counties ($15,000 in Davidson, Shelby, Hamilton, and Knox counties). Common cases include unpaid debts, property damage, and contract disputes.' },
      { num: 2, title: 'Identify the correct General Sessions Court', desc: 'File in the General Sessions Court in the county where the defendant lives or where the obligation arose. Tennessee has General Sessions Courts in every county.' },
      { num: 3, title: 'Complete the civil warrant', desc: 'File a Civil Warrant (or Detainer Warrant for evictions) with the General Sessions Court clerk. Provide the defendant\'s name, address, amount claimed, and reason for the claim.' },
      { num: 4, title: 'Pay the filing fee', desc: 'Filing fees vary significantly by county — expect $150–$300 total when including litigation taxes, service fees, and other costs. Check with your specific county court.' },
      { num: 5, title: 'Serve the defendant', desc: 'Tennessee uses sheriffs, constables, or certified mail for service. The court typically arranges this. Businesses must be served through their registered agent.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Bring contracts, receipts, photos, and all relevant documents. Tennessee General Sessions hearings are informal — no strict rules of evidence apply.' },
      { num: 7, title: 'Attend your hearing', desc: 'The judge will hear both sides and usually rules immediately. Either party may appeal to Circuit Court within 10 days — the appeal is a brand new trial (de novo).' },
    ],
    tips: [
      'Tennessee General Sessions Court has one of the highest small claims limits nationally — $25,000 in most counties.',
      'Tennessee\'s 1-year personal injury statute of limitations is shorter than most states — act quickly.',
      'Both attorneys and parties can represent themselves in General Sessions Court.',
    ],
  },
  indiana: {
    name: 'Indiana',
    slug: 'indiana',
    limit: '$10,000',
    limitAmount: 10000,
    courtWebsite: 'https://www.in.gov/courts/publications/small-claims-manual/',
    courtWebsiteLabel: 'Indiana Courts – Small Claims Manual',
    filingFee: '$26–$97',
    statuteOfLimitations: '2–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Indiana small claims court handles disputes up to $10,000. Common cases include unpaid debts, property damage, security deposits, and minor contract disputes.' },
      { num: 2, title: 'Identify the correct court', desc: 'In Marion County (Indianapolis), file in the appropriate township Small Claims Court. In all other counties, file in the Small Claims Docket of Circuit or Superior Court.' },
      { num: 3, title: 'Complete the Notice of Claim', desc: 'Fill out a Notice of Claim form from the court clerk. You\'ll need the defendant\'s full name, address, the amount claimed, and a brief description of the dispute.' },
      { num: 4, title: 'File your claim and pay the fee', desc: 'Filing fees vary by court — Marion County charges $26 per action; other counties range from $35 to $97 depending on the court and number of defendants.' },
      { num: 5, title: 'Serve the defendant', desc: 'Service is typically arranged by the court through certified mail or a constable/bailiff. You\'ll be notified if service fails.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather contracts, receipts, photos, and correspondence. Indiana small claims proceedings are informal — no formal discovery is permitted.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case clearly to the judge or magistrate. Decisions are typically made at the hearing. Appeals go to Circuit/Superior Court on the record (not a new trial).' },
    ],
    tips: [
      'Indiana prohibits formal discovery in small claims — bring all your evidence to the hearing.',
      'Marion County has unique township courts — file in the township where the defendant lives or works.',
      'Attorneys are permitted in Indiana small claims, but fees are generally not recoverable even if you win.',
    ],
  },
  missouri: {
    name: 'Missouri',
    slug: 'missouri',
    limit: '$5,000',
    limitAmount: 5000,
    courtWebsite: 'https://www.courts.mo.gov/page.jsp?id=704',
    courtWebsiteLabel: 'Missouri Courts – Small Claims',
    filingFee: '$25–$45',
    statuteOfLimitations: '5–10 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Missouri small claims court handles disputes up to $5,000 (excluding interest and costs). You may waive amounts above $5,000 to fit within the limit but forfeit the excess.' },
      { num: 2, title: 'Identify the correct Associate Circuit Court', desc: 'File in the Associate Circuit Court in the county where the defendant lives or where the contract was to be performed.' },
      { num: 3, title: 'Complete the small claims petition', desc: 'Fill out the Small Claims Petition form (available from the court clerk or courts.mo.gov). Include the defendant\'s name, address, amount, and reason for the claim.' },
      { num: 4, title: 'File your petition and pay the fee', desc: 'Filing fees typically range from $25 to $45 depending on the county. Additional fees apply for service by sheriff.' },
      { num: 5, title: 'Sign the annual filing affidavit', desc: 'Missouri limits plaintiffs to 12 small claims per calendar year statewide. At filing, you must sign a sworn statement confirming you haven\'t exceeded this limit.' },
      { num: 6, title: 'Service is arranged by the court', desc: 'Missouri courts arrange service by certified mail. If mail is returned unclaimed, sheriff service may be required — at an additional cost.' },
      { num: 7, title: 'Attend your hearing', desc: 'The judge actively questions both parties and makes an independent finding. Appeal must be filed within 10 days and requires a licensed attorney.' },
    ],
    tips: [
      'Missouri limits each plaintiff to 12 small claims filings per calendar year statewide — a limit designed to prevent debt collection abuse.',
      'No jury trials in Missouri small claims — all cases decided by a judge.',
      'Missouri\'s 5-year personal injury statute of limitations is among the most generous in the nation.',
    ],
  },
  maryland: {
    name: 'Maryland',
    slug: 'maryland',
    limit: '$5,000',
    limitAmount: 5000,
    courtWebsite: 'https://www.mdcourts.gov/legalhelp/smallclaims',
    courtWebsiteLabel: 'Maryland Courts – Small Claims',
    filingFee: '$44–$56',
    statuteOfLimitations: '3 years for most claims',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Maryland\'s Small Claims track (in District Court) handles disputes up to $5,000. Common cases include unpaid debts, property damage, security deposits, and minor contracts.' },
      { num: 2, title: 'Identify the correct District Court', desc: 'File in the District Court for the county where the defendant lives or where the dispute occurred. Maryland\'s District Court has locations throughout the state.' },
      { num: 3, title: 'Complete the DC/CV 1 complaint form', desc: 'Fill out a complaint form (DC/CV 1) from the District Court clerk or online. Provide the defendant\'s name, address, amount, and the basis for your claim.' },
      { num: 4, title: 'File your complaint and pay the fee', desc: 'Filing fees are approximately $44–$56 depending on the amount. Additional fees apply for service.' },
      { num: 5, title: 'Choose your service method', desc: 'Maryland offers certified mail service (clerk handles it), sheriff service (~$40 additional), or private process server. Certified mail is the most convenient option.' },
      { num: 6, title: 'Prepare your evidence and consider mediation', desc: 'Maryland courts offer free mediation through the ADR Office — many cases settle before the hearing. Organize all documents, receipts, and photos if the case goes to trial.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the District Court judge. No jury trials in small claims. If you win, Maryland offers enforcement tools including wage garnishment.' },
    ],
    tips: [
      'Maryland offers free ADR mediation — consider it before your hearing date.',
      'Maryland is piloting Online Dispute Resolution (MDOR) for remote small claims — check the court website for availability in your county.',
      'Maryland\'s 3-year statute of limitations applies uniformly to most civil claims (personal injury, contracts, property damage).',
    ],
  },
  wisconsin: {
    name: 'Wisconsin',
    slug: 'wisconsin',
    limit: '$10,000',
    limitAmount: 10000,
    courtWebsite: 'https://www.wicourts.gov/services/public/selfhelp/smallclaims.htm',
    courtWebsiteLabel: 'Wisconsin Courts – Small Claims',
    filingFee: '$22–$40',
    statuteOfLimitations: '3–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Wisconsin small claims (Chapter 799) handles money claims up to $10,000 ($5,000 for personal injury/tort). Eviction cases have no dollar limit. Filed in Circuit Court.' },
      { num: 2, title: 'Identify the correct Circuit Court', desc: 'File in the Circuit Court for the county where the defendant lives or where the dispute arose. Wisconsin has 72 circuit courts, one per county.' },
      { num: 3, title: 'Complete the SC-500 Summons and Complaint', desc: 'Use Wisconsin\'s online Forms Assistant to auto-populate the SC-500 form. Include the defendant\'s name, address, amount claimed, and the basis for your claim.' },
      { num: 4, title: 'File and pay the fee', desc: 'Wisconsin\'s base small claims filing fee is just $22 — one of the lowest in the nation. Total costs including service typically run under $40.' },
      { num: 5, title: 'Serve the defendant', desc: 'The court clerk mails the summons by first-class mail by default. If mail fails, sheriff service is available as a backup.' },
      { num: 6, title: 'File a written answer (defendant) or prepare evidence (plaintiff)', desc: 'Defendants must file a written answer; failure to do so enables a default judgment. Plaintiffs should gather contracts, receipts, and photos.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the Circuit Court judge. Appeals go to the Court of Appeals on the record (45-day deadline) — not a new trial.' },
    ],
    tips: [
      'Wisconsin has one of the lowest small claims filing fees in the US — just $22 base.',
      'Eviction cases have no dollar limit in Wisconsin small claims — landlord-tenant disputes are the most common Chapter 799 filings.',
      'Corporations may be represented by a non-attorney officer or employee in Wisconsin small claims.',
    ],
  },
  minnesota: {
    name: 'Minnesota',
    slug: 'minnesota',
    limit: '$20,000',
    limitAmount: 20000,
    courtWebsite: 'https://mncourts.gov/help-topics/conciliation-court',
    courtWebsiteLabel: 'Minnesota Courts – Conciliation Court',
    filingFee: '$65–$80',
    statuteOfLimitations: '2–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Minnesota Conciliation Court (small claims) handles disputes up to $20,000 (one of the highest limits nationally). Consumer credit disputes are capped at $4,000.' },
      { num: 2, title: 'Identify the correct county', desc: 'File in the Conciliation Court for the county where the defendant lives or where the dispute occurred. Minnesota\'s Conciliation Court is a division of District Court.' },
      { num: 3, title: 'Use Minnesota Guide & File', desc: 'Minnesota offers a guided e-filing tool (mncourts.gov/guideandfile) that walks you through completing and filing your Conciliation Court claim online.' },
      { num: 4, title: 'Pay the filing fee', desc: 'The filing fee is a flat $65 per party (plaintiff pays at filing; defendant pays when first paper is filed). Some counties add a law library surcharge for a total of ~$80.' },
      { num: 5, title: 'Service of defendant', desc: 'Service method depends on claim amount and defendant\'s location. Claims over $2,500 require certified mail service. The court administrator handles service for smaller claims.' },
      { num: 6, title: 'Consider voluntary mediation', desc: 'Minnesota courts encourage mediation — Community Mediation Minnesota provides free services. Many disputes settle before the hearing with a court settlement agreement.' },
      { num: 7, title: 'Attend your Conciliation Court hearing', desc: 'A judge or court referee hears both sides informally. No jury trials. Either party may appeal to District Court for a new trial (de novo) within 20 days.' },
    ],
    tips: [
      'Minnesota\'s $20,000 limit is one of the highest small claims limits in the US (raised from $15,000 in July 2024).',
      'Minnesota offers a Virtual Assistant on mncourts.gov to guide you step by step.',
      'Minnesota court materials are available in Spanish, Hmong, Somali, and other languages.',
    ],
  },
  'south-carolina': {
    name: 'South Carolina',
    slug: 'south-carolina',
    limit: '$7,500',
    limitAmount: 7500,
    courtWebsite: 'https://www.sccourts.org/resources/general-public/self-help-resources/',
    courtWebsiteLabel: 'South Carolina Courts – Self-Help',
    filingFee: '$80',
    statuteOfLimitations: '3 years for most claims',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'South Carolina Magistrate Court handles civil claims up to $7,500. Common cases include unpaid debts, property damage, security deposits, and breach of contract.' },
      { num: 2, title: 'Identify the correct Magistrate Court', desc: 'File in the Magistrate Court in the county where the defendant lives or where the dispute occurred. South Carolina has Magistrate Courts in each county.' },
      { num: 3, title: 'Complete the civil complaint form', desc: 'Fill out a civil complaint form from the Magistrate Court clerk. Include the defendant\'s name, address, amount claimed, and a clear statement of the facts.' },
      { num: 4, title: 'File your complaint and pay the fee', desc: 'The standard filing fee is approximately $80 (plus $10 per additional defendant). Hardship waivers are available.' },
      { num: 5, title: 'Arrange service of defendant', desc: 'Service is typically arranged through the sheriff, constable, certified mail, or a disinterested adult. Select your preferred method when filing.' },
      { num: 6, title: 'Request a jury trial if desired', desc: 'South Carolina is unique — you can request a 6-person jury trial in Magistrate Court. You must request it at least 5 business days before the scheduled hearing.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the magistrate (or jury if requested). Either party may appeal to Circuit Court for a de novo review within 30 days.' },
    ],
    tips: [
      'South Carolina Magistrate Court is one of the only small claims courts in the US that allows a jury trial — request one if your facts are strong.',
      'The 3-year statute of limitations applies uniformly to most civil claims in South Carolina.',
      'Attorneys are permitted but not required in SC Magistrate Court.',
    ],
  },
  alabama: {
    name: 'Alabama',
    slug: 'alabama',
    limit: '$6,000',
    limitAmount: 6000,
    courtWebsite: 'https://judicial.alabama.gov/library/smallclaims',
    courtWebsiteLabel: 'Alabama Courts – Small Claims',
    filingFee: '$52–$215',
    statuteOfLimitations: '2–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Alabama\'s Small Claims Docket (in District Court) handles disputes up to $6,000. Common cases include unpaid debts, property damage, security deposits, and minor contract breaches.' },
      { num: 2, title: 'Identify the correct District Court', desc: 'File in the District Court for the county where the defendant lives or where the contract was to be performed.' },
      { num: 3, title: 'Complete the complaint form', desc: 'Fill out a Small Claims Complaint from the District Court clerk. Provide the defendant\'s full legal name, address, amount owed, and a brief explanation.' },
      { num: 4, title: 'Pay the tiered filing fee', desc: 'Alabama uses a tiered fee structure: ~$52 for claims under $1,500; ~$126 for claims up to $3,000; ~$215 for claims up to $6,000. Additional service fees apply.' },
      { num: 5, title: 'Serve the defendant', desc: 'The court typically arranges certified mail service. If certified mail fails, sheriff service is available at an additional cost of approximately $30 per defendant.' },
      { num: 6, title: 'Prepare your evidence and file a written answer (if defendant)', desc: 'Defendants must file a written answer within 14 days of service. Plaintiffs should organize contracts, receipts, photos, and any written communications.' },
      { num: 7, title: 'Attend your hearing', desc: 'The judge hears both sides and renders a decision. No jury trial in small claims. Appeals to Circuit Court must be filed within 14 days.' },
    ],
    tips: [
      'Alabama\'s 14-day appeal window is very short — act immediately if you need to appeal.',
      'Debt buyers and assignees must be represented by a licensed attorney in Alabama small claims — a key consumer protection.',
      'No jury trials in Alabama small claims court.',
    ],
  },
  louisiana: {
    name: 'Louisiana',
    slug: 'louisiana',
    limit: '$5,000',
    limitAmount: 5000,
    courtWebsite: 'https://louisianalawhelp.org',
    courtWebsiteLabel: 'Louisiana Law Help – Small Claims',
    filingFee: '$35–$150',
    statuteOfLimitations: '2–10 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Louisiana Small Claims Division (in City Court or Justice of the Peace Court) handles disputes up to $5,000. Common cases include unpaid debts, property damage, and minor contract disputes.' },
      { num: 2, title: 'Identify the correct court', desc: 'In urban parishes: file in the Small Claims Division of your parish City Court. In rural parishes: file before the Justice of the Peace. Find your court at lasc.org.' },
      { num: 3, title: 'Complete the small claims petition', desc: 'Fill out the petition form from the court clerk. Include the defendant\'s name, address, amount claimed, and a clear description of why you\'re owed money.' },
      { num: 4, title: 'File your petition and pay the fee', desc: 'Filing fees vary significantly by parish — typically $35 to $150. Sheriff service fees are separate ($30–$75 per defendant).' },
      { num: 5, title: 'Service is arranged through the court', desc: 'Louisiana uses sheriff service as the primary method. Certified mail is also available. If service fails, alternative service methods may be ordered by the court.' },
      { num: 6, title: 'Attend your hearing', desc: 'Present your case informally. The judge applies Louisiana Civil Code rules (not common law). Technical rules of evidence are relaxed for self-represented litigants.' },
      { num: 7, title: 'Note: Small Claims judgments are final', desc: 'IMPORTANT: Louisiana Small Claims Division judgments are final and non-appealable. If you want to preserve appeal rights, file in regular City Court civil docket instead.' },
    ],
    tips: [
      'Louisiana is the only US state using Civil Law (Napoleonic Code) — your case is governed by the Louisiana Civil Code, not common law.',
      'Louisiana Small Claims judgments CANNOT be appealed. If your case is complex, file in regular City Court to preserve appeal rights.',
      'Louisiana extended its personal injury statute of limitations from 1 year to 2 years effective July 1, 2024.',
    ],
  },
  kentucky: {
    name: 'Kentucky',
    slug: 'kentucky',
    limit: '$2,500',
    limitAmount: 2500,
    courtWebsite: 'https://www.kycourts.gov/Legal-Help/Pages/default.aspx',
    courtWebsiteLabel: 'Kentucky Courts – Legal Self-Help',
    filingFee: '$30–$50',
    statuteOfLimitations: '1–5 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Kentucky small claims court handles disputes up to $2,500 — one of the lowest limits nationally. Claims between $2,500 and $5,000 go to the regular District Court civil docket.' },
      { num: 2, title: 'Identify the correct District Court', desc: 'File in the District Court for the county where the defendant lives or where the obligation arose. Kentucky\'s Small Claims Division is part of District Court.' },
      { num: 3, title: 'Complete the complaint form', desc: 'Fill out the Small Claims Complaint form from the District Court clerk or use Kentucky\'s e-filing portal (ehelp.kycourts.net). Include the defendant\'s name, address, and claim details.' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are approximately $30 for claims up to $1,500 and $50 for claims up to $2,500. Certified mail service is usually included.' },
      { num: 5, title: 'Service is arranged by the court', desc: 'The clerk arranges service by certified mail. If certified mail fails, sheriff or process server service is available.' },
      { num: 6, title: 'Prepare your evidence', desc: 'No formal discovery is permitted in Kentucky small claims. Bring all your documents, receipts, photos, and any written communications to the hearing.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the District Court judge. Either party may appeal to Circuit Court for a completely new trial (de novo). Fee increases are scheduled for July 1, 2026.' },
    ],
    tips: [
      'Kentucky\'s $2,500 small claims limit is one of the lowest in the nation — if your claim exceeds it, file in the regular District Court civil docket (up to $5,000).',
      'Kentucky\'s 1-year personal injury statute of limitations is among the shortest in the US — act fast.',
      'Kentucky offers e-filing for small claims at ehelp.kycourts.net — no need to visit the courthouse in person.',
    ],
  },
  colorado: {
    name: 'Colorado',
    slug: 'colorado',
    limit: '$7,500',
    limitAmount: 7500,
    courtWebsite: 'https://www.courts.state.co.us/userfiles/file/Court_Probation/County_Court/small_claims_booklet.pdf',
    courtWebsiteLabel: 'Colorado Courts – Small Claims Guide',
    filingFee: '$31–$55',
    statuteOfLimitations: '3–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Colorado small claims court handles disputes up to $7,500. Common cases include unpaid debts, security deposit disputes, property damage, and minor contract disputes.' },
      { num: 2, title: 'Identify the correct County Court', desc: 'File in the County Court for the county where the defendant lives or where the transaction occurred. Colorado\'s small claims division is part of County Court.' },
      { num: 3, title: 'Complete the Notice, Claim & Summons (JDF 250)', desc: 'Fill out form JDF 250 (Notice, Claim and Summons to Appear for Trial) from the County Court clerk or Colorado Judicial website. Include the defendant\'s name, address, amount, and reason for the claim.' },
      { num: 4, title: 'File your claim and pay the fee', desc: 'File with the County Court clerk. Filing fees are $31 for claims up to $500, $55 for claims up to $7,500.' },
      { num: 5, title: 'Serve the defendant', desc: 'Colorado requires personal service — a sheriff, process server, or adult who is not a party can serve the defendant at least 15 days before the trial date.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather all contracts, receipts, photos, and communications. Colorado small claims hearings are informal but well-organized — bring a clear summary of your case.' },
      { num: 7, title: 'Attend your trial', desc: 'Present your case to the judge. Decisions are usually rendered the same day. Either party may appeal to District Court within 15 days.' },
    ],
    tips: [
      'Colorado prohibits attorneys from representing clients in small claims court — both sides must appear in person.',
      'Colorado requires personal service (not just mail) — plan ahead since you need to serve the defendant at least 15 days before trial.',
      'You can sue for up to $7,500, but the County Court civil division handles larger disputes up to $25,000.',
    ],
  },
  oregon: {
    name: 'Oregon',
    slug: 'oregon',
    limit: '$10,000',
    limitAmount: 10000,
    courtWebsite: 'https://www.courts.oregon.gov/help/Pages/small-claims.aspx',
    courtWebsiteLabel: 'Oregon Judicial Department – Small Claims',
    filingFee: '$57–$102',
    statuteOfLimitations: '2–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Oregon small claims court handles disputes up to $10,000. Claims of $750 or less must be filed in small claims; claims between $751 and $10,000 may be filed in small claims or regular circuit court at your option.' },
      { num: 2, title: 'Identify the correct court', desc: 'File in the Small Claims Department of the Circuit Court (or Justice Court in some counties) for the county where the defendant lives or where the dispute occurred.' },
      { num: 3, title: 'Complete the plaintiff\'s claim form', desc: 'Fill out the Small Claims Complaint form (SC-01) from the court clerk or the Oregon Judicial Department website (courts.oregon.gov). Include the defendant\'s full name, address, amount, and reason for the claim.' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are $57 for claims up to $2,500 and $102 for claims between $2,501 and $10,000. Fee waivers are available for low-income filers.' },
      { num: 5, title: 'Serve the defendant', desc: 'The clerk will attempt service by certified mail. You have 63 days to complete service. If mail fails, use a sheriff or process server.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather contracts, receipts, photos, and communications. Oregon small claims hearings are informal — bring a clear written summary of your case and enough copies for the judge and the defendant.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the judge or magistrate. Important: Oregon small claims judgments are FINAL — no appeals are allowed. Attorneys are not permitted at the hearing without special permission.' },
    ],
    tips: [
      'Oregon small claims judgments are final and non-appealable — make sure you are ready before filing.',
      'Attorneys are generally not allowed at Oregon small claims hearings; both sides must represent themselves.',
      'Oregon has a 2-year statute of limitations for personal injury and a 6-year limit for contract disputes.',
    ],
  },
  nevada: {
    name: 'Nevada',
    slug: 'nevada',
    limit: '$10,000',
    limitAmount: 10000,
    courtWebsite: 'https://nvcourts.gov/aoc/discover_nevada_justice/small_claims_court',
    courtWebsiteLabel: 'Nevada Courts – Small Claims Court',
    filingFee: '$66–$196',
    statuteOfLimitations: '2–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Nevada small claims court handles disputes up to $10,000 (NRS 73.010). Common cases include unpaid debts, security deposits, property damage, and minor contract disputes.' },
      { num: 2, title: 'Find your local Justice Court', desc: 'File in the Justice Court for the township where the defendant lives or where the dispute occurred. Nevada has Justice Courts in every county — the largest are Clark (Las Vegas) and Washoe (Reno).' },
      { num: 3, title: 'Complete the claim form', desc: 'Fill out the Small Claims Complaint form from your local Justice Court clerk or the court website. Include the defendant\'s full name, address, and a clear statement of the amount owed and why.' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees vary by county and claim amount: under $1,000 is $66; $1,000–$2,500 is $86; $2,500–$5,000 is $106; $5,000–$7,500 is $146; $7,500–$10,000 is $196. Fees based on Washoe County rates.' },
      { num: 5, title: 'Service and mandatory mediation', desc: 'The court will serve the defendant by certified mail. Some counties (including Reno/Washoe) require mandatory mediation before the hearing — be prepared to attempt settlement.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather contracts, receipts, text messages, and photos. Nevada small claims hearings are informal — bring organized copies of everything for the judge and the other party.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the judge. Attorneys may appear but cannot recover fees from the other side. The judge will typically issue a decision at the hearing or shortly after.' },
    ],
    tips: [
      'Nevada requires mandatory mediation before the hearing in many counties — attempt to settle before the hearing date.',
      'Nevada has a 2-year statute of limitations for personal injury and a 6-year limit for written contracts.',
      'Corporations can be represented by an officer or employee in Nevada small claims — no attorney required.',
    ],
  },
  connecticut: {
    name: 'Connecticut',
    slug: 'connecticut',
    limit: '$5,000',
    limitAmount: 5000,
    courtWebsite: 'https://www.jud.ct.gov/faq/smallclaims.html',
    courtWebsiteLabel: 'Connecticut Judicial Branch – Small Claims',
    filingFee: '$95',
    statuteOfLimitations: '2–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Connecticut small claims court (the Small Claims Session of Superior Court) handles disputes up to $5,000 general maximum. Exception: home improvement or new home construction contracts with certified contractors may go up to $15,000.' },
      { num: 2, title: 'Identify the correct court location', desc: 'File in the Superior Court for the judicial district where the defendant lives or where the dispute occurred. Connecticut has 13 judicial districts statewide.' },
      { num: 3, title: 'Complete Form CV-040A1', desc: 'Fill out Form CV-040A1 (Small Claims Writ and Notice of Suit) from the court clerk or the Connecticut Judicial Branch website (jud.ct.gov). Corporations must be represented by an attorney.' },
      { num: 4, title: 'File and pay the fee', desc: 'The flat filing fee is $95 statewide. File with the court clerk and request a return date (the deadline for the defendant to file an answer).' },
      { num: 5, title: 'Serve the defendant', desc: 'The court will issue a Writ. A proper officer (marshal or state marshal) must serve the defendant before the return date. Service by certified mail is not sufficient in Connecticut.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather contracts, invoices, text messages, and photos. Connecticut small claims hearings are conducted by court-appointed Magistrates — bring organized copies of all evidence.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the Magistrate. Note: there is no right of appeal from Connecticut Small Claims judgments and no jury trials. The decision is final.' },
    ],
    tips: [
      'Connecticut small claims judgments cannot be appealed — make sure your claim is well-documented before filing.',
      'Connecticut has a 2-year statute of limitations for personal injury and a 6-year limit for written contracts.',
      'Corporations are required by law to be represented by an attorney in Connecticut courts — even in small claims.',
    ],
  },
  massachusetts: {
    name: 'Massachusetts',
    slug: 'massachusetts',
    limit: '$7,000',
    limitAmount: 7000,
    courtWebsite: 'https://www.mass.gov/info-details/small-claims-court',
    courtWebsiteLabel: 'Mass.gov – Small Claims Court',
    filingFee: '$40–$150',
    statuteOfLimitations: '3–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Massachusetts small claims court handles disputes up to $7,000 general maximum. Important exception: there is NO dollar limit for motor vehicle property damage claims — you can sue for any amount in small claims for a car accident.' },
      { num: 2, title: 'Identify the correct court', desc: 'File in the Small Claims Session of the District Court (or Boston Municipal Court/Boston Housing Court) for the city or town where the defendant lives or where the dispute occurred. Massachusetts has 62 District Courts.' },
      { num: 3, title: 'Complete the Statement of Small Claim form', desc: 'Fill out the Statement of Small Claim form (Form SC-1) from your District Court clerk or the Mass.gov website. Include the defendant\'s name, address, amount claimed, and a brief statement of the reason.' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are tiered: up to $500 = $40; $501–$2,000 = $50; $2,001–$5,000 = $100; $5,001–$7,000 = $150. An additional $7 eFiling surcharge may apply.' },
      { num: 5, title: 'Service is by mail', desc: 'The court serves the defendant by first-class mail. The defendant has 20 days to file a written answer, though they can also just appear at the scheduled hearing date.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather all contracts, receipts, photos, and communications. Massachusetts small claims hearings are informal — bring clear, organized copies for the magistrate and the other party.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the magistrate. Either party may appeal to the District Court within 10 days of the judgment.' },
    ],
    tips: [
      'Massachusetts has NO dollar limit for motor vehicle property damage claims in small claims court — ideal for car accident property damage disputes of any amount.',
      'Massachusetts has a 3-year statute of limitations for personal injury and a 6-year limit for contract disputes.',
      'Small claims hearings are held in all 62 District Courts, Boston Municipal Court, and the Boston Housing Court.',
    ],
  },
  oklahoma: {
    name: 'Oklahoma',
    slug: 'oklahoma',
    limit: '$10,000',
    limitAmount: 10000,
    courtWebsite: 'https://www.oscn.net',
    courtWebsiteLabel: 'Oklahoma State Courts Network (OSCN)',
    filingFee: '$42–$80',
    statuteOfLimitations: '2–5 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Oklahoma small claims court (the Small Claims Docket of District Court) handles disputes up to $10,000, exclusive of attorney fees and costs (12 O.S. § 1751). Note: claims based on libel or slander are excluded.' },
      { num: 2, title: 'Find your local District Court', desc: 'File in the District Court for the county where the defendant lives or where the dispute occurred. Oklahoma has 77 District Courts — one per county.' },
      { num: 3, title: 'Complete the petition form', desc: 'Fill out the Small Claims Petition from your county District Court clerk. Include the defendant\'s full name, address, amount claimed, and reason for the claim.' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees vary by county — generally $42–$80. Add $10–$20 for certified mail service. Check with your specific county District Court clerk.' },
      { num: 5, title: 'Service and hearing scheduling', desc: 'The court issues an Order to Appear served on the defendant. Cases must be heard within 60 days of filing by statute. The defendant must appear at the hearing (no written answer required to avoid default).' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather contracts, receipts, text messages, and photos. Oklahoma small claims hearings are informal — bring organized copies of all evidence for the judge and the other party.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the judge. Jury trials are available for claims over $1,500 if demanded 72 hours before the hearing. Either party may appeal within 30 days.' },
    ],
    tips: [
      'Oklahoma cases must be heard within 60 days of filing — the fastest small claims timeline in the country.',
      'Oklahoma has a 2-year statute of limitations for personal injury and a 5-year limit for written contracts.',
      'Jury trials are available in Oklahoma small claims for claims over $1,500 — demand one at least 72 hours before the hearing.',
    ],
  },
  arkansas: {
    name: 'Arkansas',
    slug: 'arkansas',
    limit: '$5,000',
    limitAmount: 5000,
    courtWebsite: 'https://arcourts.gov/directories/district-courts',
    courtWebsiteLabel: 'Arkansas Courts – District Court Directory',
    filingFee: '$30–$65',
    statuteOfLimitations: '3–5 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Arkansas Small Claims Court (a division of District Court) handles disputes strictly below $5,000. Important: collection agencies, collection agents, and money-lending businesses CANNOT use Arkansas small claims court.' },
      { num: 2, title: 'Find your local District Court', desc: 'File in the District Court for the county where the defendant lives or where the dispute occurred. Each county has a District Court with a small claims division.' },
      { num: 3, title: 'Complete the complaint form', desc: 'Fill out the Small Claims Complaint from the District Court clerk. Include the defendant\'s name, address, amount claimed, and a brief description of the dispute.' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are typically $30–$65. Add $20–$30 for certified mail service. Some counties add additional service fees.' },
      { num: 5, title: 'Service is by certified mail', desc: 'The court serves the defendant by certified mail. The defendant has 30 days from service to file a written answer. If certified mail fails, sheriff service is available.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather contracts, receipts, photos, and communications. Arkansas small claims hearings are informal — bring organized copies of all documents.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the District Court judge. IMPORTANT: No attorneys allowed — if either party retains an attorney, the case is automatically transferred to the regular District Court civil docket. Either party may appeal to Circuit Court within 30 days.' },
    ],
    tips: [
      'Arkansas strictly prohibits attorneys in small claims court — if either party hires one, the case transfers out of small claims.',
      'Arkansas has a 3-year statute of limitations for personal injury and a 5-year limit for written contracts.',
      'Collection agencies and money lenders cannot use Arkansas small claims court — they must file in regular District Court.',
    ],
  },
  mississippi: {
    name: 'Mississippi',
    slug: 'mississippi',
    limit: '$3,500',
    limitAmount: 3500,
    courtWebsite: 'https://www.courts.ms.gov/trialcourts/justicecourt/justicecourt.php',
    courtWebsiteLabel: 'Mississippi Courts – Justice Court',
    filingFee: '$84–$225',
    statuteOfLimitations: '3 years for most claims',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Mississippi Justice Court handles civil disputes up to $3,500 — one of the lowest limits in the U.S. (Miss. Code § 9-11-9). For claims between $3,500 and $200,000, file in County Court.' },
      { num: 2, title: 'Find your local Justice Court', desc: 'File in the Justice Court for the county where the defendant lives or where the dispute occurred. Mississippi has Justice Courts in all 82 counties.' },
      { num: 3, title: 'Complete the complaint form', desc: 'Fill out the civil complaint form from the Justice Court clerk. Include the defendant\'s full name, address, amount claimed, and a clear description of why the money is owed.' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees vary by county and number of defendants — typically $84–$225. Some counties charge per additional defendant.' },
      { num: 5, title: 'Service of process', desc: 'Service must be by constable, sheriff personal service, or certified mail with return receipt. The court will schedule a hearing typically 30–45 days after filing.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather contracts, receipts, photos, and communications. Note: Mississippi Justice Court judges are NOT required to be attorneys — hearings are informal but straightforward.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the Justice Court judge. Either party may appeal within 30 days for a full new trial in County or Circuit Court.' },
    ],
    tips: [
      'Mississippi\'s $3,500 Justice Court limit is one of the lowest in the nation — consider County Court for larger claims.',
      'Mississippi has a uniform 3-year statute of limitations for virtually all civil claims under § 15-1-49.',
      'Post-judgment interest accrues at 8% annually in Mississippi — collect promptly after winning.',
    ],
  },
  utah: {
    name: 'Utah',
    slug: 'utah',
    limit: '$20,000',
    limitAmount: 20000,
    courtWebsite: 'https://www.utcourts.gov/en/self-help/case-categories/consumer/small-claims.html',
    courtWebsiteLabel: 'Utah Courts – Small Claims',
    filingFee: '$60–$185',
    statuteOfLimitations: '3–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Utah Justice Court handles small claims disputes up to $20,000 (Utah Code § 78A-8-102). This limit automatically rises to $25,000 on January 1, 2030 — Utah\'s unique inflation-indexed escalator. Online Dispute Resolution (ODR) is available.' },
      { num: 2, title: 'Identify the correct court', desc: 'File in the Justice Court for the precinct where the defendant lives or where the dispute occurred. Utah has Justice Courts in most counties and municipalities.' },
      { num: 3, title: 'Complete the small claims forms', desc: 'Fill out the Small Claims Affidavit and Summons from the Justice Court clerk or the Utah Courts website (utcourts.gov). Include the defendant\'s name, address, amount, and reason for the claim.' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees: up to $2,000 = $60; $2,001–$7,500 = $100; $7,501–$20,000 = $185. Add a service fee of $25–$50.' },
      { num: 5, title: 'Consider Online Dispute Resolution (ODR)', desc: 'Utah offers ODR in many courts — you may be able to resolve the dispute online before going to a hearing. The plaintiff must log in within 7 days of filing or the case may be dismissed.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather contracts, receipts, text messages, and photos. Any counterclaims must be filed at least 15 days before the trial date.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the judge or court commissioner. Either party may appeal to District Court within 28 days for a completely new trial.' },
    ],
    tips: [
      'Utah\'s small claims limit rises automatically to $25,000 on January 1, 2030 — no legislative action needed.',
      'Utah offers Online Dispute Resolution (ODR) — log in within 7 days of filing or risk dismissal.',
      'Utah has a 4-year statute of limitations for personal injury and a 6-year limit for written contracts.',
    ],
  },
  'new-mexico': {
    name: 'New Mexico',
    slug: 'new-mexico',
    limit: '$10,000',
    limitAmount: 10000,
    courtWebsite: 'https://nmcourts.gov',
    courtWebsiteLabel: 'New Mexico Courts',
    filingFee: '$77–$87',
    statuteOfLimitations: '3–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'New Mexico Magistrate Court handles civil disputes up to $10,000 (N.M. Stat. § 35-3-3). Important: Bernalillo County (Albuquerque) uses Metropolitan Court instead of Magistrate Court — different rules and deadlines apply.' },
      { num: 2, title: 'Find the correct court', desc: 'In Bernalillo County: file in Metropolitan Court. In all other 32 counties: file in your county\'s Magistrate Court. Find your court at nmcourts.gov.' },
      { num: 3, title: 'Complete the complaint form', desc: 'Fill out the civil complaint form from the Magistrate Court clerk or online at selfrepresentation.nmcourts.gov. Include the defendant\'s name, address, amount, and reason for the claim.' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are $77–$87 for claims up to $10,000. Add $25–$50 for sheriff service. A $100 additional fee applies if you request a jury trial.' },
      { num: 5, title: 'Service of process', desc: 'The defendant must be served by sheriff or process server. Answer deadline is 20 days in Magistrate Court but only 10 days in Metropolitan Court (Bernalillo County) — much shorter.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather contracts, receipts, photos, and communications. New Mexico\'s small claims procedure is governed by the Rules of Civil Procedure for the Magistrate/Metro Courts.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the judge. Either party may appeal to District Court. New Mexico has a 15% post-judgment interest rate on tort claims against insured defendants — among the highest nationally.' },
    ],
    tips: [
      'Bernalillo County (Albuquerque) uses Metropolitan Court with different rules — the answer deadline is 10 days instead of 20.',
      'New Mexico has a 3-year statute of limitations for personal injury and a 6-year limit for written contracts.',
      'New Mexico Courts offer a HelpLine: (855) 268-7804 for self-represented litigants.',
    ],
  },
  'west-virginia': {
    name: 'West Virginia',
    slug: 'west-virginia',
    limit: '$20,000',
    limitAmount: 20000,
    courtWebsite: 'https://www.courtswv.gov/lower-courts/magistrate-courts',
    courtWebsiteLabel: 'West Virginia Courts – Magistrate Courts',
    filingFee: '$50–$70',
    statuteOfLimitations: '2–10 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'West Virginia Magistrate Court handles civil disputes up to $20,000 (effective July 2025, doubled from $10,000 under HB 2761). This puts WV among the highest-limit magistrate courts nationally.' },
      { num: 2, title: 'Find your local Magistrate Court', desc: 'File in the Magistrate Court for the county where the defendant lives or where the dispute occurred. West Virginia has at least 2 magistrates per county (169 total statewide).' },
      { num: 3, title: 'Complete the complaint form', desc: 'Fill out the Magistrate Court civil complaint form from the court clerk or the WV Courts website (courtswv.gov). Include the defendant\'s name, address, amount, and a clear description of the dispute.' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are $50–$70 depending on claim amount. Fee waivers (Affidavit of Pauperism) are available for filers below 150% of the federal poverty guidelines.' },
      { num: 5, title: 'Service of process', desc: 'The defendant must be served and has 20 days to respond. Eviction cases have a shorter 5-day service deadline. Partial payment or written acknowledgment by the defendant resets the statute of limitations clock.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather contracts, receipts, photos, and communications. Note: West Virginia\'s written contract statute of limitations is 10 years — the longest in the nation.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the magistrate. Either party may appeal to Circuit Court within 20 days by filing a notice of appeal and posting a cost bond.' },
    ],
    tips: [
      'West Virginia\'s $20,000 magistrate court limit is among the highest nationally — doubled from $10,000 in July 2025.',
      'West Virginia has the longest written contract statute of limitations nationally — 10 years (W. Va. Code § 55-2-6).',
      'West Virginia has a 2-year statute of limitations for personal injury — act quickly after an accident.',
    ],
  },
  delaware: {
    name: 'Delaware',
    slug: 'delaware',
    limit: '$25,000',
    limitAmount: 25000,
    courtWebsite: 'https://courts.delaware.gov/jpc/',
    courtWebsiteLabel: 'Delaware Justice of the Peace Court',
    filingFee: '$30–$50',
    statuteOfLimitations: '2–3 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Delaware Justice of the Peace (JP) Court handles civil disputes up to $25,000 — the highest small claims limit in the United States (10 Del. C. § 9301). No attorneys are allowed in JP Court small claims proceedings.' },
      { num: 2, title: 'Find your local JP Court', desc: 'File in the JP Court in the county where the defendant lives or where the cause of action arose. Delaware has JP Courts in New Castle, Kent, and Sussex counties.' },
      { num: 3, title: 'Complete the civil complaint', desc: 'Obtain and fill out the civil complaint form at your local JP Court or download it from the Delaware Courts website. Include the defendant\'s name, address, the amount claimed, and a description of the dispute.' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are $30–$50 depending on the amount claimed. Fee waivers may be available for income-qualified filers.' },
      { num: 5, title: 'Service of process', desc: 'The court will arrange service on the defendant. The defendant has 15 days to respond after being served.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather all contracts, receipts, photos, text messages, and other documentation. Delaware\'s personal injury SOL is only 2 years — file promptly.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the JP. Either party may appeal to the Court of Common Pleas within 15 days of judgment.' },
    ],
    tips: [
      'Delaware has the highest small claims limit in the U.S. at $25,000 — available without an attorney in JP Court.',
      'Claims between $25,001 and $75,000 go to the Court of Common Pleas; above $75,000 go to Superior Court.',
      'Delaware\'s personal injury statute of limitations is 2 years (10 Del. C. § 8119) — act quickly.',
    ],
  },
  'rhode-island': {
    name: 'Rhode Island',
    slug: 'rhode-island',
    limit: '$2,500',
    limitAmount: 2500,
    courtWebsite: 'https://www.courts.ri.gov/Courts/districtcourt/Pages/smallclaims.aspx',
    courtWebsiteLabel: 'Rhode Island District Court – Small Claims',
    filingFee: '$65–$80',
    statuteOfLimitations: '3–10 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Rhode Island District Court Small Claims handles disputes up to $2,500 (R.I. Gen. Laws § 10-16-1). This is one of the lowest limits in the U.S. For claims over $2,500, file in District Court (regular civil division).' },
      { num: 2, title: 'Find your local District Court', desc: 'File in the District Court for the county where the defendant lives or where the transaction occurred. Rhode Island has District Court divisions in Providence, Kent, Newport, and Washington counties.' },
      { num: 3, title: 'Complete the statement of claim', desc: 'Fill out the small claims statement of claim form available at your local District Court clerk\'s office or the RI Courts website. Clearly describe the dispute and the amount owed.' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are approximately $65–$80. Submit your forms to the clerk and obtain a hearing date.' },
      { num: 5, title: 'Serve the defendant', desc: 'The court will serve the defendant. The defendant must receive notice of the hearing date.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather all relevant documents. Rhode Island\'s written and oral contract SOL is 10 years — much longer than most states.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the judge. Important: in Rhode Island small claims court, only the DEFENDANT may appeal — the plaintiff has no right to appeal a small claims judgment (unique nationally).' },
    ],
    tips: [
      'Rhode Island\'s $2,500 small claims limit is one of the lowest in the U.S. — for claims above $2,500, use regular District Court.',
      'Only the defendant can appeal a small claims judgment in Rhode Island — plaintiffs cannot appeal.',
      'Post-judgment interest in Rhode Island accrues at 12% per annum — higher than most states.',
    ],
  },
  'new-hampshire': {
    name: 'New Hampshire',
    slug: 'new-hampshire',
    limit: '$10,000',
    limitAmount: 10000,
    courtWebsite: 'https://www.courts.state.nh.us/district/smallclaims.htm',
    courtWebsiteLabel: 'New Hampshire Courts – Small Claims',
    filingFee: '$90–$130',
    statuteOfLimitations: '3 years for all claim types',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'New Hampshire Circuit Court Small Claims Division handles disputes up to $10,000 (RSA § 503:1). All claims must be for money only — no injunctive relief in small claims.' },
      { num: 2, title: 'Find the correct Circuit Court', desc: 'File in the Circuit Court district court division for the county where the defendant lives or where the transaction occurred.' },
      { num: 3, title: 'Complete the statement of claim', desc: 'Fill out the small claims statement of claim available from the NH Courts website (courts.nh.gov). E-filing is mandatory in New Hampshire — most forms must be filed online.' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are $90–$130 depending on the amount. E-filing is required.' },
      { num: 5, title: 'Mediation for claims over $5,000', desc: 'For claims over $5,000, mediation is mandatory before a hearing. The court will schedule a mediation session with a trained mediator.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather all contracts, receipts, photos, and communications. Note: New Hampshire has a uniform 3-year statute of limitations for all civil claims (RSA § 508:4).' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the judge. Either party may appeal to Superior Court.' },
    ],
    tips: [
      'E-filing is mandatory in New Hampshire — visit courts.nh.gov to file online.',
      'Mediation is required for claims over $5,000 before a hearing is scheduled.',
      'New Hampshire has a uniform 3-year statute of limitations for all civil claims — the simplest SOL regime in the U.S.',
    ],
  },
  vermont: {
    name: 'Vermont',
    slug: 'vermont',
    limit: '$5,000',
    limitAmount: 5000,
    courtWebsite: 'https://www.vermontjudiciary.org/civil/small-claims',
    courtWebsiteLabel: 'Vermont Judiciary – Small Claims',
    filingFee: '$90–$120',
    statuteOfLimitations: '3–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Vermont Small Claims Court handles disputes up to $5,000 (12 V.S.A. § 5531). Cases must be for money damages only — no property recovery or injunctions.' },
      { num: 2, title: 'Find your local Superior Court', desc: 'Small claims cases are filed in the Civil Division of Vermont Superior Court in the county where the defendant lives or works, or where the dispute occurred.' },
      { num: 3, title: 'Complete the small claims form', desc: 'Fill out the Vermont small claims complaint form available from the Vermont Judiciary website (vermontjudiciary.org). Describe the dispute and the amount sought.' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are $90–$120. Filers with limited income may apply for a fee waiver.' },
      { num: 5, title: 'Service of process', desc: 'The court will arrange service on the defendant, who then has time to respond or request mediation.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather all relevant documentation. Personal injury SOL is 3 years in Vermont (12 V.S.A. § 512); written contract SOL is 6 years (12 V.S.A. § 511).' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case. Attorneys may appear, but the judge may limit their questioning. Either party may appeal to the Vermont Supreme Court on questions of law.' },
    ],
    tips: [
      'Vermont small claims is limited to $5,000 — for larger disputes file in the regular Superior Court civil division.',
      'Attorneys may appear in Vermont small claims court, unlike many states.',
      'Vermont\'s personal injury statute of limitations is 3 years; written contracts are 6 years.',
    ],
  },
  maine: {
    name: 'Maine',
    slug: 'maine',
    limit: '$6,000',
    limitAmount: 6000,
    courtWebsite: 'https://www.courts.maine.gov/fees/fees-small-claims.shtml',
    courtWebsiteLabel: 'Maine Courts – Small Claims',
    filingFee: '$60–$80',
    statuteOfLimitations: '6 years for all claim types',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Maine District Court Small Claims handles disputes up to $6,000 (14 M.R.S.A. § 7482). Common cases include contract disputes, property damage, landlord-tenant issues, and unpaid debts.' },
      { num: 2, title: 'Find your local District Court', desc: 'File in the District Court for the county where the defendant lives or where the cause of action arose.' },
      { num: 3, title: 'Complete the small claims complaint', desc: 'Fill out the small claims complaint form (CV-SC-1) available at your local District Court or the Maine Courts website (courts.maine.gov).' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are $60–$80 depending on the amount. Fee waivers are available for income-qualified filers.' },
      { num: 5, title: 'Service of process', desc: 'The clerk will arrange certified mail service on the defendant. Personal service may be required if mail service fails.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather all documentation. Maine has a uniform 6-year statute of limitations for virtually all civil claims (14 M.R.S.A. § 752) — one of the most generous in the U.S.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case. Note: Maine has asymmetric appeal rights — plaintiffs can only appeal on questions of law, but defendants can appeal both law and fact (14 M.R.S.A. § 7488).' },
    ],
    tips: [
      'Maine has a 6-year statute of limitations for virtually all civil claims — one of the most generous SOL regimes in the U.S.',
      'Asymmetric appeal rights: plaintiffs can appeal only on legal error; defendants can appeal both law and fact.',
      'Maine\'s $6,000 small claims limit covers most consumer and landlord-tenant disputes.',
    ],
  },
  iowa: {
    name: 'Iowa',
    slug: 'iowa',
    limit: '$6,500',
    limitAmount: 6500,
    courtWebsite: 'https://www.iowacourts.gov/for-the-public/court-forms/small-claims/',
    courtWebsiteLabel: 'Iowa Courts – Small Claims',
    filingFee: '$35–$95',
    statuteOfLimitations: '2–10 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Iowa Small Claims Court handles disputes up to $6,500 (Iowa Code § 631.1). Common cases include unpaid debts, property damage, security deposit disputes, and minor contract breaches.' },
      { num: 2, title: 'Find your local District Court', desc: 'Small claims cases are filed in the District Court for the county where the defendant lives or where the cause of action arose. Iowa has District Courts in each of its 99 counties.' },
      { num: 3, title: 'Complete the original notice and petition', desc: 'Fill out the original notice and petition form available from your county courthouse or the Iowa Courts website (iowacourts.gov).' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees range from $35 to $95 based on the amount claimed. Fee waivers are available for income-qualified filers.' },
      { num: 5, title: 'Service of process', desc: 'The defendant must be served by certified mail or in person. The defendant has 20 days to respond after service.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather all documentation. Note: Iowa has a 10-year statute of limitations for written contracts (Iowa Code § 614.1(5)) — tied for the longest in the U.S.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the judge. Either party may appeal to District Court within 20 days of the judgment.' },
    ],
    tips: [
      'Iowa\'s written contract statute of limitations is 10 years — tied for the longest in the U.S.',
      'Personal injury claims must be filed within 2 years in Iowa.',
      'Small claims is limited to $6,500 — for larger amounts file a regular civil action in District Court.',
    ],
  },
  kansas: {
    name: 'Kansas',
    slug: 'kansas',
    limit: '$4,000',
    limitAmount: 4000,
    courtWebsite: 'https://www.kscourts.org/Rules-Cases-Forms/Forms/Court-Forms',
    courtWebsiteLabel: 'Kansas Courts – Court Forms',
    filingFee: '$35–$70',
    statuteOfLimitations: '2–5 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Kansas Small Claims Court handles disputes up to $4,000 (K.S.A. § 61-2703). Common cases include unpaid rent, property damage, and minor contract disputes.' },
      { num: 2, title: 'Find the correct District Court', desc: 'File in the District Court for the county where the defendant lives or where the cause of action arose.' },
      { num: 3, title: 'Complete the petition', desc: 'Fill out the small claims petition available at your county District Court or the Kansas Courts website.' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are $35–$70. Fee waivers are available for income-qualified filers (Affidavit of Indigency).' },
      { num: 5, title: 'Service of process', desc: 'The court arranges service on the defendant. The defendant must respond within the time specified in the summons.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather contracts, receipts, and other documentation. Personal injury SOL is 2 years in Kansas (KSA § 60-513).' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case. Unique Kansas rule: attorneys are not allowed unless the opposing party also has an attorney. Maximum 20 small claims filings per year per individual.' },
    ],
    tips: [
      'Unique Kansas rule: no attorneys unless the opposing party also has one — creates a level playing field.',
      'Kansas limits individuals to 20 small claims filings per year.',
      'Kansas\'s $4,000 limit is among the lower ones nationally — claims above this go to District Court.',
    ],
  },
  nebraska: {
    name: 'Nebraska',
    slug: 'nebraska',
    limit: '$3,600',
    limitAmount: 3600,
    courtWebsite: 'https://supremecourt.nebraska.gov/self-help/county-court/small-claims',
    courtWebsiteLabel: 'Nebraska Courts – Small Claims',
    filingFee: '$30–$45',
    statuteOfLimitations: '4–5 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Nebraska County Court Small Claims handles disputes up to $3,600 (Neb. Rev. Stat. § 25-2801). For claims up to $67,500, file in regular County Court. District Court handles larger amounts.' },
      { num: 2, title: 'Find your local County Court', desc: 'File in the County Court for the county where the defendant lives or where the cause of action arose. Nebraska has County Courts in each of its 93 counties.' },
      { num: 3, title: 'Complete the petition', desc: 'Fill out the small claims petition available at your County Court clerk\'s office or the Nebraska Courts website (supremecourt.nebraska.gov).' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are $30–$45 — among the lowest in the nation. Fee waivers are available for income-qualified filers.' },
      { num: 5, title: 'Service of process', desc: 'The court arranges service on the defendant, who has time to respond before the hearing.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather all documentation. Nebraska written contract SOL is 5 years (Neb. Rev. Stat. § 25-205); personal injury SOL is 4 years.' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case. Nebraska has a strict no-attorneys rule in small claims (Neb. Rev. Stat. § 25-2806). Individuals are limited to 2 filings per week and 10 filings per year.' },
    ],
    tips: [
      'Nebraska has a strict no-attorneys rule in small claims court — both parties must represent themselves.',
      'Individuals are limited to 2 small claims filings per week and 10 per year in Nebraska.',
      'Nebraska\'s $3,600 limit is low — for disputes above this amount, file in regular County Court.',
    ],
  },
  'south-dakota': {
    name: 'South Dakota',
    slug: 'south-dakota',
    limit: '$12,000',
    limitAmount: 12000,
    courtWebsite: 'https://ujs.sd.gov/Circuit_Court/',
    courtWebsiteLabel: 'South Dakota Unified Judicial System – Circuit Court',
    filingFee: '$20–$50',
    statuteOfLimitations: '3–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'South Dakota Small Claims Court handles disputes up to $12,000 (SDCL § 15-39-45). Common cases include unpaid debts, property damage, and contract disputes.' },
      { num: 2, title: 'Find your local Circuit Court', desc: 'File in the Circuit Court for the county where the defendant lives or where the cause of action arose. South Dakota has Circuit Courts in each of its counties.' },
      { num: 3, title: 'Complete the petition', desc: 'Fill out the small claims complaint form available from your local Circuit Court clerk or the Unified Judicial System website (ujs.sd.gov).' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are $20–$50 — among the lowest in the nation.' },
      { num: 5, title: 'Service of process', desc: 'The court arranges service on the defendant, who has 30 days to respond.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather all documentation. South Dakota personal injury SOL is 3 years (SDCL § 15-2-14); written contracts are 6 years (SDCL § 15-2-13).' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case. Attorneys are not allowed in small claims unless both parties agree. Either party may appeal to Circuit Court.' },
    ],
    tips: [
      'South Dakota\'s $12,000 small claims limit is generous for a small-population state.',
      'Filing fees of $20–$50 are among the lowest in the U.S.',
      'Attorneys are not allowed in small claims court unless both parties consent.',
    ],
  },
  'north-dakota': {
    name: 'North Dakota',
    slug: 'north-dakota',
    limit: '$15,000',
    limitAmount: 15000,
    courtWebsite: 'https://www.ndcourts.gov/legal-self-help/going-to-court/small-claims-court',
    courtWebsiteLabel: 'North Dakota Courts – Small Claims',
    filingFee: '$10–$50',
    statuteOfLimitations: '6 years for all claim types',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'North Dakota Small Claims Court handles disputes up to $15,000 (N.D.C.C. § 27-08.1-01). Cases must be for money only.' },
      { num: 2, title: 'Find your local District Court', desc: 'Small claims cases are filed in District Court. North Dakota has District Courts organized into judicial districts.' },
      { num: 3, title: 'Complete the claim form', desc: 'Fill out the small claims complaint form available from your local District Court clerk or the ND Courts website (ndcourts.gov).' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are $10–$50 — very affordable for most filers.' },
      { num: 5, title: 'Service of process', desc: 'The court arranges service on the defendant, who has 20 days to respond.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather all documentation. North Dakota has a uniform 6-year statute of limitations for virtually all civil claims (N.D.C.C. § 28-01-16).' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case. Unique ND rule: individual persons cannot be represented by attorneys, but corporations MUST be represented by attorneys — the inverse of most states.' },
    ],
    tips: [
      'Unique North Dakota rule: individuals cannot have attorneys in small claims; corporations MUST have attorneys.',
      'North Dakota has a uniform 6-year statute of limitations for all civil claims — plan accordingly.',
      'The $15,000 limit accommodates most consumer and landlord-tenant disputes.',
    ],
  },
  montana: {
    name: 'Montana',
    slug: 'montana',
    limit: '$7,000',
    limitAmount: 7000,
    courtWebsite: 'https://courts.mt.gov/Courts/justice',
    courtWebsiteLabel: 'Montana Courts – Justice Court',
    filingFee: '$30–$50',
    statuteOfLimitations: '2–8 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Montana Justice Court handles small claims disputes up to $7,000 (MCA § 25-35-502). Common cases include unpaid debts, property damage, and contract disputes.' },
      { num: 2, title: 'Find your local Justice Court', desc: 'File in the Justice Court for the county where the defendant lives or where the dispute occurred. Each Montana county has a Justice Court.' },
      { num: 3, title: 'Complete the complaint', desc: 'Fill out the small claims complaint form available from your local Justice Court clerk or the Montana Courts website (courts.mt.gov).' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are $30–$50. Fee waivers are available for income-qualified filers.' },
      { num: 5, title: 'Service of process', desc: 'The court arranges service on the defendant, who has a specified time to respond.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather all documentation. Montana\'s written contract SOL is 8 years (MCA § 27-2-202) — among the longest in the U.S. Personal injury SOL is 3 years (MCA § 27-2-204).' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case. Montana has an "all or none" attorney rule: either both parties have attorneys or neither does. Either party may appeal to District Court.' },
    ],
    tips: [
      'Montana\'s "all or none" attorney rule: either both parties have lawyers or neither does — prevents one-sided representation.',
      'Montana\'s written contract SOL is 8 years — among the longest in the U.S.',
      'For property damage claims, the SOL is only 2 years — act promptly.',
    ],
  },
  wyoming: {
    name: 'Wyoming',
    slug: 'wyoming',
    limit: '$6,000',
    limitAmount: 6000,
    courtWebsite: 'https://www.courts.state.wy.us/CircuitCourt/',
    courtWebsiteLabel: 'Wyoming Courts – Circuit Court',
    filingFee: '$10',
    statuteOfLimitations: '4–10 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Wyoming Circuit Court Small Claims handles disputes up to $6,000 (W.S. § 1-21-201). Common cases include unpaid debts, security deposits, and property damage.' },
      { num: 2, title: 'Find your local Circuit Court', desc: 'File in the Circuit Court for the county where the defendant lives or where the cause of action arose. Wyoming has Circuit Courts in each of its 23 counties.' },
      { num: 3, title: 'Complete the complaint', desc: 'Fill out the small claims complaint form available from your local Circuit Court clerk or the Wyoming Courts website (courts.state.wy.us).' },
      { num: 4, title: 'File and pay the fee', desc: 'Wyoming charges only $10 to file a small claims case — the lowest filing fee in the United States.' },
      { num: 5, title: 'Service of process', desc: 'The court arranges service on the defendant, who has a specified time to respond.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather all documentation. Wyoming written contract SOL is 10 years (W.S. § 1-3-105); personal injury SOL is 4 years (W.S. § 1-3-106).' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case to the judge. Either party may appeal to District Court.' },
    ],
    tips: [
      'Wyoming has the lowest small claims filing fee in the U.S. — only $10.',
      'Written contracts have a 10-year statute of limitations in Wyoming.',
      'Wyoming\'s $6,000 limit handles most common consumer disputes.',
    ],
  },
  idaho: {
    name: 'Idaho',
    slug: 'idaho',
    limit: '$5,000',
    limitAmount: 5000,
    courtWebsite: 'https://isc.idaho.gov/pages/small-claims',
    courtWebsiteLabel: 'Idaho Courts – Small Claims',
    filingFee: '$55–$110',
    statuteOfLimitations: '2–5 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Idaho Small Claims Court handles disputes up to $5,000 (Idaho Code § 1-2301). Unique rule: no counterclaims are allowed in Idaho small claims court — the only state with this restriction.' },
      { num: 2, title: 'Find your local Magistrate Division', desc: 'Small claims are filed in the Magistrate Division of District Court for the county where the defendant lives or where the cause of action arose.' },
      { num: 3, title: 'Complete the claim form', desc: 'Fill out the small claims claim form (SC-1) available from your local Magistrate Court or the Idaho Courts website (isc.idaho.gov).' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are $55–$110 depending on the amount claimed.' },
      { num: 5, title: 'Service of process', desc: 'The court arranges service on the defendant via certified mail. Personal service may be required if mail fails.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather all documentation. Idaho personal injury SOL is 2 years (Idaho Code § 5-219); written contracts are 5 years (Idaho Code § 5-216).' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case. No attorneys are permitted in Idaho small claims. Either party may appeal to District Court within 30 days.' },
    ],
    tips: [
      'Idaho prohibits both attorneys AND counterclaims in small claims court — unique nationally.',
      'For claims between $5,001 and $10,000, file in Idaho Magistrate Division instead.',
      'Idaho\'s personal injury statute of limitations is 2 years — act quickly after an injury.',
    ],
  },
  hawaii: {
    name: 'Hawaii',
    slug: 'hawaii',
    limit: '$5,000',
    limitAmount: 5000,
    courtWebsite: 'https://www.courts.state.hi.us/self-help/courts/small_claims_court',
    courtWebsiteLabel: 'Hawaii Courts – Small Claims',
    filingFee: '$55–$80',
    statuteOfLimitations: '2–6 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Hawaii Small Claims Court handles disputes up to $5,000 (HRS § 633-27). Special rule: security deposit disputes have no dollar limit in small claims. Important: there is NO right to appeal from small claims court in Hawaii — unique nationally.' },
      { num: 2, title: 'Find your local District Court', desc: 'File in the District Court for the circuit where the defendant lives or where the cause of action arose. Hawaii has four circuits: First (Honolulu/Oahu), Second (Maui), Third (Hawaii Island), and Fifth (Kauai).' },
      { num: 3, title: 'Complete the claim form', desc: 'Fill out the small claims statement of claim (Form DC-5C) available from your local District Court clerk or the Hawaii Courts website (courts.state.hi.us).' },
      { num: 4, title: 'File and pay the fee', desc: 'Filing fees are $55–$80 depending on the claim amount.' },
      { num: 5, title: 'Service of process', desc: 'The court serves the defendant by certified mail. Personal service may be required if mail service fails.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather all documentation. Hawaii personal injury SOL is 2 years (HRS § 657-7); written contracts are 6 years (HRS § 657-1).' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case. No attorneys are permitted. CRITICAL: There is NO right to appeal from a small claims judgment in Hawaii — the decision is final.' },
    ],
    tips: [
      'Hawaii small claims judgments are final — there is NO right to appeal (unique nationally). Be well-prepared before your hearing.',
      'Security deposit disputes have no dollar limit in Hawaii small claims court.',
      'Hawaii\'s personal injury statute of limitations is 2 years — act promptly after an incident.',
    ],
  },
  alaska: {
    name: 'Alaska',
    slug: 'alaska',
    limit: '$10,000',
    limitAmount: 10000,
    courtWebsite: 'https://courts.alaska.gov/selfhelp/smallclaims/',
    courtWebsiteLabel: 'Alaska Courts – Small Claims',
    filingFee: '$50–$100',
    statuteOfLimitations: '2–3 years depending on claim type',
    steps: [
      { num: 1, title: 'Determine if your case qualifies', desc: 'Alaska District Court handles small claims in two tracks: SCL (Small Claims Level) for claims ≤$2,500 with a $50 fee, and SCG (Small Claims Grade) for claims up to $10,000 with a $100 fee (AS § 22.15.040).' },
      { num: 2, title: 'Find your local District Court', desc: 'File in the District Court for the judicial district where the defendant lives or where the cause of action arose. Alaska has District Courts in Anchorage, Fairbanks, Juneau, and other locations.' },
      { num: 3, title: 'Complete the complaint form', desc: 'Fill out the small claims complaint form available from your local District Court clerk or the Alaska Courts website (courts.alaska.gov). Indicate whether you are filing under SCL or SCG.' },
      { num: 4, title: 'File and pay the fee', desc: 'SCL filing fee: $50 (claims ≤$2,500). SCG filing fee: $100 (claims $2,501–$10,000).' },
      { num: 5, title: 'Service of process', desc: 'The court arranges service on the defendant, who has 20 days to respond.' },
      { num: 6, title: 'Prepare your evidence', desc: 'Gather all documentation. Alaska personal injury SOL is 2 years (AS § 09.10.070); written contracts are 3 years (AS § 09.10.053).' },
      { num: 7, title: 'Attend your hearing', desc: 'Present your case. Attorneys are generally not allowed unless both parties agree. Either party may appeal to Superior Court.' },
    ],
    tips: [
      'Alaska uses a two-track small claims system: SCL (≤$2,500, $50 fee) and SCG (up to $10,000, $100 fee).',
      'No attorneys allowed in Alaska small claims unless both parties consent.',
      'Alaska\'s personal injury statute of limitations is 2 years — and written contracts are only 3 years — among the shorter periods nationally.',
    ],
  },
}

const stateList = Object.values(STATES)

/* ------------------------------------------------------------------ */
/*  Static params & metadata                                          */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return stateList.map((s) => ({ state: s.slug }))
}

export function generateMetadata({
  params,
}: {
  params: { state: string }
}): Metadata {
  const info = STATES[params.state]
  if (!info) return {}

  const title = `How to File a Small Claims Case in ${info.name} (${new Date().getFullYear()}) | Lawyer Free`
  const description = `Step-by-step guide to filing a small claims case in ${info.name}. Court limit: ${info.limit}. Learn the process, fees, and tips — then start your case for free with Lawyer Free.`

  return {
    title,
    description,
    openGraph: {
      title: `How to File Small Claims in ${info.name}`,
      description,
    },
  }
}

/* ------------------------------------------------------------------ */
/*  Page component                                                    */
/* ------------------------------------------------------------------ */

export default function SmallClaimsStatePage({
  params,
}: {
  params: { state: string }
}) {
  const info = STATES[params.state]
  if (!info) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-warm-text mb-4">
          How to File a Small Claims Case in {info.name}
        </h1>
        <p className="text-lg text-warm-muted max-w-2xl mx-auto">
          {info.name} small claims court lets you resolve disputes up to{' '}
          <strong className="text-warm-text">{info.limit}</strong> without hiring a lawyer.
          Here&apos;s everything you need to know.
        </p>
      </section>

      {/* Key Facts */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-warm-text mb-6 text-center">
          {info.name} Small Claims at a Glance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-calm-indigo/5 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-calm-indigo mb-2">{info.limit}</p>
            <p className="text-sm text-warm-muted">Maximum claim amount</p>
          </div>
          <div className="bg-calm-indigo/5 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-calm-indigo mb-2">{info.filingFee}</p>
            <p className="text-sm text-warm-muted">Typical filing fees</p>
          </div>
          <div className="bg-calm-indigo/5 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-calm-indigo mb-2">{info.statuteOfLimitations}</p>
            <p className="text-sm text-warm-muted">Statute of limitations</p>
          </div>
        </div>
      </section>

      {/* Step-by-step process */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-warm-text mb-6 text-center">
          Step-by-Step: Filing in {info.name}
        </h2>
        <div className="space-y-4">
          {info.steps.map((step) => (
            <div key={step.num} className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-calm-indigo text-white flex items-center justify-center text-sm font-bold">
                {step.num}
              </span>
              <div>
                <h3 className="font-semibold text-warm-text">{step.title}</h3>
                <p className="text-sm text-warm-muted mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-warm-text mb-6 text-center">
          Tips for {info.name} Small Claims Court
        </h2>
        <div className="space-y-3">
          {info.tips.map((tip, i) => (
            <div key={i} className="bg-calm-green/5 rounded-xl p-5 flex items-start gap-3">
              <span className="flex-shrink-0 text-calm-green font-bold">&#10003;</span>
              <p className="text-sm text-warm-text">{tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Court website link */}
      <section className="mb-16 text-center">
        <h2 className="text-2xl font-bold text-warm-text mb-4">
          Official Court Resources
        </h2>
        <p className="text-warm-muted mb-4">
          For the latest forms, fees, and local rules, visit the official court website:
        </p>
        <a
          href={info.courtWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-calm-indigo underline hover:text-calm-indigo/80 transition-colors font-medium"
        >
          {info.courtWebsiteLabel} &rarr;
        </a>
      </section>

      {/* CTA */}
      <section className="text-center mb-16">
        <h2 className="text-2xl font-bold text-warm-text mb-4">
          Ready to file your small claims case?
        </h2>
        <p className="text-warm-muted mb-6 max-w-xl mx-auto">
          Lawyer Free walks you through every step — from filling out your forms to preparing for
          your hearing. No legal jargon, no guesswork.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-calm-indigo text-white font-semibold px-8 py-3 rounded-lg text-lg hover:bg-calm-indigo/90 transition-colors"
        >
          Start Your Case for Free with Lawyer Free
        </Link>
      </section>

      {/* Other states */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-warm-text mb-4 text-center">
          Small Claims Guides for Other States
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {stateList
            .filter((s) => s.slug !== info.slug)
            .map((s) => (
              <Link
                key={s.slug}
                href={`/small-claims/${s.slug}`}
                className="text-sm text-calm-indigo underline hover:text-calm-indigo/80"
              >
                {s.name}
              </Link>
            ))}
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="text-xs text-warm-muted text-center max-w-2xl mx-auto">
        <p>
          Lawyer Free is not a law firm and does not provide legal advice. The information on this
          page is for educational and self-help purposes only. Court rules, fees, and limits may
          change — always verify with your local court. You should consult a licensed attorney for
          advice specific to your situation. Use of this platform does not create an attorney-client
          relationship.
        </p>
      </footer>
    </div>
  )
}
