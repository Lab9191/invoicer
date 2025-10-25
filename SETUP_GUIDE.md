# Invoicer - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Supabase Database

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the entire contents of `supabase/schema.sql`
4. Verify tables are created:
   - profiles
   - clients
   - invoices
   - invoice_items

### 4. Generate Database Types (Optional but Recommended)

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure Overview

```
invoicer/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── [locale]/             # i18n routing
│   │   │   ├── company/          # Company dashboard
│   │   │   │   ├── profile/      # Profile management
│   │   │   │   ├── clients/      # Client CRUD
│   │   │   │   └── invoices/     # Invoice management
│   │   │   └── individual/       # Individual dashboard (mirrors company)
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   └── layouts/              # Layout components
│   ├── lib/
│   │   ├── api/                  # Supabase API functions
│   │   ├── pdf-generator.ts      # PDF export
│   │   ├── supabase.ts          # Supabase client
│   │   └── database.types.ts     # Database TypeScript types
│   ├── messages/                 # i18n translations
│   │   ├── en.json
│   │   └── sk.json
│   └── i18n/
├── supabase/
│   └── schema.sql                # Database schema
├── IMPLEMENTATION.md             # Full implementation docs
└── package.json
```

## Features Implemented

### ✅ UI Components
- Button (primary, secondary, danger, ghost variants)
- Input with label, error, helper text
- Textarea
- Select dropdown
- Modal with portal
- Card (header, content, footer)
- Table (responsive)
- Spinner (loading states)
- Toast notifications (context-based)

### ✅ Layouts
- DashboardLayout with responsive sidebar
- Mobile hamburger menu
- Fixed header with navigation

### ✅ Profile Management
- **Company Profile**:
  - Basic info (name, address, contact)
  - Tax details (company ID, tax ID, VAT ID)
  - VAT payer flag
  - Registration info
  - Banking details
  - Notes

- **Individual Profile**:
  - Basic info
  - Tax details (for self-employed)
  - Banking details
  - Notes

### ✅ Client Management
- List all clients in a table
- Create new client (modal form)
- Edit existing client
- Delete client (with confirmation)
- Client details:
  - Name, email, phone
  - Address (street, city, postal code, country)
  - Tax info (company ID, tax ID, VAT ID)
  - Notes

### ✅ Invoice Management
- **List Invoices**:
  - Filterable table (status, date range)
  - Status badges (draft, sent, paid, overdue, cancelled)
  - Quick actions (view, edit, delete)

- **Create Invoice**:
  - Client selection
  - Invoice details (number, dates, payment info)
  - Dynamic items array (add/remove)
  - Auto-calculate totals
  - Language selection (EN/SK)
  - QR code toggle
  - Notes

- **Edit Invoice**:
  - Same as create with pre-filled data

- **View Invoice**:
  - Professional layout
  - Supplier and client details
  - Itemized breakdown
  - Export to PDF button

### ✅ PDF Export
- jsPDF-based generation
- Professional invoice template
- Multi-language support (EN/SK)
- QR code with payment info
- Payment info box
- Itemized table

### ✅ Internationalization
- English (EN)
- Slovak (SK)
- Switchable via URL (/en/... or /sk/...)
- All UI text translated

### ✅ API Layer
- Type-safe Supabase integration
- CRUD operations for:
  - Profiles (company/individual)
  - Clients
  - Invoices + Items
- Error handling with try-catch
- Auto-generate invoice numbers

## Navigation

### Company Dashboard
```
/en/company (or /sk/company)
├── /profile              # Company profile form
├── /clients              # Client list + CRUD
└── /invoices             # Invoice management
    ├── /                 # List all invoices
    ├── /new              # Create new invoice
    └── /{id}             # View invoice
        └── /edit         # Edit invoice
```

