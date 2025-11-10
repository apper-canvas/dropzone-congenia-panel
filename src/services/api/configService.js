import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

class ConfigService {
  constructor() {
    this.tableName = "upload_config_c";
    this.defaultConfig = {
      max_file_size_c: 10485760, // 10MB
      max_files_c: 10,
      auto_upload_c: true,
      chunk_size_c: 1048576, // 1MB
      retry_attempts_c: 3,
      timeout_c: 30000
    };
  }

  // Get upload configuration
  async getConfig() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        // Return default config if client not available
        return this.defaultConfig;
      }

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "max_file_size_c"}},
          {"field": {"Name": "max_files_c"}},
          {"field": {"Name": "auto_upload_c"}},
          {"field": {"Name": "chunk_size_c"}},
          {"field": {"Name": "retry_attempts_c"}},
          {"field": {"Name": "timeout_c"}}
        ],
        pagingInfo: {
          limit: 1,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response?.data?.length) {
        // Return default config if no records found
        return this.defaultConfig;
      }

      const config = response.data[0];
      return {
        max_file_size_c: config.max_file_size_c || this.defaultConfig.max_file_size_c,
        max_files_c: config.max_files_c || this.defaultConfig.max_files_c,
        auto_upload_c: config.auto_upload_c ?? this.defaultConfig.auto_upload_c,
        chunk_size_c: config.chunk_size_c || this.defaultConfig.chunk_size_c,
        retry_attempts_c: config.retry_attempts_c || this.defaultConfig.retry_attempts_c,
        timeout_c: config.timeout_c || this.defaultConfig.timeout_c
      };
    } catch (error) {
      console.error("Error fetching config:", error?.response?.data?.message || error);
      // Return default config on error
      return this.defaultConfig;
    }
  }

  // Update upload configuration
  async updateConfig(newConfig) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // First check if config exists
      const existingConfig = await this.getConfigRecord();
      
      const configData = {
        Name: "Default Upload Configuration",
        max_file_size_c: newConfig.max_file_size_c || this.defaultConfig.max_file_size_c,
        max_files_c: newConfig.max_files_c || this.defaultConfig.max_files_c,
        auto_upload_c: newConfig.auto_upload_c ?? this.defaultConfig.auto_upload_c,
        chunk_size_c: newConfig.chunk_size_c || this.defaultConfig.chunk_size_c,
        retry_attempts_c: newConfig.retry_attempts_c || this.defaultConfig.retry_attempts_c,
        timeout_c: newConfig.timeout_c || this.defaultConfig.timeout_c
      };

      let response;
      
      if (existingConfig && existingConfig.Id) {
        // Update existing config
        response = await apperClient.updateRecord(this.tableName, {
          records: [{
            Id: existingConfig.Id,
            ...configData
          }]
        });
      } else {
        // Create new config
        response = await apperClient.createRecord(this.tableName, {
          records: [configData]
        });
      }

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results[0] && response.results[0].success) {
        toast.success("Configuration updated successfully");
        return configData;
      }

      throw new Error("Failed to update configuration");
    } catch (error) {
      console.error("Error updating config:", error?.response?.data?.message || error.message);
      toast.error("Failed to update configuration");
      throw error;
    }
  }

  // Helper to get existing config record
  async getConfigRecord() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        return null;
      }

      const params = {
        fields: [{"field": {"Name": "Id"}}, {"field": {"Name": "Name"}}],
        pagingInfo: {
          limit: 1,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords(this.tableName, params);
      return response?.data?.[0] || null;
    } catch (error) {
      console.error("Error getting config record:", error);
      return null;
    }
  }
}

export const configService = new ConfigService();