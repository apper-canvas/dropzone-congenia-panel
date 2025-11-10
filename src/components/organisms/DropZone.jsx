import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const DropZone = ({ 
  onFilesSelected,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = [],
  maxFiles = 10,
  disabled = false,
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleFiles = (files) => {
    if (files.length === 0) return;
// Validate file count
    if (files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = files.filter(file => {
      // Check file size
      if (file.size > maxFileSize) {
        alert(`File "${file.name}" is too large. Maximum size is ${Math.round(maxFileSize / (1024 * 1024))}MB`);
        return false;
      }

      // Check file type
      if (allowedTypes.length > 0) {
        const isValid = allowedTypes.some(type => {
          if (type.endsWith("/*")) {
            return file.type.startsWith(type.slice(0, -1));
          }
          return file.type === type;
        });

        if (!isValid) {
          alert(`File "${file.name}" type is not allowed`);
          return false;
        }
      }

      return true;
    });

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const dropZoneVariants = {
    default: { scale: 1, borderColor: "rgb(209 213 219)" },
    dragOver: { 
      scale: 1.02, 
      borderColor: "rgb(59 130 246)",
      backgroundColor: "rgb(239 246 255)"
    },
    hover: { 
      scale: 1.01,
      borderColor: "rgb(99 102 241)"
    }
  };

  return (
    <motion.div
      variants={dropZoneVariants}
      initial="default"
      animate={isDragOver ? "dragOver" : "default"}
      whileHover={!disabled ? "hover" : undefined}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer group",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-50/50",
        isDragOver ? "border-primary bg-blue-50 shadow-lg" : "border-gray-300",
        className
      )}
      onClick={openFileDialog}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInput}
        className="hidden"
        accept={allowedTypes.join(",")}
        disabled={disabled}
      />

      <div className="space-y-6">
        {/* Upload Icon */}
        <div className="relative">
          <motion.div
            animate={isDragOver ? { y: -4 } : { y: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center"
          >
            <ApperIcon 
              name="CloudUpload" 
              className={cn(
                "w-10 h-10 transition-colors duration-200",
                isDragOver ? "text-primary animate-pulse-gentle" : "text-gray-400 group-hover:text-primary"
              )} 
            />
          </motion.div>
          
          {/* Floating particles effect on drag over */}
          <AnimatePresence>
            {isDragOver && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1, 0],
                      x: [0, (i % 2 ? 20 : -20) * Math.random()],
                      y: [0, -20 * Math.random()]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full"
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h3 className={cn(
            "text-xl font-semibold transition-colors duration-200",
            isDragOver ? "text-primary" : "text-gray-900"
          )}>
            {isDragOver ? "Drop files here!" : "Drag & drop files here"}
          </h3>
          <p className="text-gray-500">
            or click to browse from your device
          </p>
        </div>

        {/* File Requirements */}
<div className="space-y-1 text-sm text-gray-400">
          {maxFiles > 1 && (
            <p>Up to {maxFiles} files</p>
          )}
          <p>Maximum {Math.round(maxFileSize / (1024 * 1024))}MB per file</p>
          {allowedTypes.length > 0 && (
            <p>Supports: {allowedTypes.map(type => type.replace("/*", "")).join(", ")}</p>
          )}
        </div>

        {/* Browse Button */}
        <Button
          variant="outline"
          size="lg"
          icon="FolderOpen"
          disabled={disabled}
          className="mt-4"
          onClick={(e) => {
            e.stopPropagation();
            openFileDialog();
          }}
        >
          Browse Files
        </Button>
      </div>
    </motion.div>
  );
};

export default DropZone;