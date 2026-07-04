import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { db } from '../../../../db';
import { users } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const botToken = body.telegramBotToken;

    // We can clear the token if they pass an empty string
    if (botToken === undefined) {
      return NextResponse.json({ error: 'Missing telegramBotToken' }, { status: 400 });
    }

    // Save token to DB and clear chat id (since it might be a new bot)
    await db.update(users).set({ 
      telegramBotToken: botToken || null,
      telegramChatId: null // Reset chat ID so new owner can claim it
    }).where(eq(users.id, user.id));

    if (botToken) {
      // Register webhook with Telegram
      const host = request.headers.get('host');
      const protocol = host?.includes('localhost') ? 'https' : 'https'; // Telegram requires HTTPS. For local dev with ngrok, we need https. 
      // Actually, for local testing we can just use the provided host, but Vercel gives us standard HTTPS.
      // We will hardcode https:// since webhooks require it.
      
      const webhookUrl = `https://${host}/api/webhooks/telegram?userId=${user.id}`;
      
      const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
      });
      
      const data = await res.json();
      if (!data.ok) {
        return NextResponse.json({ error: 'Failed to set Telegram webhook: ' + data.description }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving telegram token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
