"use client"

import { useCallback, useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { set, useForm } from "react-hook-form"
import * as z from "zod"

import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

const phoneNumberSchema = z
  .union([z.string().min(10).max(10), z.string().length(0)])
  .optional()
  .transform((e) => (e === "" ? undefined : e))

const formSchema = z.object({
  name: z.string().min(1),
  email: z
    .string()
    .regex(/^[a-zA-Z0-9+_.-]*$/)
    .min(3)
    .max(255),
  summary: z.string(),
  phone: phoneNumberSchema,
})
export const SupportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      summary: "",
      phone: "",
      name: "",
    },
  })
  const { toast } = useToast()

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    const { error } = await supabase.from("cases").insert({
      name: values.name,
      username: values.email,
      summary: values.summary,
      phone_number: values.phone,
    })
    if (error) {
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }
    setSuccess(true)
    setIsSubmitting(false)
  }

  const reset = useCallback(() => {
    form.reset()
    setSuccess(false)
    console.log("Reset")
  }, [form])

  /* Return to form after 20 seconds */
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => {
        if (success) {
          reset()
        }
      }, 20000)
      return () => clearTimeout(t)
    }
  }, [success, reset])

  if (!success) {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-2xl space-y-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    className="max-w-2xl"
                    placeholder="Musty Mustang"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="flex flex-row items-center gap-1">
                    <Input
                      className="max-w-2xl"
                      placeholder="mustymustang"
                      {...field}
                    />
                    <p className="text-sm text-muted-foreground">
                      @calpoly.edu
                    </p>
                  </div>
                </FormControl>
                <FormDescription>
                  The first part of your Cal Poly email address
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Summary</FormLabel>
                <FormControl>
                  <Input
                    className="max-w-2xl"
                    placeholder="I need help with..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>A brief summary of your issue</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    className="max-w-2xl"
                    placeholder="8057565555"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Your phone number</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    )
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <h2 className="text-xl font-semibold tracking-tighter md:text-4xl">
        Thank you!
      </h2>
      <p className="text-lg text-center">
        We will assist you as soon as possible
      </p>
      <Button onClick={() => reset()}>Go back</Button>
    </div>
  )
}
