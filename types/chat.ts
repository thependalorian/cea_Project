export interface ChatUser {
  id: string;
  name: string;
  image?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  user: ChatUser;
  sources?: Array<{
    content: string;
    metadata: {
      chunk_index?: number;
      page?: number;
      resume_id?: string;
      similarity?: number;
      [key: string]: any;
    }
  }>;
}

export interface ResumeUploadResponse {
  fileId: string;
  fileName: string;
  userId?: string;
  url?: string;
} 