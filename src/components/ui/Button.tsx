import { ButtonHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "outline";
    size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={twMerge(
                    clsx(
                        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                        {
                            "bg-white text-black hover:bg-neutral-200": variant === "primary",
                            "bg-neutral-800 text-white hover:bg-neutral-700": variant === "secondary",
                            "hover:bg-white/10 text-white": variant === "ghost",
                            "border border-white/20 bg-transparent text-white hover:bg-white/10": variant === "outline",
                            "h-8 px-3 text-xs": size === "sm",
                            "h-10 px-4 text-sm": size === "md",
                            "h-12 px-6 text-base": size === "lg",
                        },
                        className
                    )
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export { Button };
