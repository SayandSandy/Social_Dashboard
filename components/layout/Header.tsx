import { SyncButton } from '../ui/SyncButton';

export function Header() {
  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950 text-white">
      <div className="font-semibold flex items-center gap-4">
        Dashboard
      </div>
      <div className="flex items-center gap-4">
        <span className="text-slate-400 text-sm">{new Date().toLocaleDateString()}</span>
        <SyncButton />
      </div>
    </header>
  );
}
