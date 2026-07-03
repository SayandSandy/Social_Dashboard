import { z } from 'zod';

export const AIInsightsSchema = z.object({
  executive_summary: z.string().max(500),
  wins: z.array(z.string()).max(5),
  losses: z.array(z.string()).max(5),
  opportunities: z.array(z.string()).max(5),
  recommendations: z.array(z.string()).max(7),
  action_items: z.array(z.string()).max(5),
  posting_frequency: z.object({ current: z.string(), recommended: z.string() }),
  best_content_types: z.array(z.string()),
  best_posting_times: z.array(z.string()),
  growth_strategy: z.string().max(300),
});

export type AIInsightsOutput = z.infer<typeof AIInsightsSchema>;
