import { useCallback, useEffect, useMemo, useState } from "react"
import { ZodError } from "zod"

import { cn } from "@/lib/utils"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Textarea } from "./ui/textarea"
import { useToast } from "./ui/use-toast"

/*
  Editable field hook architecture:
  - pass in a record of fields with their live value and what to do when a new change is submitted
  - have an object that contains all the props of the editable fields
  - reset everything when the id changes
*/

type EditableFieldStaticPropNames =
  | "onChange"
  | "editing"
  | "setEditing"
  | "closeEditing"
  | "setEditingValue"
type EditableFieldStaticProps = Pick<
  EditableFieldProps,
  EditableFieldStaticPropNames
>
type EditableFieldDynamicProps = Omit<
  EditableFieldProps,
  EditableFieldStaticPropNames
>

interface EditableFieldProps {
  value: string
  onChange: (value: string) => void
  pClassName?: string
  inputClassName?: string
  className?: string
  label?: string
  setEditing: () => void
  editing: boolean
  closeEditing: () => void
  editingValue: string
  setEditingValue: (value: string) => void
  constraint?: Zod.ZodType
}

export type EditableFieldsDefinition<T extends object = {}> = {
  [K in keyof T]: EditableFieldValue
}

export interface EditableFieldValue {
  value: string
  onChange: (value: string) => void
  constraint?: Zod.ZodType
}

export const useEditableFields = <T extends object = {}>(
  id: string,
  fields: EditableFieldsDefinition<T>
) => {
  const [editing, setEditing] = useState(false)
  const [editingField, setEditingField] = useState<keyof T | null>(null)
  const { toast } = useToast()

  const [dynamicFieldProps, setDynamicFieldProps] = useState<
    Record<keyof T, EditableFieldDynamicProps>
  >(() => {
    const newStates = {} as Record<keyof T, EditableFieldDynamicProps>
    for (const i in fields) {
      newStates[i] = {
        value: fields[i].value,
        editingValue: fields[i].value,
      }
    }
    return newStates
  })

  useEffect(() => {
    setDynamicFieldProps((old) => {
      const newStates = { ...old }
      for (const i in fields) {
        newStates[i] = {
          value: fields[i].value,
          editingValue:
            fields[i].value === old[i].value
              ? old[i].editingValue
              : fields[i].value,
        }
      }
      // console.log(newStates)
      return newStates
    })
  }, [fields])

  /* Sets a field as the one that's currently being edited, which should close the others */
  const setEditingFieldWrapper = useCallback((field: keyof T) => {
    setEditingField(field)
    setEditing(true)
  }, [])

  /* Closes all fields */
  const closeEditing = useCallback(() => {
    setEditing(false)
    setEditingField(null)
  }, [])

  const staticFieldProps = useMemo(() => {
    const props = {} as Record<keyof T, EditableFieldStaticProps>
    for (const id in fields) {
      props[id] = {
        onChange: (s) => {
          if (fields[id] && fields[id].constraint !== undefined) {
            const result = fields[id].constraint?.safeParse(s)
            if (!result?.success) {
              toast({
                title: "Invalid input",
                description:
                  (JSON.parse(result?.error.message ?? "[]") as ZodError[])[0]
                    .message ?? "Invalid input",
                variant: "destructive",
              })
              setDynamicFieldProps((old) => ({
                ...old,
                [id]: { ...old[id], editingValue: old[id].value },
              }))
              return
            }
          }
          fields[id].onChange(s)
        },
        editing: editing && editingField === id,
        setEditing: () => setEditingFieldWrapper(id),
        closeEditing,
        setEditingValue: (value: string) => {
          setDynamicFieldProps((old) => ({
            ...old,
            [id]: { ...old[id], editingValue: value },
          }))
        },
      }
    }
    return props
  }, [fields, setEditingFieldWrapper, closeEditing, editing, editingField])

  const resetEditing = () => {
    setEditing(false)
    setEditingField(null)
    setDynamicFieldProps(() => {
      const newStates = {} as Record<keyof T, EditableFieldDynamicProps>
      for (const i in fields) {
        newStates[i] = {
          value: fields[i].value,
          editingValue: fields[i].value,
        }
      }
      return newStates
    })
  }

  return {
    editing,
    setEditing,
    editingField,
    resetEditing,
    setEditingField: setEditingFieldWrapper,
    dynamicFieldProps,
    staticFieldProps,
  }
}

