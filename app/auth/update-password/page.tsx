/**
 * Update Password Page - Climate Economy Assistant
 * Handles password updates after reset email verification
 * Location: app/auth/update-password/page.tsx
 */

import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-seafoam-blue/20 to-spring-green/20 p-4">
      <UpdatePasswordForm />
    </div>
  );
}

export const metadata = {
  title: "Update Password - Climate Economy Assistant",
  description: "Set your new password",
}; 