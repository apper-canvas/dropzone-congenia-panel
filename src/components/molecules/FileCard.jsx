import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import ProgressBar from "@/components/atoms/ProgressBar";
import { formatFileSize, getFileIcon } from "@/utils/fileUtils";

const FileCard = ({ 
  file, 
  onRemove, 
  onRetry, 
  className 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "uploading": return "border-primary bg-blue-50";
      case "success": return "border-success bg-green-50";
      case "error": return "border-error bg-red-50";
      default: return "border-gray-200 bg-white";
    }
  };

  const getStatusIcon = () => {
    switch (file.status) {
      case "uploading": 
        return <ApperIcon name="Upload" className="w-4 h-4 text-primary animate-pulse" />;
      case "success": 
        return <ApperIcon name="CheckCircle" className="w-4 h-4 text-success" />;
      case "error": 
        return <ApperIcon name="XCircle" className="w-4 h-4 text-error" />;
      default: 
        return <ApperIcon name="Clock" className="w-4 h-4 text-gray-400" />;
    }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "group relative p-4 rounded-xl border-l-4 shadow-card hover:shadow-card-hover transition-all duration-200",
        getStatusColor(file.status),
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* File Icon or Preview */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
          {file.preview ? (
            <img 
              src={file.preview} 
              alt={file.name} 
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <ApperIcon 
              name={getFileIcon(file.type)} 
              className="w-6 h-6 text-gray-500" 
            />
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span className="capitalize">{file.type.split("/")[0]}</span>
              </div>
            </div>
            
            {/* Status Icon */}
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              {file.status === "uploading" && file.uploadSpeed && (
                <span className="text-xs text-gray-500">
                  {formatFileSize(file.uploadSpeed)}/s
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {file.status === "uploading" && (
            <ProgressBar 
              progress={file.progress} 
              size="sm"
            />
          )}

          {/* Error Message */}
          {file.status === "error" && file.error && (
            <p className="text-xs text-error font-medium">
              {file.error}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center gap-1">
          {file.status === "error" && onRetry && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onRetry(file.id)}
              className="w-8 h-8 text-gray-500 hover:text-primary hover:bg-blue-100"
            >
              <ApperIcon name="RotateCcw" className="w-3 h-3" />
            </Button>
          )}
          
          {onRemove && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onRemove(file.id)}
              className="w-8 h-8 text-gray-500 hover:text-error hover:bg-red-100"
            >
              <ApperIcon name="X" className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FileCard;