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
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">⚙️</div>
              <span className="text-xs text-gray-500">Coming Soon</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('nav.individualProfile')}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Set up your personal information and bank account details
            </p>
            <button
              disabled
              className="w-full bg-gray-100 text-gray-400 py-2 px-4 rounded-lg cursor-not-allowed"
            >
              Configure Profile
            </button>
          </div>

          {/* Clients Card */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">👥</div>
              <span className="text-xs text-gray-500">Coming Soon</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('nav.clients')}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Add and manage your clients and their contact information
            </p>
            <button
              disabled
              className="w-full bg-gray-100 text-gray-400 py-2 px-4 rounded-lg cursor-not-allowed"
            >
              Manage Clients
            </button>
          </div>

          {/* Invoices Card */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">📄</div>
              <span className="text-xs text-gray-500">Coming Soon</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('nav.invoices')}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Create, edit, and export professional invoices with QR codes
            </p>
            <button
              disabled
              className="w-full bg-gray-100 text-gray-400 py-2 px-4 rounded-lg cursor-not-allowed"
            >
              View Invoices
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="text-3xl mr-4">ℹ️</div>
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Getting Started
              </h3>
              <p className="text-purple-800 mb-4">
                This is the Individual workspace. Here you can:
              </p>
              <ul className="list-disc list-inside text-purple-800 space-y-2">
                <li>Set up your personal profile with trade license details</li>
                <li>Add clients and their information</li>
                <li>Create simple invoices for freelance work</li>
                <li>Export invoices to PDF with QR codes for payment</li>
                <li>Support for English and Slovak languages</li>
              </ul>
              <div className="mt-6 p-4 bg-white rounded-lg border border-purple-300">
                <p className="text-sm text-gray-700">
                  <strong>🚧 Under Development</strong>
                  <br />
                  The full functionality is being implemented. These pages are placeholders showing the planned features.
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
