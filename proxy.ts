import { type NextRequest, NextResponse } from 'next/server'

const isDev = process.env.NODE_ENV === 'development'

// If the API is configured on another origin, the browser has to be allowed to call it.
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
const apiOrigin = /^https?:\/\//.test(apiUrl) ? new URL(apiUrl).origin : ''

/**
 * Strict, nonce-based Content Security Policy (see the Next.js CSP guide). Next reads the nonce from
 * the request's CSP header and stamps it on its own scripts and styles, so injected markup, such as
 * unsanitised transaction narration, can't execute script even if it reaches the DOM.
 */
function contentSecurityPolicy(nonce: string): string {
  return [
    `default-src 'self'`,
    // React needs eval in development only, for its debugging features.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? ` 'unsafe-eval'` : ''}`,
    // Dev injects CSS through un-nonced <style> tags (HMR). A nonce disables 'unsafe-inline', so dev drops it.
    isDev ? `style-src 'self' 'unsafe-inline'` : `style-src 'self' 'nonce-${nonce}'`,
    // Avatars can come from arbitrary CDNs.
    `img-src 'self' data: blob: https:`,
    `font-src 'self'`,
    `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ''}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join('; ')
}

export function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID())
  const csp = contentSecurityPolicy(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  matcher: [
    {
      // Pages only: skip the API, static assets and link prefetches.
      source: '/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
