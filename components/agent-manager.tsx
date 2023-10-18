"use client"

import { useEffect, useState } from "react"
import { Database } from "@/supabase/db_types"

import { supabase } from "@/lib/supabase"

import { Button } from "./ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Input } from "./ui/input"
import { useToast } from "./ui/use-toast"

export const AgentManager = () => {
  const { toast } = useToast()
  const [confirming, setConfirming] = useState<string | null>(null)
  const [agents, setAgents] = useState<
    Database["public"]["Tables"]["agents"]["Row"][]
  >([])

  const [newAgentName, setNewAgentName] = useState("")
  const [newAgentUsername, setNewAgentUsername] = useState("")

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

  const createAgent = async () => {
    if (!newAgentName || !newAgentUsername) {
      toast({ title: "Please fill out all fields", variant: "destructive" })
      return
    }
    const { data, error } = await supabase
      .from("agents")
      .upsert({
        name: newAgentName,
        username: newAgentUsername,
      })
      .select("*")
    if (error) {
      console.error(error)
      return
    }
    setAgents((old) => [...old, data[0]])
    setNewAgentName("")
    setNewAgentUsername("")
  }

  useEffect(() => {
    if (confirming) {
      const t = setTimeout(() => setConfirming(null), 2000)
      return () => clearTimeout(t)
    }
  }, [confirming])

  const deleteAgent = async (id: string) => {
    if (confirming !== id) {
      setConfirming(id)
      return
    } else {
      setConfirming(null)
    }
    const { data, error } = await supabase
      .from("agents")
      .delete()
      .match({ id })
      .select("*")
    if (error) {
      console.error(error)
      return
    }
    setAgents((old) => old.filter((v) => v.id !== id))
  }

  return (
    <div className="my-2">
      {agents.map((v, i) => {
        return (
          <Card key={i} className="my-2">
            <CardHeader>
              <CardTitle>{v.name}</CardTitle>
              <CardDescription>{v.username}</CardDescription>
            </CardHeader>
            <CardFooter className="gap-2">
              <Button variant={"destructive"} onClick={() => deleteAgent(v.id)}>
                {confirming === v.id ? "Click again to delete" : "Delete"}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
      <div className="mt-2 flex flex-row gap-2">
        <Input
          placeholder="mustymustang"
          className="max-w-[600px]"
          value={newAgentUsername}
          onChange={(e) => setNewAgentUsername(e.target.value)}
        />
        <Input
          placeholder="Musty Mustang"
          className="max-w-[600px]"
          value={newAgentName}
          onChange={(e) => setNewAgentName(e.target.value)}
        />
        <Button className="grow" onClick={() => createAgent()}>
          Add
        </Button>
      </div>
    </div>
  )
}
