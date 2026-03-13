import type { GuidedStepConfig } from '../types'

export const bizEmploymentEvidenceConfig: GuidedStepConfig = {
  title: 'Organize Your Employment Evidence',
  reassurance:
    'Employment cases depend heavily on documentation. Collecting and organizing your evidence now strengthens every step that follows.',

  questions: [
    {
      id: 'has_pay_stubs',
      type: 'yes_no',
      prompt: 'Do you have pay stubs or wage records?',
    },
    {
      id: 'has_contract',
      type: 'yes_no',
      prompt: 'Do you have an employment contract or offer letter?',
    },
    {
      id: 'has_reviews',
      type: 'yes_no',
      prompt: 'Do you have performance reviews?',
    },
    {
      id: 'has_communications',
      type: 'yes_no',
      prompt:
        'Do you have relevant emails, texts, or other written communications?',
    },
    {
      id: 'has_witnesses',
      type: 'yes_no',
      prompt: 'Do you have witnesses who can support your account?',
    },
    {
      id: 'has_handbook',
      type: 'yes_no',
      prompt: 'Do you have a copy of the employee handbook?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_pay_stubs === 'yes') {
      items.push({ status: 'done', text: 'Pay stubs or wage records collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate pay stubs or wage records.',
      })
    }

    if (answers.has_contract === 'yes') {
      items.push({
        status: 'done',
        text: 'Employment contract or offer letter collected.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate your employment contract or offer letter.',
      })
    }

    if (answers.has_reviews === 'yes') {
      items.push({ status: 'done', text: 'Performance reviews collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather any performance reviews you received.',
      })
    }

    if (answers.has_communications === 'yes') {
      items.push({
        status: 'done',
        text: 'Relevant emails and communications collected.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Save all relevant emails, texts, and written communications.',
      })
    }

    if (answers.has_witnesses === 'yes') {
      items.push({
        status: 'done',
        text: 'Witnesses identified who can support your account.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify coworkers or others who witnessed the events.',
      })
    }

    if (answers.has_handbook === 'yes') {
      items.push({ status: 'done', text: 'Employee handbook collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Obtain a copy of the employee handbook from HR or the company intranet.',
      })
    }

    return items
  },
}
