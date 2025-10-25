# Invoicer - Implementation Documentation

## Overview

A complete, production-ready invoicing application built with Next.js 15, TypeScript, and Supabase. Supports both company and individual profiles with full CRUD operations for clients and invoices, including PDF export with QR codes.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.x (strict mode)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **PDF Generation**: jsPDF + qrcode
- **i18n**: next-intl (EN/SK support)

## Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── company/           # Company profile routes
│   │   │   ├── profile/       # Company profile management
│   │   │   ├── clients/       # Client CRUD
│   │   │   └── invoices/      # Invoice management
│   │   │       ├── new/       # Create invoice
│   │   │       └── [id]/      # View/Edit invoice
│   │   └── individual/        # Individual profile routes (mirrors company)
│   └── globals.css
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── modal.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── spinner.tsx
│   │   └── toast.tsx
│   └── layouts/
│       └── DashboardLayout.tsx
├── lib/
│   ├── api/                   # Supabase API layer
│   │   ├── profiles.ts
│   │   ├── clients.ts
│   │   ├── invoices.ts
│   │   └── index.ts
│   ├── database.types.ts      # Generated Supabase types
│   ├── pdf-generator.ts       # PDF export logic
│   └── supabase.ts           # Supabase client
└── messages/                  # i18n translations
    ├── en.json
    └── sk.json
```

## Key Features

### 1. UI Components (`src/components/ui/`)

All components are production-ready with:
- TypeScript strict typing
- Tailwind CSS styling
- Responsive design
- Accessibility considerations
- Error state handling

**Components:**
- `Button`: Multiple variants (primary, secondary, danger, ghost), loading states
- `Input/Textarea`: Label, error, helper text support
- `Select`: Dropdown with validation
- `Modal`: Portal-based, keyboard navigation (ESC), backdrop click
- `Card`: Flexible layout with header/content/footer
- `Table`: Responsive table with proper semantics
- `Spinner`: Loading indicator with size variants
- `Toast`: Context-based notification system with auto-dismiss

### 2. Dashboard Layout

**Location**: `src/components/layouts/DashboardLayout.tsx`

- Responsive sidebar navigation
- Mobile-friendly hamburger menu
- Active route highlighting
- Profile type switching (company/individual)
- Fixed header with breadcrumbs

### 3. Profile Management

**Company**: `src/app/[locale]/company/profile/page.tsx`
**Individual**: `src/app/[locale]/individual/profile/page.tsx`

Features:
- Form validation with Zod schema
- All profile fields from database schema
- VAT payer checkbox (company only)
- Bank details section
- Registration info (company only)
- Auto-save with toast notifications

### 4. Client Management

**Company**: `src/app/[locale]/company/clients/`
**Individual**: `src/app/[locale]/individual/clients/`

Features:
- List view with sortable table
- Create/Edit modal with full form
- Delete with confirmation
- Search/filter capabilities
- Client details (company ID, tax ID, VAT ID)
- Empty state handling

### 5. Invoice Management

**Structure:**
- List page with filters
- Create new invoice form
- Edit existing invoice
- View invoice details
- PDF export

**Features:**
- Dynamic item array with add/remove
- Auto-calculate totals
- Client selection dropdown
- Date pickers for issue/due/delivery dates
- Payment method and reference
- Status tracking (draft, sent, paid, overdue, cancelled)
- Language selection (EN/SK)
- QR code toggle
- Notes field

### 6. PDF Export

**Location**: `src/lib/pdf-generator.ts`

- Professional invoice layout
- Supplier and client details side-by-side
- Itemized table with calculations
- QR code for payment (IBAN + amount + reference)
- Multi-language support
- Payment info box with highlighted details
- VAT/non-VAT payer handling

### 7. API Layer

**Location**: `src/lib/api/`

Type-safe Supabase integration with:
- **Profiles**: CRUD operations with profile type filtering
- **Clients**: Full CRUD with profile association
- **Invoices**: Complex CRUD with items, auto-number generation
- **Invoice Items**: Cascade operations with invoices
- Error handling and logging

### 8. Database Schema

**Supabase Tables:**
- `profiles`: User profiles (company/individual)
- `clients`: Client information
- `invoices`: Invoice headers
- `invoice_items`: Invoice line items

**Features:**
- Row Level Security (RLS) policies
- UUID primary keys
- Timestamps (created_at, updated_at)
- Foreign key constraints
- Indexes for performance
- Cascade deletions

## TypeScript Patterns Used

1. **Strict Type Safety**: All components use strict TypeScript
2. **Database Types**: Generated from Supabase schema
3. **Zod Schemas**: Runtime validation with type inference
4. **Generic Components**: Reusable with proper typing
5. **React Hook Form**: Typed form state management
6. **Conditional Types**: For variant props
7. **Type Guards**: For safe type narrowing
8. **Utility Types**: Omit, Pick, Partial for transformations

## Form Validation

Using `react-hook-form` + `zod` for:
- Client-side validation
- Type-safe form data
- Error message display
- Async validation support
- Field array management (invoice items)

## State Management

- **React useState**: Local component state
- **React Context**: Toast notifications
- **Server State**: Direct Supabase queries (no caching library needed)

## Internationalization

**Supported Languages**: English (EN), Slovak (SK)

Translation structure:
- `common`: Shared terms (save, cancel, delete, etc.)
- `profile`: Profile field labels
- `invoice`: Invoice-related terms
- `nav`: Navigation items
- `status`: Invoice statuses
- `messages`: Success/error messages

## Performance Considerations

1. **Code Splitting**: Automatic with Next.js App Router
2. **Server Components**: Where possible for reduced JS bundle
3. **Client Components**: Only for interactive features
4. **Lazy Loading**: Modal portal only when open
5. **Optimistic Updates**: Toast feedback during async operations
6. **Database Indexes**: For common queries

## Security

1. **Row Level Security**: Supabase RLS policies enforce user data isolation
2. **Input Validation**: Client-side (Zod) and server-side (Supabase)
3. **XSS Protection**: React auto-escaping
4. **CSRF**: Next.js built-in protection
5. **Type Safety**: Prevents common bugs

## Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Collapsible sidebar on mobile
- Touch-friendly buttons and inputs
- Responsive tables with horizontal scroll

## Error Handling

1. **API Errors**: Try-catch with toast notifications
2. **Form Errors**: Inline field-level errors
3. **Loading States**: Spinners and disabled buttons
4. **Empty States**: Helpful empty state messages
5. **404 Handling**: Not found pages

## Environment Setup

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Authentication Integration

**Current State**: Uses mock user ID (`mock-user-id`)

**To Integrate Real Auth:**

1. Add Supabase Auth:
```typescript
// src/lib/auth.ts
import { supabase } from './supabase';

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

