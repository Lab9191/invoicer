import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function IndividualPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-purple-600">
                Invoicer
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-lg font-medium text-gray-700">
                👤 {t('common.individual')}
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
            {t('common.individual')} Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Manage your freelance invoices and clients
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Profile Card */}
          <Link href="/en/individual/profile" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow block">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">⚙️</div>
              <span className="text-xs text-green-600 font-medium">Ready</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('nav.individualProfile')}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Set up your personal information and bank account details
            </p>
            <div className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-center hover:bg-purple-700 transition-colors">
              Configure Profile
            </div>
          </Link>

          {/* Clients Card */}
          <Link href="/en/individual/clients" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow block">
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
            <div className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-center hover:bg-purple-700 transition-colors">
              Manage Clients
            </div>
          </Link>

          {/* Invoices Card */}
          <Link href="/en/individual/invoices" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow block">
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
            <div className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-center hover:bg-purple-700 transition-colors">
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
                This is your Individual workspace. All features are fully functional:
              </p>
              <ul className="list-disc list-inside text-green-800 space-y-2">
                <li>Set up your personal profile with trade license details</li>
                <li>Add and manage clients with their information</li>
                <li>Create professional invoices for freelance work</li>
                <li>Export invoices to PDF with QR codes for payment</li>
                <li>Full support for English and Slovak languages</li>
              </ul>
              <div className="mt-6 p-4 bg-white rounded-lg border border-green-300">
                <p className="text-sm text-gray-700">
                  <strong>💡 Quick Start:</strong> Begin by setting up your personal profile, then add your first client, and start creating invoices!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ✨ Features for Individuals
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Personal profile with trade license
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Tax ID support (DIČ)
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Simple invoice templates
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
              💡 Perfect For
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">●</span>
                Freelancers and contractors
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">●</span>
                Self-employed individuals
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">●</span>
                Trade license holders (živnostníci)
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">●</span>
                Consultants and advisors
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">●</span>
                Service providers
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
