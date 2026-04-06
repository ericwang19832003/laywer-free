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
