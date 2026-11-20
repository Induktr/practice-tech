import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/ui/tooltip";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-4xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)]",
        outline:
          "border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] aria-expanded:bg-[var(--bg-surface-hover)]",
        secondary:
          "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] border border-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-hover)] aria-expanded:bg-[var(--btn-secondary-bg)]",
        ghost:
          "text-[var(--text-secondary)] hover:bg-[var(--btn-ghost-hover)] hover:text-[var(--text-primary)] aria-expanded:bg-[var(--btn-ghost-active)] aria-expanded:text-[var(--text-primary)]",
        destructive:
          "bg-[var(--accent-rose)]/10 text-[var(--accent-rose)] border border-[var(--accent-rose)]/20 hover:bg-[var(--accent-rose)]/20 focus-visible:border-[var(--accent-rose)]",
        link: "text-[var(--text-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  tooltip,
  tooltipSide = "top",
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    tooltip?: React.ReactNode;
    tooltipSide?: "top" | "bottom" | "left" | "right";
  }) {
  const buttonElement = (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger render={buttonElement} />
        <TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return buttonElement;
}

export { Button, buttonVariants };
