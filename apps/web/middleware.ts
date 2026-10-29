import { NextResponse, type NextRequest } from 'next/server';
import { isLocale, negotiateLocale } from '@lucky/content';
import { LOCALE_COOKIE } from './lib/constants';

/**
 * 没有语言前缀的路径 → 按 cookie 或浏览器语言跳转到 /th/、/zh-hans/ 等。
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split('/')[1] ?? '';
  if (isLocale(first)) return NextResponse.next();

  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = cookie && isLocale(cookie) ? cookie : negotiateLocale(request.headers.get('accept-language'));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  url.search = search;
  return NextResponse.redirect(url);
}

export const config = {
  // 跳过接口、静态资源和带扩展名的文件（robots.txt、sitemap.xml 等）
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
