/**
 * Reusable Button component
 * Accessible, responsive, and customizable button with loading states
 */

"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-3 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group";

    const variants = {
      primary:
        "bg-gradient-to-r from-primary-600 to-primary-500 text-light-1 hover:shadow-lg hover:shadow-primary-500/50 hover:scale-105 focus:ring-primary-500 before:absolute before:inset-0 before:bg-white before:opacity-0 hover:before:opacity-10 before:transition-opacity",
      secondary:
        "bg-gradient-to-r from-secondary-500 to-yellow-500 text-dark-1 hover:shadow-lg hover:shadow-secondary-500/50 hover:scale-105 focus:ring-secondary-500 before:absolute before:inset-0 before:bg-white before:opacity-0 hover:before:opacity-20 before:transition-opacity",
      outline:
        "border-2 border-primary-500/50 text-light-1 hover:bg-primary-500/10 hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/30 focus:ring-primary-500 backdrop-blur-sm",
      ghost: 
        "text-light-1 hover:bg-dark-4/80 focus:ring-primary-500 hover:scale-105",
      danger:
        "bg-gradient-to-r from-red to-red/80 text-light-1 hover:shadow-lg hover:shadow-red/50 hover:scale-105 focus:ring-red before:absolute before:inset-0 before:bg-white before:opacity-0 hover:before:opacity-10 before:transition-opacity",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <span className="relative z-10">{children}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;