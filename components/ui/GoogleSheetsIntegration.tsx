"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Button } from "./button";
import { Table, Link2, Check, Trash2 } from 'lucide-react';

interface GoogleSheetsIntegrationProps {
  initialGoogleSheetId?: string | null;
}

export function GoogleSheetsIntegration({ initialGoogleSheetId }: GoogleSheetsIntegrationProps) {
  const [sheetUrl, setSheetUrl] = useState(initialGoogleSheetId ? `https://docs.google.com/spreadsheets/d/${initialGoogleSheetId}` : '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const serviceAccountEmail = process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL || 'social-dashboard-service@your-project.iam.gserviceaccount.com';

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/users/google-sheet', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleSheetId: sheetUrl })
      });
      if (res.ok) {
        setMessage('Google Sheet connected successfully!');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to connect sheet');
      }
    } catch (e: any) {
      setMessage('Error saving sheet config.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/users/google-sheet', { method: 'DELETE' });
      if (res.ok) {
        setMessage('Disconnected successfully!');
        setSheetUrl('');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage('Failed to disconnect');
      }
    } catch (e: any) {
      setMessage('Error disconnecting.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-800 text-white mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-slate-200">
          <Table className="w-5 h-5 text-green-500" />
          <span>Google Sheets Export</span>
        </CardTitle>
        <CardDescription className="text-slate-400">
          Automatically push raw analytics data to a Google Sheet so you can build custom dashboards.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {initialGoogleSheetId ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-emerald-400 p-4 bg-emerald-500/10 rounded-md border border-emerald-500/20">
              <Check className="w-5 h-5 flex-shrink-0" />
              <div>
                <div className="font-semibold">Sheet Connected!</div>
                <div className="text-sm text-emerald-500 break-all">
                  Syncing to Sheet ID: {initialGoogleSheetId}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href={`https://docs.google.com/spreadsheets/d/${initialGoogleSheetId}`}
                target="_blank" 
                rel="noreferrer"
                className="text-sm text-blue-400 hover:underline flex items-center gap-1"
              >
                Open Google Sheet
              </a>
              <Button onClick={handleDisconnect} disabled={saving} variant="destructive" size="sm" className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Disconnect
              </Button>
            </div>
            {message && <div className="text-sm text-emerald-400">{message}</div>}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3 text-sm text-slate-300">
              <p>To connect your Google Sheet:</p>
              <ol className="list-decimal pl-5 space-y-2 text-slate-400">
                <li>Create a Google Sheet and name two tabs exactly: <strong>RAW_OVERVIEW</strong> and <strong>RAW_POSTS</strong></li>
                <li>Click the "Share" button in the top right corner.</li>
                <li>Add this exact email address as an <strong>Editor</strong>:
                  <div className="mt-2 p-2 bg-slate-950 border border-slate-800 rounded text-green-400 font-mono text-xs break-all cursor-all-scroll select-all">
                    {serviceAccountEmail}
                  </div>
                </li>
                <li>Copy the link to your spreadsheet and paste it below.</li>
              </ol>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Spreadsheet Link or ID</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link2 className="h-4 w-4 text-slate-500" />
                  </div>
                  <input 
                    type="text" 
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 pl-10 pr-3 text-white outline-none focus:border-green-500"
                  />
                </div>
                <Button onClick={handleSave} disabled={saving || !sheetUrl} className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap">
                  {saving ? 'Connecting...' : 'Connect Sheet'}
                </Button>
              </div>
              {message && (
                <div className={`mt-2 text-sm ${message.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
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
