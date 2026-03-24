import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-semibold tracking-wide whitespace-nowrap transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-calm-indigo/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-[#6366F1] to-calm-indigo text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),0_3px_10px_rgba(79,70,229,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.15),0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97] active:shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(0,0,0,0.1)]",
        destructive:
          "bg-gradient-to-b from-[#EF4444] to-[#DC2626] text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),0_3px_10px_rgba(220,38,38,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.15),0_6px_20px_rgba(220,38,38,0.4)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97] active:shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(0,0,0,0.1)] focus-visible:ring-destructive/30",
        outline:
          "border border-warm-border/80 bg-white text-warm-text shadow-[0_1px_2px_rgba(0,0,0,0.05),0_1px_1px_rgba(0,0,0,0.03)] hover:border-calm-indigo/40 hover:text-calm-indigo hover:bg-calm-indigo/[0.03] hover:shadow-[0_1px_3px_rgba(79,70,229,0.12),0_2px_6px_rgba(79,70,229,0.06)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97] active:bg-calm-indigo/[0.06]",
        secondary:
          "bg-calm-indigo/[0.07] text-calm-indigo border border-calm-indigo/[0.12] shadow-[0_1px_2px_rgba(79,70,229,0.06)] hover:bg-calm-indigo/[0.12] hover:border-calm-indigo/25 hover:shadow-[0_1px_4px_rgba(79,70,229,0.12)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97]",
        ghost:
          "text-warm-text hover:bg-warm-border/40 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04)] active:bg-warm-border/60 dark:hover:bg-accent/50",
        link: "text-calm-indigo underline-offset-4 hover:underline hover:text-calm-indigo/80",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-xl px-4 has-[>svg]:px-3",
        lg: "h-11 rounded-xl px-7 text-base has-[>svg]:px-5",
        icon: "size-10 rounded-xl",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-xl",
        "icon-lg": "size-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
