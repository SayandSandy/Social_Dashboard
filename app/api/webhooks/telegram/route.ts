import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { users } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { AIInsightsService } from '../../../../services/ai-insights.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message;

    if (!message || !message.text || !message.chat) {
      return NextResponse.json({ success: true }); // Acknowledge to stop retries
    }

    const chatId = message.chat.id.toString();
    const text = message.text.trim();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN is not set');
      return NextResponse.json({ success: true });
    }

    const sendMessage = async (msg: string) => {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg }),
      });
    };

    // 1. Handle Connection (/start code)
    if (text.startsWith('/start ')) {
      const code = text.replace('/start ', '').trim();
      
      const userList = await db.select().from(users).where(eq(users.telegramConnectCode, code));
      if (userList.length === 0) {
        await sendMessage('Invalid connection code. Please check your dashboard and try again.');
        return NextResponse.json({ success: true });
      }

      // Link the account
      await db.update(users).set({ telegramChatId: chatId, telegramConnectCode: null }).where(eq(users.id, userList[0].id));
      await sendMessage('✅ Successfully connected to your Instagram Analytics Dashboard! You can now ask me questions about your analytics.');
      return NextResponse.json({ success: true });
    }

    // 2. Handle standard messages
    const userList = await db.select().from(users).where(eq(users.telegramChatId, chatId));
    if (userList.length === 0) {
      await sendMessage('⚠️ You have not connected your account. Please go to your dashboard, generate a connection code, and send it here using /start <code_from_dashboard>.');
      return NextResponse.json({ success: true });
    }

    const user = userList[0];
    if (!user.aiProvider || !user.aiApiKey) {
      await sendMessage('⚠️ Please connect an AI provider in your dashboard before asking questions.');
      return NextResponse.json({ success: true });
    }

    // 3. Process with AI
    try {
      await sendMessage('Thinking... 🧠');
      
      const aiService = new AIInsightsService(user.aiProvider, user.aiApiKey, user.aiBaseUrl, user.aiModel);
      const answer = await aiService.chatWithAnalytics(user.id, text);
      
      await sendMessage(answer);
    } catch (e: any) {
      console.error('Chat error:', e);
      await sendMessage(`❌ Error: ${e.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Telegram Webhook error:', error);
    return NextResponse.json({ success: true }); // Always return 200 to Telegram
  }
}
