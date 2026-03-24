export interface ObjectionCard {
  title: string
  description: string
  whenToUse: string
  exampleLanguage: string
}

export const OBJECTION_CARDS: ObjectionCard[] = [
  {
    title: 'Hearsay',
    description: 'When someone testifies about what another person said, offered to prove the truth of what was said.',
    whenToUse: 'The witness is repeating what someone else told them as if it were fact.',
    exampleLanguage: '"Objection, Your Honor. That is hearsay — the witness is testifying about what someone else said."',
  },
  {
    title: 'Relevance',
    description: 'Evidence or testimony that has nothing to do with the issues in the case.',
    whenToUse: 'The other side is talking about something that doesn\'t relate to your dispute.',
    exampleLanguage: '"Objection, Your Honor. This is not relevant to the issues before the court."',
  },
  {
    title: 'Leading Question',
    description: 'A question that suggests the answer, typically on direct examination.',
    whenToUse: 'The other side is asking their own witness questions that suggest the answer.',
    exampleLanguage: '"Objection, Your Honor. Counsel is leading the witness."',
  },
  {
    title: 'Speculation',
    description: 'When a witness is asked to guess or speculate about something they don\'t know.',
    whenToUse: 'The witness is guessing rather than testifying from personal knowledge.',
    exampleLanguage: '"Objection, Your Honor. The witness is speculating — they have no personal knowledge of this."',
  },
  {
    title: 'Asked and Answered',
    description: 'The same question has already been asked and answered.',
    whenToUse: 'The other side keeps asking the same question to badger the witness.',
    exampleLanguage: '"Objection, Your Honor. That question has already been asked and answered."',
  },
  {
    title: 'Assumes Facts Not in Evidence',
    description: 'A question that assumes something is true when it hasn\'t been proven.',
    whenToUse: 'The question contains an assumption that hasn\'t been established.',
    exampleLanguage: '"Objection, Your Honor. The question assumes facts not in evidence."',
  },
  {
    title: 'Best Evidence Rule',
    description: 'When someone testifies about the contents of a document without producing the document.',
    whenToUse: 'Someone is describing what a document says instead of showing it.',
    exampleLanguage: '"Objection, Your Honor. The best evidence rule requires the original document be produced."',
  },
  {
    title: 'Lack of Foundation',
    description: 'The witness hasn\'t established they have the knowledge to testify about something.',
    whenToUse: 'The witness hasn\'t shown they were there or have personal knowledge.',
    exampleLanguage: '"Objection, Your Honor. No foundation has been laid for this testimony."',
  },
]
