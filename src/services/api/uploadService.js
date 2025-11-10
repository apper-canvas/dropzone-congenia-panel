import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

class UploadService {
  constructor() {
    this.tableName = "upload_file_c";
  }

  // Get files for a specific field key (for ApperFileFieldComponent)
  async getFilesForField(fieldKey) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "url_c"}},
          {"field": {"Name": "uploaded_at_c"}},
          {"field": {"Name": "size_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "Tags"}}
        ],
        where: [{
          "FieldName": "Tags",
          "Operator": "Contains", 
          "Values": [fieldKey],
          "Include": true
        }]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching files for field:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  // Update file field data (for ApperFileFieldComponent)
  async updateFileField(fieldKey, files) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Convert UI format files to database format if needed
      const recordsToUpdate = files.map(file => ({
        Id: file.id || file.Id,
        Name: file.name || file.Name,
        url_c: file.url || file.url_c,
        uploaded_at_c: file.uploadedAt || file.uploaded_at_c || new Date().toISOString(),
        size_c: file.size || file.size_c,
        type_c: file.type || file.type_c,
        Tags: fieldKey
      }));

      const response = await apperClient.updateRecord(this.tableName, {
        records: recordsToUpdate
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.results || [];
    } catch (error) {
      console.error("Error updating file field:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  // Convert API format to UI format for ApperFileFieldComponent
  convertToUIFormat(apiFiles) {
    if (!Array.isArray(apiFiles)) return [];

    return apiFiles.map(file => ({
      id: file.Id,
      name: file.Name,
      url: file.url_c,
      uploadedAt: file.uploaded_at_c,
      size: file.size_c,
      type: file.type_c,
      status: 'success'
    }));
  }

  // Simulate file upload with realistic delay and database integration
  async upload(uploadFile) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Random delay between 2-4 seconds to simulate upload
      const delay = Math.random() * 2000 + 2000;
      await new Promise(resolve => setTimeout(resolve, delay));

      // 10% chance of failure for demonstration
      if (Math.random() < 0.1) {
        throw new Error("Network error - please try again");
      }

      const uploadData = {
        Name: uploadFile.name,
        url_c: `https://example.com/uploads/${uploadFile.id}`,
        uploaded_at_c: new Date().toISOString(),
        size_c: uploadFile.size || uploadFile.file?.size || 0,
        type_c: uploadFile.type || uploadFile.file?.type || "unknown"
      };

      const response = await apperClient.createRecord(this.tableName, {
        records: [uploadData]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results[0]) {
        const result = response.results[0];
        if (result.success) {
          return {
            id: result.data.Id,
            url: result.data.url_c,
            uploadedAt: result.data.uploaded_at_c,
            size: result.data.size_c,
            type: result.data.type_c
          };
        } else {
          const error = result.message || "Upload failed";
          console.error(error);
          toast.error(error);
          throw new Error(error);
        }
      }

      throw new Error("Unexpected response format");
    } catch (error) {
      console.error("Error uploading file:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  // Get upload configuration - delegates to configService
  async getConfig() {
    const { configService } = await import("./configService");
    return await configService.getConfig();
  }

  // Update upload configuration - delegates to configService  
  async updateConfig(newConfig) {
    const { configService } = await import("./configService");
    return await configService.updateConfig(newConfig);
  }

  // Get upload history - delegates to historyService
  async getUploadHistory() {
    const { historyService } = await import("./historyService");
    return await historyService.getAll();
  }

  // Delete uploaded file
async deleteFile(fileId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.deleteRecord(this.tableName, {
        RecordIds: [parseInt(fileId)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results[0] && response.results[0].success) {
        return { success: true, deletedAt: new Date().toISOString() };
      }

      // 5% chance of failure for demonstration if no specific error
      if (Math.random() < 0.05) {
        throw new Error("Failed to delete file");
      }

      return { success: true, deletedAt: new Date().toISOString() };
    } catch (error) {
      console.error("Error deleting file:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  // Delete files by field key (for ApperFileFieldComponent)
  async deleteFilesByField(fieldKey) {
    try {
      const files = await this.getFilesForField(fieldKey);
      const fileIds = files.map(file => file.Id);
      
      if (fileIds.length === 0) {
        return { success: true, deletedCount: 0 };
      }

      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord(this.tableName, {
        RecordIds: fileIds
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const successfulDeletes = response.results?.filter(result => result.success) || [];
      return { 
        success: true, 
        deletedCount: successfulDeletes.length,
        deletedAt: new Date().toISOString() 
      };
    } catch (error) {
      console.error("Error deleting files by field:", error?.response?.data?.message || error.message);
      throw error;
    }
  }
}

export const uploadService = new UploadService();