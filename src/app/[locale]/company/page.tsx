import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function CompanyPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Invoicer
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-lg font-medium text-gray-700">
                🏢 {t('common.company')}
              </span>
            </div>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← {t('nav.dashboard')}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('common.company')} Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Manage your company invoices and clients
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Profile Card */}
          <Link href="/en/company/profile" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow block">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">⚙️</div>
              <span className="text-xs text-green-600 font-medium">Ready</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('nav.companyProfile')}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Set up your company information, tax details, and bank account
            </p>
            <div className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors">
              Configure Profile
            </div>
          </Link>

          {/* Clients Card */}
          <Link href="/en/company/clients" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow block">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">👥</div>
              <span className="text-xs text-green-600 font-medium">Ready</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('nav.clients')}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Add and manage your clients and their contact information
            </p>
            <div className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors">
              Manage Clients
            </div>
          </Link>

          {/* Invoices Card */}
          <Link href="/en/company/invoices" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow block">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">📄</div>
              <span className="text-xs text-green-600 font-medium">Ready</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('nav.invoices')}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Create, edit, and export professional invoices with QR codes
            </p>
            <div className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors">
              View Invoices
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="text-3xl mr-4">✅</div>
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Ready to Use!
              </h3>
              <p className="text-green-800 mb-4">
                This is your Company workspace. All features are fully functional:
              </p>
              <ul className="list-disc list-inside text-green-800 space-y-2">
                <li>Set up your company profile with registration details</li>
                <li>Add and manage clients with their tax information</li>
                <li>Create professional invoices with automatic numbering</li>
                <li>Export invoices to PDF with QR codes for payment</li>
                <li>Full support for English and Slovak languages</li>
              </ul>
              <div className="mt-6 p-4 bg-white rounded-lg border border-green-300">
                <p className="text-sm text-gray-700">
                  <strong>💡 Quick Start:</strong> Begin by setting up your company profile, then add your first client, and you'll be ready to create invoices!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ✨ Features for Companies
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Full company registration details
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                VAT and tax ID support
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Professional invoice templates
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                QR code payment integration
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Multi-language invoices (EN/SK)
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Tech Stack
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">●</span>
                Next.js 15 with TypeScript
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">●</span>
                Supabase for database
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">●</span>
                PDF generation with jsPDF
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">●</span>
                Tailwind CSS styling
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">●</span>
                Deployed on Vercel
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