2. Replace mock user ID in all pages:
```typescript
// Before
const mockUserId = 'mock-user-id';

// After
const user = await getCurrentUser();
if (!user) redirect('/login');
const userId = user.id;
```

3. Add authentication pages:
- `/login`
- `/register`
- `/forgot-password`

4. Add middleware for protected routes
5. Update RLS policies if needed

## Deployment

**Recommended Platform**: Vercel

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

**Database Migration**:
1. Run `supabase/schema.sql` in Supabase SQL editor
2. Generate types: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts`

## Future Enhancements

1. **Authentication**: Real user authentication with Supabase Auth
2. **Email**: Send invoices via email
3. **Recurring Invoices**: Template and schedule support
4. **Reports**: Analytics dashboard
5. **Multi-currency**: Support for different currencies
6. **VAT Calculations**: Automatic VAT computation
7. **Payment Tracking**: Mark invoices as paid
8. **File Uploads**: Logo upload for profiles
9. **Export Options**: Excel, CSV exports
10. **Dark Mode**: Theme switching

## Testing Recommendations

1. **Unit Tests**: Jest + React Testing Library
2. **Integration Tests**: Test API functions
3. **E2E Tests**: Playwright for user flows
4. **Type Testing**: TypeScript compiler as test

## Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse Score**: > 90

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari/Chrome: Latest 2 versions

## Known Limitations

1. **Mock Authentication**: Not production-ready without real auth
2. **No Email Service**: Manual invoice delivery
3. **Single Currency**: EUR only
4. **No File Storage**: No logo upload yet
5. **Basic Search**: No advanced filtering
6. **No Pagination**: Could be slow with many records

## Contributing

When adding new features:
1. Follow existing component patterns
2. Add TypeScript types
3. Include error handling
4. Add translations for EN and SK
5. Test on mobile devices
6. Update this documentation

## License

Private project - All rights reserved

---

**Built with**: Next.js 15 + TypeScript + Supabase
**Last Updated**: 2025-10-25
