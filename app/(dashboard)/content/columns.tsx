"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ExternalLink } from "lucide-react"
import { Button } from "../../../components/ui/button"

export type ContentItem = {
  id: string
  igMediaId: string
  mediaType: string
  thumbnailUrl: string | null
  caption: string | null
  timestamp: Date | null
  likeCount: number
  commentsCount: number
  repostsCount: number | null
  sharesCount: number | null
  savedCount: number | null
  permalink: string | null
}

export const columns: ColumnDef<ContentItem>[] = [
  {
    accessorKey: "thumbnailUrl",
    header: "Media",
    cell: ({ row }) => {
      const url = row.getValue("thumbnailUrl") as string
      const type = row.original.mediaType
      return url ? (
        <div className="w-12 h-12 rounded overflow-hidden bg-slate-800 flex items-center justify-center relative">
          <img src={url} alt="thumbnail" className="object-cover w-full h-full" />
        </div>
      ) : (
        <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center text-xs text-slate-500">
          {type}
        </div>
      )
    },
  },
  {
    accessorKey: "caption",
    header: "Caption",
    cell: ({ row }) => {
      const caption = row.getValue("caption") as string
      return <div className="max-w-[300px] truncate text-slate-300">{caption || "No caption"}</div>
    }
  },
  {
    accessorKey: "mediaType",
    header: "Type",
    cell: ({ row }) => {
      return <div className="text-sm font-medium">{row.getValue("mediaType")}</div>
    }
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-slate-800 hover:text-white -ml-4"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("timestamp") as Date
      return <div className="text-slate-300">{date ? new Date(date).toLocaleDateString() : 'N/A'}</div>
    }
  },
  {
    accessorKey: "likeCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-slate-800 hover:text-white -ml-4"
        >
          Likes
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("likeCount"))
      return <div className="font-medium text-emerald-400">{amount.toLocaleString()}</div>
    }
  },
  {
    accessorKey: "commentsCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-slate-800 hover:text-white -ml-4"
        >
          Comments
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("commentsCount"))
      return <div className="font-medium text-blue-400">{amount.toLocaleString()}</div>
    }
  },
  {
    accessorKey: "repostsCount",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="hover:bg-slate-800 hover:text-white -ml-4">
          Reshares
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const val = row.getValue("repostsCount") as number | null
      return <div className="font-medium text-indigo-400">{val !== null ? val.toLocaleString() : '-'}</div>
    }
  },
  {
    accessorKey: "sharesCount",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="hover:bg-slate-800 hover:text-white -ml-4">
          Shares
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const val = row.getValue("sharesCount") as number | null
      return <div className="font-medium text-purple-400">{val !== null ? val.toLocaleString() : '-'}</div>
    }
  },
  {
    accessorKey: "savedCount",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="hover:bg-slate-800 hover:text-white -ml-4">
          Saves
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const val = row.getValue("savedCount") as number | null
      return <div className="font-medium text-orange-400">{val !== null ? val.toLocaleString() : '-'}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const permalink = row.original.permalink
      return permalink ? (
        <a href={permalink} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
          <ExternalLink className="h-5 w-5" />
        </a>
      ) : null
    },
  },
]
