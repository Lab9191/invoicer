import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'sk'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from the request
  let locale = await requestLocale;

  // Fallback to default if not provided
  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
