import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
});

// Public routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/signup', '/auth/callback', '/auth/forgot-password', '/auth/reset-password'];

export async function middleware(request: NextRequest) {
  // First, handle i18n
  let response = intlMiddleware(request);

  // Create a Supabase client configured to use cookies
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Set cookie on both responses
          request.cookies.set(name, value);
          supabaseResponse.cookies.set(name, value, options);
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          // Remove cookie from both responses
          request.cookies.delete(name);
          supabaseResponse.cookies.delete(name);
          response.cookies.delete(name);
        },
      },
    }
  );

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;

  // Extract locale from path (e.g., /en/company -> en)
  const localeMatch = path.match(/^\/([^\/]+)/);
  const locale = localeMatch ? localeMatch[1] : 'en';

  // Check if current path is public (after locale)
  const pathWithoutLocale = path.replace(`/${locale}`, '');
  const isPublicRoute = publicRoutes.some(route => pathWithoutLocale.startsWith(route));
  const isRootPath = pathWithoutLocale === '' || pathWithoutLocale === '/';

  // If not authenticated and trying to access protected route, redirect to login
  if (!session && !isPublicRoute && !isRootPath) {
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access auth pages, redirect to home
  if (session && isPublicRoute && !pathWithoutLocale.startsWith('/auth/callback')) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
