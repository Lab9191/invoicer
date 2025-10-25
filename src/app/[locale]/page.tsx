'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { Spinner } from '@/components/ui';

export default function Home() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const user = await getCurrentUser();
    setIsAuthenticated(!!user);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header with Auth buttons */}
          {!isAuthenticated && (
            <div className="flex justify-end mb-4 gap-3">
              <Link
                href={`/${locale}/auth/login`}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Login
              </Link>
              <Link
                href={`/${locale}/auth/signup`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            Invoicer
          </h1>
          <p className="text-xl text-gray-600 mb-12 text-center">
            Professional invoice management for companies and individuals
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Link
              href="/company"
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-8 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="relative z-10">
                <div className="text-4xl mb-4">🏢</div>
                <h2 className="text-2xl font-bold mb-2">{t('common.company')}</h2>
                <p className="text-blue-100">
                  Manage invoices for your company with full tax compliance
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-600/20 group-hover:from-blue-400/10 group-hover:to-blue-600/30 transition-all duration-300"></div>
            </Link>

            <Link
              href="/individual"
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-8 hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="relative z-10">
                <div className="text-4xl mb-4">👤</div>
                <h2 className="text-2xl font-bold mb-2">{t('common.individual')}</h2>
                <p className="text-purple-100">
                  Create invoices as an individual or freelancer
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-purple-600/20 group-hover:from-purple-400/10 group-hover:to-purple-600/30 transition-all duration-300"></div>
            </Link>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Features:</h3>
            <ul className="grid md:grid-cols-2 gap-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Create & manage invoices</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Export to PDF</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">QR code payments</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Multi-language support (EN/SK)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Client management</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Secure cloud storage</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
