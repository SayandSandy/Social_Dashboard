"use client"

import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import { Button } from '../../components/ui/button'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Check your email for the login link!')
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen bg-slate-950 items-center justify-center text-slate-100">
      <div className="max-w-md w-full p-8 bg-slate-900 border border-slate-800 rounded-xl shadow-xl flex flex-col items-center text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Instagram Analytics</h1>
          <p className="text-slate-400">Enter your email to log in</p>
        </div>
        
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-white outline-none focus:border-indigo-500"
          />
          <Button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6"
          >
            {loading ? 'Sending link...' : 'Send Magic Link'}
          </Button>
        </form>
        
        {message && (
          <p className={`text-sm ${message.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
            {message}
          </p>
        )}
        
        <p className="text-xs text-slate-500">
          We will email you a secure link to instantly sign in.
        </p>
      </div>
    </div>
  )
}
