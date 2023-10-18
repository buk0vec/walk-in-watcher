import moment from "moment"
import { DateRange } from "react-day-picker"

import { Case } from "@/components/cases-table"

const caseToRow = (ticket: Case) => [
  `"${ticket.summary?.replace(/"/g, '""')}"` /* Escape + quote */,
  ticket.assignee ?? "jmoir@calpoly.edu",
  ticket.username.includes("@")
    ? ticket.username
    : `${ticket.username}@calpoly.edu`,
  "General Support",
  30,
  "" /* No description */,
  "Resolved",
  ticket.component ?? "Computer Support & Consultation",
  "walk-in",
  "Zone C",
  "Service Desk",
]

type DownloadCasesOptions = {
  useDateRange: boolean
  range: DateRange | undefined
  removeClosed: boolean
  removeTicketed: boolean
  removeNoTicketNeeded: boolean
}

export const exportCases = (
  tickets: Case[],
  {
    useDateRange,
    range,
    removeClosed,
    removeTicketed,
    removeNoTicketNeeded,
  }: DownloadCasesOptions
) => {
  const rows = [
    [
      "Summary",
      "Assignee",
      "Reporter",
      "Issue Type",
      "Request Type",
      "Description",
      "Status",
      "Component",
      "labels",
      "Support Zone",
      "Assigned Team",
    ],
    ...tickets
      .filter((t) => {
        if (useDateRange) {
          // we should only include tickets made on or after the start date and on or before the end date
          const ticketDate = moment(t.created_at)
          const startDate = moment(range?.from)
          const endDate = moment(range?.to)
          return (
            ticketDate.isSameOrAfter(startDate, "day") &&
            ticketDate.isSameOrBefore(endDate, "day")
          )
        }
        return true
      })
      .filter((t) => {
        if (removeClosed && t.closed_at !== null) {
          return false
        }
        if (
          removeTicketed &&
          (t.ticket_link)
        ) {
          return false
        }
        if (removeNoTicketNeeded && t.ticket_needed === false) {
          return false
        }
        return true
      })
      .map(caseToRow),
  ]

  return rows.map((e) => e.join(",")).join("\n")
}

export const downloadCases = async (
  tickets: Case[],
  options: DownloadCasesOptions
) => {
  if (options.useDateRange && (options.range?.from === undefined || options.range?.to === undefined)) {
    throw new Error("Date range is malformed")
  }
  const blob = new Blob([exportCases(tickets, options)], { type: "text/csv" })
  const a = document.createElement("a")
  a.style.cssText = "display: none"
  const url = window.URL.createObjectURL(blob)
  a.href = url
  a.download = `cases-${moment(new Date()).format("YYYY-MM-DD")}.csv`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
}
