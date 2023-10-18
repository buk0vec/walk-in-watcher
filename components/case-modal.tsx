"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import FocusTrap from "focus-trap-react"
import moment from "moment"

import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

import { AgentSelector } from "./agent-selector"
import type { Case } from "./cases-table"
import { ComponentSelector } from "./component-selector"
import {
  EditableBooleanField,
  EditableField,
  EditableFieldValue,
  EditableFieldsDefinition,
  EditableTextField,
  useEditableFields,
} from "./editable-field"
import { phoneNumberSchema } from "./support-form"
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
  const [subscription, setSubscription] = useState<Case | null>(data)

  const liveData = useMemo(
    () => subscription ?? data ?? undefined,
    [subscription, data]
  )

  const f = useMemo(() => {
    return {
      summary: {
        value: liveData?.summary ?? "",
        onChange: async (value) => {
          console.log("Change submit")
          const { error } = await supabase
            .from("cases")
            .update({ summary: value })
            .match({ id: liveData?.id })
        },
      } satisfies EditableFieldValue,
      email: {
        value: liveData?.username ?? "",
        onChange: async (value) => {
          console.log("Change submit")
          const { error } = await supabase
            .from("cases")
            .update({ username: value })
            .match({ id: liveData?.id })
        },
      } satisfies EditableFieldValue,
      phone: {
        value: liveData?.phone_number ?? "",
        onChange: async (value) => {
          console.log("Change submit")
          const { error } = await supabase
            .from("cases")
            .update({ phone_number: value })
            .match({ id: liveData?.id })
        },
        constraint: phoneNumberSchema,
      } satisfies EditableFieldValue,
      needsTicket: {
        value: liveData?.ticket_needed?.toString() ?? "false",
        onChange: async (value) => {
          const { error } = await supabase
            .from("cases")
            .update({ ticket_needed: value === "true" })
            .match({ id: liveData?.id })
        },
      } satisfies EditableFieldValue,
      ticketLink: {
        value: liveData?.ticket_link ?? "",
        onChange: async (value) => {
          const { error } = await supabase
            .from("cases")
            .update({ ticket_link: value })
            .match({ id: liveData?.id })
        },
      } satisfies EditableFieldValue,
      closed: {
        value: liveData?.closed_at ? "true" : "false",
        onChange: async (value) => {
          const { error } = await supabase
            .from("cases")
            .update({
              closed_at: value === "true" ? new Date().toISOString() : null,
            })
            .match({ id: liveData?.id })
        },
      } satisfies EditableFieldValue,
    } satisfies EditableFieldsDefinition
  }, [
    liveData?.id,
    liveData?.summary,
    liveData?.username,
    liveData?.phone_number,
    liveData?.ticket_needed,
    liveData?.ticket_link,
    liveData?.closed_at,
  ])

  const fields = useEditableFields(data?.id ?? "no-id", f)

  const date = useMemo(
    () =>
      liveData?.created_at
        ? moment(liveData.created_at).format("MMMM Do YYYY, h:mm:ss a")
        : "",
    [liveData?.created_at]
  )

  const closedDate = useMemo(
    () =>
      liveData?.closed_at
        ? moment(liveData.closed_at).format("MMMM Do YYYY, h:mm:ss a")
        : "N/A",
    [liveData?.closed_at]
  )

  const escapeCheck = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close()
      }
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

  useEffect(() => {
    if (!data?.id || !open) return
    console.log(`subsribing with id=eq.${data?.id}`)
    const channel = supabase
      .channel("table-filter-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "cases",
          filter: `id=eq.${data?.id}`,
        },
        (payload) => {
          console.log(payload.new)
          setSubscription(payload.new as Case)
        }
      )
      .subscribe()
    return () => {
      console.log(`Unsub with id=eq.${data?.id}`)
      setSubscription(null)
      channel?.unsubscribe()
    }
  }, [data?.id, open])

  return (
    <FocusTrap
      paused={true}
      active={false}
      focusTrapOptions={{ escapeDeactivates: false }}
    >
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
                <div>
                  <CardTitle>{liveData?.name ?? "Customer"}</CardTitle>{" "}
                </div>
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
              <CardDescription>{liveData?.username}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
                <EditableTextField
                  label="Summary"
                  className="mt-2"
                  {...fields.dynamicFieldProps.summary}
                  {...fields.staticFieldProps.summary}
                />

                <div>
                  <EditableField
                    label="Email"
                    className="mt-2"
                    {...fields.dynamicFieldProps.email}
                    {...fields.staticFieldProps.email}
                  />
                </div>
                <div>
                  <p className="mt-2 text-base text-muted-foreground">
                    Date Created
                  </p>
                  <p>{date}</p>
                </div>
                <div>
                  <EditableField
                    label="Phone number"
                    className="mt-2"
                    {...fields.dynamicFieldProps.phone}
                    {...fields.staticFieldProps.phone}
                  />
                </div>
                <EditableBooleanField
                  label="Ticket Required"
                  className="mt-2"
                  inputClassName="ticket-required"
                  {...fields.dynamicFieldProps.needsTicket}
                  {...fields.staticFieldProps.needsTicket}
                />
                <EditableField
                  label="Ticket Link"
                  className="mt-2"
                  {...fields.dynamicFieldProps.ticketLink}
                  {...fields.staticFieldProps.ticketLink}
                />
                <EditableBooleanField
                  label="Closed"
                  className="mt-2"
                  {...fields.dynamicFieldProps.closed}
                  {...fields.staticFieldProps.closed}
                  inputClassName="closed"
                />
                <div>
                  <p className="mt-2 text-base text-muted-foreground">
                    Time Closed
                  </p>
                  <p>{closedDate}</p>
                </div>
                <div>
                  <p className="mt-2 text-base text-muted-foreground">
                    Component
                  </p>
                  {liveData && <ComponentSelector data={liveData} idx={0} />}
                </div>
                <div>
                  <p className="mt-2 text-base text-muted-foreground">
                    Assignee
                  </p>
                  {liveData && (
                    <AgentSelector data={liveData} key={liveData.id} />
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
