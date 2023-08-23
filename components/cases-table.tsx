"use client"

import { useEffect, useState } from "react"
import { RealtimeChannel } from "@supabase/supabase-js"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { createColumnHelper } from "@tanstack/table-core"
import moment from "moment"

import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

import { Database } from "../supabase/db_types"
import { Button } from "./ui/button"
import { CaseModal } from "./case-modal"

export type Case = Database["public"]["Tables"]["cases"]["Row"]

const ch = createColumnHelper<Case>()

export const CasesTable = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalCase, setModalCase] = useState<Case | null>(null)

  const openModal = (id: any) => {
    if (!id) return
    const c = cases.find((c) => c.id === id)
    if (c) {
      console.log(c)
      setModalCase(c)
      setModalOpen(true)
    }
  }

  const columns = [
    ch.accessor((c) => c.name, { header: "Name" }),
    ch.accessor((c) => c.username, { header: "Username" }),

    ch.accessor((c) => [c.summary, c.id], {
      id: "summary",
      header: "Summary",
      cell: (props) => (
        <a
          role="button"
          onClick={() => openModal(props.getValue()[1])}
          className="underline underline-offset-1 hover:text-primary"
          tabIndex={0}
        >
          {props.getValue()[0]}
        </a>
      ),
    }),
    ch.accessor((c) => c.phone_number, {
      id: "phone_number",
      header: "Phone Number",
    }),
    ch.accessor((c) => moment(c.created_at).fromNow(), {
      id: "created_at",
      header: "Date Entered",
    }),
    ch.accessor(
      (c) => {
        if (c.closed_at) {
          return "Closed"
        }
        if (c.ticket_needed && !c.ticket_link) {
          return "Pending"
        }
        if (c.ticket_needed && c.ticket_link) {
          return "Ready to Close"
        }
        if (!c.ticket_needed) {
          return "Ready to Close"
        }
        return "Unknown"
      },
      {
        id: "status",
        header: "Status",
      }
    ),
  ]
  const [cases, setCases] = useState<Case[]>([])
  const { toast } = useToast()

  const table = useReactTable({
    data: cases,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      minSize: 0,
      size: Number.MAX_SAFE_INTEGER,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
  })

  useEffect(() => {
    let channel = undefined as RealtimeChannel | undefined
    const fetchCases = async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: true })
      if (error) {
        toast({
          title: "Error fetching cases",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setCases(data)
      }
    }

    fetchCases().then(() => {
      channel = supabase
        .channel("table-db-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "cases",
          },
          (payload) => {
            // TODO: validate new
            const new_case = payload.new as Case
            switch (payload.eventType) {
              case "INSERT":
                setCases((prev) => [...prev, new_case])
                break
              case "UPDATE":
                setCases((prev) =>
                  prev.map((c) => (c.id === new_case.id ? new_case : c))
                )
                break
              case "DELETE":
                setCases((prev) => prev.filter((c) => c.id !== new_case.id))
                break
              default:
                console.log(payload)
            }
          }
        )
        .subscribe()
    })

    return () => {
      channel?.unsubscribe()
    }
  }, [toast])

  return (
    <>
    <CaseModal open={modalOpen} close={() => setModalOpen(false)} data={modalCase} />
      <div className="w-full max-w-full overflow-x-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
