"use client"

import { useMemo } from "react"
import { X } from "lucide-react"
import moment from "moment"

import { cn } from "@/lib/utils"

import type { Case } from "./cases-table"
import { Button } from "./ui/button"
import FocusTrap from "focus-trap-react"

interface CaseModalProps {
  open: boolean
  close: () => void
  data: Case | null
}

export const CaseModal = ({ open, close, data }: CaseModalProps) => {
  const date = useMemo(
    () =>
      data ? moment(data.created_at).format("MMMM Do YYYY, h:mm:ss a") : "",
    [data]
  )

  return (
    <FocusTrap active={open}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-screen bg-card/0 fade-in-60 fade-out-0 sm:top-[calc(4rem+1px)] sm:h-[calc(100vh-4rem-1px)]",
          "backdrop-blur-sm",
          open ? "flex" : "hidden"
        )}
        onKeyDown={(e) => e.key === "Escape" && close()}
      >
        <div className="container" onClick={() => close()}>
          <section
            className="mx-auto mt-4 flex flex-col rounded-lg border-4 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-row items-start justify-between">
              <div className="flex flex-col items-baseline sm:flex-row sm:gap-2">
                <p className="hyphens-auto text-3xl font-bold sm:text-4xl">
                  {data?.name ?? "Customer"}
                </p>
                <p className="h-full text-base font-semibold text-muted-foreground ">
                  {data?.username}
                </p>
              </div>
              <button className="mt-1" onClick={() => close()} >
                <X className="h-5 w-5 sm:h-8 sm:w-8" />
              </button>
            </div>
            <p className="mt-2 text-base text-muted-foreground">Summary</p>
            <p>{data?.summary}</p>
            <p className="mt-2 text-base text-muted-foreground">Date Created</p>
            <p>{date}</p>
          </section>
        </div>
      </aside>
    </FocusTrap>
  )
}
