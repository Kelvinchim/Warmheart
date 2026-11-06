import { test, expect } from '@playwright/test';

test('responsive campaign images load and the JavaScript stays small', async ({ page }) => {
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const hero = page.getByAltText('Campaign', { exact: true });
  await expect.poll(() => hero.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  expect(await hero.getAttribute('loading')).toBe('eager');
  expect(await hero.evaluate(img => img.currentSrc)).toContain('group-');
  expect(await hero.evaluate(img => img.currentSrc)).not.toContain('/src/');
  const preload = page.locator('link[rel="preload"][as="image"]');
  expect(await preload.getAttribute('imagesrcset')).not.toContain('/src/');
  const scripts = await page.evaluate(() => performance.getEntriesByType('resource').filter(r => r.name.endsWith('.js')).reduce((total, r) => total + r.decodedBodySize, 0));
  expect(scripts).toBeLessThan(250000);
  expect(failures).toEqual([]);
  await page.screenshot({ path: '/tmp/warmheart-mobile.png' });
});

test('legacy cart migrates, persists, updates quantity and starts checkout', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('seeded')) {
      localStorage.setItem('warm-heart-store-v1', JSON.stringify([{ id: 1, name: 'Core Tee — Rich Brown', price: 40000, quantity: 2, size: 'L', image: 'data:image/jpeg;base64,legacy' }]));
      localStorage.setItem('seeded', 'yes');
    }
  });
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('warm-heart-store-v1'))[0].image)).toContain('/assets/');
  await page.reload();
  await page.getByRole('button', { name: 'Shop', exact: true }).click();
  await page.getByRole('button', { name: 'Add to Cart', exact: true }).first().click();
  // The bag button is the only navigation button containing the count badge.
  await page.locator('header button').filter({ has: page.locator('span') }).last().click();
  await expect(page.getByRole('heading', { name: 'Your Order' })).toBeVisible();
  await expect(page.getByText('Items (3)', { exact: true })).toBeVisible();
  await page.locator('button').filter({ has: page.locator('svg.lucide-plus') }).first().click();
  await expect(page.getByText('Items (4)', { exact: true })).toBeVisible();
  await page.locator('button').filter({ has: page.locator('svg.lucide-minus') }).first().click();
  await expect(page.getByText('Items (3)', { exact: true })).toBeVisible();
  await page.getByPlaceholder('Full name').fill('Test Customer');
  await page.getByPlaceholder('Phone number').fill('0990000000');
  let checkout;
  await page.route('**/.netlify/functions/checkout', async route => {
    checkout = route.request().postDataJSON();
    await route.fulfill({ json: { success: true, payment_url: 'http://127.0.0.1:4173/?order=success' } });
  });
  await page.getByRole('button', { name: 'Pay Now' }).click();
  await expect(page.getByRole('heading', { name: 'Order Confirmed' })).toBeVisible();
  expect(checkout.items.reduce((sum, item) => sum + item.quantity, 0)).toBe(3);
  expect(checkout.items.some(item => item.size === 'L' && item.quantity === 2)).toBe(true);
  expect(JSON.stringify(checkout)).not.toContain('base64');
  expect(checkout.customer.name).toBe('Test Customer');
  await page.goto('/?order=failed');
  await expect(page.getByRole('heading', { name: 'Payment Cancelled' })).toBeVisible();
  await page.getByRole('button', { name: 'Try Again', exact: true }).click();
  await expect(page.getByText('Items (3)', { exact: true })).toBeVisible();
});
