"use client"

import { useCallback, useEffect, useState } from "react"
import { RealtimeChannel } from "@supabase/supabase-js"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { createColumnHelper } from "@tanstack/table-core"
import { ColumnFiltersState, getFilteredRowModel } from '@tanstack/react-table'
import moment from "moment"

import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

import { Database } from "../supabase/db_types"
import { ActionSelector } from "./action-selector"
import { CaseModal } from "./case-modal"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { HorizontalScrollArea, ScrollArea } from "./ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"

export type Case = Database["public"]["Tables"]["cases"]["Row"]

const ch = createColumnHelper<Case>()

export const CasesTable = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalCase, setModalCase] = useState<Case | null>(null)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    [{id: "status", value: true}]
  )
  const [hideClosed, setHideClosed] = useState(true)

  const openModal = (id: any) => {
    if (!id) return
    const c = cases.find((c) => c.id === id)
    if (c) {
      setModalCase(c)
      setModalOpen(true)
    }
  }

  const columns = [
    ch.accessor((c) => c.name, { header: "Name" }),
    ch.accessor((c) => [c.username, c.id], {
      header: "Username",
      cell: (props) => (
        <p
          className="cursor-pointer underline underline-offset-1 hover:text-primary"
          onClick={() => openModal(props.getValue()[1])}
        >
          {props.getValue()[0]}
        </p>
      ),
    }),

    ch.accessor((c) => [c.summary, c.id], {
      id: "summary",
      header: "Summary",
      cell: (props) => (
        <p
          className="cursor-pointer underline underline-offset-1 hover:text-primary"
          onClick={() => openModal(props.getValue()[1])}
        >
          {props.getValue()[0]}
        </p>
      ),
    }),
    ch.accessor((c) => c.phone_number, {
      id: "phone_number",
      header: "Phone Number",
    }),
    ch.accessor((c) => moment(c.created_at), {
      id: "created_at",
      cell: (c) => c.getValue().fromNow(),
      enableColumnFilter: true,
      header: "Date Entered",
    }),
    ch.accessor((c) => c, {
      id: "status",
      header: "Status",
      filterFn: (row, id, filterValue) => {
        if (!filterValue) return true
        const r = row.getValue(id) as Case
        return !r.closed_at
      },
      cell: (props) => (
        <ActionSelector
          data={props.getValue()}
          idx={props.row.index * 2 + 21}
          key={props.getValue().id}
        />
      ),
    }),
  ]
  const [cases, setCases] = useState<Case[]>([])
  const { toast } = useToast()

  const table = useReactTable({
    data: cases,
    columns,
    defaultColumn: {
      size: 0,
    },
    state: {
      columnFilters
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTableRowElement>,
    id: string,
    idx: number
  ) => {
    if (e.target !== e.currentTarget) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      e.stopPropagation()
      openModal(id)
    } else if (
      e.key === "ArrowDown" &&
      idx != table.getRowModel().rows.length - 1
    ) {
      e.preventDefault()
      e.stopPropagation()
      const next = e.currentTarget.nextSibling as HTMLTableRowElement | null
      next?.focus()
    } else if (e.key === "ArrowUp" && idx != 0) {
      e.preventDefault()
      e.stopPropagation()
      const prev = e.currentTarget.previousSibling as HTMLTableRowElement | null
      prev?.focus()
    }
  }

  const close = useCallback(() => setModalOpen(false), [])

  const toggleHideClosed = (() => {
    if (columnFilters.findIndex((f) => f.id === "status") === -1) {
      table.setColumnFilters((prev) => [...prev, {id: "status", value: !hideClosed}])
    }
    else {
      table.setColumnFilters((prev) => prev.map((f) => f.id === "status" ? {...f, value: !hideClosed} : f))
    }
    setHideClosed((prev) => !prev)
  })

  return (
    <div className="w-full">
      <CaseModal open={modalOpen} close={close} data={modalCase} />
      <div className="flex w-full flex-row justify-end pb-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="hide-closed" onClick={() => toggleHideClosed()} checked={hideClosed} />
            <label
              htmlFor="hide-closed"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Hide Closed
            </label>
          </div>
        </div>
      <HorizontalScrollArea className="w-full max-w-full rounded-md border">
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
              table.getRowModel().rows.map((row, idx) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={(e) => {
                    window.getSelection()?.type != "Range" &&
                      e.currentTarget === e.target &&
                      openModal(row.original.id)
                  }}
                  tabIndex={idx * 2 + 20}
                  onKeyDown={(e) => handleKeyDown(e, row.original.id, idx)}
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
                  No cases found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </HorizontalScrollArea>
    </div>
  )
}
