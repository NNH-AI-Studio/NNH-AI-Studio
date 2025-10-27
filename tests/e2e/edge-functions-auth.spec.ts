import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.PLAYWRIGHT_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.PLAYWRIGHT_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function getJwtOrSkip(): Promise<string> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    test.skip(true, 'Supabase env not configured: SUPABASE_URL/ANON_KEY');
    return '';
  }
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  if (!email || !password) {
    test.skip(true, 'Missing TEST_USER_EMAIL/TEST_USER_PASSWORD');
    return '';
  }
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) {
    test.skip(true, `Unable to sign in test user: ${error?.message || 'no session'}`);
    return '';
  }
  return data.session.access_token;
}

const f = (name: string) => `${SUPABASE_URL}/functions/v1/${name}`;

test.describe('Edge Functions Auth Matrix', () => {
  test('create-auth-url: no Authorization → 401; OPTIONS → 200', async ({ request }) => {
    test.skip(!SUPABASE_URL, 'No SUPABASE_URL');

    const resNoAuth = await request.post(f('create-auth-url'));
    expect(resNoAuth.status()).toBe(401);

    const resOptions = await request.fetch(f('create-auth-url'), { method: 'OPTIONS' });
    expect(resOptions.status()).toBe(200);
  });

  test('create-auth-url: invalid and valid Authorization', async ({ request }) => {
    test.skip(!SUPABASE_URL, 'No SUPABASE_URL');

    const resInvalid = await request.post(f('create-auth-url'), {
      headers: { Authorization: 'Bearer invalid' },
    });
    expect([400, 401]).toContain(resInvalid.status());

    const jwt = await getJwtOrSkip();
    const resValid = await request.post(f('create-auth-url'), {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    expect(resValid.status()).toBe(200);

    const json = await resValid.json();
    expect(json.authUrl || json.url).toBeTruthy();
  });

  test('gmb-sync: no Authorization → 401; valid with missing body → 400', async ({ request }) => {
    test.skip(!SUPABASE_URL, 'No SUPABASE_URL');

    const resNoAuth = await request.post(f('gmb-sync'));
    expect(resNoAuth.status()).toBe(401);

    const jwt = await getJwtOrSkip();
    const resMissing = await request.post(f('gmb-sync'), {
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      data: {},
    });
    expect(resMissing.status()).toBe(400);
  });
});
