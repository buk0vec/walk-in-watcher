import { SupportForm } from "@/components/support-form"

export default function Page() {
  return (
    <main className="mx-8 mt-4 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
        ITS Walk-in Support
      </h1>
      <SupportForm />
    </main>
  )
}
