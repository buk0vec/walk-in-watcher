"use client"

import { useState, useEffect } from "react"
import { Database } from "@/supabase/db_types"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { supabase } from "@/lib/supabase"

interface AgentSelectorProps {
  data: Database["public"]["Tables"]["cases"]["Row"]
}

export function AgentSelector({ data }: AgentSelectorProps) {
  const [agents, setAgents] = useState<
    Database["public"]["Tables"]["agents"]["Row"][]
  >([])
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(data.assignee)

  const getAgents = async () => {
    const { data, error } = await supabase.from("agents").select("*")
    if (error) {
      console.error(error)
      return
    }
    setAgents(data)
  }

  useEffect(() => {
    getAgents()
  })

  const setAgent = async (agent: string) => {
    const { error } = await supabase
      .from("cases")
      .update({ assignee: agent })
      .match({ id: data.id })
    if (error) {
      console.error(error)
      return
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? agents.find((framework) => framework.username === value)?.username
            : "Unassigned"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search agents..." />
          <CommandEmpty>No agent found.</CommandEmpty>
          <CommandGroup>
            {agents.map((agent) => (
              <CommandItem
                key={agent.username}
                onSelect={(currentValue) => {
                  setAgent(currentValue === value ? "" : currentValue)
                  setValue(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === agent.username ? "opacity-100" : "opacity-0"
                  )}
                />
                {agent.username}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
