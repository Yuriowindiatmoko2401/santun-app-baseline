import { NextResponse } from 'next/server';
import { localLogout } from '@/lib/auth-local';

export async function POST() {
  try {
    await localLogout();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Local logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
