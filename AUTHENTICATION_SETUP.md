# Authentication Setup Guide

This guide explains how to set up secure authentication for the Invoicer application using Supabase Auth.

## 🔒 Security Features

- ✅ Email/Password authentication with email verification
- ✅ Protected routes with middleware
- ✅ Row Level Security (RLS) on all tables
- ✅ Server-side session validation
- ✅ Secure cookie-based sessions
- ✅ Automatic user logout on session expiry
- ✅ CSRF protection via Supabase

## 📋 Setup Steps

### 1. Enable Email Authentication in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** provider
4. Configure email templates (optional but recommended):
   - Go to **Authentication** → **Email Templates**
   - Customize "Confirm signup" template
   - Set confirmation URL to: `https://your-domain.com/[locale]/auth/callback`

### 2. Configure Email Settings (Production)

For production, you should configure SMTP:

1. Go to **Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Configure your SMTP provider (e.g., SendGrid, AWS SES, Mailgun)
4. Or use Supabase's default email service (limited)

### 3. Update RLS Policies

Run the RLS migration in your Supabase SQL Editor:

```bash
# Copy the contents of supabase/migrations/002_update_rls_for_auth.sql
# Paste into Supabase SQL Editor and execute
```

Or via Supabase CLI:

```bash
supabase db push
```

### 4. Verify Environment Variables

Make sure these are set in your `.env.local` and Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Test Authentication Flow

1. **Sign Up**: Visit `/en/auth/signup`
   - Enter email and password
   - Check email for confirmation link
   - Click confirmation link

2. **Login**: Visit `/en/auth/login`
   - Enter credentials
   - Should redirect to home page

3. **Protected Routes**: Try accessing `/en/company/profile`
   - Should require login
   - Redirects to login page if not authenticated

4. **Logout**: Click user menu → Logout
   - Should clear session and redirect to login

## 🔐 Security Best Practices

### Password Requirements

- Minimum 8 characters (enforced in signup form)
- Consider adding complexity requirements in production

### Email Verification

- Email verification is REQUIRED by default
- Users cannot access the app until email is confirmed
- Confirmation links expire after 24 hours

### Session Management

- Sessions are stored in secure HTTP-only cookies
- Automatic session refresh on activity
- Sessions expire after 1 hour of inactivity (default)

### RLS Policies

All tables have Row Level Security enabled:

- **profiles**: Users can only access their own profiles
- **clients**: Users can only access clients for their profiles
- **invoices**: Users can only access invoices for their profiles
- **invoice_items**: Users can only access items for their invoices

## 🛠️ Development vs Production

### Development Mode

In development, Supabase uses their default email service:
- Emails may be slow to arrive
- Check spam folder
- For testing, use temporary email services

### Production Mode

For production, configure:
1. Custom SMTP provider for reliable email delivery
2. Custom domain for email sender
3. Rate limiting on auth endpoints
4. Consider adding 2FA for admin users

## 📱 User Flow

### New User Registration

```
1. User visits /auth/signup
2. Enters email and password
3. Supabase sends confirmation email
4. User clicks link in email
5. Redirected to /auth/callback
6. Session created, redirected to home
7. User can now access protected routes
```

### Existing User Login

```
1. User visits /auth/login
2. Enters credentials
3. Supabase validates credentials
4. Session created, redirected to home
5. Middleware validates session on each request
```

### Session Expiry

```
1. User session expires (1 hour default)
2. Next request fails authentication
3. Middleware redirects to /auth/login
4. User sees "Please log in" toast message
```

## 🚨 Troubleshooting

### Email Not Received

- Check spam folder
- Wait 5-10 minutes (free tier can be slow)
- Check Supabase logs in dashboard
- Verify email provider configuration

### Redirect Loop

- Clear browser cookies
- Check middleware configuration
- Verify Supabase URL and anon key
- Check browser console for errors

### RLS Errors

- Ensure migration was run successfully
- Check user_id is set correctly in profiles table
- Verify auth.uid() returns correct user
- Check Supabase logs for RLS policy errors

### "Please log in" Error

- Session may have expired
- Try logging out and back in
- Clear browser cache and cookies
- Check if email was verified

## 🔄 Migration from Mock Auth

The application previously used `mock-user-id` for development. This has been replaced with real authentication:

**Before:**
```typescript
const mockUserId = 'mock-user-id';
const profile = await getProfile(mockUserId, 'company');
```

**After:**
```typescript
const user = await getCurrentUser();
if (!user) {
  router.push('/auth/login');
  return;
}
const profile = await getProfile(user.id, 'company');
```

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

## 🎯 Production Checklist

Before deploying to production:

- [ ] Configure custom SMTP provider
- [ ] Update email templates with branding
- [ ] Set up custom domain for emails
- [ ] Enable rate limiting
- [ ] Configure session timeout appropriately
- [ ] Test all authentication flows
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Enable audit logging
- [ ] Review and test RLS policies
- [ ] Set up backup authentication method
- [ ] Configure password reset flow
- [ ] Test mobile responsiveness of auth pages

## 🔒 Security Notes

- Never commit `.env.local` to git
- Rotate Supabase keys if exposed
- Use different Supabase projects for dev/prod
- Regular security audits recommended
- Keep dependencies updated
- Monitor for suspicious login attempts
