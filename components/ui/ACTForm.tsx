"use client";

/**
 * ACT Form Component - Alliance for Climate Transition
 * iOS-inspired form elements with modern design
 * Location: components/ui/ACTForm.tsx
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Search, 
  Calendar, 
  Clock, 
  Upload,
  ChevronDown,
  Info,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

// Base input props interface
interface BaseInputProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'glass' | 'frosted' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onIconClick?: () => void;
  onEndIconClick?: () => void;
}

// Text input props
interface ACTTextInputProps extends BaseInputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  maxLength?: number;
  showCharCount?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
}

// Textarea props
interface ACTTextareaProps extends BaseInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
  resizable?: boolean;
  autoResize?: boolean;
}

// Select props
interface ACTSelectProps extends BaseInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  searchable?: boolean;
}

// Checkbox props
interface ACTCheckboxProps {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  variant?: 'default' | 'switch';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Radio group props
interface ACTRadioGroupProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  direction?: 'row' | 'column';
  disabled?: boolean;
  className?: string;
}

// File upload props
interface ACTFileUploadProps extends BaseInputProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onChange?: (files: FileList | null) => void;
  dragAndDrop?: boolean;
  showPreview?: boolean;
}

// Common variant styles
const getVariantStyles = (
  variant: 'default' | 'glass' | 'frosted' | 'minimal', 
  size: 'sm' | 'md' | 'lg', 
  hasError: boolean
) => {
  const baseStyles = 'transition-all duration-200 rounded-ios-lg border';
  
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };
  
  const variantStyles = {
    default: hasError 
      ? 'bg-white border-ios-red focus:border-ios-red focus:ring-1 focus:ring-ios-red/20'
      : 'bg-white border-sand-gray/30 focus:border-spring-green focus:ring-1 focus:ring-spring-green/20',
    glass: hasError
      ? 'bg-white/20 backdrop-blur-ios border-ios-red/50 focus:border-ios-red focus:ring-1 focus:ring-ios-red/20'
      : 'bg-white/20 backdrop-blur-ios border-white/30 focus:border-spring-green focus:ring-1 focus:ring-spring-green/20',
    frosted: hasError
      ? 'bg-white/60 backdrop-blur-ios border-ios-red/50 focus:border-ios-red focus:ring-1 focus:ring-ios-red/20'
      : 'bg-white/60 backdrop-blur-ios border-white/40 focus:border-spring-green focus:ring-1 focus:ring-spring-green/20',
    minimal: hasError
      ? 'bg-transparent border-b border-ios-red focus:border-ios-red rounded-none'
      : 'bg-transparent border-b border-sand-gray/30 focus:border-spring-green rounded-none'
  };
  
  return cn(baseStyles, sizeStyles[size], variantStyles[variant]);
};

// Text Input Component
export const ACTTextInput = React.forwardRef<HTMLInputElement, ACTTextInputProps>(({
  label,
  placeholder,
  helperText,
  error,
  required = false,
  disabled = false,
  className,
  variant = 'default',
  size = 'md',
  type = 'text',
  value,
  defaultValue,
  onChange,
  maxLength,
  showCharCount = false,
  autoComplete,
  autoFocus = false,
  icon,
  endIcon,
  onIconClick,
  onEndIconClick,
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const currentValue = value !== undefined ? value : internalValue;
  const isPasswordType = type === 'password';
  const inputType = isPasswordType && showPassword ? 'text' : type;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-midnight-forest dark:text-white mb-2">
          {label}
          {required && <span className="text-ios-red ml-1">*</span>}
        </label>
      )}
      
      {/* Input container */}
      <div className="relative">
        {/* Start icon */}
        {icon && (
          <div 
            className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 text-sand-gray",
              onIconClick && "cursor-pointer hover:text-spring-green"
            )}
            onClick={onIconClick}
          >
            {icon}
          </div>
        )}
        
        {/* Input field */}
        <input
          ref={ref}
          type={inputType}
          value={currentValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={cn(
            getVariantStyles(variant, size, !!error),
            'w-full font-sf-pro outline-none',
            icon && 'pl-10',
            (endIcon || isPasswordType) && 'pr-10',
            disabled && 'opacity-50 cursor-not-allowed',
            'placeholder:text-sand-gray dark:placeholder:text-white/50'
          )}
          {...props}
        />
        
        {/* End icon or password toggle */}
        {(endIcon || isPasswordType) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isPasswordType ? (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-sand-gray hover:text-spring-green transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            ) : endIcon && (
              <div 
                className={cn(
                  "text-sand-gray",
                  onEndIconClick && "cursor-pointer hover:text-spring-green"
                )}
                onClick={onEndIconClick}
              >
                {endIcon}
              </div>
            )}
          </div>
        )}
        
        {/* Focus ring */}
        {isFocused && (
          <motion.div
            layoutId="focus-ring"
            className="absolute inset-0 rounded-ios-lg border-2 border-spring-green pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </div>
      
      {/* Helper text or character count */}
      <div className="flex justify-between items-center mt-1">
        <div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1 text-sm text-ios-red"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
          {!error && helperText && (
            <div className="flex items-center gap-1 text-sm text-sand-gray">
              <Info className="w-4 h-4" />
              {helperText}
            </div>
          )}
        </div>
        
        {showCharCount && maxLength && (
          <div className={cn(
            'text-sm',
            currentValue.length > maxLength * 0.9 ? 'text-ios-red' : 'text-sand-gray'
          )}>
            {currentValue.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
});

ACTTextInput.displayName = 'ACTTextInput';

// Textarea Component
export const ACTTextarea = React.forwardRef<HTMLTextAreaElement, ACTTextareaProps>(({
  label,
  placeholder,
  helperText,
  error,
  required = false,
  disabled = false,
  className,
  variant = 'default',
  size = 'md',
  value,
  defaultValue,
  onChange,
  rows = 4,
  maxLength,
  showCharCount = false,
  resizable = true,
  autoResize = false,
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
    
    // Auto-resize functionality
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [currentValue, autoResize]);
  
  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-midnight-forest dark:text-white mb-2">
          {label}
          {required && <span className="text-ios-red ml-1">*</span>}
        </label>
      )}
      
      {/* Textarea container */}
      <div className="relative">
        <textarea
          ref={ref || textareaRef}
          value={currentValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          rows={rows}
          className={cn(
            getVariantStyles(variant, size, !!error),
            'w-full font-sf-pro outline-none',
            !resizable && 'resize-none',
            autoResize && 'resize-none overflow-hidden',
            disabled && 'opacity-50 cursor-not-allowed',
            'placeholder:text-sand-gray dark:placeholder:text-white/50'
          )}
          {...props}
        />
        
        {/* Focus ring */}
        {isFocused && (
          <motion.div
            layoutId="focus-ring-textarea"
            className="absolute inset-0 rounded-ios-lg border-2 border-spring-green pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </div>
      
      {/* Helper text or character count */}
      <div className="flex justify-between items-center mt-1">
        <div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1 text-sm text-ios-red"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
          {!error && helperText && (
            <div className="flex items-center gap-1 text-sm text-sand-gray">
              <Info className="w-4 h-4" />
              {helperText}
            </div>
          )}
        </div>
        
        {showCharCount && maxLength && (
          <div className={cn(
            'text-sm',
            currentValue.length > maxLength * 0.9 ? 'text-ios-red' : 'text-sand-gray'
          )}>
            {currentValue.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
});

ACTTextarea.displayName = 'ACTTextarea';

// Select Component
export const ACTSelect = React.forwardRef<HTMLSelectElement, ACTSelectProps>(({
  label,
  placeholder = 'Select an option...',
  helperText,
  error,
  required = false,
  disabled = false,
  className,
  variant = 'default',
  size = 'md',
  value,
  defaultValue,
  onChange,
  options,
  searchable = false,
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const currentValue = value !== undefined ? value : internalValue;
  const selectedOption = options.find(opt => opt.value === currentValue);
  
  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;
  
  const handleSelect = (optionValue: string) => {
    if (value === undefined) {
      setInternalValue(optionValue);
    }
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  return (
    <div className={cn('w-full relative', className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-midnight-forest dark:text-white mb-2">
          {label}
          {required && <span className="text-ios-red ml-1">*</span>}
        </label>
      )}
      
      {/* Select trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={cn(
            getVariantStyles(variant, size, !!error),
            'w-full text-left font-sf-pro outline-none flex items-center justify-between',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span className={cn(
            selectedOption ? 'text-midnight-forest dark:text-white' : 'text-sand-gray dark:text-white/50'
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={cn(
            'w-5 h-5 text-sand-gray transition-transform',
            isOpen && 'rotate-180'
          )} />
        </button>
        
        {/* Focus ring */}
        {isFocused && (
          <motion.div
            layoutId="focus-ring-select"
            className="absolute inset-0 rounded-ios-lg border-2 border-spring-green pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </div>
      
      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-sand-gray/30 rounded-ios-lg shadow-ios-normal overflow-hidden"
          >
            {/* Search input */}
            {searchable && (
              <div className="p-3 border-b border-sand-gray/20">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sand-gray" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-10 pr-3 py-2 text-sm bg-sand-gray/10 rounded-ios-lg outline-none focus:bg-sand-gray/20"
                  />
                </div>
              </div>
            )}
            
            {/* Options */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-sm text-sand-gray text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm transition-colors',
                      'hover:bg-spring-green/10 focus:bg-spring-green/10',
                      option.value === currentValue && 'bg-spring-green/20 text-spring-green',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      {option.label}
                      {option.value === currentValue && (
                        <Check className="w-4 h-4 text-spring-green" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Helper text */}
      <div className="mt-1">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 text-sm text-ios-red"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
        {!error && helperText && (
          <div className="flex items-center gap-1 text-sm text-sand-gray">
            <Info className="w-4 h-4" />
            {helperText}
          </div>
        )}
      </div>
    </div>
  );
});

ACTSelect.displayName = 'ACTSelect';

// Checkbox Component
export const ACTCheckbox = React.forwardRef<HTMLInputElement, ACTCheckboxProps>(({
  label,
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  indeterminate = false,
  variant = 'default',
  size = 'md',
  className,
  ...props
}, ref) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  
  const isChecked = checked !== undefined ? checked : internalChecked;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    if (checked === undefined) {
      setInternalChecked(newChecked);
    }
    onChange?.(newChecked);
  };
  
  const sizeStyles = {
    sm: variant === 'switch' ? 'w-8 h-5' : 'w-4 h-4',
    md: variant === 'switch' ? 'w-10 h-6' : 'w-5 h-5',
    lg: variant === 'switch' ? 'w-12 h-7' : 'w-6 h-6'
  };
  
  if (variant === 'switch') {
    return (
      <label className={cn('flex items-center cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div className={cn(
            'rounded-full transition-all duration-200 border-2',
            sizeStyles[size],
            isChecked 
              ? 'bg-spring-green border-spring-green' 
              : 'bg-sand-gray/30 border-sand-gray/30'
          )}>
            <motion.div
              className={cn(
                'w-4 h-4 bg-white rounded-full shadow-sm',
                size === 'sm' && 'w-3 h-3',
                size === 'lg' && 'w-5 h-5'
              )}
              animate={{
                x: isChecked 
                  ? size === 'sm' ? 12 : size === 'lg' ? 20 : 16
                  : 2
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </div>
        {label && (
          <span className="ml-3 text-sm font-medium text-midnight-forest dark:text-white">
            {label}
          </span>
        )}
      </label>
    );
  }
  
  return (
    <label className={cn('flex items-center cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div className={cn(
          'rounded-ios-md border-2 transition-all duration-200 flex items-center justify-center',
          sizeStyles[size],
          isChecked 
            ? 'bg-spring-green border-spring-green' 
            : 'bg-white border-sand-gray/30'
        )}>
          <AnimatePresence>
            {(isChecked || indeterminate) && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {indeterminate ? (
                  <div className="w-2 h-0.5 bg-white rounded-full" />
                ) : (
                  <Check className={cn(
                    'text-white',
                    size === 'sm' && 'w-3 h-3',
                    size === 'md' && 'w-4 h-4',
                    size === 'lg' && 'w-5 h-5'
                  )} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {label && (
        <span className="ml-3 text-sm font-medium text-midnight-forest dark:text-white">
          {label}
        </span>
      )}
    </label>
  );
});

ACTCheckbox.displayName = 'ACTCheckbox';

// Radio Group Component
export const ACTRadioGroup = ({
  label,
  value,
  defaultValue,
  onChange,
  options,
  direction = 'column',
  disabled = false,
  className,
  ...props
}: ACTRadioGroupProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleChange = (optionValue: string) => {
    if (value === undefined) {
      setInternalValue(optionValue);
    }
    onChange?.(optionValue);
  };
  
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-midnight-forest dark:text-white mb-3">
          {label}
        </label>
      )}
      
      <div className={cn(
        'flex gap-4',
        direction === 'column' ? 'flex-col' : 'flex-row flex-wrap'
      )}>
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-center cursor-pointer',
              (disabled || option.disabled) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="relative">
              <input
                type="radio"
                value={option.value}
                checked={currentValue === option.value}
                onChange={() => !disabled && !option.disabled && handleChange(option.value)}
                disabled={disabled || option.disabled}
                className="sr-only"
                {...props}
              />
              <div className={cn(
                'w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center',
                currentValue === option.value
                  ? 'bg-spring-green border-spring-green'
                  : 'bg-white border-sand-gray/30'
              )}>
                <AnimatePresence>
                  {currentValue === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
            <span className="ml-3 text-sm font-medium text-midnight-forest dark:text-white">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

// File Upload Component
export const ACTFileUpload = ({
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  className,
  accept,
  multiple = false,
  maxSize = 10, // 10MB default
  onChange,
  dragAndDrop = true,
  showPreview = true,
  ...props
}: ACTFileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  
  // Filter out conflicting props
  const { 
    size, 
    variant, 
    icon, 
    endIcon, 
    onIconClick, 
    onEndIconClick,
    placeholder,
    ...filteredProps 
  } = props;
  
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter(file => {
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        return false;
      }
      return true;
    });
    
    setFiles(multiple ? [...files, ...validFiles] : validFiles);
    onChange?.(selectedFiles);
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };
  
  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };
  
  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-midnight-forest dark:text-white mb-2">
          {label}
          {required && <span className="text-ios-red ml-1">*</span>}
        </label>
      )}
      
      {/* Upload area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-ios-lg p-6 transition-all duration-200',
          dragOver && 'border-spring-green bg-spring-green/5',
          !dragOver && (error ? 'border-ios-red' : 'border-sand-gray/30'),
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDrag={handleDrag}
        onDragStart={handleDrag}
        onDragEnd={handleDrag}
        onDragOver={handleDrag}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={disabled}
          className="hidden"
          {...filteredProps}
        />
        
        <div className="text-center">
          <Upload className={cn(
            'mx-auto w-12 h-12 mb-4',
            dragOver ? 'text-spring-green' : 'text-sand-gray'
          )} />
          
          <div className="mb-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="text-spring-green hover:text-moss-green font-medium underline"
            >
              Choose files
            </button>
            {dragAndDrop && <span className="text-sand-gray"> or drag and drop</span>}
          </div>
          
          <p className="text-sm text-sand-gray">
            {accept ? `Accepted formats: ${accept}` : 'All file types accepted'}
            {maxSize && ` • Max size: ${maxSize}MB`}
          </p>
        </div>
      </div>
      
      {/* File preview */}
      {showPreview && files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 bg-sand-gray/10 rounded-ios-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-spring-green/20 rounded-ios-md flex items-center justify-center">
                  <span className="text-xs font-bold text-spring-green">
                    {file.name.split('.').pop()?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-midnight-forest dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-sand-gray">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 text-sand-gray hover:text-ios-red transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Helper text */}
      <div className="mt-1">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 text-sm text-ios-red"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
        {!error && helperText && (
          <div className="flex items-center gap-1 text-sm text-sand-gray">
            <Info className="w-4 h-4" />
            {helperText}
          </div>
        )}
      </div>
    </div>
  );
};

// Main ACT Form Component
interface ACTFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'glass' | 'frosted' | 'minimal';
}

export const ACTForm = ({ 
  children, 
  onSubmit, 
  className, 
  title, 
  description,
  variant = 'default' 
}: ACTFormProps) => {
  const variantStyles = {
    default: 'bg-white border border-gray-200 shadow-sm',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20',
    frosted: 'bg-white/20 backdrop-blur-lg border border-white/30',
    minimal: 'bg-transparent'
  };

  return (
    <div className={cn(
      'rounded-lg p-6',
      variantStyles[variant],
      className
    )}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
        </div>
      )}
      
      <form onSubmit={onSubmit} className="space-y-6">
        {children}
      </form>
    </div>
  );
}; 