export const EditableField = ({
  value,
  onChange,
  pClassName,
  inputClassName,
  label,
  className,
  editing,
  setEditing,
  closeEditing,
  editingValue,
  setEditingValue,
}: EditableFieldProps) => {
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused && editing) {
      const timeout = setTimeout(() => {
        closeEditing()
      }, 4000)
      return () => clearTimeout(timeout)
    }
  }, [focused, editing, closeEditing])

  return (
    <div
      className={cn(
        !editing ? "cursor-pointer rounded-md hover:bg-accent" : undefined,
        className
      )}
      onClick={(e) =>
        !editing && window.getSelection()?.type != "Range" && setEditing()
      }
    >
      {label && <p className="text-base text-muted-foreground">{label}</p>}
      {editing && (
        <>
          <Input
            value={editingValue}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(v) => setEditingValue(v.target.value)}
            autoFocus={true}
          />
          <div className="mt-2 flex flex-row gap-2">
            <Button
              onClick={() => {
                closeEditing()
              }}
              variant="ghost"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                closeEditing()
                onChange(editingValue)
              }}
              variant="ghost"
              size="sm"
              className="border border-input"
            >
              Edit
            </Button>
          </div>
        </>
      )}
      {!editing && <p className={cn(pClassName)}>{value}</p>}
    </div>
  )
}

export const EditableTextField = ({
  value,
  onChange,
  pClassName,
  inputClassName,
  label,
  className,
  editing,
  setEditing,
  closeEditing,
  editingValue,
  setEditingValue,
}: EditableFieldProps) => {
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused && editing) {
      const timeout = setTimeout(() => {
        closeEditing()
      }, 4000)
      return () => clearTimeout(timeout)
    }
  }, [focused, editing, closeEditing])

  return (
    <div
      className={cn(
        !editing ? "cursor-pointer rounded-md hover:bg-accent" : undefined,
        className
      )}
      onClick={(e) =>
        !editing && window.getSelection()?.type != "Range" && setEditing()
      }
    >
      {label && <p className="text-base text-muted-foreground">{label}</p>}
      {editing && (
        <>
          <Textarea
            value={editingValue}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(v) => setEditingValue(v.target.value)}
            autoFocus={true}
          />
          <div className="mt-2 flex flex-row gap-2">
            <Button
              onClick={() => {
                closeEditing()
              }}
              variant="ghost"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                closeEditing()
                onChange(editingValue)
              }}
              variant="ghost"
              size="sm"
              className="border border-input"
            >
              Edit
            </Button>
          </div>
        </>
      )}
      {!editing && <p className={cn(pClassName)}>{value}</p>}
    </div>
  )
}

export const EditableBooleanField = ({
  value,
  onChange,
  pClassName,
  inputClassName,
  label,
  className,
  editing,
  setEditing,
  closeEditing,
  editingValue,
  setEditingValue,
}: EditableFieldProps) => {
  const [focused, setFocused] = useState(false)

  const shownValue = useMemo(() => {
    if (value === "true") return "Yes"
    if (value === "false") return "No"
    return "Unknown"
  }, [value])

  useEffect(() => {
    if (!focused && editing) {
      const timeout = setTimeout(() => {
        closeEditing()
      }, 4000)
      return () => clearTimeout(timeout)
    }
  }, [focused, editing, closeEditing])

  return (
    <div
      className={cn(
        !editing ? "cursor-pointer rounded-md hover:bg-accent" : undefined,
        className
      )}
      onClick={(e) =>
        !editing && window.getSelection()?.type != "Range" && setEditing()
      }
    >
      {label && <p className="text-base text-muted-foreground">{label}</p>}
      {editing && (
        <>
          {/* <Textarea
            value={editingValue}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(v) => setEditingValue(v.target.value)}
            autoFocus={true}
          /> */}
          <div className="flex flex-row gap-2 items-center mt-2">
          <Switch
            checked={editingValue === "true"}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onCheckedChange={(v) => setEditingValue(v.toString())}
            id={inputClassName}
          > </Switch>
          <Label htmlFor={inputClassName}>{editingValue === "true" ? "Yes" : "No"}</Label>
          </div>
          <div className="mt-2 flex flex-row gap-2">
            <Button
              onClick={() => {
                closeEditing()
              }}
              variant="ghost"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                closeEditing()
                onChange(editingValue)
              }}
              variant="ghost"
              size="sm"
              className="border border-input"
            >
              Edit
            </Button>
          </div>
        </>
      )}
      {!editing && <p className={cn(pClassName)}>{shownValue}</p>}
    </div>
  )
}
