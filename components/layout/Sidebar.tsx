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
    </aside>
  );
}
