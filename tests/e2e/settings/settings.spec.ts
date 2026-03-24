import { test, expect } from '../fixtures/test-fixtures'

test.describe('Settings Page', () => {
  test('settings page loads with profile section', async ({ page }) => {
    await page.goto('/settings')

    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Profile').first()).toBeVisible()
    await expect(page.getByLabel('Display Name')).toBeVisible()
  })

  test('update display name', async ({ page }) => {
    await page.goto('/settings')

    const displayNameInput = page.getByLabel('Display Name')
    await expect(displayNameInput).toBeVisible({ timeout: 10000 })
    await displayNameInput.fill('E2E Test User')

    await page.getByRole('button', { name: 'Save Profile' }).click()

    await expect(page.getByText(/Profile updated/i)).toBeVisible({ timeout: 5000 })
  })

  test('notification preferences are toggleable', async ({ page }) => {
    await page.goto('/settings')

    await expect(page.getByText('Notification Preferences').first()).toBeVisible({
      timeout: 10000,
    })

    // Use exact match for "Deadline reminders" label text
    const deadlineLabel = page.getByText('Deadline reminders', { exact: true })
    await expect(deadlineLabel).toBeVisible()

    // The checkbox is a sibling of the label inside the same <label> element
    const checkboxContainer = deadlineLabel.locator('..')
    const checkbox = checkboxContainer.locator('input[type="checkbox"]')
    await expect(checkbox).toBeVisible()

    await checkbox.click()
    await expect(page.getByText(/preferences updated/i)).toBeVisible({ timeout: 5000 })

    // Toggle back
    await checkbox.click()
  })

  test('email is shown as read-only', async ({ page }) => {
    await page.goto('/settings')

    const emailInput = page.locator('#email')
    await expect(emailInput).toBeVisible({ timeout: 10000 })
    await expect(emailInput).toBeDisabled()
  })

  test('change password section is visible', async ({ page }) => {
    await page.goto('/settings')

    await expect(page.getByText('Change Password').first()).toBeVisible({ timeout: 10000 })
    // Use exact label match to avoid matching both password fields
    await expect(page.getByLabel('New Password', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Confirm New Password')).toBeVisible()
  })

  test('danger zone shows delete account', async ({ page }) => {
    await page.goto('/settings')

    await expect(page.getByText('Danger Zone')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: 'Delete Account' })).toBeVisible()
  })
})
