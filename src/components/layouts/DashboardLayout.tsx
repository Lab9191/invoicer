'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  profileType: 'company' | 'individual';
  locale: string;
}

export function DashboardLayout({ children, profileType, locale }: DashboardLayoutProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const baseHref = `/${locale}/${profileType}`;

  const navItems: NavItem[] = [
    {
      href: `${baseHref}`,
      label: t('nav.dashboard'),
      icon: '📊',
    },
    {
      href: `${baseHref}/profile`,
      label: profileType === 'company' ? t('nav.companyProfile') : t('nav.individualProfile'),
      icon: '⚙️',
    },
    {
      href: `${baseHref}/clients`,
      label: t('nav.clients'),
      icon: '👥',
    },
    {
      href: `${baseHref}/invoices`,
      label: t('nav.invoices'),
      icon: '📄',
    },
  ];

  const isActive = (href: string) => {
    if (href === baseHref) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Invoicer
            </Link>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <span className="text-lg font-medium text-gray-700 hidden sm:inline">
              {profileType === 'company' ? '🏢' : '👤'} {t(`common.${profileType}`)}
            </span>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← {t('nav.dashboard')}
          </Link>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out z-20
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg
                transition-colors
                ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main
        className={`
          pt-16 transition-all duration-300
          ${isSidebarOpen ? 'lg:pl-64' : 'pl-0'}
        `}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
