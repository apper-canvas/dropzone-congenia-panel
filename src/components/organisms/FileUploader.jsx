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
import { configService } from "@/services/api/configService";
import ApperFileFieldComponent from "@/components/atoms/FileUploader/ApperFileFieldComponent";

const FileUploader = ({ useSDKComponent = false, fieldKey = "default-upload" }) => {
  const [files, setFiles] = useState([]);
  const [uploadMode, setUploadMode] = useState(useSDKComponent ? "sdk" : "custom");
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    max_file_size_c: 10 * 1024 * 1024, // 10MB
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
    max_files_c: 10,
    auto_upload_c: true
  });

  // Load config from database on mount
  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const dbConfig = await configService.getConfig();
        setConfig(prev => ({
          ...prev,
          max_file_size_c: dbConfig.max_file_size_c,
          max_files_c: dbConfig.max_files_c,
          auto_upload_c: dbConfig.auto_upload_c,
          chunk_size_c: dbConfig.chunk_size_c,
          retry_attempts_c: dbConfig.retry_attempts_c,
          timeout_c: dbConfig.timeout_c
        }));
      } catch (error) {
        console.error("Failed to load config:", error);
        toast.error("Failed to load configuration");
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

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
if (config.auto_upload_c) {
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

// Handle SDK component file changes
  const handleSDKFileChange = (event) => {
    console.log('SDK File change:', event);
    if (event.type === 'mounted' || event.type === 'updated') {
      // Update local state based on SDK files
      setFiles(event.files.map(file => ({
        ...file,
        id: file.id || generateUploadId()
      })));
    } else if (event.type === 'cleared') {
      setFiles([]);
    }
  };

  const handleSDKError = (error) => {
    console.error('SDK Component Error:', error);
    toast.error(error);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full">
          <ApperIcon name="CloudUpload" className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-gradient">DropZone</h1>
        </div>
        <p className="text-gray-600 max-w-md mx-auto">
          {uploadMode === "sdk" 
            ? "Advanced file upload with SDK integration. Files are automatically synced with database."
            : "Drag and drop your files or click to browse. Upload progress is tracked in real-time with visual feedback."
          }
        </p>
      </div>

      {/* Upload Mode Toggle */}
      <div className="flex justify-center gap-2 p-1 bg-gray-100 rounded-lg w-fit mx-auto">
        <button
          onClick={() => setUploadMode("custom")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            uploadMode === "custom"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Custom Upload
        </button>
        <button
          onClick={() => setUploadMode("sdk")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            uploadMode === "sdk"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          SDK Upload
        </button>
      </div>

      {uploadMode === "sdk" ? (
        /* SDK Upload Component */
        <ApperFileFieldComponent
          elementId={`file-uploader-${fieldKey}`}
          config={{
            fieldKey,
            tableName: "upload_file_c",
            fieldName: "attachments",
            apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
            apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY,
            existingFiles: files,
            fileCount: config.max_files_c,
            purpose: 'RecordAttachment'
          }}
          className="min-h-[200px] border-2 border-dashed border-gray-300 rounded-xl bg-gray-50"
          onFileChange={handleSDKFileChange}
          onError={handleSDKError}
        />
      ) : (
        /* Custom Upload Components */
        <>
          {/* Drop Zone */}
          <DropZone
            onFilesSelected={handleFilesSelected}
            maxFileSize={config.max_file_size_c}
            allowedTypes={config.allowedTypes}
            maxFiles={config.max_files_c}
            disabled={isUploading || loading}
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
        </>
      )}
    </div>
  );
};

export default FileUploader;