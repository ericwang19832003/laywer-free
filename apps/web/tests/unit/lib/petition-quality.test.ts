import { describe, expect, it } from 'vitest'
import { scorePetitionDraft } from '@/lib/petition-quality'

describe('scorePetitionDraft', () => {
  it('scores a filing-style petition with complete sections as strong', () => {
    const draft = `
DRAFT -- NOT FOR FILING
CAUSE NO. 2026-1001
IN THE COUNTY COURT AT LAW OF TRAVIS COUNTY, TEXAS

JANE DOE, Plaintiff,
v.
JOHN SMITH, Defendant.

PLAINTIFF'S ORIGINAL PETITION

1. DISCOVERY CONTROL PLAN
Plaintiff intends that discovery be conducted under Texas Rule of Civil Procedure 190.

2. PARTIES
Plaintiff Jane Doe resides in Travis County, Texas. Defendant John Smith may be served at 456 Oak Ave.

3. JURISDICTION AND VENUE
This Court has jurisdiction and venue is proper in Travis County, Texas.

4. FACTS
On June 15, 2025, Defendant rear-ended Plaintiff while Plaintiff was stopped at a red light.

5. CAUSES OF ACTION
5.1 NEGLIGENCE. Defendant owed Plaintiff a duty of ordinary care, breached that duty, and proximately caused damages.

6. DAMAGES
Plaintiff seeks repair costs, loss of use, court costs, and interest.

7. PRAYER FOR RELIEF
WHEREFORE, PREMISES CONSIDERED, Plaintiff asks the Court for judgment against Defendant.

Respectfully submitted,
Jane Doe (Pro Se)

CERTIFICATE OF SERVICE
Plaintiff will serve Defendant as required by law.
`

    const result = scorePetitionDraft(draft)
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.improvements).not.toContain('Add a court caption with the court, parties, and cause number.')
  })

  it('flags weak drafts that miss core pleading sections and placeholders', () => {
    const draft = `
This is my complaint.
Defendant damaged my car and should pay me.
TODO add court info.
`

    const result = scorePetitionDraft(draft)
    expect(result.score).toBeLessThan(70)
    expect(result.improvements).toContain('Add a court caption with the court, parties, and cause number.')
    expect(result.improvements).toContain('Add jurisdiction and venue facts showing why this court can hear the case.')
    expect(result.improvements).toContain('Remove placeholders before filing.')
  })

  it('does not treat every bracketed phrase as a placeholder', () => {
    const draft = `
CAUSE NO. 2026-1001
IN THE COUNTY COURT AT LAW OF TRAVIS COUNTY, TEXAS

JANE DOE, Plaintiff,
v.
JOHN SMITH, Defendant.

PLAINTIFF'S ORIGINAL PETITION

PARTIES
Plaintiff resides in Travis County. Defendant may be served at 456 Oak Ave.

JURISDICTION AND VENUE
This Court has jurisdiction and venue is proper in Travis County, Texas.

FACTS
On June 15, 2025, Defendant damaged Plaintiff's vehicle. Plaintiff's estimate includes
parts listed in [Exhibit A] and repair notes from [Shop Invoice 14].

CAUSES OF ACTION
Defendant's negligence proximately caused Plaintiff's damages.

DAMAGES AND PRAYER FOR RELIEF
Plaintiff seeks repair costs and court costs. WHEREFORE, Plaintiff asks for judgment.

Respectfully submitted,
Jane Doe, Pro Se
`

    const result = scorePetitionDraft(draft)
    expect(result.improvements).not.toContain('Remove placeholders before filing.')
  })
})
