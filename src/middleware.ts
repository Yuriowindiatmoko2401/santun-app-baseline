import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLocalDev = process.env.USE_LOCAL_SERVICES === 'true';
  
  // Handle local logout redirect
  if (isLocalDev) {
    // Handle /logout path for local dev
    if (request.nextUrl.pathname === '/logout') {
      // Execute the POST request directly from middleware
      // This is more reliable than redirecting to the API route
      const response = NextResponse.redirect(new URL('/local-auth', request.url));
      
      // Clear the auth cookie
      response.cookies.delete('local-auth-token');
      
      return response;
    }
    
    // Protect routes that require authentication
    if (request.nextUrl.pathname === '/') {
      // Check if user is authenticated in local dev
      const authToken = request.cookies.get('local-auth-token');
      if (!authToken) {
        return NextResponse.redirect(new URL('/local-auth', request.url));
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/logout',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
