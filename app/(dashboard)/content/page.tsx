import { ContentRepository } from '../../../repositories/content.repository';
import { columns, type ContentItem } from './columns';
import { DataTable } from '../../../components/data-table/data-table';
import { createClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ContentLibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const contentRepo = new ContentRepository();
  const rawData = await contentRepo.getAllContent(user.id);

  const formattedData = rawData.map(item => ({
    id: item.id,
    igMediaId: item.igMediaId,
    mediaType: item.mediaType,
    thumbnailUrl: item.thumbnailUrl,
    caption: item.caption,
    timestamp: item.timestamp,
    likeCount: item.likeCount || 0,
    commentsCount: item.commentsCount || 0,
    permalink: item.permalink,
  })) as ContentItem[];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Library</h1>
      </div>
      <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 shadow-sm flex-1">
        <DataTable columns={columns} data={formattedData} />
      </div>
    </div>
  );
}
