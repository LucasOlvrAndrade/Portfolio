"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const gradientButtonVariants = cva(
  [
    "gradient-button",
    "inline-flex items-center justify-center gap-2",
    // `rounded-xl` (12px) em vez do `rounded-[11px]` original: 11 é número
    // mágico de outro projeto e furava a escala de raios daqui (8/12px).
    "rounded-xl min-w-[132px] px-9 py-4",
    "text-base leading-[19px] text-white",
    "font-sans font-semibold",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "",
        variant: "gradient-button-variant",
        /** Azul do acento → verde do Grupo RAM, igual ao spotlight. */
        brand: "gradient-button-brand",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {
  /** Renderiza o filho no lugar do <button> — para virar um <a>, por exemplo. */
  asChild?: boolean;
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(gradientButtonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
GradientButton.displayName = "GradientButton";

export { GradientButton, gradientButtonVariants };
