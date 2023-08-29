"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import FocusTrap from "focus-trap-react"
import moment from "moment"

import { cn } from "@/lib/utils"

import type { Case } from "./cases-table"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"

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

  const escapeCheck = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    },
    [close]
  )

  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", escapeCheck)
    }
    return () => {
      window.removeEventListener("keydown", escapeCheck)
    }
  }, [open, escapeCheck])

  return (
    <FocusTrap active={open} focusTrapOptions={{ escapeDeactivates: false }}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-screen bg-[#154734]/0 fade-in-0 fade-out-0",
          "backdrop-blur-sm",
          open ? "flex" : "hidden"
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
          return true
        }}
      >
        <div className="container mt-[5.5rem] h-fit md:mt-[6.5rem]">
          <Card className=" translate-x-0 translate-y-0">
            <CardHeader>
              <div className="flex min-w-full flex-row items-start justify-between">
                <CardTitle>{data?.name ?? "Customer"}</CardTitle>{" "}
                <p
                  className="cursor-pointer text-muted-foreground underline underline-offset-2 hover:opacity-50"
                  tabIndex={0}
                  onClick={() => close()}
                  onKeyDown={({ key, currentTarget, target }) => {
                    if (
                      (key === "Enter" || key === " ") &&
                      currentTarget === target
                    ) {
                      close()
                    }
                    return true
                  }}
                >
                  Close
                </p>
              </div>
              <CardDescription>{data?.username}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
                <div>
                  <p className="mt-2 text-base text-muted-foreground">
                    Summary
                  </p>
                  <p>{data?.summary}</p>
                </div>

                <div>
                  <p className="mt-2 text-base text-muted-foreground">Email</p>
                  <p>{`${data?.username ?? ""}${
                    data?.username.includes("@") ? "" : "@calpoly.edu"
                  }`}</p>
                </div>
                <div>
                  <p className="mt-2 text-base text-muted-foreground">
                    Date Created
                  </p>
                  <p>{date}</p>
                </div>
                <div>
                  <p className="mt-2 text-base text-muted-foreground">
                    Phone Number
                  </p>
                  <p>{data?.phone_number ?? "N/A"}</p>
                </div>
                <div>
                  <p className="mt-2 text-base text-muted-foreground">
                    Ticket Required
                  </p>
                  <p>{data?.ticket_needed ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="mt-2 text-base text-muted-foreground">
                    Ticket Link
                  </p>
                  {data?.ticket_link ? (
                    <a href={data?.ticket_link}>{data.ticket_link}</a>
                  ) : (
                    <p>N/A</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>
    </FocusTrap>
  )
}
