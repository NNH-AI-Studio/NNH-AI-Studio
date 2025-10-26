# OAuth Flow - Supabase Native Callback

## Overview

This project uses **Supabase's native OAuth callback** flow without any custom redirect URLs or manual code exchange. The entire OAuth process is handled by Supabase Auth.

## Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    User     │────────▶│  Supabase   │────────▶│   Google    │
│  (Browser)  │         │    Auth     │         │   OAuth     │
└─────────────┘         └─────────────┘         └─────────────┘
      ▲                        │                        │
      │                        │                        │
      │                        ▼                        │
      │                 Exchange code                   │
      │                  for tokens                     │
      │                        │                        │
      │                        ▼                        │
      │                  Set session                    │
      │                   in browser                    │
      │                        │                        │
      └────────────────────────┘                        │
           Redirect to app                              │
         (session established)                          │
                                                         │
         ◀───────────────────────────────────────────────┘
                    Return to Supabase
```

## Configuration

### Google Cloud Console

**Authorized redirect URIs:**
```
https://rrarhekwhgpgkakqrlyn.supabase.co/auth/v1/callback
```

**Authorized JavaScript origins:**
```
https://www.nnh.ae
https://rrarhekwhgpgkakqrlyn.supabase.co
```

### Supabase Dashboard

**Site URL:**
```
https://www.nnh.ae
```

**Redirect URLs:**
```
(Leave empty - not needed for this flow)
```

**Google Provider:**
- ✅ Enabled
- Client ID: `462186989347-3hb8d9mhhsfdkt6tfciffjde5p6q68c8.apps.googleusercontent.com`
- Client Secret: `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`

### Domain Setup

**301 Redirect:**
```
nnh.ae → https://www.nnh.ae
```

This ensures domain consistency with the Supabase Site URL.

## Implementation

### 1. Sign In (src/services/googleAuthService.ts)

```typescript
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  if (error) throw error;
  return data;
}
```

**Key Points:**
- ❌ No `redirectTo` parameter
- ✅ Supabase handles the entire callback
- ✅ Uses PKCE (Proof Key for Code Exchange) automatically

### 2. Callback Handling (src/pages/AuthCallback.tsx)

```typescript
const { data: { session }, error } = await supabase.auth.getSession();

if (error) throw error;
if (!session) throw new Error('No session found');

// Session is already established by Supabase
navigate('/dashboard', { replace: true });
```

**Key Points:**
- ❌ No `exchangeCodeForSession()` call
- ✅ Session already exists from Supabase callback
- ✅ Just verify and redirect

### 3. Routes (src/App.tsx)

```typescript
<Route path="/auth/callback" element={<AuthCallback />} />
<Route path="/auth/google/callback" element={<GoogleCallback />} />
```

Both routes now simply check for the session and redirect to dashboard.

## Flow Steps

### Step 1: User Initiates Sign-In
```
User clicks "Sign in with Google"
  ↓
signInWithGoogle() called
  ↓
Redirects to: https://rrarhekwhgpgkakqrlyn.supabase.co/auth/v1/authorize
```

### Step 2: Supabase → Google
```
Supabase Auth → Google OAuth
  with redirect_uri: https://rrarhekwhgpgkakqrlyn.supabase.co/auth/v1/callback
```

### Step 3: User Authorizes
```
User logs in with Google
  ↓
Google redirects to: https://rrarhekwhgpgkakqrlyn.supabase.co/auth/v1/callback?code=xxx
```

### Step 4: Supabase Handles Callback
```
Supabase receives code
  ↓
Exchanges code for tokens with Google
  ↓
Creates session in browser (cookies + localStorage)
  ↓
Redirects to Site URL: https://www.nnh.ae
```

### Step 5: App Verifies Session
```
AuthContext checks session on mount
  ↓
Session found → User authenticated ✅
  ↓
Navigate to /dashboard
```

## What We Removed

### ❌ Custom redirectTo
```typescript
// OLD (removed):
options: {
  redirectTo: 'https://www.nnh.ae/auth/callback',
}

// NEW (current):
options: {
  queryParams: {
    access_type: 'offline',
    prompt: 'select_account',
  },
}
```

### ❌ Manual Code Exchange
```typescript
// OLD (removed):
const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

// NEW (current):
const { data: { session } } = await supabase.auth.getSession();
```

### ❌ Custom Callback URLs in Google Console
```
// OLD (removed):
https://www.nnh.ae/auth/callback
http://localhost:5173/auth/callback

// NEW (current):
https://rrarhekwhgpgkakqrlyn.supabase.co/auth/v1/callback (only)
```

## Benefits

✅ **Simpler:** No manual code exchange
✅ **More Secure:** PKCE handled by Supabase
✅ **Less Error-Prone:** One callback URL to manage
✅ **Better UX:** Faster redirects
✅ **Maintainable:** Standard Supabase pattern

## Troubleshooting

### Error 400: redirect_uri_mismatch

**Problem:** Google doesn't recognize the redirect URI.

**Solution:** Ensure Google Console has:
```
https://rrarhekwhgpgkakqrlyn.supabase.co/auth/v1/callback
```

### Session Not Found After Redirect

**Problem:** `getSession()` returns null after OAuth.

**Solution:**
1. Check Supabase Site URL is `https://www.nnh.ae`
2. Ensure domain redirect `nnh.ae → www.nnh.ae` is working
3. Clear browser cookies and try again

### Provider Token Not Available

**Problem:** `session.provider_token` is null.

**Solution:**
1. Ensure `access_type: 'offline'` in queryParams
2. Use `prompt: 'select_account'` to force re-consent
3. Check Google OAuth scopes are approved

## Testing Checklist

- [ ] Google Cloud Console has correct redirect URI
- [ ] Supabase Site URL is `https://www.nnh.ae`
- [ ] Domain redirect `nnh.ae → www.nnh.ae` works
- [ ] Sign in redirects to Google
- [ ] Google redirects back to app
- [ ] Session is established automatically
- [ ] User is redirected to `/dashboard`
- [ ] Provider token is available in session

## Environment Variables

```env
VITE_SUPABASE_URL=https://rrarhekwhgpgkakqrlyn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_APP_BASE_URL=https://www.nnh.ae
VITE_GOOGLE_CLIENT_ID=462186989347-3hb8d9mhhsfdkt6tfciffjde5p6q68c8.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=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
```

## References

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [PKCE Flow Explanation](https://oauth.net/2/pkce/)
