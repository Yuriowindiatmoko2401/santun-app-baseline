import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redis } from './db';

// Local authentication system to replace Kinde Auth for development

// JWT secret for local development only - never use this in production!
const JWT_SECRET = 'local-dev-secret-key-for-auth';

export type LocalUser = {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  name?: string; // Add name field required by UI components
  picture?: string;
};

// Mock of Kinde Auth session
export function getLocalKindeServerSession() {
  return {
    getUser: async (): Promise<LocalUser | null> => {
      const token = cookies().get('local-auth-token')?.value;
      if (!token) return null;
      
      try {
        return jwt.verify(token, JWT_SECRET) as LocalUser;
      } catch (error) {
        console.error('Invalid token:', error);
        return null;
      }
    },
    isAuthenticated: async (): Promise<boolean> => {
      const token = cookies().get('local-auth-token')?.value;
      if (!token) return false;
      
      try {
        jwt.verify(token, JWT_SECRET);
        return true;
      } catch {
        return false;
      }
    },
    // Add any other methods from Kinde you might need
  };
}

// Create a local login function for development
export async function localLogin(user: Omit<LocalUser, 'id'>) {
  // First, check if a user with this email already exists
  try {
    // Use SCAN to find all user keys
    let cursor = '0';
    let existingUserId: string | null = null;
    let existingUser: LocalUser | null = null;
    
    do {
      const [nextCursor, keys] = await redis.scan(cursor, { 
        match: 'user:*', 
        count: 100 
      });
      cursor = nextCursor;
      
      // Filter out non-user keys
      const userKeys = keys.filter(key => 
        !key.includes(':conversations') && 
        !key.includes(':messages')
      );
      
      // Check each user key for matching email
      for (const key of userKeys) {
        try {
          const keyType = await redis.type(key);
          if (keyType === 'hash') {
            const userData = await redis.hgetall(key);
            if (userData && userData.email === user.email) {
              existingUserId = key.replace('user:', '');
              existingUser = userData as any as LocalUser;
              break;
            }
          }
        } catch (err) {
          console.error(`Error checking user key ${key}:`, err);
        }
      }
      
      if (existingUserId) break; // Stop scanning if we found a match
    } while (cursor !== '0');
    
    // If we found an existing user, use that instead of creating a new one
    if (existingUserId && existingUser) {
      console.log(`Found existing user with email ${user.email}, using ID ${existingUserId}`);
      
      // Update with any new information from the login
      const updatedUser: LocalUser = {
        ...existingUser,
        given_name: user.given_name || existingUser.given_name,
        family_name: user.family_name || existingUser.family_name,
        // Create a combined name field for the user interface
        name: `${user.given_name || existingUser.given_name} ${user.family_name || existingUser.family_name}`,
      };
      
      // Update the existing user in Redis
      await redis.hset(`user:${existingUserId}`, updatedUser as any);
      return loginWithUserData(updatedUser);
    }
  } catch (error) {
    console.error('Error checking for existing user:', error);
    // Continue with creating a new user if there was an error
  }
  
  // Generate a unique ID for the user if no existing user was found
  const id = `local_${Math.random().toString(36).substring(2, 11)}`;
  
  // Create a combined name field for the user interface
  const fullName = `${user.given_name} ${user.family_name}`;
  
  const userData: LocalUser = {
    ...user,
    id,
    name: fullName, // Add name field required by UI components
  };
  
  // Store user data in Redis - this is critical for the app to display the user correctly
  const redisKey = `user:${id}`;
  try {
    // Store user data as a hash in Redis
    await redis.hset(redisKey, userData as any);
    console.log(`Stored new user data in Redis with key ${redisKey}`);
  } catch (error) {
    console.error('Failed to store user data in Redis:', error);
  }
  
  return loginWithUserData(userData);
}

// Helper function to handle the actual login (JWT creation, cookie setting)
function loginWithUserData(userData: LocalUser) {
  // Sign a JWT token
  const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });
  
  // Set the token in a cookie
  cookies().set('local-auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
  
  return userData;
}

// Logout function
export async function localLogout() {
  cookies().delete('local-auth-token');
}

// Helper to generate a default local user for quick development
export function getDefaultLocalUser(): Omit<LocalUser, 'id'> {
  return {
    email: 'dev@example.com',
    given_name: 'Dev',
    family_name: 'User',
    picture: '/user-placeholder.png',
  };
}
