import { test, expect } from '@playwright/test'

test.describe('SEO Landing Pages', () => {
  test.describe('Debt Collection', () => {
    test('renders content and CTA', async ({ page }) => {
      await page.goto('/learn-more/debt-collection')
      await expect(page.getByText(/being sued for debt/i)).toBeVisible()
      await expect(page.getByText(/FDCPA/i)).toBeVisible()
      // CTA should link to signup with correct params
      const cta = page.getByRole('link', { name: /start.*free.*debt/i }).first()
      await expect(cta).toBeVisible()
      await expect(cta).toHaveAttribute('href', /type=debt_collection/)
    })

    test('has legal disclaimer', async ({ page }) => {
      await page.goto('/learn-more/debt-collection')
      await expect(page.getByText(/does not provide legal advice/i)).toBeVisible()
    })
  })

  test.describe('Eviction', () => {
    test('renders content and CTA', async ({ page }) => {
      await page.goto('/learn-more/eviction')
      await expect(page.getByText(/facing eviction/i)).toBeVisible()
      await expect(page.getByText(/92\.052|property code/i)).toBeVisible()
      const cta = page.getByRole('link', { name: /start.*free.*eviction/i }).first()
      await expect(cta).toBeVisible()
      await expect(cta).toHaveAttribute('href', /type=landlord_tenant/)
    })
  })

  test.describe('Personal Injury', () => {
    test('renders content and CTA', async ({ page }) => {
      await page.goto('/learn-more/personal-injury')
      await expect(page.getByText(/injured in texas/i)).toBeVisible()
      const cta = page.getByRole('link', { name: /start.*free.*injury/i }).first()
      await expect(cta).toBeVisible()
      await expect(cta).toHaveAttribute('href', /type=personal_injury/)
    })
  })

  test('all pages have correct meta titles', async ({ page }) => {
    await page.goto('/learn-more/debt-collection')
    await expect(page).toHaveTitle(/debt.*texas/i)

    await page.goto('/learn-more/eviction')
    await expect(page).toHaveTitle(/eviction.*texas/i)

    await page.goto('/learn-more/personal-injury')
    await expect(page).toHaveTitle(/injured.*texas/i)
  })
})
