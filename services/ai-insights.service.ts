import Anthropic from '@anthropic-ai/sdk';
import { InsightsRepository } from '../repositories/insights.repository';
import { AIInsightsSchema, AIInsightsOutput } from '../schemas/insights.schema';

export class AIInsightsService {
  private anthropic: Anthropic;
  private insightsRepo = new InsightsRepository();

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  async generateMonthlyInsights(accountId: string, periodStart: Date, periodEnd: Date, accountData: any, mediaData: any): Promise<AIInsightsOutput> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API Key is not set');
    }

    const prompt = `You are an Instagram analytics expert. Analyze the following data for the period ${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]} and provide structured insights.

ACCOUNT DATA:
${JSON.stringify(accountData)}

MEDIA PERFORMANCE:
${JSON.stringify(mediaData)}

Respond with a JSON object matching this exact schema:
{
  "executive_summary": "string max 500 chars",
  "wins": ["string max 5"],
  "losses": ["string max 5"],
  "opportunities": ["string max 5"],
  "recommendations": ["string max 7"],
  "action_items": ["string max 5"],
  "posting_frequency": { "current": "string", "recommended": "string" },
  "best_content_types": ["string"],
  "best_posting_times": ["string"],
  "growth_strategy": "string max 300 chars"
}

Be specific, data-driven, and actionable. Avoid generic advice. Only return the raw JSON object.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1500,
      system: 'You are an Instagram analytics expert.',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    });

    try {
      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const rawJson = jsonMatch ? jsonMatch[0] : text;
      const parsed = JSON.parse(rawJson);
      
      const validated = AIInsightsSchema.parse(parsed);

      await this.insightsRepo.upsert({
        accountId,
        periodStart: periodStart.toISOString().split('T')[0],
        periodEnd: periodEnd.toISOString().split('T')[0],
        model: 'claude-3-5-sonnet-20240620',
        promptVersion: 1,
        ...validated,
        inputTokenCount: response.usage.input_tokens,
        outputTokenCount: response.usage.output_tokens
      });

      return validated;
    } catch (e) {
      console.error('Failed to parse or validate AI response', e);
      throw new Error('AI Response Validation Failed');
    }
  }
}
