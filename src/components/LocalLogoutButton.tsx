'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LocalLogoutButton() {
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      // Using a direct link is more reliable for logout than API calls
      // This will be intercepted by our middleware
      router.push('/logout');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      
      // Fallback to direct API call if router fails
      try {
        await fetch('/api/local-auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // Force redirect to login page
        window.location.href = '/local-auth';
      } catch (fallbackError) {
        console.error('Fallback logout error:', fallbackError);
      }
    }
  };
  
  return (
    <Button onClick={handleLogout} variant="ghost" size="sm">
      <LogOut size={22} className="mr-2" />
      Logout
    </Button>
  );
}
