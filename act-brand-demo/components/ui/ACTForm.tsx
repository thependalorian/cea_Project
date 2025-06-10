"use client";

/**
 * ACT Form Component - Alliance for Climate Transition
 * Modern 2025 form implementation with iOS-inspired design
 * Location: components/ui/ACTForm.tsx
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  value?: string | number | boolean;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    errorMessage?: string;
  };
  helperText?: string;
  icon?: React.ReactNode;
}

interface ACTFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'glass' | 'frosted' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal';
  loading?: boolean;
  errors?: Record<string, string>;
  animated?: boolean;
  dark?: boolean;
  compact?: boolean;
}

export function ACTForm({
  fields,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  title,
  description,
  className,
  variant = 'default',
  size = 'md',
  layout = 'vertical',
  loading = false,
  errors = {},
  animated = true,
  dark = false,
  compact = false,
}: ACTFormProps) {
  // State to manage form values
  const [formValues, setFormValues] = useState<Record<string, any>>(() => {
    const initialValues: Record<string, any> = {};
    fields.forEach((field) => {
      initialValues[field.id] = field.value || (field.type === 'checkbox' ? false : '');
    });
    return initialValues;
  });
  
  // State to track which fields have been touched
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Variant styles with iOS-inspired design
  const variantStyles = {
    default: 'bg-white border border-sand-gray/20 shadow-ios-subtle rounded-ios-xl',
    glass: 'bg-white/15 backdrop-blur-ios border border-white/25 shadow-ios-normal rounded-ios-xl',
    frosted: 'bg-white/75 dark:bg-midnight-forest/75 backdrop-blur-ios border border-white/15 dark:border-white/10 shadow-ios-normal rounded-ios-xl',
    minimal: 'bg-transparent',
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  // Text color based on dark mode
  const textColorClass = dark || variant === 'frosted' 
    ? 'text-white' 
    : 'text-midnight-forest';
  
  // Secondary text color
  const secondaryTextColorClass = dark || variant === 'frosted'
    ? 'text-white/70'
    : 'text-midnight-forest/70';
  
  // Handler for input changes
  const handleChange = (id: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  
  // Handler for input blur (mark as touched)
  const handleBlur = (id: string) => {
    setTouched((prev) => ({
      ...prev,
      [id]: true,
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    fields.forEach((field) => {
      allTouched[field.id] = true;
    });
    setTouched(allTouched);
    
    // Submit form data if no errors
    onSubmit(formValues);
  };
  
  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  const Wrapper = animated ? motion.form : 'form';
  const Item = animated ? motion.div : 'div';
  
  const wrapperProps = animated ? {
    initial: "hidden",
    animate: "visible",
    variants: formVariants
  } : {};
  
  const itemProps = animated ? {
    variants: itemVariants
  } : {};
  
  return (
    <Wrapper 
      className={cn(
        variant !== 'minimal' ? variantStyles[variant] : '',
        sizeStyles[size],
        "w-full",
        className
      )}
      onSubmit={handleSubmit}
      {...wrapperProps}
    >
      {/* Form header */}
      {(title || description) && (
        <Item className="mb-6" {...itemProps}>
          {title && (
            <h3 className={cn(
              "font-sf-pro-rounded font-bold",
              size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl',
              textColorClass
            )}>
              {title}
            </h3>
          )}
          {description && (
            <p className={cn(
              "mt-2 font-sf-pro",
              size === 'sm' ? 'text-sm' : 'text-base',
              secondaryTextColorClass
            )}>
              {description}
            </p>
          )}
        </Item>
      )}
      
      {/* Form fields */}
      <div className={cn(
        "space-y-4",
        layout === 'horizontal' ? 'sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0' : ''
      )}>
        {fields.map((field) => (
          <Item key={field.id} {...itemProps}>
            <FormField
              field={field}
              value={formValues[field.id]}
              onChange={(value) => handleChange(field.id, value)}
              onBlur={() => handleBlur(field.id)}
              error={touched[field.id] ? errors[field.id] : undefined}
              dark={dark}
              compact={compact}
              variant={variant}
            />
          </Item>
        ))}
      </div>
      
      {/* Form actions */}
      <Item className={cn("flex items-center justify-end gap-3 mt-8")} {...itemProps}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              "py-2 px-4 rounded-ios-full font-sf-pro",
              dark || variant === 'frosted'
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-sand-gray/20 hover:bg-sand-gray/30 text-midnight-forest",
              "transition-all duration-200",
              compact ? "text-sm" : "text-base"
            )}
            disabled={loading}
          >
            {cancelText}
          </button>
        )}
        <button
          type="submit"
          className={cn(
            "py-2 px-5 rounded-ios-full font-sf-pro font-medium",
            "bg-spring-green text-midnight-forest",
            "hover:shadow-ios-subtle active:scale-95",
            "transition-all duration-200",
            compact ? "text-sm" : "text-base",
            loading ? "opacity-70 cursor-not-allowed" : ""
          )}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-midnight-forest/30 border-t-midnight-forest rounded-full animate-spin mr-2"></div>
              <span>Processing...</span>
            </div>
          ) : (
            submitText
          )}
        </button>
      </Item>
    </Wrapper>
  );
}

