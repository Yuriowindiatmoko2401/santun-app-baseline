import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { LocalUser } from '@/lib/auth-local';

// JWT secret for local development only (same as in auth-local.ts)
const JWT_SECRET = 'local-dev-secret-key-for-auth';

// Local replacement for Kinde Auth setup endpoint
// This provides a mock API response for local development

export async function GET(req: NextRequest) {
  const isLocalDev = process.env.USE_LOCAL_SERVICES === 'true';
  
  if (isLocalDev) {
    // Check if we have a local auth token
    const tokenCookie = cookies().get('local-auth-token');
    
    if (tokenCookie?.value) {
      try {
        // Decode the token to get the actual user data
        const userData = jwt.verify(tokenCookie.value, JWT_SECRET) as LocalUser;
        
        // Return the actual user data from the token
        return NextResponse.json({
          success: true,
          user: userData
        });
      } catch (error) {
        console.error('Invalid token:', error);
        // Clear invalid token
        cookies().delete('local-auth-token');
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }
    
    // If no token, return a 401 but don't redirect
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  // If not in local dev, return a 401 and let client code handle it
  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}
