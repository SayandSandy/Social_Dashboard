"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Button } from "./button";
import { MessageCircle, Key, Check } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

interface ChatIntegrationProps {
  hasAiSettings: boolean;
  telegramChatId?: string | null;
  telegramBotToken?: string | null;
}

export function ChatIntegration({ hasAiSettings, telegramChatId, telegramBotToken }: ChatIntegrationProps) {
  const [token, setToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveToken = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/users/telegram-token', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramBotToken: token })
      });
      if (res.ok) {
        setMessage('Bot Token saved! Your bot is ready to be connected.');
        setToken(''); // Clear input for security
        // Reload page to reflect new state
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to save token');
      }
    } catch (e: any) {
      setMessage('Error saving token.');
      console.error(e);
    } finally {
      setSaving(false);
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
          Chat directly with your Instagram Analytics data using your own personalized Telegram Bot.
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
              <div className="text-sm text-emerald-500">Your Telegram Bot is fully linked and configured as your analytics assistant.</div>
            </div>
          </div>
        ) : telegramBotToken ? (
          <div className="space-y-4 p-4 bg-blue-500/10 rounded-md border border-blue-500/20">
            <h3 className="font-semibold text-blue-400">Bot Configured! Final Step:</h3>
            <p className="text-sm text-slate-300">
              Open Telegram and send <code>/start</code> to your bot. The first person to message the bot will be registered as the owner.
            </p>
            <p className="text-xs text-slate-400 italic">
              (Once you send the message, refresh this page to see the green connected status.)
            </p>
            <div className="pt-4 border-t border-blue-500/20">
              <p className="text-sm text-slate-300 mb-2">Want to change your bot?</p>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste new HTTP API Token..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-md py-2 px-3 text-white outline-none focus:border-blue-500"
                />
                <Button onClick={handleSaveToken} disabled={saving || !token} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {saving ? 'Saving...' : 'Update Token'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3 text-sm text-slate-300">
              <p>To keep your data private and secure, you will use your own personal Telegram Bot. It's free and takes 30 seconds.</p>
              <ol className="list-decimal pl-5 space-y-2 text-slate-400">
                <li>Open Telegram and search for <strong>@BotFather</strong>.</li>
                <li>Send the command <code>/newbot</code> and follow the prompts to choose a name and username.</li>
                <li>BotFather will give you an <strong>HTTP API Token</strong> (e.g. <code>123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11</code>).</li>
                <li>Paste that token below.</li>
              </ol>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Telegram Bot Token</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-slate-500" />
                  </div>
                  <input 
                    type="password" 
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste HTTP API Token here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 pl-10 pr-3 text-white outline-none focus:border-blue-500"
                  />
                </div>
                <Button onClick={handleSaveToken} disabled={saving || !token} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
                  {saving ? 'Saving...' : 'Connect Bot'}
                </Button>
              </div>
              {message && (
                <div className={`mt-2 text-sm ${message.includes('saved') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
