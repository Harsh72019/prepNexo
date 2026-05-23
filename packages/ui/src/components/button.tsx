import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_10px_30px_hsl(var(--primary)/0.24)] hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-[0_16px_38px_hsl(var(--primary)/0.34)]",
        secondary: "bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-secondary/88",
        destructive: "bg-destructive text-destructive-foreground shadow-[0_10px_28px_hsl(var(--destructive)/0.20)] hover:-translate-y-0.5 hover:bg-destructive/90",
        outline: "border border-border bg-background/70 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-muted",
        ghost: "hover:bg-muted hover:text-primary",
        link: "h-auto p-0 text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-5",
        icon: "size-10 p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    if (asChild) {
      return (
        <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props}>
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
