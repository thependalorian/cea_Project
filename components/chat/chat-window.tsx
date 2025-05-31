"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizontal, AlertCircle, Paperclip, FileText, X } from "lucide-react";
import { ChatMessageItem } from "@/components/chat-message";
import { ChatMessage, ChatUser } from "@/types/chat";
import { toast } from "@/components/ui/use-toast";
import ResumeControls from "@/components/ResumeControls";

interface ChatWindowProps {
  context?: 'general' | 'job-seeker';
  assistantName?: string;
}

export function ChatWindow({ 
  context = 'general',
  assistantName = context === 'job-seeker' ? 'Climate Jobs Assistant' : 'Climate Assistant'
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'loading' | 'available' | 'unavailable'>('loading');
  const [fileUploading, setFileUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState<{
    fileId?: string;
    userId?: string;
    fileName?: string;
    url?: string;
    id?: string;
    file_name?: string;
    user_id?: string;
  } | null>(null);
  const [useResumeRAG, setUseResumeRAG] = useState(false);
  const [useEnhancedSearch, setUseEnhancedSearch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check backend health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
        });
        
        if (response.ok) {
          setBackendStatus('available');
          setError(null);
        } else {
          const data = await response.json();
          setBackendStatus('unavailable');
          setError(data.error || 'Backend service is unavailable');
        }
      } catch {
        setBackendStatus('unavailable');
        setError('Failed to connect to backend service');
      }
    };

    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !uploadedFile) || isLoading) return;
    if (backendStatus === 'unavailable') {
      setError('Chat service is currently unavailable. Please try again later.');
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setError(null);
    
    // Create user message content
    let messageContent = userMessage;
    if (uploadedFile) {
      messageContent = userMessage 
        ? `${userMessage} (Uploaded: ${uploadedFile.name})`
        : `I've uploaded my resume: ${uploadedFile.name}`;
    }

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageContent,
      createdAt: new Date().toISOString(),
      user: {
        id: 'user',
        name: 'You'
      } as ChatUser
    };

    // Add user message to chat
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    // If there's a file, upload it first
    let fileUploadResult = null;
    if (uploadedFile) {
      try {
        setFileUploading(true);
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('context', context);

        const uploadResponse = await fetch('/api/upload-resume', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload file');
        }

        fileUploadResult = await uploadResponse.json();
        
        // Store resume data for RAG queries
        setResumeData(fileUploadResult);
        
        // Clear the uploaded file after successful upload
        setUploadedFile(null);
        
        toast({
          title: "Resume uploaded successfully",
          description: "Your resume has been uploaded and will be analyzed.",
        });
      } catch (error) {
        console.error("Failed to upload file:", error);
        setError(error instanceof Error ? error.message : "Failed to upload file");
        setIsLoading(false);
        setFileUploading(false);
        return;
      } finally {
        setFileUploading(false);
      }
    }

    try {
      // Call our Next.js API endpoint with context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: userMessage,
          context: context,
          resumeData: resumeData || (fileUploadResult ? { 
            id: fileUploadResult.fileId,
            user_id: fileUploadResult.userId,
            file_name: fileUploadResult.fileName 
          } : null),
          useResumeRAG: useResumeRAG,
          useEnhancedSearch: useEnhancedSearch
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from API');
      }

      const data = await response.json();
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.content,
        createdAt: new Date().toISOString(),
        user: {
          id: 'assistant',
          name: assistantName
        } as ChatUser,
        sources: data.sources || null
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setError(error instanceof Error ? error.message : "An error occurred while processing your message");
      
      // Set backend status based on error
      if (error instanceof Error && 
         (error.message.includes('Backend service') || 
          error.message.includes('Failed to connect'))) {
        setBackendStatus('unavailable');
      }
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : "Sorry, I encountered an error processing your message. Please try again.",
        createdAt: new Date().toISOString(),
        user: {
          id: 'assistant',
          name: assistantName
        } as ChatUser
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }
    
    setUploadedFile(file);
    setError(null);
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResumeToggle = (enabled: boolean) => {
    setUseResumeRAG(enabled);
    if (enabled && resumeData) {
      toast({
        title: "Resume Chat Mode Enabled",
        description: "I'll use your resume to answer your career-related questions.",
        variant: "default",
      });
    }
  };
  
  const handleEnhancedSearchToggle = (enabled: boolean) => {
    setUseEnhancedSearch(enabled);
    if (enabled && resumeData) {
      toast({
        title: "Enhanced Social Context Enabled",
        description: "I'll use information from your social profiles to provide more personalized responses.",
        variant: "default",
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-chat-background border rounded-lg shadow-sm overflow-hidden">
      {/* Error message */}
      {error && (
        <div className="p-2 bg-destructive/10 border-b border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">{assistantName}</h3>
            <p className="max-w-md">
              {context === 'job-seeker' 
                ? "Ask me about climate jobs, skills, and career development. Upload your resume for personalized advice!" 
                : "Ask me about climate change, solutions, and the climate economy. How can I help you today?"}
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.user.id === 'user';
            const showHeader = index === 0 || 
              messages[index - 1]?.user.id !== message.user.id;
            
            return (
              <ChatMessageItem 
                key={message.id} 
                message={message} 
                isOwnMessage={isOwnMessage}
                showHeader={showHeader}
              />
            );
          })
        )}
      </div>

      {/* Resume controls */}
      <div className="p-2 border-t bg-muted/40">
        <ResumeControls
          onToggleRAG={handleResumeToggle}
          onToggleEnhancedSearch={handleEnhancedSearchToggle}
          resumeData={resumeData}
          setResumeData={setResumeData}
        />
      </div>

      {/* File upload indicator */}
      {uploadedFile && (
        <div className="px-4 py-2 border-t flex items-center gap-2 bg-muted/30">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm flex-1 truncate">{uploadedFile.name}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={removeUploadedFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input form */}
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleFileClick}
            disabled={isLoading || fileUploading}
            className="flex-shrink-0"
          >
            <Paperclip className="h-4 w-4" />
            <span className="sr-only">Upload resume</span>
          </Button>
          
          <Input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "Thinking..." : "Type a message..."}
            disabled={isLoading || fileUploading || backendStatus !== 'available'}
            className="flex-1"
          />
          
          <Button
            type="submit"
            disabled={(!input.trim() && !uploadedFile) || isLoading || fileUploading || backendStatus !== 'available'}
            className="flex-shrink-0"
          >
            <SendHorizontal className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>

      {/* File upload hidden input */}
      <input
        type="file"
        accept=".pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
} 