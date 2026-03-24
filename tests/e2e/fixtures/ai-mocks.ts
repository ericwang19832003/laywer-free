import type { Page } from '@playwright/test'

/**
 * Intercept all AI-powered API routes with canned responses to avoid
 * cost and flakiness during E2E tests.
 */
export async function mockAIRoutes(page: Page) {
  // Strategy recommendations
  await page.route('**/api/cases/*/strategy', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ recommendations: [] }),
    })
  )

  // Case insights
  await page.route('**/api/cases/*/insights', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    }
    return route.continue()
  })

  // Task description AI
  await page.route('**/api/cases/*/task-description', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        description: 'Test task description',
        importance: 'helpful',
      }),
    })
  )

  // Generate filing
  await page.route('**/api/cases/*/generate-filing', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ content: 'Test filing content' }),
    })
  )

  // Confidence score
  await page.route('**/api/cases/*/confidence', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ score: 50, breakdown: {} }),
    })
  )

  // Risk explain & tips
  await page.route('**/api/cases/*/risk/explain', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ explanation: 'Test risk explanation' }),
    })
  )

  await page.route('**/api/cases/*/risk/tips', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ tips: [] }),
    })
  )

  // Answer/analyze (opponent filing analysis)
  await page.route('**/api/cases/*/answer/analyze', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ analysis: 'Test analysis' }),
    })
  )

  await page.route('**/api/cases/*/answer/extract', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ extracted: {} }),
    })
  )

  // Courtroom script
  await page.route('**/api/cases/*/courtroom-script', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ script: 'Test courtroom script' }),
    })
  )

  // Research ask
  await page.route('**/api/cases/*/research/ask', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ answer: 'Test research answer', citations: [] }),
    })
  )

  // Timeline summary
  await page.route('**/api/cases/*/timeline/summary', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ summary: 'Test summary', key_milestones: [] }),
    })
  )

  // Preservation letter
  await page.route('**/api/ai/preservation-letter', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ letter: 'Test preservation letter' }),
    })
  )

  // Case file suggestions
  await page.route('**/api/cases/*/case-file/suggestions', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ suggestions: [] }),
    })
  )

  // Email draft reply
  await page.route('**/api/cases/*/emails/*/draft-reply', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ draft: 'Test draft reply' }),
    })
  )

  // Objection classify
  await page.route('**/api/objections/reviews/*/classify', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ classification: 'valid' }),
    })
  )

  // Cron routes (should never fire in tests, but just in case)
  await page.route('**/api/cron/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  )

  // Gmail status (avoid real MCP check)
  await page.route('**/api/gmail/status', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ connected: false, email: null, configured: false }),
    })
  )
}
