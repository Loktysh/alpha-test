import { test, expect, type Page } from '@playwright/test';
import { StorePage } from '../pages/StorePage';

let storePage: StorePage;

test.describe('UI tests', () => {
  test.beforeEach(async ({ page }) => {
    storePage = new StorePage(page);
    await storePage.navigate();
    await storePage.clearCart();
    await storePage.cardsContainer.waitFor({ state: 'visible' });
  });

  test('Go to empty cart', async ({ page }) => {
    await storePage.openCartPopup();
    await expect(storePage.cartPopup).toBeVisible();
    await storePage.openCartPage();
    await expect(page).toHaveURL('/basket');
  });

  test('Go to cart with 1 non-discounted item', async ({ page }) => {
    await storePage.addProducts(1);
    await expect(storePage.cartCount).toHaveText('1');
    await storePage.checkCartFunctionality();
  });

  test('Go to cart with 1 discounted item', async ({ page }) => {
    await storePage.addProducts(1, true);
    await expect(storePage.cartCount).toHaveText('1');
    await storePage.checkCartFunctionality();
  });

  test('Going to a cart with 9 different products', async ({ page }) => {
    await storePage.addProducts(1, true);
    await storePage.addUniqueProducts(8);
    await expect(storePage.cartCount).toHaveText('9');
    await storePage.checkCartFunctionality();
  });

  test('Go to a cart with 9 discounted products of the same name', async ({ page }) => {
    await storePage.addProducts(9, true);
    await expect(storePage.cartCount).toHaveText('9');
    await storePage.checkCartFunctionality();
  });
});
