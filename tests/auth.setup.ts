import { test as setup } from '@playwright/test';
import 'dotenv/config';

const authFile = 'playwright/.auth/user.json';

setup('Authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Логин клиента').type(process.env.LOGIN as string);
  await page.getByPlaceholder('Пароль клиента').type(process.env.PASSWORD as string);
  await page.getByRole('button', { name: 'Вход' }).click();
  await page.waitForURL('/');
  await page.context().storageState({ path: authFile });
});
