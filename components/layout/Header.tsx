export function Header() {
  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950 text-white">
      <div className="font-semibold">Dashboard</div>
      <div>{new Date().toLocaleDateString()}</div>
    </header>
  );
}
