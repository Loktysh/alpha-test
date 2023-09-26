import { test, expect } from '@playwright/test';
import { StorePage } from '../pages/StorePage';

test.describe('UI tests', () => {
  test.beforeEach(async ({ page }) => {
    const storePage = new StorePage(page);
    await storePage.goto();
    await storePage.clearCart();
    await storePage.cardsContainer.waitFor({ state: 'visible' });
  });
  
  test('Go to empty cart', async ({ page }) => {
    const storePage = new StorePage(page);
    await storePage.openCartPopup();
    await expect(storePage.cartPopup).toBeVisible();
    await storePage.openCartPage();
    await expect(page).toHaveURL('/basket');
  });
  
  test('Go to cart with 1 non-discounted item', async ({ page }) => {
    const storePage = new StorePage(page);
    await storePage.addProducts(1);
    await expect(storePage.cartCount).toHaveText('1');
    await storePage.checkCartFunctionality();
  });
  
  test('Go to cart with 1 discounted item', async ({ page }) => {
    const storePage = new StorePage(page);
    await storePage.addProducts(1, true);
    await expect(storePage.cartCount).toHaveText('1');
    await storePage.checkCartFunctionality();
  });
  
  test('Going to a cart with 9 different products', async ({ page }) => {
    const storePage = new StorePage(page);
    await storePage.addProducts(1, true);
    let counter = 8;
    while (counter > 0) {
      const buyBtns = await storePage.allProductBuyBtns.all();
      for (const btn of buyBtns) {
        if (counter === 0) {
          break;
        }
        await btn.click();
        counter--;
        if (counter === 1) {
          await storePage.gotoNextPage();
          break;
        }
      }
      if (counter === 0) {
        break;
      }
      await storePage.gotoNextPage();
    }
    await expect(storePage.cartCount).toHaveText('9');
    await storePage.checkCartFunctionality();
  });
  
  test('Go to a cart with 9 discounted products of the same name', async ({ page }) => {
    const storePage = new StorePage(page);
    await storePage.addProducts(9, true);
    await expect(storePage.cartCount).toHaveText('9');
    await storePage.checkCartFunctionality();
  });
});
