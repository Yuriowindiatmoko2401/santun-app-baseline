import { NextRequest, NextResponse } from 'next/server';
import { getDefaultLocalUser, localLogin } from '@/lib/auth-local';

export async function POST(req: NextRequest) {
  try {
    // In a real app, you'd validate the user data and authenticate against a database
    // For local development, we're just creating a test user
    const userData = await req.json();
    const user = await localLogin(userData || getDefaultLocalUser());
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Local login error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
