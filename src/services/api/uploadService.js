import { uploadConfigData } from "@/services/mockData/uploadConfig.json";

class UploadService {
  constructor() {
    this.config = uploadConfigData;
  }

  // Simulate file upload with realistic delay
  async upload(uploadFile) {
    // Random delay between 2-4 seconds
    const delay = Math.random() * 2000 + 2000;
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 10% chance of failure for demonstration
        if (Math.random() < 0.1) {
          reject(new Error("Network error - please try again"));
          return;
        }
        
        resolve({
          id: uploadFile.id,
          url: `https://example.com/uploads/${uploadFile.id}`,
          uploadedAt: new Date().toISOString(),
          size: uploadFile.size,
          type: uploadFile.type
        });
      }, delay);
    });
  }

  // Get upload configuration
  async getConfig() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { ...this.config };
  }

  // Update upload configuration
  async updateConfig(newConfig) {
    await new Promise(resolve => setTimeout(resolve, 300));
    this.config = { ...this.config, ...newConfig };
    return { ...this.config };
  }

  // Get upload history/stats
  async getUploadHistory() {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Return mock upload history
    return [
      {
        id: "upload_001",
        fileName: "presentation.pdf",
        fileSize: 2048576,
        uploadedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: "success"
      },
      {
        id: "upload_002", 
        fileName: "image.jpg",
        fileSize: 1024000,
        uploadedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: "success"
      },
      {
        id: "upload_003",
        fileName: "document.docx", 
        fileSize: 512000,
        uploadedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        status: "success"
      }
    ];
  }

  // Delete uploaded file
  async deleteFile(fileId) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // 5% chance of failure
    if (Math.random() < 0.05) {
      throw new Error("Failed to delete file");
    }
    
    return { success: true, deletedAt: new Date().toISOString() };
  }
}

export const uploadService = new UploadService();