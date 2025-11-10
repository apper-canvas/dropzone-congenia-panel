import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

class HistoryService {
  constructor() {
    this.tableName = "upload_history_c";
  }

  // Get all upload history
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "file_name_c"}},
          {"field": {"Name": "file_size_c"}},
          {"field": {"Name": "uploaded_at_c"}},
          {"field": {"Name": "status_c"}}
        ],
        orderBy: [{
          fieldName: "uploaded_at_c",
          sorttype: "DESC"
        }],
        pagingInfo: {
          limit: 50,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(record => ({
        id: record.Id,
        fileName: record.file_name_c,
        fileSize: record.file_size_c,
        uploadedAt: record.uploaded_at_c,
        status: record.status_c
      }));
    } catch (error) {
      console.error("Error fetching upload history:", error?.response?.data?.message || error.message);
      return [];
    }
  }

  // Create new history entry
  async create(historyData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const recordData = {
        Name: historyData.fileName || "Upload",
        file_name_c: historyData.fileName,
        file_size_c: historyData.fileSize,
        uploaded_at_c: historyData.uploadedAt || new Date().toISOString(),
        status_c: historyData.status || "success"
      };

      const response = await apperClient.createRecord(this.tableName, {
        records: [recordData]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results[0] && response.results[0].success) {
        return response.results[0].data;
      }

      throw new Error("Failed to create history entry");
    } catch (error) {
      console.error("Error creating history entry:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  // Delete history entry
  async delete(recordId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.deleteRecord(this.tableName, {
        RecordIds: [parseInt(recordId)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results[0] && response.results[0].success) {
        toast.success("History entry deleted successfully");
        return true;
      }

      throw new Error("Failed to delete history entry");
    } catch (error) {
      console.error("Error deleting history entry:", error?.response?.data?.message || error.message);
      toast.error("Failed to delete history entry");
      throw error;
    }
  }
}

export const historyService = new HistoryService();