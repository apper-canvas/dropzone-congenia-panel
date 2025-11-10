import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Input = forwardRef(({ 
  className, 
  type = "text",
  error = false,
  ...props 
}, ref) => {
  const baseStyles = "w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50";
  const variants = {
    default: "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-primary",
    error: "border-error bg-red-50 text-gray-900 placeholder-red-300 focus:border-error focus:ring-error/50"
  };

  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        baseStyles,
        error ? variants.error : variants.default,
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;