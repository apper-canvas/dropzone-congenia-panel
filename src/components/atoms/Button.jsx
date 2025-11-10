import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = forwardRef(({ 
  children, 
  className, 
  variant = "default", 
  size = "default", 
  icon,
  loading = false,
  disabled = false,
  ...props 
}, ref) => {
  const variants = {
    default: "bg-gradient-primary text-white hover:shadow-lg",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
    ghost: "text-gray-600 hover:bg-gray-100",
    danger: "bg-gradient-to-r from-error to-red-600 text-white hover:shadow-lg",
    success: "bg-gradient-success text-white hover:shadow-lg"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
    icon: "p-2"
  };

  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <ApperIcon name={icon} className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;