import { useEffect, useState } from "react"
import Link from "next/link"
import { Database } from "@/supabase/db_types"

import { siteConfig } from "@/config/site"
import { supabase } from "@/lib/supabase"
import { buttonVariants } from "@/components/ui/button"
import { CasesTable } from "@/components/cases-table"

export default function IndexPage() {

  return (
    <section className="container flex flex-col gap-6 pb-8 pt-6 md:py-10">
      <div className="flex flex-col items-center gap-2">
        {/* <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Cal Poly ITS Walk
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Accessible and customizable components that you can copy and paste
          into your apps. Free. Open Source. And Next.js 13 Ready.
        </p> */}
        <CasesTable />
      </div>
    </section>
  )
}
