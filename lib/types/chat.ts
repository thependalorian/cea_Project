export interface ChatUser {
  id: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  user: ChatUser;
  sources?: string[] | null;
  error?: boolean;
}

export interface ResumeData {
  fileId?: string;
  userId?: string;
  fileName?: string;
  content?: string;
  url?: string;
  id?: string;
  file_name?: string;
  user_id?: string;
} 