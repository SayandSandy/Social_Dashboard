"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Button } from "./button";
import { AtSign } from 'lucide-react';

interface InstagramConnectProps {
  initialUsername?: string | null;
}

export function InstagramConnect({ initialUsername }: InstagramConnectProps) {
  const [username, setUsername] = useState(initialUsername || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/users/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUsername: username.replace('@', '') })
      });
      
      if (!res.ok) throw new Error('Failed to save');
      setMessage('Instagram account connected successfully!');
    } catch (e) {
      setMessage('Error connecting Instagram account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-800 text-white mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-slate-200">
          <AtSign className="w-5 h-5 text-pink-500" />
          <span>Connect Instagram</span>
        </CardTitle>
        <CardDescription className="text-slate-400">
          Enter the public Instagram username you want to track analytics for.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-[2]">
            <label className="block text-sm font-medium text-slate-400 mb-1">Instagram Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500">@</span>
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="zuck"
                className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 pl-8 pr-3 text-white outline-none focus:border-pink-500"
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button onClick={handleSave} disabled={saving || !username} className="bg-pink-600 hover:bg-pink-700 text-white w-full md:w-auto">
              {saving ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        </div>
        {message && (
          <div className={`mt-3 text-sm ${message.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
