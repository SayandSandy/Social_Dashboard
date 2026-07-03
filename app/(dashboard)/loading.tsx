import { Skeleton } from "../../components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-10 w-1/4 bg-slate-800" />
        <Skeleton className="h-4 w-1/3 bg-slate-800" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full bg-slate-800 rounded-xl" />
        ))}
      </div>

      <div className="mt-6">
        <Skeleton className="h-[400px] w-full bg-slate-800 rounded-xl" />
      </div>
    </div>
  )
}
