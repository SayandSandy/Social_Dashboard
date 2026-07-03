"use client"

import { useEffect } from "react"
import { Button } from "../../components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Something went wrong!</h1>
        <p className="max-w-[600px] text-slate-400">
          We encountered an error while trying to load your dashboard data. 
          Make sure your database is connected and up to date.
        </p>
      </div>
      <Button 
        onClick={() => reset()}
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        Try again
      </Button>
    </div>
  )
}
