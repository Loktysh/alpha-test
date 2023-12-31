import { type Page, type Locator, expect } from '@playwright/test';
import { error } from 'console';

export class StorePage {
  private readonly cartIcon: Locator;
  readonly cartPopup: Locator;
  readonly cartCount: Locator;
  private readonly cartClearBtn: Locator;
  private readonly cartPageBtn: Locator;
  private readonly productCards: Locator;
  private readonly discountedProductCards: Locator;
  public cardsContainer: Locator;
  public cartProductTitle: Locator;
  public cartProductPrice: Locator;
  public cartProductCount: Locator;
  public cartAmountPrice: Locator;
  public nextPageBtn: Locator;
  public cartTextedBtn: Locator;
  public allProductBuyBtns: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.cardsContainer = this.page.locator('//*[@class="note-list row"]');
    this.cartPopup = this.page.locator('#basketContainer .dropdown-menu');
    this.cartTextedBtn = this.page.getByText('Корзина', { exact: true });
    this.cartIcon = this.page.locator('#dropdownBasket');
    this.cartCount = this.page.locator('//span[contains(@class, "basket-count-items")]');
    this.cartClearBtn = this.page.locator(
      '//*[@role="button"][contains(text(),"Очистить корзину")]'
    );
    this.cartPageBtn = this.page.locator(
      '//*[@role="button"][contains(text(),"Перейти в корзину")]'
    );
    this.allProductBuyBtns = this.page.locator(
      '(//*[contains(@class,"note-item")]//button)[position() > 1]'
    );
    this.productCards = this.page.locator('//*[@class="note-item card h-100"]');
    this.discountedProductCards = this.page.locator(
      '//*[@class="note-item card h-100 hasDiscount"]'
    );
    this.nextPageBtn = this.page.locator('//*[@class="page-item active"]/following::li');
    this.cartProductTitle = this.page.locator('.basket-item-title');
    this.cartProductPrice = this.page.locator('.basket-item-price');
    this.cartProductCount = this.page.locator('.basket-item-count');
    this.cartAmountPrice = this.page.locator('.basket_price');
  }

  async navigate() {
    await this.page.goto('/');
    await this.cardsContainer.waitFor({ state: 'visible' });
  }

  async openCartPopup() {
    await this.cartIcon.click();
    await this.cartPopup.waitFor({ state: 'visible', timeout: 3000 });
  }

  async openCartPage() {
    await this.cartPageBtn.click();
  }

  async clearCart() {
    if ((await this.cartCount.textContent()) == '0') return;
    await this.cartTextedBtn.click();
    if (this.page.url().endsWith('basket')) { //Temporary solution for failed dropdown opening pass
      await this.page.goto('/');
      await this.page.evaluate(() => {
        const popup = document.querySelector('[aria-labelledby="dropdownBasket"]');
        popup && popup.classList.add('show');
      });
    }
    await this.cartClearBtn.click();
    await this.cartPopup.isHidden();
    await this.page.waitForTimeout(3000);
    await expect(await this.cartCount.innerText()).toEqual('0');
  }

  async checkCartFunctionality() {
    await this.openCartPopup();
    await expect(this.cartPopup).toBeVisible({ timeout: 2000 });
    await this.checkCartHaveInfo();
    await this.openCartPage();
    await expect(this.page).toHaveURL('/basket');
  }

  async checkCartHaveInfo() {
    await expect(this.cartProductTitle.first()).not.toBeEmpty();
    await expect(this.cartProductPrice.first()).not.toBeEmpty();
    await expect(this.cartProductCount.first()).toContainText(/^\d+$/);
    await expect(this.cartAmountPrice).toContainText(/^\d+$/);
  }

  async addProducts(count: number = 1, isDiscounted: boolean = false) {
    const productCards = isDiscounted ? this.discountedProductCards : this.productCards;
    for (const productCard of await productCards.all()) {
      const stocksCount = Number(
        await productCard.locator('//span[contains(@class, "product_count")]').textContent()
      );
      if (stocksCount && stocksCount >= count) {
        await productCard.locator('//*[@name="product-enter-count"]').fill(count + '');
        await productCard.getByRole('button', { name: 'Купить' }).first().click();
        return;
      }
    }
  }
  // addUniqueProducts must be reworked later for checking
  // existing product ids in cart and correct handle of next page
  async addUniqueProducts(count: number = 1) {
    let counter = count;
    while (counter > 0) {
      const buyBtns = await this.allProductBuyBtns.all();
      for (const btn of buyBtns) {
        if (counter === 0) {
          break;
        }
        await btn.click();
        counter--;
        if (counter === 1) {
          await this.gotoNextPage();
          break;
        }
      }
      if (counter === 0) {
        break;
      }
      await this.gotoNextPage();
    }
  }

  async gotoNextPage() {
    await this.nextPageBtn.click();
  }
}