### Individual Dashboard
```
/en/individual (or /sk/individual)
├── /profile              # Individual profile form
├── /clients              # Client list + CRUD
└── /invoices             # Invoice management
    ├── /                 # List all invoices
    ├── /new              # Create new invoice
    └── /{id}             # View invoice
        └── /edit         # Edit invoice
```

## Authentication Status

⚠️ **Current State**: Mock authentication with hardcoded user ID

The application currently uses a mock user ID (`mock-user-id`) for all operations. This allows full functionality testing without authentication.

**To Add Real Authentication:**

1. Enable Supabase Auth in your project
2. Add auth pages (login, register, forgot password)
3. Replace mock user ID with real user from `supabase.auth.getUser()`
4. Add middleware to protect routes
5. Update all API calls to use authenticated user

Example:
```typescript
// Current (mock)
const mockUserId = 'mock-user-id';
const profile = await getProfile(mockUserId, 'company');

// With real auth
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect('/login');
const profile = await getProfile(user.id, 'company');
```

## Environment Variables Explained

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# Your Supabase project URL

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Your Supabase anonymous key (public, safe for client)
```

## Database Schema

The schema includes:

1. **profiles** - User profiles (company/individual)
2. **clients** - Client information
3. **invoices** - Invoice headers
4. **invoice_items** - Invoice line items

All tables have:
- UUID primary keys
- Created/Updated timestamps
- Row Level Security (RLS) policies
- Proper indexes

## Development Tips

### Testing Locally

1. Create a profile first (company or individual)
2. Add some clients
3. Create invoices for those clients
4. Test PDF export

### Mock Data

Since authentication is mocked, all data is associated with `mock-user-id`. To test multiple users, you would need to:
1. Modify the mock user ID in different browser sessions, or
2. Implement real authentication

### Database Reset

To reset all data:
```sql
-- In Supabase SQL Editor
DELETE FROM invoice_items;
DELETE FROM invoices;
DELETE FROM clients;
DELETE FROM profiles;
```

## Common Issues & Solutions

### Issue: "Profile not found"
**Solution**: Create a profile first at `/company/profile` or `/individual/profile`

### Issue: "No clients available when creating invoice"
**Solution**: Add clients at `/company/clients` before creating invoices

### Issue: PDF export fails
**Solution**: Ensure profile has banking details (IBAN required for QR code)

### Issue: Translations not showing
**Solution**: Check that you're accessing the correct locale URL (/en/ or /sk/)

### Issue: Supabase errors
**Solution**:
1. Check environment variables are set
2. Verify database schema is applied
3. Check RLS policies are enabled
4. Confirm user has proper permissions

## Production Checklist

Before deploying to production:

- [ ] Implement real authentication
- [ ] Replace mock user IDs
- [ ] Add proper error logging (e.g., Sentry)
- [ ] Set up environment variables in hosting platform
- [ ] Run database migrations
- [ ] Test on multiple devices/browsers
- [ ] Set up backup strategy for database
- [ ] Add rate limiting for API endpoints
- [ ] Implement proper user onboarding
- [ ] Add email notifications (optional)
- [ ] Set up monitoring and analytics
- [ ] Review and test RLS policies
- [ ] Add terms of service / privacy policy
- [ ] Test PDF generation with real data
- [ ] Optimize images and assets
- [ ] Run Lighthouse audit

## Deployment

### Recommended: Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

Vercel will automatically:
- Build the Next.js app
- Set up CDN
- Configure custom domain
- Enable automatic deployments

### Alternative: Any Node.js Host

```bash
# Build
npm run build

# Start
npm start
```

Requires Node.js 18.18+ or 20+

## Monitoring

Recommended tools:
- **Vercel Analytics** - Built-in performance monitoring
- **Supabase Dashboard** - Database queries and usage
- **Sentry** - Error tracking
- **Google Analytics** - User analytics

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Hook Form**: https://react-hook-form.com
- **Zod**: https://zod.dev

## License

Private project - All rights reserved

---

**Questions?** Check `IMPLEMENTATION.md` for detailed technical documentation.
