import React, { useEffect, useRef, useState, useMemo } from 'react';
import { toast } from 'react-toastify';

/**
 * ApperFileFieldComponent - React component that interfaces with ApperSDK for file operations
 * 
 * Props:
 * - elementId: Unique element ID (pattern: ${baseName}-${recordId} for lists)
 * - config: Configuration object with fieldKey, tableName, fieldName, etc.
 * - className: CSS classes for styling
 * - style: Inline styles object
 */
const ApperFileFieldComponent = ({ 
  elementId, 
  config, 
  className = '', 
  style = {},
  onFileChange,
  onError 
}) => {
  const elementIdRef = useRef(null);
  const mountedRef = useRef(false);
  const existingFilesRef = useRef([]);
  
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [loadingAttempts, setLoadingAttempts] = useState(0);

  // Memoize existing files to prevent unnecessary re-renders
  const existingFiles = useMemo(() => {
    if (!config?.existingFiles) return [];
    
    // Check if files need format conversion
    const files = Array.isArray(config.existingFiles) ? config.existingFiles : [];
    
    // Compare with previous files to detect actual changes
    const filesChanged = JSON.stringify(files) !== JSON.stringify(existingFilesRef.current);
    
    if (filesChanged) {
      existingFilesRef.current = files;
    }
    
    return files;
  }, [config?.existingFiles]);

  // Check if ApperSDK is loaded with retry mechanism
  useEffect(() => {
    let mounted = true;
    let retryTimeout;

    const checkSDKAvailability = () => {
      if (!mounted) return;

      if (window.ApperSDK?.ApperFileUploader?.FileField) {
        setIsSDKLoaded(true);
        setError(null);
        return;
      }

      if (loadingAttempts < 50) { // Max 50 attempts (250 seconds total)
        setLoadingAttempts(prev => prev + 1);
        retryTimeout = setTimeout(checkSDKAvailability, 5000); // 5 second intervals
      } else {
        const errorMsg = 'ApperSDK failed to load after 250 seconds. Please check your internet connection and refresh the page.';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    };

    checkSDKAvailability();

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [loadingAttempts, onError]);

  // Mount ApperFileField component when SDK is ready
  useEffect(() => {
    let mounted = true;

    const mountFileField = async () => {
      if (!isSDKLoaded || !config || !elementIdRef.current) return;
      if (mountedRef.current) return; // Prevent remounting

      try {
        if (!window.ApperSDK) {
          throw new Error('ApperSDK not loaded. Please ensure the SDK script is included before this component.');
        }

        const { ApperFileUploader } = window.ApperSDK;

        if (!ApperFileUploader?.FileField?.mount) {
          throw new Error('ApperFileUploader.FileField.mount method not available');
        }

        // Validate required config properties
        const requiredProps = ['fieldKey', 'tableName', 'fieldName', 'apperProjectId', 'apperPublicKey'];
        const missingProps = requiredProps.filter(prop => !config[prop]);
        
        if (missingProps.length > 0) {
          throw new Error(`Missing required config properties: ${missingProps.join(', ')}`);
        }

        // Check if files need API to UI format conversion
        let formattedFiles = existingFiles;
        if (existingFiles.length > 0 && ApperFileUploader.toUIFormat) {
          try {
            formattedFiles = ApperFileUploader.toUIFormat(existingFiles);
          } catch (conversionError) {
            console.warn('File format conversion failed, using original format:', conversionError);
            // Continue with original format if conversion fails
          }
        }

        // Mount the file field component
        const mountResult = await ApperFileUploader.FileField.mount(elementIdRef.current, {
          ...config,
          existingFiles: formattedFiles
        });

        if (mounted) {
          mountedRef.current = true;
          setIsReady(true);
          setError(null);
          
          // Notify parent component of successful mount
          onFileChange?.({ type: 'mounted', files: formattedFiles });
        }

      } catch (err) {
        console.error('Failed to mount ApperFileField:', err);
        if (mounted) {
          setError(err.message);
          setIsReady(false);
          onError?.(err.message);
        }
      }
    };

    mountFileField();

    return () => {
      mounted = false;
    };
  }, [isSDKLoaded, config, existingFiles, onFileChange, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mountedRef.current && elementIdRef.current && window.ApperSDK?.ApperFileUploader?.FileField?.unmount) {
        try {
          window.ApperSDK.ApperFileUploader.FileField.unmount(elementIdRef.current);
          mountedRef.current = false;
        } catch (err) {
          console.error('Error unmounting ApperFileField:', err);
        }
      }
    };
  }, []);

  // Update files when external changes occur
  useEffect(() => {
    if (!isReady || !config?.fieldKey || !window.ApperSDK?.ApperFileUploader?.FileField?.updateFiles) return;

    const updateFiles = async () => {
      try {
        let filesToUpdate = existingFiles;
        
        // Convert format if needed
        if (existingFiles.length > 0 && window.ApperSDK.ApperFileUploader.toUIFormat) {
          try {
            filesToUpdate = window.ApperSDK.ApperFileUploader.toUIFormat(existingFiles);
          } catch (conversionError) {
            console.warn('File format conversion failed during update:', conversionError);
          }
        }

        await window.ApperSDK.ApperFileUploader.FileField.updateFiles(config.fieldKey, filesToUpdate);
        
        // Notify parent component of file update
        onFileChange?.({ type: 'updated', files: filesToUpdate });
        
      } catch (err) {
        console.error('Failed to update files:', err);
        setError(`Failed to update files: ${err.message}`);
        onError?.(err.message);
      }
    };

    updateFiles();
  }, [existingFiles, isReady, config?.fieldKey, onFileChange, onError]);

  // Clear all files method (can be called by parent)
  const clearAllFiles = async () => {
    if (!isReady || !config?.fieldKey || !window.ApperSDK?.ApperFileUploader?.FileField?.clearField) {
      return;
    }

    try {
      await window.ApperSDK.ApperFileUploader.FileField.clearField(config.fieldKey);
      onFileChange?.({ type: 'cleared', files: [] });
      toast.info('All files cleared');
    } catch (err) {
      console.error('Failed to clear files:', err);
      setError(`Failed to clear files: ${err.message}`);
      onError?.(err.message);
      toast.error('Failed to clear files');
    }
  };

  // Expose methods to parent component
  React.useImperativeHandle(React.forwardRef(() => null), () => ({
    clearAllFiles,
    isReady,
    error
  }));

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`} style={style}>
        <div className="flex items-center gap-2 text-red-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">File Upload Error</span>
        </div>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        {loadingAttempts < 50 && (
          <p className="mt-1 text-xs text-red-500">
            Retrying... Attempt {loadingAttempts}/50
          </p>
        )}
      </div>
    );
  }

  if (!isSDKLoaded) {
    return (
      <div className={`p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`} style={style}>
        <div className="flex items-center gap-2 text-blue-700">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-medium">Loading File Uploader...</span>
        </div>
        <p className="mt-1 text-sm text-blue-600">
          Please wait while ApperSDK loads (Attempt {loadingAttempts}/50)
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={elementIdRef}
      id={elementId}
      className={className}
      style={style}
      data-testid="apper-file-field"
    >
      {/* ApperSDK will mount the file field component here */}
    </div>
  );
};

export default ApperFileFieldComponent;