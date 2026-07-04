import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { users } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { AIInsightsService } from '../../../../services/ai-insights.service';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: true }); // Missing user context
    }

    const body = await request.json();
    const message = body.message;

    if (!message || !message.text || !message.chat) {
      return NextResponse.json({ success: true }); // Acknowledge to stop retries
    }

    const chatId = message.chat.id.toString();
    const text = message.text.trim();

    // Look up the user
    const userList = await db.select().from(users).where(eq(users.id, userId));
    if (userList.length === 0) {
      return NextResponse.json({ success: true });
    }

    const user = userList[0];
    const botToken = user.telegramBotToken;

    if (!botToken) {
      return NextResponse.json({ success: true }); // Should not happen if webhook was set
    }

    const sendMessage = async (msg: string) => {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg }),
      });
    };

    // 1. Handle claiming ownership on first /start
    if (!user.telegramChatId) {
      if (text === '/start') {
        await db.update(users).set({ telegramChatId: chatId }).where(eq(users.id, user.id));
        await sendMessage('✅ You are now the owner of this bot! It is securely linked to your Instagram Analytics dashboard. You can now ask me questions about your analytics.');
        return NextResponse.json({ success: true });
      } else {
        await sendMessage('Please send /start to claim ownership of this bot.');
        return NextResponse.json({ success: true });
      }
    }

    // 2. Prevent strangers from using the bot
    if (user.telegramChatId !== chatId) {
      return NextResponse.json({ success: true }); // Silently ignore strangers
    }

    // Handle normal /start
    if (text === '/start') {
        await sendMessage('✅ Welcome back! Your bot is ready. You can ask me questions about your analytics.');
        return NextResponse.json({ success: true });
    }

    // 3. Process with AI
    if (!user.aiProvider || !user.aiApiKey) {
      await sendMessage('⚠️ Please connect an AI provider in your dashboard before asking questions.');
      return NextResponse.json({ success: true });
    }

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
