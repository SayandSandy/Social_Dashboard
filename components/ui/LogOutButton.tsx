"use client"

import { LogOut } from 'lucide-react';
import { Button } from './button';
import { createClient } from '../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogOut = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleLogOut} 
      disabled={loading}
      className="flex items-center space-x-2"
    >
      <LogOut className="w-4 h-4" />
      <span>{loading ? 'Logging out...' : 'Log Out'}</span>
    </Button>
  );
}
