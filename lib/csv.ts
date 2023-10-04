import { Case } from "@/components/cases-table"
import moment from "moment"

const caseToRow = (ticket: Case) => ([
  `"${ticket.summary?.replace(/"/g, '""')}"`, /* Escape + quote */
  'jmoir@calpoly.edu', /* TODO: If assignee is selected, then change to whoever */
  ticket.username.includes('@') ? ticket.username : `${ticket.username}@calpoly.edu`,
  'General Support',
  30,
  '', /* No description */
  'Resolved',
  '', /* TODO: Fill in Component */
  'walk-in',
  'Zone C',
  'Service Desk',
])

export const exportCases = (tickets: Case[]) => {
  const rows = [[
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

  ], ...tickets.map(caseToRow)]

  return rows.map(e => e.join(",")).join("\n");
};

export const downloadCases = async (tickets: Case[]) => {
  console.log("Download..")
  const blob = new Blob([exportCases(tickets)], { type: 'text/csv' })
  const a = document.createElement('a')
  a.style.cssText = 'display: none';
  const url = window.URL.createObjectURL(blob)
  a.href = url;
  a.download = `cases-${moment(new Date()).format('YYYY-MM-DD')}.csv`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
}

