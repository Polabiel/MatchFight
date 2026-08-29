import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";

import { cn } from "@acme/ui";

export const buttonVariants = cva(
  "text-label-bold focus-visible:ring-ring inline-flex items-center justify-center rounded-none border-2 font-sans transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background border-foreground hover:bg-background hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground border-destructive hover:bg-foreground hover:border-foreground",
        outline:
          "bg-background text-foreground border-foreground hover:bg-foreground hover:text-background",
        secondary:
          "bg-muted text-foreground border-border hover:bg-foreground hover:text-background hover:border-foreground",
        ghost:
          "text-foreground hover:bg-muted border-transparent bg-transparent",
        link: "text-primary border-transparent bg-transparent underline-offset-4 hover:underline",
        action:
          "bg-primary text-primary-foreground border-primary hover:bg-foreground hover:border-foreground",
      },
      size: {
        default: "h-12 px-6",
        sm: "text-label-sm h-10 px-4",
        lg: "h-14 px-8",
        icon: "size-12",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? SlotPrimitive.Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