// Individual form field component
function FormField({
  field,
  value,
  onChange,
  onBlur,
  error,
  dark,
  compact,
  variant,
}: {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  error?: string;
  dark?: boolean;
  compact?: boolean;
  variant?: string;
}) {
  // Text color based on dark mode
  const textColorClass = dark || variant === 'frosted' 
    ? 'text-white' 
    : 'text-midnight-forest';
  
  // Secondary text color
  const secondaryTextColorClass = dark || variant === 'frosted'
    ? 'text-white/70'
    : 'text-midnight-forest/70';
  
  // Input background color
  const inputBgClass = dark || variant === 'frosted'
    ? 'bg-white/10'
    : 'bg-sand-gray/10';
  
  // Common input styles
  const inputStyles = cn(
    "w-full rounded-ios-lg px-3 py-2 font-sf-pro",
    "border border-sand-gray/20 dark:border-white/10",
    "focus:outline-none focus:ring-2 focus:ring-spring-green focus:border-transparent",
    "transition-all duration-200",
    inputBgClass,
    textColorClass,
    compact ? "text-sm" : "text-base",
    error ? "border-ios-red focus:ring-ios-red" : ""
  );
  
  // Render appropriate input based on field type
  const renderInput = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            placeholder={field.placeholder}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            required={field.required}
            disabled={field.disabled}
            className={cn(inputStyles, "resize-y min-h-24")}
            rows={5}
          />
        );
      
      case 'select':
        return (
          <select
            id={field.id}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            required={field.required}
            disabled={field.disabled}
            className={cn(inputStyles, "appearance-none bg-no-repeat bg-right-center pr-8")}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundSize: "1.25rem",
            }}
          >
            <option value="" disabled>{field.placeholder || 'Select an option'}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.id}
              checked={value as boolean}
              onChange={(e) => onChange(e.target.checked)}
              onBlur={onBlur}
              disabled={field.disabled}
              className="w-5 h-5 rounded-ios border-sand-gray/30 text-spring-green focus:ring-spring-green"
            />
            <label 
              htmlFor={field.id} 
              className={cn(
                "ml-2 font-sf-pro",
                compact ? "text-sm" : "text-base",
                textColorClass
              )}
            >
              {field.label}
            </label>
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.id}-${option.value}`}
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  onBlur={onBlur}
                  disabled={field.disabled}
                  className="w-5 h-5 border-sand-gray/30 text-spring-green focus:ring-spring-green"
                />
                <label 
                  htmlFor={`${field.id}-${option.value}`} 
                  className={cn(
                    "ml-2 font-sf-pro",
                    compact ? "text-sm" : "text-base",
                    textColorClass
                  )}
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            required={field.required}
            disabled={field.disabled}
            className={inputStyles}
          />
        );
      
      case 'file':
        return (
          <div className={cn(
            "relative",
            "border-2 border-dashed border-sand-gray/30 dark:border-white/20",
            "rounded-ios-lg px-3 py-4 text-center cursor-pointer",
            "hover:bg-sand-gray/5 dark:hover:bg-white/5",
            "transition-colors duration-200"
          )}>
            <input
              type="file"
              id={field.id}
              onChange={(e) => onChange(e.target.files?.[0] || null)}
              onBlur={onBlur}
              required={field.required}
              disabled={field.disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className={cn(
              "font-sf-pro flex flex-col items-center justify-center",
              secondaryTextColorClass
            )}>
              <svg className="w-8 h-8 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>{value ? (value as File).name : 'Choose a file or drag & drop'}</span>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="relative">
            {field.icon && (
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <span className={secondaryTextColorClass}>{field.icon}</span>
              </div>
            )}
            <input
              type={field.type}
              id={field.id}
              placeholder={field.placeholder}
              value={value as string}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              required={field.required}
              disabled={field.disabled}
              min={field.validation?.min}
              max={field.validation?.max}
              minLength={field.validation?.minLength}
              maxLength={field.validation?.maxLength}
              pattern={field.validation?.pattern?.source}
              className={cn(
                inputStyles,
                field.icon ? "pl-10" : ""
              )}
            />
          </div>
        );
    }
  };
  
  return (
    <div className="w-full">
      {field.type !== 'checkbox' && (
        <label 
          htmlFor={field.id}
          className={cn(
            "block mb-1 font-sf-pro-rounded",
            compact ? "text-sm" : "text-base",
            textColorClass
          )}
        >
          {field.label}
          {field.required && <span className="text-ios-red ml-1">*</span>}
        </label>
      )}
      
      {renderInput()}
      
      {/* Helper text or error message */}
      {(error || field.helperText) && (
        <p className={cn(
          "mt-1 font-sf-pro text-sm",
          error ? "text-ios-red" : secondaryTextColorClass
        )}>
          {error || field.helperText}
        </p>
      )}
    </div>
  );
} 