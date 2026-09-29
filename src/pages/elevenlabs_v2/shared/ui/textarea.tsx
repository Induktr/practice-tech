import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full resize-none bg-transparent text-base outline-none placeholder:text-muted-foreground p-3",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
