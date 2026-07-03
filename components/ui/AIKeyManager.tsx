"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Button } from "./button";
import { Settings, Key } from 'lucide-react';

interface AIKeyManagerProps {
  initialProvider?: string;
  hasKey?: boolean;
}

export function AIKeyManager({ initialProvider = 'anthropic', hasKey = false }: AIKeyManagerProps) {
  const [provider, setProvider] = useState(initialProvider);
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/users/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiProvider: provider, aiApiKey: apiKey })
      });
      
      if (!res.ok) throw new Error('Failed to save');
      setMessage('Settings saved successfully!');
      setApiKey(''); // Clear for security
    } catch (e) {
      setMessage('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-800 text-white mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-slate-200">
          <Settings className="w-5 h-5 text-indigo-400" />
          <span>AI Provider Settings</span>
        </CardTitle>
        <CardDescription className="text-slate-400">
          Connect your preferred AI model to unlock AI Insights and Telegram Chat features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-400 mb-1">Provider</label>
            <select 
              value={provider} 
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-white outline-none focus:border-indigo-500"
            >
              <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
              <option value="openai">OpenAI (GPT-4o)</option>
              <option value="google">Google (Gemini 1.5 Pro)</option>
            </select>
          </div>
          <div className="flex-[2]">
            <label className="block text-sm font-medium text-slate-400 mb-1">API Key</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-4 w-4 text-slate-500" />
              </div>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasKey ? "••••••••••••••••" : "sk-..."}
                className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 pl-10 pr-3 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button onClick={handleSave} disabled={saving || !apiKey} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto">
              {saving ? 'Saving...' : 'Save Settings'}
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
