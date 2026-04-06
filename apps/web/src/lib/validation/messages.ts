export interface ValidationMessage {
  title: string
  description: string
  suggestion?: string
}

export const VALIDATION_MESSAGES: Record<string, ValidationMessage> = {
  required: {
    title: 'We need this to continue.',
    description: 'This information helps us complete your filing.',
    suggestion: 'Take your time — you can always update it later.',
  },
  email: {
    title: "That doesn't look like an email address.",
    description: 'An email address usually looks like: name@example.com',
    suggestion: 'Double-check for typos and make sure to include the @ symbol.',
  },
  phone: {
    title: 'Please enter a phone number.',
    description: 'A phone number should have 10 digits.',
    suggestion: 'Example: (555) 123-4567 or 555-123-4567',
  },
  zip: {
    title: 'That ZIP code doesn\'t look right.',
    description: 'A US ZIP code is usually 5 digits.',
    suggestion: 'Try entering just the 5-digit ZIP code.',
  },
  date: {
    title: 'That date doesn\'t look right.',
    description: 'Dates are usually written as MM/DD/YYYY.',
    suggestion: 'Example: 01/15/2026 or January 15, 2026',
  },
  date_future: {
    title: 'This date is in the past.',
    description: 'This date needs to be in the future.',
    suggestion: 'Check the year and month — make sure it\'s upcoming.',
  },
  date_past: {
    title: 'This date is in the future.',
    description: 'This date needs to be in the past.',
    suggestion: 'Make sure you\'re entering when the incident happened.',
  },
  amount: {
    title: 'That doesn\'t look like a dollar amount.',
    description: 'Enter the amount as a number without the dollar sign.',
    suggestion: 'Example: 5000 or 150.25',
  },
  name: {
    title: 'Please enter a name.',
    description: 'A legal name usually includes a first and last name.',
    suggestion: 'Include any middle names or suffixes if applicable.',
  },
  address: {
    title: 'This address seems incomplete.',
    description: 'An address usually includes a street, city, state, and ZIP.',
    suggestion: 'Include what you know — even a partial address helps.',
  },
  ssn: {
    title: 'That doesn\'t look like a Social Security Number.',
    description: 'An SSN has 9 digits in the format XXX-XX-XXXX.',
    suggestion: 'We only need the last 4 digits for most filings.',
  },
  case_number: {
    title: 'That case number doesn\'t look right.',
    description: 'Case numbers are usually assigned by the court.',
    suggestion: 'Check your court documents for the correct format.',
  },
  min_length: {
    title: 'Please add more detail.',
    description: 'For the strongest filing, include more information.',
    suggestion: 'Add a few more sentences to help explain your situation.',
  },
  max_length: {
    title: 'That\'s a lot of detail!',
    description: 'Courts appreciate concise filings.',
    suggestion: 'Try to keep it focused on the key facts.',
  },
  invalid_choice: {
    title: 'Please select an option.',
    description: 'We need you to choose one of the available options.',
    suggestion: 'Click on one of the choices above.',
  },
  duplicate: {
    title: 'This appears to be a duplicate.',
    description: 'You\'ve already added someone with this information.',
    suggestion: 'Check the list above and remove the duplicate if needed.',
  },
}

export function getValidationMessage(key: string, overrides?: Partial<ValidationMessage>): ValidationMessage {
  const message = VALIDATION_MESSAGES[key] ?? VALIDATION_MESSAGES.required
  return { ...message, ...overrides }
}

export function getFieldValidationMessage(
  fieldName: string,
  fieldType: 'text' | 'date' | 'amount' | 'email' | 'address' | 'name' = 'text'
): ValidationMessage {
  const fieldMessages: Record<string, ValidationMessage> = {
    defendant_name: {
      title: 'We need the defendant\'s name.',
      description: 'The court needs to know who is being sued.',
      suggestion: 'If you don\'t know their full name, use what you know.',
    },
    defendant_address: {
      title: 'We need the defendant\'s address.',
      description: 'The court needs this to formally notify the defendant.',
      suggestion: 'If you don\'t know the exact address, provide what you know.',
    },
    incident_date: {
      title: 'When did this happen?',
      description: 'An approximate date works fine.',
      suggestion: 'Use "on or about" if you\'re not certain of the exact date.',
    },
    incident_location: {
      title: 'Where did this happen?',
      description: 'The court needs to know the location of the incident.',
      suggestion: 'Enter the city and state at minimum.',
    },
    damages_amount: {
      title: 'How much are you asking for?',
      description: 'Enter the total amount you\'re requesting.',
      suggestion: 'For uncertainty, you can write "to be determined at trial."',
    },
    statement_of_facts: {
      title: 'Tell us what happened.',
      description: 'Think of this as telling your story.',
      suggestion: 'Include: what happened, when, where, and why the defendant is responsible.',
    },
    your_name: {
      title: 'What\'s your name?',
      description: 'The court needs your legal name.',
      suggestion: 'Enter your full legal name as it appears on your ID.',
    },
    your_address: {
      title: 'What\'s your address?',
      description: 'The court needs your contact information.',
      suggestion: 'This is where the court will send official notices.',
    },
    court_county: {
      title: 'Which county is your court in?',
      description: 'The county determines which courthouse handles your case.',
      suggestion: 'This is usually where the incident happened or where the defendant lives.',
    },
  }

  const fieldMessage = fieldMessages[fieldName]
  if (fieldMessage) return fieldMessage

  const typeDefaults: Record<string, ValidationMessage> = {
    text: {
      title: `Please enter the ${fieldName}.`,
      description: 'This information is needed to continue.',
      suggestion: 'Take your time and double-check for typos.',
    },
    date: {
      title: 'Please enter a valid date.',
      description: 'Dates are usually written as MM/DD/YYYY.',
      suggestion: 'Example: 01/15/2026',
    },
    amount: {
      title: 'Please enter a dollar amount.',
      description: 'Enter the number without the dollar sign.',
      suggestion: 'Example: 5000',
    },
    email: {
      title: 'Please enter a valid email.',
      description: 'An email address usually looks like: name@example.com',
      suggestion: 'Double-check for typos.',
    },
    address: {
      title: 'Please enter an address.',
      description: 'Include the street, city, state, and ZIP if possible.',
      suggestion: 'Include what you know — even a partial address helps.',
    },
    name: {
      title: 'Please enter a name.',
      description: 'Enter the full legal name.',
      suggestion: 'Include first and last name at minimum.',
    },
  }

  return typeDefaults[fieldType] ?? VALIDATION_MESSAGES.required
}
