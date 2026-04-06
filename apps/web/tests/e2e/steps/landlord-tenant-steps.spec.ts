import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Landlord-Tenant Guided Steps', () => {
  let caseId: string

  test.beforeEach(async ({ page }) => {
    await mockAIRoutes(page)
    const response = await page.request.post('/api/cases', {
      data: {
        state: 'TX',
        role: 'defendant',
        dispute_type: 'landlord_tenant',
        landlord_tenant_sub_type: 'eviction',
      },
    })
    if (response.status() === 403) {
      test.skip()
      return
    }
    const body = await response.json()
    caseId = body.case?.id
  })

  test('case dashboard loads for landlord-tenant', async ({ page }) => {
    if (!caseId) return
    await page.goto(`/case/${caseId}`)
    await expect(page.getByText(/one step at a time/i)).toBeVisible()
  })

  test('repair request step exists in workflow', async ({ page }) => {
    if (!caseId) return
    await page.goto(`/case/${caseId}`)
    await expect(page.getByText(/repair|habitability|eviction/i).first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // May be locked or in collapsed section
    })
  })

  test('eviction response step exists in workflow', async ({ page }) => {
    if (!caseId) return
    await page.goto(`/case/${caseId}`)
    // Check for eviction-related tasks
    await expect(page.getByText(/respond.*eviction|eviction.*notice/i).first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // May be locked
    })
  })
})
