import { useEffect, useMemo, useRef, useState } from "react"
import { PostgrestError } from "@supabase/supabase-js"
import FocusTrap from "focus-trap-react"
import { ChevronRight } from "lucide-react"

import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

import { Case } from "./cases-table"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { useToast } from "./ui/use-toast"

interface ActionSelectorProps {
  data: Case
  idx: number
}

/*
  closed: closed ticket
  pending: a ticket is needed and is not there. can add a ticket, set as not needed, or just close
  preclose: either a ticket is not needed or a ticket is needed and is there. can set a ticket as needed, add a ticket, or close

*/

export const ActionSelector = ({ data, idx }: ActionSelectorProps) => {
  const [loading, setLoading] = useState(false)
  const [addingTicket, setAddingTicket] = useState(false)
  const [linkFocused, setLinkFocused] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<string>("")
  const [link, setLink] = useState<string>("")

  const { toast } = useToast()
  const status = useMemo(() => {
    if (data.closed_at) {
      return "closed" as const
    }
    if (data.ticket_needed && !data.ticket_link) {
      return "needs-ticket" as const
    }
    if (data.ticket_needed && data.ticket_link) {
      return "has-ticket" as const
    }
    return "no-ticket" as const
  }, [data])

  const messages = {
    closed: "Closed",
    "needs-ticket": "Needs Ticket",
    "has-ticket": "Ready to Close",
    "no-ticket": "No Ticket Needed",
  }

  const items = useMemo(() => {
    if (status === "closed") {
      return [{ value: "reopen" as const, label: "Reopen" }]
    } else if (status === "needs-ticket") {
      return [
        { value: "ticket" as const, label: "Add Ticket" },
        { value: "no-ticket" as const, label: "No Ticket Needed" },
        { value: "close-dialog" as const, label: "Close" },
      ]
    } else if (status === "no-ticket") {
      return [
        { value: "needs-ticket" as const, label: "Needs Ticket" },
        { value: "close" as const, label: "Close" },
      ]
    }
    return [
      { value: "edit-ticket" as const, label: "Edit Ticket" },
      { value: "no-ticket" as const, label: "No Ticket Needed" },
      { value: "close" as const, label: "Close" },
    ]
  }, [status])

  const onChange = async (value: string) => {
    setLoading(true)
    let error: PostgrestError | null = null
    if (value === "reopen") {
      const req = await supabase
        .from("cases")
        .update({ closed_at: null })
        .match({ id: data.id })
      error = req.error
      setLoading(false)
    } else if (value === "close") {
      const req = await supabase
        .from("cases")
        .update({ closed_at: new Date().toISOString() })
        .match({ id: data.id })
      error = req.error
      setLoading(false)
    } else if (value === "close-dialog") {
      setModalType("close")
      setModalOpen(true)
    } else if (value === "no-ticket") {
      const req = await supabase
        .from("cases")
        .update({ ticket_needed: false })
        .match({ id: data.id })
      error = req.error
      setLoading(false)
    } else if (value === "needs-ticket") {
      const req = await supabase
        .from("cases")
        .update({ ticket_needed: true })
        .match({ id: data.id })
      error = req.error
    } else if (value === "ticket") {
      setLoading(false)
      setAddingTicket(true)
    }
    else if (value === "edit-ticket") {
      setLoading(false)
      setAddingTicket(true)
      setLink(data.ticket_link ?? "")
    }
    if (error) {
      toast({
        title: "Error updating status",
        description: error?.message ?? "Internal server error",
        variant: "destructive",
      })
    }
  }

  const addTicket = async () => {
    console.log("Adding ticket...")
    if (!link) return
    setAddingTicket(false)
    setLoading(true)
    const { error } = await supabase
      .from("cases")
      .update({ ticket_link: link })
      .match({ id: data.id })
    if (error) {
      toast({
        title: "Error adding ticket",
        description: error.message,
        variant: "destructive",
      })
    }
    setLink("")
    setLoading(false)
  }

  useEffect(() => {
    if (!linkFocused && addingTicket) {
      const timeout = setTimeout(() => {
        setLink('')
        setAddingTicket(false)
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [linkFocused, addingTicket])

  if (addingTicket) {
    return (
      <div
        className="group flex h-10 w-[14rem] flex-row rounded-md border border-input bg-background px-3 py-2 ring-2 ring-ring"
        onKeyDown={(e) => {
          e.key === "Enter" && addTicket()
        }}
      >
        <input
          className="flex w-full rounded-md border-none bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none"
          placeholder="Ticket link"
          autoFocus={true}
          onChange={(e) => setLink(e.target.value)}
          value={link}
          onFocus={() => setLinkFocused(true)}
          onBlurCapture={() => setLinkFocused(false)}
        />
        <button onClick={() => addTicket()}>
          <ChevronRight className="h-4 w-4 opacity-50" />
        </button>
      </div>
    )
  }

  return (
    <>
      <Dialog
        open={modalOpen}
        onOpenChange={(c) => {
          setModalOpen(c)
          if (!c) setLoading(c)
        }}
      >
        {modalType === "close" && (
          <DialogContent>
            <DialogTitle>Are You Sure?</DialogTitle>
            <DialogDescription>
              You are closing a case that still needs a ticket. If this case
              does not need a ticket, please mark it as so before closing.
            </DialogDescription>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => {
                  setModalOpen(false)
                  setLoading(false)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={async () => {
                  const { error } = await supabase
                    .from("cases")
                    .update({ closed_at: new Date().toISOString() })
                    .match({ id: data.id })
                  setModalOpen(false)

                  if (error) {
                    toast({
                      title: "Error closing status",
                      description: error.message,
                      variant: "destructive",
                    })
                  }
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      {loading && (
        <div role="status" className="mx-auto">
          <svg
            aria-hidden="true"
            className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      )}
      {!loading && (
        <Select onValueChange={onChange}>
          <SelectTrigger tabIndex={idx} className="w-[14rem]">
            <SelectValue placeholder={messages[status]} />
          </SelectTrigger>
          <SelectContent>
            {items.map((i) => (
              <SelectItem key={i.value} value={i.value}>
                {i.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </>
  )
}
