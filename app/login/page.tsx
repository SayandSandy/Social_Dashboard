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
  const [fbLoading, setFbLoading] = useState(false)
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

  const handleFacebookLogin = async () => {
    setFbLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement',
        }
      });
      
      if (error) throw error;
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
      setFbLoading(false);
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
        
        <div className="w-full flex items-center justify-center space-x-4">
          <div className="h-px bg-slate-800 flex-1"></div>
          <span className="text-sm text-slate-500 font-medium">OR</span>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        <div className="w-full">
          <Button
            type="button"
            onClick={handleFacebookLogin}
            disabled={fbLoading || loading}
            variant="outline"
            className="w-full border-slate-700 bg-slate-900 hover:bg-slate-800 hover:text-white text-slate-200 font-semibold py-6 flex items-center justify-center"
          >
            <svg className="mr-2 h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {fbLoading ? 'Connecting...' : 'Login with Facebook'}
          </Button>
          <p className="text-xs text-slate-500 mt-3 text-center">
            Full authentication required for detailed insights and real-time API access.
          </p>
        </div>

        {message && (
          <p className={`text-sm ${message.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
