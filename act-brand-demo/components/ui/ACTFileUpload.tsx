"use client";

/**
 * ACT File Upload Component - Alliance for Climate Transition
 * Modern 2025 file upload implementation with iOS-inspired design
 * Location: components/ui/ACTFileUpload.tsx
 */

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface FileInfo {
  file: File;
  id: string;
  previewUrl?: string;
}

interface ACTFileUploadProps {
  onChange: (files: File[]) => void;
  onRemove?: (fileId: string) => void;
  value?: File[];
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  variant?: 'default' | 'minimal' | 'glass' | 'frosted';
  className?: string;
  previewClassName?: string;
  buttonText?: string;
  dragActiveText?: string;
  dragInactiveText?: string;
  disabled?: boolean;
  showFileNames?: boolean;
  showFileSize?: boolean;
  showPreview?: boolean;
  allowRemoving?: boolean;
  compact?: boolean;
  dark?: boolean;
  error?: string;
}

export function ACTFileUpload({
  onChange,
  onRemove,
  value = [],
  accept = '*',
  multiple = true,
  maxFiles = 5,
  maxSize = 10, // Default 10MB
  variant = 'default',
  className,
  previewClassName,
  buttonText = 'Select Files',
  dragActiveText = 'Drop files here',
  dragInactiveText = 'Drag and drop files here, or click to browse',
  disabled = false,
  showFileNames = true,
  showFileSize = true,
  showPreview = true,
  allowRemoving = true,
  compact = false,
  dark = false,
  error,
}: ACTFileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Variant styles with iOS-inspired design
  const variantStyles = {
    default: 'bg-white border-2 border-dashed border-sand-gray/30 shadow-ios-subtle',
    minimal: 'bg-transparent border-2 border-dashed border-sand-gray/30',
    glass: 'bg-white/15 backdrop-blur-ios border-2 border-dashed border-white/25 shadow-ios-subtle',
    frosted: 'bg-white/75 dark:bg-midnight-forest/75 backdrop-blur-ios border-2 border-dashed border-white/15 dark:border-white/10 shadow-ios-subtle',
  };
  
  // Text color based on dark mode
  const textColorClass = dark || variant === 'frosted' 
    ? 'text-white' 
    : 'text-midnight-forest';
  
  // Secondary text color
  const secondaryTextColorClass = dark || variant === 'frosted'
    ? 'text-white/70'
    : 'text-midnight-forest/70';
  
  // Active drag styles
  const activeDragStyles = dragActive
    ? 'border-spring-green bg-spring-green/5'
    : '';
  
  // Handle incoming files
  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    
    // Convert FileList to array and perform validation
    const fileArray = Array.from(newFiles);
    
    // Check file count
    if (files.length + fileArray.length > maxFiles) {
      setLocalError(`You can only upload up to ${maxFiles} files`);
      return;
    }
    
    // Check file sizes
    const invalidSizeFiles = fileArray.filter(
      file => file.size > maxSize * 1024 * 1024
    );
    
    if (invalidSizeFiles.length > 0) {
      setLocalError(`Some files exceed the maximum size of ${maxSize}MB`);
      return;
    }
    
    setLocalError(null);
    
    // Process files for preview
    const newFileInfos: FileInfo[] = fileArray.map(file => {
      const id = Math.random().toString(36).substring(2);
      let previewUrl;
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }
      
      return { file, id, previewUrl };
    });
    
    // Update state
    const updatedFiles = [...files, ...newFileInfos];
    setFiles(updatedFiles);
    
    // Notify parent component
    onChange(updatedFiles.map(fileInfo => fileInfo.file));
  };
  
  // Handle file input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };
  
  // Handle file removal
  const handleRemove = (id: string) => {
    const updatedFiles = files.filter(fileInfo => fileInfo.id !== id);
    setFiles(updatedFiles);
    
    // Clean up preview URL to prevent memory leaks
    const removedFile = files.find(fileInfo => fileInfo.id === id);
    if (removedFile?.previewUrl) {
      URL.revokeObjectURL(removedFile.previewUrl);
    }
    
    // Notify parent component
    onChange(updatedFiles.map(fileInfo => fileInfo.file));
    
    // Call onRemove callback if provided
    if (onRemove) {
      onRemove(id);
    }
  };
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9 }
  };
  
  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        className={cn(
          'relative rounded-ios-xl overflow-hidden transition-all duration-300',
          variantStyles[variant],
          activeDragStyles,
          'cursor-pointer',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          compact ? 'p-4' : 'p-6',
          className
        )}
        onDragEnter={handleDrag}
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          {/* Icon */}
          <div className={cn(
            'mb-4 rounded-full p-3',
            dark || variant === 'frosted' 
              ? 'bg-white/10' 
              : 'bg-spring-green/10',
            textColorClass
          )}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          
          {/* Text */}
          <p className={cn("font-sf-pro-rounded font-medium mb-1", textColorClass)}>
            {dragActive ? dragActiveText : dragInactiveText}
          </p>
          
          <p className={cn("text-sm", secondaryTextColorClass)}>
            Maximum {maxFiles} files, up to {maxSize}MB each
          </p>
          
          {/* Upload button */}
          <div className="mt-4">
            <button
              type="button"
              className={cn(
                "py-2 px-4 rounded-ios-full font-sf-pro text-sm",
                "bg-spring-green text-midnight-forest",
                "hover:shadow-ios-subtle transition-all duration-300",
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              )}
              onClick={(e) => {
                e.stopPropagation();
                !disabled && inputRef.current?.click();
              }}
              disabled={disabled}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {(error || localError) && (
        <div className="text-ios-red text-sm font-sf-pro mt-2">
          {error || localError}
        </div>
      )}
      
      {/* File previews */}
      {files.length > 0 && (
        <motion.div
          className={cn(
            "grid gap-3",
            compact ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
            previewClassName
          )}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {files.map((fileInfo) => (
              <motion.div
                key={fileInfo.id}
                className={cn(
                  "relative rounded-ios-lg overflow-hidden",
                  "border border-sand-gray/20 dark:border-white/10",
                  "shadow-ios-subtle bg-white/50 dark:bg-midnight-forest/20",
                  "backdrop-blur-ios-light"
                )}
                variants={itemVariants}
                exit="exit"
                layout
              >
                {/* Preview */}
                {showPreview && fileInfo.previewUrl && (
                  <div className="relative aspect-video w-full">
                    <Image
                      src={fileInfo.previewUrl}
                      alt={fileInfo.file.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                {/* File info */}
                <div className="p-3">
                  {/* File type icon */}
                  {(!fileInfo.previewUrl || !showPreview) && (
                    <div className="flex items-center justify-center h-10 mb-2">
                      <FileTypeIcon fileType={fileInfo.file.type} />
                    </div>
                  )}
                  
                  {/* File name */}
                  {showFileNames && (
                    <p className={cn(
                      "font-sf-pro text-sm truncate",
                      textColorClass
                    )}>
                      {fileInfo.file.name}
                    </p>
                  )}
                  
                  {/* File size */}
                  {showFileSize && (
                    <p className={cn(
                      "text-xs font-sf-pro",
                      secondaryTextColorClass
                    )}>
                      {formatFileSize(fileInfo.file.size)}
                    </p>
                  )}
                </div>
                
                {/* Remove button */}
                {allowRemoving && (
                  <button
                    className={cn(
                      "absolute top-2 right-2 w-6 h-6 rounded-full",
                      "bg-white/80 backdrop-blur-ios-light text-midnight-forest",
                      "hover:bg-white flex items-center justify-center",
                      "shadow-ios-subtle transition-all duration-200",
                      "hover:scale-110"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(fileInfo.id);
                    }}
                    aria-label="Remove file"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3 h-3"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

// Helper component for file type icons
function FileTypeIcon({ fileType }: { fileType: string }) {
  let icon;
  
  if (fileType.startsWith('image/')) {
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    );
  } else if (fileType.startsWith('video/')) {
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    );
  } else if (fileType.startsWith('audio/')) {
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    );
  } else if (fileType === 'application/pdf') {
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M10 13v4h4v-4" />
        <polyline points="10 13 12 11 14 13" />
      </svg>
    );
  } else {
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    );
  }
  
  return (
    <div className="text-midnight-forest/70 dark:text-white/70">
      {icon}
    </div>
  );
} 