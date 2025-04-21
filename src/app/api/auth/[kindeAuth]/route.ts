import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// JWT secret for local development only (same as in auth-local.ts)
const JWT_SECRET = 'local-dev-secret-key-for-auth';

// Check if we're in local development mode
const isLocalDev = process.env.USE_LOCAL_SERVICES === 'true';

// Custom auth handler that supports local development
export async function GET(req: NextRequest, { params }: { params: { kindeAuth: string } }) {
  // If in local development mode, provide local auth handling
  if (isLocalDev) {
    const { kindeAuth } = params;
    
    // Handle various Kinde auth routes
    switch (kindeAuth) {
      case 'login':
        return NextResponse.redirect(new URL('/local-auth', req.url));
      
      case 'logout':
        const response = NextResponse.redirect(new URL('/local-auth', req.url));
        response.cookies.delete('local-auth-token');
        return response;
      
      case 'register':
        return NextResponse.redirect(new URL('/local-auth', req.url));
      
      case 'user':
        // Return actual user info from token if local auth token exists
        const tokenCookie = cookies().get('local-auth-token');
        if (tokenCookie?.value) {
          try {
            // Decode the token to get the actual user data
            const userData = jwt.verify(tokenCookie.value, JWT_SECRET) as {
              id: string;
              email: string;
              given_name: string;
              family_name: string;
              picture?: string;
            };
            
            // Return the actual user data
            return NextResponse.json(userData);
          } catch (error) {
            console.error('Invalid token in auth route:', error);
            // Clear invalid token
            const response = NextResponse.json({ error: 'Invalid token' }, { status: 401 });
            response.cookies.delete('local-auth-token');
            return response;
          }
        }
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      
      default:
        // Return a mock response for other auth routes
        return NextResponse.json({});
    }
  }
  
  // If not in local development, use the standard Kinde auth handler
  const authHandler = handleAuth();
  return authHandler(req, { params });
}
