import { ChecklistItem } from './checklist-item'
import type { FilingChecklist as ChecklistType } from '@/lib/schemas/filing'

interface FilingChecklistProps {
  courtType: string
  role: string
  checklist: ChecklistType
  onChange: (checklist: ChecklistType) => void
}

interface ChecklistItemDef {
  key: keyof Omit<ChecklistType, 'confirmation_number'>
  label: string
  description: string
}

function getChecklistItems(courtType: string, role: string): ChecklistItemDef[] {
  if (courtType === 'federal') {
    return [
      { key: 'account_created', label: 'Create a PACER account', description: 'Go to pacer.uscourts.gov and register for an account. You will need this to access CM/ECF (the federal electronic filing system).\n\nNote: Pro se filers may need to contact the clerk\'s office directly to request electronic filing privileges.' },
      { key: 'court_selected', label: 'Register for CM/ECF', description: 'Contact the clerk\'s office of your target federal district court (e.g., Western District of Texas, Austin Division).\n\nSome courts allow pro se e-filing; others require you to file in person at the clerk\'s office.' },
      { key: 'filing_type_chosen', label: 'Prepare your civil cover sheet', description: 'Download the JS-44 Civil Cover Sheet from uscourts.gov.\n\nFill in:\n\u2022 Basis of jurisdiction (diversity, federal question)\n\u2022 Nature of suit\n\u2022 Cause of action\n\u2022 Party information' },
      { key: 'document_uploaded', label: `Upload your ${role === 'defendant' ? 'answer' : 'complaint'} and cover sheet`, description: 'Upload both documents through CM/ECF, or deliver them to the clerk\'s office if filing in person.\n\nMake sure your documents are in PDF format.' },
      { key: 'fee_paid', label: 'Pay the filing fee ($405)', description: 'The federal filing fee is $405.\n\nIf you cannot afford this, file a motion to proceed In Forma Pauperis (IFP) along with a financial affidavit showing your inability to pay.' },
      { key: 'submitted', label: 'Confirm service of process', description: 'Federal rules require service within 90 days (FRCP Rule 4).\n\nOptions:\n\u2022 U.S. Marshal service (free for IFP filers)\n\u2022 Private process server\n\u2022 Waiver of service (send Form AO 398 to defendant)' },
    ]
  }

  // Texas state courts (JP, County, District)
  const courtName = courtType === 'jp' ? 'JP Court' : courtType === 'county' ? 'County Court' : 'District Court'

  return [
    { key: 'account_created', label: 'Create an eFileTexas account', description: `Go to eFileTexas.gov and click "Register."\n\nSelect "Individual" for the account type. Fill in your name, email, and create a password.\n\n${courtType === 'jp' ? 'Note: Some JP courts still accept paper filing. Check with your local court.' : 'All Texas state civil courts require e-filing.'}` },
    { key: 'court_selected', label: `Select ${courtName}`, description: `In eFileTexas, search for your court:\n\n${courtType === 'jp' ? `"[Your County] Justice of the Peace, Precinct [X]"\n\nIf you don't know your precinct, check your county's website for a JP court locator.` : `"[Your County] ${courtName}"\n\nMake sure to select the correct court level.`}` },
    { key: 'filing_type_chosen', label: 'Choose your filing type', description: role === 'defendant' ? 'Select "Existing Case" and enter your cause number.\n\nFor the filing type, select "Answer" or "Original Answer."' : `Select "New Case" \u2192 "Civil" \u2192 ${courtType === 'jp' ? '"Small Claims"' : '"Civil Case"'}.\n\nThis creates a new case filing in the system.` },
    { key: 'document_uploaded', label: `Upload your ${role === 'defendant' ? 'answer' : 'petition'}`, description: `Upload the PDF you prepared in the previous step.\n\nDocument type: "${role === 'defendant' ? 'Answer' : 'Petition'}"\n\nMake sure the file is in PDF format and under 10MB.` },
    { key: 'fee_paid', label: `Pay the filing fee`, description: `Filing fees vary by court and claim amount.\n\nIf you cannot afford the fee, you can file a "Statement of Inability to Afford Payment of Court Costs" instead. The clerk will review it and may waive or reduce the fee.` },
    { key: 'submitted', label: 'Submit and save your confirmation', description: 'Click "Submit" to file your documents with the court.\n\nIMPORTANT: Save your confirmation number and filing receipt. You will need these for your records.\n\nThe court will send you a notification when your filing is accepted.' },
  ]
}

export function FilingChecklistComponent({ courtType, role, checklist, onChange }: FilingChecklistProps) {
  const items = getChecklistItems(courtType, role)

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ChecklistItem
          key={item.key}
          id={item.key}
          label={item.label}
          description={item.description}
          checked={checklist[item.key]}
          onCheckedChange={(checked) => onChange({ ...checklist, [item.key]: checked })}
        />
      ))}
    </div>
  )
}
