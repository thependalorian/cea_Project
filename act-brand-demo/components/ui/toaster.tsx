/**
 * Toaster Component - Alliance for Climate Transition
 * Modern 2025 toast container with iOS-inspired design
 * Location: act-brand-demo/components/ui/toaster.tsx
 */

"use client";

import * as React from "react";
import { useToast } from "./use-toast";
import { Toast, ToastAction, ToastClose, ToastTitle, ToastDescription } from "./toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div
      className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
    >
      {toasts.map(function (toast) {
        return (
          <Toast key={toast.id}>
            <div className="grid gap-1">
              {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
              {toast.description && (
                <ToastDescription>{toast.description}</ToastDescription>
              )}
            </div>
            {toast.action}
            <ToastClose />
          </Toast>
        );
      })}
    </div>
  );
} 