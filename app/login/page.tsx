"use client"

import { createClient } from '../../lib/supabase/client'
import { Button } from '../../components/ui/button'

export default function LoginPage() {
  const supabase = createClient()

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        scopes: 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement',
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950 items-center justify-center text-slate-100">
      <div className="max-w-md w-full p-8 bg-slate-900 border border-slate-800 rounded-xl shadow-xl flex flex-col items-center text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Instagram Analytics</h1>
          <p className="text-slate-400">Log in to view your dashboard</p>
        </div>
        
        <Button 
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6"
        >
          Continue with Facebook
        </Button>
        <p className="text-xs text-slate-500">
          This will connect your Instagram Business Account via Meta.
        </p>
      </div>
    </div>
  )
}
