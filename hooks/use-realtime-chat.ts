import { ChatMessage } from "@/types/chat";

interface UseRealtimeChatOptions {
  roomName: string;
  username: string;
}

// This hook will be implemented later for real-time chat functionality
export function useRealtimeChat({ roomName, username }: UseRealtimeChatOptions) {
  // TODO: Implement real-time chat functionality
  return {
    messages: [] as ChatMessage[],
    isLoading: false,
    isConnected: true, // Mock connection status
    error: null as Error | null,
    sendMessage: async (content: string) => {
      // Implementation will be added later
      console.log(`Sending message to room ${roomName} from ${username}: ${content}`);
    },
  };
} 