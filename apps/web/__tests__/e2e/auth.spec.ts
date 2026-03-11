import { test, expect } from '@playwright/test'

test.describe('Authentication flows', () => {
  test('unauthenticated user visiting /dashboard is redirected to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user visiting /dashboard/admin is redirected to /login', async ({
    page,
  }) => {
    await page.goto('/dashboard/admin')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page renders email/password form and Google button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
  })

  test('signup page renders form with role selector', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel(/i am a/i)).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByLabel(/confirm password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })

  test('login with invalid credentials shows error message', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('nonexistent@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    // Expect redirect back to /login with error param
    await expect(page).toHaveURL(/\/login\?error=/)
    await expect(page.locator('text=/invalid|credentials|password/i').first()).toBeVisible()
  })

  test('signup shows check-email message after successful registration', async ({ page }) => {
    // Use a unique email each run
    const email = `test-${Date.now()}@example.com`
    await page.goto('/signup')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel(/i am a/i).selectOption('student')
    await page.getByLabel('Password').fill('password123')
    await page.getByLabel(/confirm password/i).fill('password123')
    await page.getByRole('button', { name: /create account/i }).click()
    // Should redirect to /login?message=check-email
    await expect(page).toHaveURL(/message=check-email/)
    await expect(page.getByText(/check your email/i)).toBeVisible()
  })

  test('authenticated user visiting /login is redirected to /dashboard', async ({ page }) => {
    // This test requires a real session — run against a seeded test environment
    test.skip(
      !process.env.TEST_USER_EMAIL,
      'Skipped: set TEST_USER_EMAIL + TEST_USER_PASSWORD env vars'
    )

    await page.goto('/login')
    await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!)
    await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/dashboard\//)
  })
})

test.describe('Role-based routing', () => {
  test('student cannot access /dashboard/admin — redirected to /dashboard/student', async ({
    page,
  }) => {
    test.skip(
      !process.env.TEST_STUDENT_EMAIL,
      'Skipped: set TEST_STUDENT_EMAIL + TEST_STUDENT_PASSWORD env vars'
    )

    // Sign in as student
    await page.goto('/login')
    await page.getByLabel('Email').fill(process.env.TEST_STUDENT_EMAIL!)
    await page.getByLabel('Password').fill(process.env.TEST_STUDENT_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/dashboard/student')

    // Try to navigate to admin
    await page.goto('/dashboard/admin')
    await expect(page).toHaveURL('/dashboard/student')
  })

  test('admin user signs in and lands on /dashboard/admin', async ({ page }) => {
    test.skip(
      !process.env.TEST_ADMIN_EMAIL,
      'Skipped: set TEST_ADMIN_EMAIL + TEST_ADMIN_PASSWORD env vars'
    )

    await page.goto('/login')
    await page.getByLabel('Email').fill(process.env.TEST_ADMIN_EMAIL!)
    await page.getByLabel('Password').fill(process.env.TEST_ADMIN_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/dashboard/admin')
    await expect(page.getByText(/admin portal/i)).toBeVisible()
  })
})
