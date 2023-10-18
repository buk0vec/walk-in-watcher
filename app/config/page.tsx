import { AgentManager } from "@/components/agent-manager";

export default function ConfigPage() {
  return (
    <main className="mx-8 mt-4 flex flex-col">
      <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
        Config
      </h1>
      <h2 className="text-2xl font-extrabold leading-tight tracking-tighter md:text-3xl">
        Agents
      </h2>
      <AgentManager />
    </main>
  )
}
