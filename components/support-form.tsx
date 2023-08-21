"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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

const phoneNumberSchema = z
  .union([z.string().min(10).max(10), z.string().length(0)])
  .optional()
  .transform((e) => (e === "" ? undefined : e))

const formSchema = z.object({
  email: z
    .string()
    .regex(/^[a-zA-Z0-9+_.-]*$/)
    .min(3)
    .max(255),
  summary: z.string(),
  phone: phoneNumberSchema,
})
export const SupportForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      summary: "",
      phone: "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-2xl space-y-8"
      >
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
                  <p className="text-sm text-muted-foreground">@calpoly.edu</p>
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
