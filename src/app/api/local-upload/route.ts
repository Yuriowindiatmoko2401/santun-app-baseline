import { NextRequest, NextResponse } from 'next/server';
import { handleLocalUpload } from '@/lib/uploads-local';

export async function POST(req: NextRequest) {
  try {
    const result = await handleLocalUpload(req);
    
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Local upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      },
      { status: 500 }
    );
  }
}
