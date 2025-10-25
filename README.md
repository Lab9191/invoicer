# Invoicer - Professional Invoice Management System

A modern web application for creating and managing invoices for both companies and individuals, with support for English and Slovak languages.

## Features

- **Dual Profile Support**: Separate workspaces for company and individual profiles
- **Multi-language**: Full support for English and Slovak
- **PDF Export**: Generate professional PDF invoices
- **QR Code Payments**: Include QR codes for easy payment processing
- **Client Management**: Store and manage client information
- **Cloud Storage**: Secure data storage with Supabase
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **UI**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **PDF Generation**: jsPDF
- **QR Codes**: qrcode.js
- **i18n**: next-intl
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/invoicer.git
cd invoicer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

1. Create a new project in [Supabase](https://supabase.com)
2. Copy your project URL and anon key to `.env.local`
3. Run the SQL schema:
   - Go to Supabase SQL Editor
   - Copy and paste the contents of `supabase/schema.sql`
   - Execute the query

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

The application will automatically deploy on every push to the main branch via GitHub Actions.

## Usage

### Company Profile

1. Navigate to the Company section
2. Set up your company information (name, address, tax IDs, bank details)
3. Add clients
4. Create invoices with detailed line items
5. Export to PDF with QR codes

### Individual Profile

1. Navigate to the Individual section
2. Set up your personal information
3. Add clients
4. Create invoices
5. Export to PDF

## Project Structure

```
invoicer/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── [locale]/        # Localized routes
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   ├── lib/                 # Utilities and helpers
│   │   ├── supabase.ts      # Supabase client
│   │   ├── pdf-generator.ts # PDF generation logic
│   │   └── database.types.ts # TypeScript types
│   ├── messages/            # i18n translations
│   │   ├── en.json
│   │   └── sk.json
│   └── i18n.ts              # i18n configuration
├── supabase/
│   └── schema.sql           # Database schema
├── public/                  # Static assets
├── .github/
│   └── workflows/           # GitHub Actions
└── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
