'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LocalAuthPage() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('dev@example.com');
  const [firstName, setFirstName] = useState('Dev');
  const [lastName, setLastName] = useState('User');
  
  const handleLogin = async () => {
    setIsLoggingIn(true);
    
    try {
      const response = await fetch('/api/local-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          given_name: firstName,
          family_name: lastName,
        }),
      });
      
      if (response.ok) {
        router.push('/');
        router.refresh();
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-950 p-8 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Local Development Login</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            This is a simplified login for local development only
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-slate-800 dark:text-white dark:border-slate-700"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                First Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="block w-full appearance-none rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-slate-800 dark:text-white dark:border-slate-700"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Last Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="block w-full appearance-none rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-slate-800 dark:text-white dark:border-slate-700"
                />
              </div>
            </div>
          </div>
          
          <div>
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
