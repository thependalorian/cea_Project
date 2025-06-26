/**
 * Utility functions
 * Purpose: Common utility functions for the application
 * Location: /lib/utils.ts
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 