"use client"

import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import { Button } from '../../components/ui/button'
import { useRouter } from 'next/navigation'
import { AtSign } from 'lucide-react'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const formattedUsername = username.replace('@', '').trim();
      if (!formattedUsername) throw new Error("Username is required");

      setMessage('Provisioning your dashboard...');
      
      // 1. Provision the account
      const res = await fetch('/api/auth/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formattedUsername })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Failed to provision account');

      setMessage('Logging you in...');

      // 2. Log in with the auto-generated credentials
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (error) {
        throw error;
      }

      // 3. Kick off sync
      setMessage('Syncing Instagram data...');
      fetch('/api/sync', { method: 'POST' }).catch(console.error); // Fire and forget

      // 4. Redirect
      router.push('/');
      router.refresh();

    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950 items-center justify-center text-slate-100 p-4">
      <div className="max-w-md w-full p-8 bg-slate-900 border border-slate-800 rounded-xl shadow-xl flex flex-col items-center text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Instagram Analytics</h1>
          <p className="text-slate-400">Enter any Instagram username to instantly view their dashboard</p>
        </div>
        
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AtSign className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="zuck"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-md py-3 pl-10 pr-3 text-white outline-none focus:border-indigo-500"
            />
          </div>
          <Button 
            type="submit"
            disabled={loading || !username}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6"
          >
            {loading ? 'Connecting...' : 'View Dashboard'}
          </Button>
        </form>
        
        {message && (
          <p className={`text-sm ${message.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
