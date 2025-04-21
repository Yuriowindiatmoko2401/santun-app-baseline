// Local file storage replacement for Cloudinary
// This is a simplified version that stores files in the public directory

import fs from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Local uploads directory within public folder (this makes them accessible via URL)
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure uploads directory exists
if (typeof window === 'undefined') {
  // Only run on server
  (async () => {
    try {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
    } catch (error) {
      console.error('Error creating uploads directory:', error);
    }
  })();
}

export async function uploadLocalFile(file: File | Blob): Promise<{ url: string; publicId: string }> {
  // Generate a unique filename
  const fileId = crypto.randomBytes(16).toString('hex');
  const fileExtension = getFileExtension(
    'name' in file ? file.name : 'image.png'
  );
  const fileName = `${fileId}${fileExtension}`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  
  // Convert blob to buffer
  const arrayBuffer = await file.arrayBuffer();
  
  // Write file to disk using fs/promises
  await fs.writeFile(filePath, new Uint8Array(arrayBuffer));
  
  // Return URL that can be used in the app
  return {
    url: `/uploads/${fileName}`,
    publicId: fileId,
  };
}

// Helper function to get file extension
function getFileExtension(filename: string): string {
  const match = /\.([^./\\]+)$/.exec(filename);
  return match ? `.${match[1].toLowerCase()}` : '';
}

// API function to handle file uploads
export async function handleLocalUpload(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    throw new Error('No file provided');
  }
  
  return uploadLocalFile(file);
}

// API function to emulate Cloudinary signature generation
// This just returns a mock signature for local development
export function generateLocalSignature() {
  return {
    timestamp: Date.now(),
    signature: crypto.randomBytes(16).toString('hex'),
    apiKey: 'local-dev-api-key',
  };
}
