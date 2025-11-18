import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-60",
    {
        variants: {
            variant: {
                default:
                    "bg-studio-500 text-white shadow-glow hover:bg-studio-400",
                outline:
                    "border border-white/10 bg-white/5 text-white hover:bg-white/10",
                ghost: "text-white/80 hover:text-white hover:bg-white/10",
            },
            size: {
                default: "h-11 px-5",
                sm: "h-9 px-4 text-xs",
                lg: "h-12 px-6 text-base",
                icon: "h-11 w-11",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        { className, variant, size, asChild = false, ...props },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(
                    buttonVariants({ variant, size }),
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
