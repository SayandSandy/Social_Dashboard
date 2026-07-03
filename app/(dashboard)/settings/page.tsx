import { createClient } from '../../../lib/supabase/server';
import { db } from '../../../db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { AIKeyManager } from '../../../components/ui/AIKeyManager';
import { ChatIntegration } from '../../../components/ui/ChatIntegration';
import { LogOutButton } from '../../../components/ui/LogOutButton';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const dbUser = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  const userData = dbUser[0];

  const hasAiSettings = !!(userData?.aiProvider && userData?.aiApiKey);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account, AI providers, and integrations.</p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Account</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-300 font-medium">{userData?.email}</p>
              <p className="text-sm text-slate-500 mt-1">Logged in via Supabase</p>
            </div>
            <LogOutButton />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">AI Integration</h2>
          <AIKeyManager 
            initialProvider={userData?.aiProvider || 'openai'} 
            hasKey={!!userData?.aiApiKey} 
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Chatbot Integrations</h2>
          <ChatIntegration 
            hasAiSettings={hasAiSettings}
            telegramChatId={userData?.telegramChatId}
          />
        </section>
      </div>
    </div>
  );
}
