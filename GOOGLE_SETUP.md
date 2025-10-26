# Google My Business API Setup Guide

This guide will help you set up Google OAuth and GMB API integration for your platform.

## Prerequisites

- Google Cloud Console account
- Google My Business account with at least one business location

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "GMB Manager")
4. Click "Create"

## Step 2: Enable Required APIs

1. In your project, go to "APIs & Services" → "Library"
2. Search and enable these APIs:
   - **Google My Business API**
   - **Google My Business Account Management API**
   - **Google My Business Business Information API**

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type → Click "Create"
3. Fill in the required information:
   - **App name**: Your platform name
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click "Save and Continue"

5. Add Scopes:
   - Click "Add or Remove Scopes"
   - Add these scopes:
     ```
     https://www.googleapis.com/auth/business.manage
     https://www.googleapis.com/auth/userinfo.email
     https://www.googleapis.com/auth/userinfo.profile
     ```
   - Click "Update" → "Save and Continue"

6. Test users (for development):
   - Add your Gmail address as a test user
   - Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Name: "GMB Manager Web Client"
5. Add Authorized redirect URIs:
   ```
   Development:
   http://localhost:5173/auth/google/callback

   Production:
   https://nnh.ae/auth/google/callback
   https://rrahrhekwhgpgkakqryln.supabase.co/functions/v1/google-oauth-callback
   ```
6. Click "Create"
7. **Save your Client ID and Client Secret**

## Step 5: Update Environment Variables

Add your credentials to `.env`:

```env
VITE_SUPABASE_URL=https://rrahrhekwhgpgkakqryln.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
VITE_GOOGLE_REDIRECT_URI=https://nnh.ae/auth/google/callback
```

## Step 6: Update Database

The required tables are already created via migrations. Make sure you've run:

```bash
# Tables are auto-created if using Supabase
# Otherwise run migrations manually
```

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Login to your platform

3. Go to "Accounts" page

4. Click "Connect Account"

5. You should be redirected to Google OAuth

6. Grant permissions

7. You'll be redirected back with your account connected

## Step 8: Sync Your Data

Once connected:

1. Click "Sync Now" on your account card
2. The system will:
   - Fetch all your GMB locations
   - Import reviews
   - Import insights data
   - Save everything to your database

## Troubleshooting

### "Access blocked: This app's request is invalid"

**Solution**: Make sure your redirect URI in Google Console exactly matches the one in your `.env` file.

### "insufficient_permissions" error

**Solution**:
1. Go to Google Console → OAuth consent screen
2. Make sure all required scopes are added
3. Re-authorize the app

### "invalid_grant" error

**Solution**: The refresh token expired. Disconnect and reconnect the account.

### API returns 403 Forbidden

**Solution**:
1. Make sure GMB API is enabled in Google Console
2. Check that your account has access to the business
3. Verify API quotas aren't exceeded

## API Quotas & Limits

Google My Business API has these limits:

- **Requests per day**: 100,000
- **Requests per 100 seconds**: 1,000
- **Reviews sync**: Recommended once per hour
- **Insights sync**: Recommended once per day

## Production Checklist

Before going live:

- [ ] Update redirect URI in Google Console
- [ ] Update `.env` with production redirect URI
- [ ] Set OAuth consent screen to "Published"
- [ ] Add proper error handling
- [ ] Implement rate limiting
- [ ] Set up monitoring
- [ ] Test with multiple accounts
- [ ] Verify all sync functions work
- [ ] Test auto-refresh token mechanism

## Security Best Practices

1. **Never commit `.env` to Git**
2. **Store tokens encrypted in database**
3. **Use environment variables for secrets**
4. **Implement rate limiting**
5. **Log all API errors**
6. **Monitor token usage**
7. **Set up alerts for auth failures**

## Need Help?

- [Google My Business API Documentation](https://developers.google.com/my-business)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GMB API Reference](https://developers.google.com/my-business/reference/rest)

## Common Use Cases

### Auto-Reply to Reviews
```typescript
import { GMBClient } from './lib/google/gmbClient';

const client = new GMBClient(accountId);
await client.replyToReview(reviewName, 'Thank you for your review!');
```

### Create a Post
```typescript
const post = await client.createPost(locationName, {
  languageCode: 'en',
  summary: 'Check out our new product!',
  topicType: 'STANDARD'
});
```

### Fetch Insights
```typescript
const insights = await client.getInsights(
  locationName,
  '2024-01-01',
  '2024-01-31'
);
```

## Support

For platform-specific issues, check the main README or contact support.
