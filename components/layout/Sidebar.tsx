import Link from 'next/link';
import { Home, BarChart2, TrendingUp, Users, MessageSquare, Library, Calculator, Sparkles } from 'lucide-react';

export function Sidebar() {
  const links = [
    { name: 'Overview', href: '/', icon: Home },
    { name: 'Views', href: '/views', icon: BarChart2 },
    { name: 'Reach', href: '/reach', icon: TrendingUp },
    { name: 'Interactions', href: '/interactions', icon: Users },
    { name: 'Followers', href: '/followers', icon: Users },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Content Library', href: '/content', icon: Library },
    { name: 'Calculations', href: '/calculations', icon: Calculator },
    { name: 'AI Insights', href: '/insights', icon: Sparkles },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen">
      <div className="p-6 font-bold text-xl text-white">IG Analytics</div>
      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <Icon className="w-5 h-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 mt-auto">
        <Link href="/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
