import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

// This API provides debug information about the local Redis instance
// Only available when USE_LOCAL_SERVICES=true

const isLocalDev = process.env.USE_LOCAL_SERVICES === 'true';

export async function GET(req: NextRequest) {
  if (!isLocalDev) {
    return NextResponse.json(
      { error: 'Debug endpoints only available in local development mode' },
      { status: 403 }
    );
  }
  
  try {
    const redis = new Redis('redis://localhost:6379');
    
    // Get Redis info
    const info = await redis.info();
    
    // Get some key statistics
    const dbSize = await redis.dbsize();
    const keys = await redis.keys('*');
    
    // Group keys by type for better overview
    const keyTypes: Record<string, string[]> = {
      users: [],
      conversations: [],
      messages: [],
      other: [],
    };
    
    // Get type of each key
    for (const key of keys) {
      if (key.startsWith('user:')) {
        keyTypes.users.push(key);
      } else if (key.startsWith('conversation:')) {
        keyTypes.conversations.push(key);
      } else if (key.startsWith('message:')) {
        keyTypes.messages.push(key);
      } else {
        keyTypes.other.push(key);
      }
    }
    
    // Parse Redis info into sections
    const infoSections: Record<string, Record<string, string>> = {};
    let currentSection = '';
    
    info.split('\n').forEach(line => {
      if (line.startsWith('#')) {
        currentSection = line.substring(2).trim();
        infoSections[currentSection] = {};
      } else if (line.includes(':') && currentSection) {
        const [key, value] = line.split(':');
        if (key && value) {
          infoSections[currentSection][key.trim()] = value.trim();
        }
      }
    });
    
    // Close connection
    redis.quit();
    
    return NextResponse.json({
      dbSize,
      keyCounts: {
        total: keys.length,
        users: keyTypes.users.length,
        conversations: keyTypes.conversations.length,
        messages: keyTypes.messages.length,
        other: keyTypes.other.length,
      },
      keyTypes,
      info: infoSections,
    });
    
  } catch (error) {
    console.error('Redis debug API error:', error);
    return NextResponse.json(
      { error: 'Failed to get Redis debug information' },
      { status: 500 }
    );
  }
}
