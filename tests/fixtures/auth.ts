import { test as base, Page } from '@playwright/test';
import { supabase } from '../../src/lib/supabase';

export type AuthFixtures = {
  authenticatedPage: Page;
  testUser: {
    email: string;
    password: string;
    name: string;
  };
};

export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use) => {
    const testUser = {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
      name: process.env.TEST_USER_NAME || 'Test User',
    };
    await use(testUser);
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard', { timeout: 10000 });

    await use(page);
  },
});

export { expect } from '@playwright/test';

export async function cleanupTestUser(email: string) {
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email);

    if (profiles && profiles.length > 0) {
      for (const profile of profiles) {
        await supabase.from('gmb_accounts').delete().eq('user_id', profile.id);
        await supabase.from('gmb_locations').delete().eq('user_id', profile.id);
        await supabase.from('posts').delete().eq('user_id', profile.id);
        await supabase.from('reviews').delete().eq('user_id', profile.id);
        await supabase.from('insights').delete().eq('user_id', profile.id);
        await supabase.from('profiles').delete().eq('id', profile.id);
      }
    }
  } catch (error) {
    console.error('Error cleaning up test user:', error);
  }
}
