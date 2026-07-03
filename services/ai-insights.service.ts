import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { InsightsRepository } from '../repositories/insights.repository';
import { AnalyticsService } from './analytics.service';
import { AIInsightsSchema, AIInsightsOutput } from '../schemas/insights.schema';

export class AIInsightsService {
  private providerName: string;
  private apiKey: string;
  private insightsRepo = new InsightsRepository();

  constructor(providerName: string, apiKey: string) {
    this.providerName = providerName.toLowerCase();
    this.apiKey = apiKey;
  }

  private getModel(task: 'structured' | 'chat') {
    if (this.providerName === 'openai') {
      const openai = createOpenAI({ apiKey: this.apiKey });
      return openai(task === 'structured' ? 'gpt-4o' : 'gpt-4o');
    } else if (this.providerName === 'google') {
      const google = createGoogleGenerativeAI({ apiKey: this.apiKey });
      return google(task === 'structured' ? 'gemini-1.5-pro' : 'gemini-1.5-flash');
    } else {
      const anthropic = createAnthropic({ apiKey: this.apiKey });
      return anthropic(task === 'structured' ? 'claude-3-5-sonnet-20240620' : 'claude-3-5-sonnet-20240620');
    }
  }

  async generateMonthlyInsights(accountId: string, periodStart: Date, periodEnd: Date, accountData: any, mediaData: any): Promise<AIInsightsOutput> {
    const prompt = `You are an Instagram analytics expert. Analyze the following data for the period ${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]} and provide structured insights.

ACCOUNT DATA:
${JSON.stringify(accountData)}

MEDIA PERFORMANCE:
${JSON.stringify(mediaData)}

Be specific, data-driven, and actionable. Avoid generic advice.`;

    try {
      const { object, usage } = await generateObject({
        model: this.getModel('structured'),
        schema: AIInsightsSchema,
        prompt: prompt,
        temperature: 0.2,
      });

      await this.insightsRepo.upsert({
        accountId,
        periodStart: periodStart.toISOString().split('T')[0],
        periodEnd: periodEnd.toISOString().split('T')[0],
        model: this.providerName,
        promptVersion: 2,
        ...object,
        inputTokenCount: usage.promptTokens,
        outputTokenCount: usage.completionTokens
      });

      return object;
    } catch (e) {
      console.error('Failed to generate insights', e);
      throw new Error('AI Generation Failed');
    }
  }

  async chatWithAnalytics(accountId: string, userMessage: string): Promise<string> {
    const analyticsService = new AnalyticsService(accountId);
    
    // Fetch last 30 days of data context
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    
    const dashboardData = await analyticsService.getDashboardData(start, end);
    
    const systemPrompt = `You are a helpful Instagram analytics assistant. You have access to the user's analytics for the last 30 days. 
Answer their question accurately based ONLY on the provided data. Keep answers concise, friendly, and formatted well for a messaging app (use emojis).
If they ask something completely unrelated to their Instagram analytics, politely decline to answer.

ANALYTICS DATA (Last 30 Days):
${JSON.stringify(dashboardData)}
`;

    try {
      const { text } = await generateText({
        model: this.getModel('chat'),
        system: systemPrompt,
        prompt: userMessage,
        temperature: 0.5,
      });

      return text;
    } catch (e) {
      console.error('Failed to chat', e);
      throw new Error('Could not generate chat response.');
    }
  }
}
