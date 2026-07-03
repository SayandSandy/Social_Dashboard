"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Button } from "./button";
import { MessageCircle, Copy, Check } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

interface ChatIntegrationProps {
  hasAiSettings: boolean;
  telegramChatId?: string | null;
}

export function ChatIntegration({ hasAiSettings, telegramChatId }: ChatIntegrationProps) {
  const [code, setCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate a random 6-digit code
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const { db } = await import('../../db');
      // Wait, we cannot import 'db' directly in a Client Component because it uses pg and postgres!
      // We must use an API route to generate the code securely.
      
      const res = await fetch('/api/users/generate-code', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCode(data.code);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(`/start ${code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-800 text-white mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-slate-200">
          <MessageCircle className="w-5 h-5 text-blue-400" />
          <span>Telegram Integration</span>
        </CardTitle>
        <CardDescription className="text-slate-400">
          Chat directly with your Instagram Analytics data using Telegram.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasAiSettings ? (
          <div className="text-amber-400 text-sm p-4 bg-amber-500/10 rounded-md border border-amber-500/20">
            ⚠️ You must connect an AI Provider above before you can use the Telegram chatbot.
          </div>
        ) : telegramChatId ? (
          <div className="flex items-center space-x-3 text-emerald-400 p-4 bg-emerald-500/10 rounded-md border border-emerald-500/20">
            <Check className="w-5 h-5" />
            <div>
              <div className="font-semibold">Successfully Connected!</div>
              <div className="text-sm text-emerald-500">Your Telegram account is linked. Message the bot to ask questions!</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-slate-300">
              1. Click the button below to generate a secure connection code.<br/>
              2. Open Telegram and search for our bot.<br/>
              3. Send the bot your connection code to link your account.
            </div>
            
            {!code ? (
              <Button onClick={generateCode} disabled={generating} className="bg-blue-600 hover:bg-blue-700 text-white">
                {generating ? 'Generating...' : 'Generate Connection Code'}
              </Button>
            ) : (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-md flex items-center justify-between">
                <code className="text-lg font-mono text-blue-400">/start {code}</code>
                <Button variant="outline" size="sm" onClick={copyCode} className="border-slate-700 hover:bg-slate-800">
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
