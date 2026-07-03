"use client"

import { useState } from 'react';
import { Button } from './button';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      if (!res.ok) throw new Error('Sync failed');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Sync failed. Make sure your Instagram account is connected properly.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button 
      onClick={handleSync} 
      disabled={syncing}
      className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2"
    >
      <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
      <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
    </Button>
  );
}
