import { MessagesRepository } from '../../../repositories/messages.repository';
import { StatCard } from '../../../components/cards/StatCard';
import { MessagesChart } from '../../../components/charts/MessagesChart';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const messagesRepo = new MessagesRepository();
  const rawData = await messagesRepo.getAll();
  
  // Sort chronologically for chart
  const chartData = [...rawData].reverse().map(d => ({
    date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    received: d.newConversations || 0,
    sent: d.repliedConversations || 0
  }));

  const totalReceived = chartData.reduce((sum, item) => sum + item.received, 0);
  const totalSent = chartData.reduce((sum, item) => sum + item.sent, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Messages Analysis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Total Received" value={totalReceived.toLocaleString()} />
        <StatCard title="Total Sent" value={totalSent.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {chartData.length > 0 ? (
          <MessagesChart data={chartData} />
        ) : (
          <div className="text-slate-400">No message data available. Note: Instagram API requires webhooks for real-time messages.</div>
        )}
      </div>
    </div>
  );
}
