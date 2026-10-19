import { test, expect, Page } from '@playwright/test'
import { getPayload, Payload } from 'payload'
import config from '../../src/payload.config.js'
import { login } from '../helpers/login'

const adminAccount = {
  email: 'phase9-e2e-admin@example.com',
  password: 'E2e-undo-pass-4417!',
  name: 'Phase9 E2E Admin',
}

const targetAccount = {
  email: 'phase9-e2e-target@example.com',
  password: 'E2e-undo-pass-4417!',
  name: 'Phase9 E2E Target',
}

const serverURL = 'http://localhost:3000'

let payload: Payload

async function targetExists(): Promise<boolean> {
  const found = await payload.find({
    collection: 'users',
    where: { email: { equals: targetAccount.email } },
    limit: 1,
    overrideAccess: true,
  })
  return found.docs.length > 0
}

async function ensureTarget() {
  if (await targetExists()) return
  await payload.create({ collection: 'users', data: targetAccount, overrideAccess: true })
}

test.describe.configure({ mode: 'serial' })

test.describe('Users undoable delete', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    payload = await getPayload({ config })

    await payload.delete({
      collection: 'users',
      where: { email: { in: [adminAccount.email, targetAccount.email] } },
      overrideAccess: true,
    })
    await payload.create({ collection: 'users', data: adminAccount, overrideAccess: true })
    await ensureTarget()

    const context = await browser.newContext()
    page = await context.newPage()
    page.on('dialog', (dialog) => dialog.accept())

    await login({ page, serverURL, user: adminAccount })
  })

  test.afterAll(async () => {
    await payload.delete({
      collection: 'users',
      where: { email: { in: [adminAccount.email, targetAccount.email] } },
      overrideAccess: true,
    })
    await payload.destroy()
  })

  test('signed-in account cannot remove itself', async () => {
    await page.goto(`${serverURL}/admin/collections/users`)
    const ownRow = page.locator('.ms-user-row', { hasText: adminAccount.email })
    await expect(ownRow).toBeVisible()
    await expect(ownRow.locator('button.ms-pill.danger')).toHaveCount(0)
    await expect(ownRow.locator('.ms-user-you')).toBeVisible()
  })

  test('Undo restores the row and keeps the account', async () => {
    await ensureTarget()
    await page.goto(`${serverURL}/admin/collections/users`)
    const targetRow = page.locator('.ms-user-row', { hasText: targetAccount.email })
    await expect(targetRow).toBeVisible()

    await targetRow.getByRole('button', { name: 'Remove' }).click()
    await expect(targetRow).toHaveCount(0)
    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(targetRow).toBeVisible()

    // The cancelled timer must not delete later.
    await page.waitForTimeout(5500)
    expect(await targetExists()).toBe(true)
  })

  test('commit deletes the account after the toast window', async () => {
    await ensureTarget()
    await page.goto(`${serverURL}/admin/collections/users`)
    const targetRow = page.locator('.ms-user-row', { hasText: targetAccount.email })
    await expect(targetRow).toBeVisible()

    await targetRow.getByRole('button', { name: 'Remove' }).click()
    await expect(targetRow).toHaveCount(0)

    await expect.poll(async () => targetExists(), { timeout: 15000 }).toBe(false)
  })
})
