import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            "flex h-11 w-full items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white shadow-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-studio-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50",
            className
        )}
        {...props}>
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-70" />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
));
SelectTrigger.displayName =
    SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            className={cn(
                "relative z-50 min-w-[12rem] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 text-white shadow-lg",
                position === "popper"
                    ? "translate-y-1"
                    : "",
                className
            )}
            position={position}
            {...props}>
            <SelectPrimitive.Viewport className="p-2">
                {children}
            </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
));
SelectContent.displayName =
    SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Label
        ref={ref}
        className={cn("px-2 py-2 text-xs text-white/60", className)}
        {...props}
    />
));
SelectLabel.displayName =
    SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex w-full cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm outline-none focus:bg-white/10 focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            className
        )}
        {...props}>
        <SelectPrimitive.ItemText className="text-left">
            {children}
        </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
));
SelectItem.displayName =
    SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-white/10", className)}
        {...props}
    />
));
SelectSeparator.displayName =
    SelectPrimitive.Separator.displayName;

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
};
