import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import DropZone from "./DropZone";
import FileCard from "@/components/molecules/FileCard";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Empty from "@/components/ui/Empty";
import { generateUploadId, createImagePreview } from "@/utils/fileUtils";
import { uploadService } from "@/services/api/uploadService";

const FileUploader = () => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [config, setConfig] = useState({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "image/*",
      "video/*",
      "audio/*",
      "application/pdf",
      "text/*",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".zip",
      ".rar"
    ],
    maxFiles: 10,
    autoUpload: true
  });

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("dropzone-config");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error("Failed to parse saved config:", error);
      }
    }
  }, []);

  // Save config to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("dropzone-config", JSON.stringify(config));
  }, [config]);

  const handleFilesSelected = async (selectedFiles) => {
    // Create upload file objects
    const uploadFiles = await Promise.all(
      selectedFiles.map(async (file) => {
        const preview = await createImagePreview(file);
        return {
          id: generateUploadId(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: "pending",
          progress: 0,
          uploadSpeed: 0,
          error: null,
          preview,
          uploadedAt: null
        };
      })
    );

    setFiles(prev => [...prev, ...uploadFiles]);

    // Auto-upload if enabled
    if (config.autoUpload) {
      uploadFiles.forEach(uploadFile => {
        startUpload(uploadFile.id);
      });
    }

    toast.success(`${uploadFiles.length} file${uploadFiles.length > 1 ? "s" : ""} added to queue`);
  };

  const startUpload = async (fileId) => {
    const fileIndex = files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return;

    // Update file status to uploading
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: "uploading", progress: 0, error: null }
        : f
    ));

    try {
      // Simulate upload with progress updates
      const startTime = Date.now();
      
      // Progress simulation
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === fileId && f.status === "uploading") {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(95, (elapsed / 3000) * 100); // Complete in ~3 seconds
            const uploadSpeed = (f.size * (progress / 100)) / (elapsed / 1000);
            
            return {
              ...f,
              progress,
              uploadSpeed: uploadSpeed || 0
            };
          }
          return f;
        }));
      }, 100);

      // Simulate actual upload
      await uploadService.upload(files[fileIndex]);
      
      clearInterval(progressInterval);
      
      // Mark as completed
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: "success", 
              progress: 100, 
              uploadSpeed: 0,
              uploadedAt: new Date()
            }
          : f
      ));

      toast.success(`${files[fileIndex].name} uploaded successfully!`);

    } catch (error) {
      // Clear progress interval on error
      const progressInterval = setTimeout(() => {}, 0);
      clearInterval(progressInterval);
      
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: "error", 
              progress: 0, 
              uploadSpeed: 0,
              error: error.message || "Upload failed"
            }
          : f
      ));

      toast.error(`Failed to upload ${files[fileIndex]?.name || "file"}`);
    }
  };

  const handleRemoveFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    toast.info("File removed from queue");
  };

  const handleRetryUpload = (fileId) => {
    startUpload(fileId);
  };

  const handleUploadAll = () => {
    const pendingFiles = files.filter(f => f.status === "pending" || f.status === "error");
    
    if (pendingFiles.length === 0) {
      toast.info("No files to upload");
      return;
    }

    setIsUploading(true);
    pendingFiles.forEach(file => startUpload(file.id));
    
    toast.info(`Starting upload for ${pendingFiles.length} file${pendingFiles.length > 1 ? "s" : ""}`);
  };

  const handleClearAll = () => {
    if (files.length === 0) return;
    
    if (window.confirm("Are you sure you want to remove all files?")) {
      setFiles([]);
      toast.info("All files removed");
    }
  };

  const getUploadStats = () => {
    const total = files.length;
    const completed = files.filter(f => f.status === "success").length;
    const uploading = files.filter(f => f.status === "uploading").length;
    const failed = files.filter(f => f.status === "error").length;
    const pending = files.filter(f => f.status === "pending").length;

    return { total, completed, uploading, failed, pending };
  };

  const stats = getUploadStats();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full">
          <ApperIcon name="CloudUpload" className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-gradient">DropZone</h1>
        </div>
        <p className="text-gray-600 max-w-md mx-auto">
          Drag and drop your files or click to browse. Upload progress is tracked in real-time with visual feedback.
        </p>
      </div>

      {/* Drop Zone */}
      <DropZone
        onFilesSelected={handleFilesSelected}
        maxFileSize={config.maxFileSize}
        allowedTypes={config.allowedTypes}
        maxFiles={config.maxFiles}
        disabled={isUploading}
      />

      {/* Upload Stats & Actions */}
      {files.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span className="text-gray-600">Completed: {stats.completed}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
              <span className="text-gray-600">Uploading: {stats.uploading}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-error"></div>
              <span className="text-gray-600">Failed: {stats.failed}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-gray-600">Pending: {stats.pending}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(stats.pending > 0 || stats.failed > 0) && (
              <Button
                onClick={handleUploadAll}
                icon="Upload"
                disabled={isUploading}
              >
                Upload All
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleClearAll}
              icon="Trash2"
              disabled={isUploading}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Files List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {files.length === 0 ? (
            <Empty
              title="No files selected"
              description="Drag and drop files above or click to browse from your device"
              actionLabel="Browse Files"
              onAction={() => {
                // Trigger file input
                const event = new MouseEvent('click', { bubbles: true });
                document.querySelector('input[type="file"]')?.dispatchEvent(event);
              }}
            />
          ) : (
            files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onRemove={handleRemoveFile}
                onRetry={handleRetryUpload}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Completed Summary */}
      {stats.completed > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-success rounded-xl text-white text-center space-y-2"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-2">
            <ApperIcon name="CheckCircle" className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold">Upload Complete!</h3>
          <p className="opacity-90">
            Successfully uploaded {stats.completed} file{stats.completed > 1 ? "s" : ""}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default FileUploader;