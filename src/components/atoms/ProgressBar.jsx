import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const ProgressBar = ({ 
  progress = 0, 
  className, 
  showLabel = false,
  size = "default",
  variant = "default"
}) => {
  const sizes = {
    sm: "h-2",
    default: "h-3",
    lg: "h-4"
  };

  const variants = {
    default: "bg-gradient-progress",
    success: "bg-gradient-success",
    error: "bg-gradient-to-r from-error to-red-600"
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm font-medium">
          <span className="text-gray-600">Progress</span>
          <span className="text-gray-900">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className={cn("bg-gray-200 rounded-full overflow-hidden", sizes[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn("h-full rounded-full", variants[variant])}
        />
      </div>
    </div>
  );
};

export default ProgressBar;