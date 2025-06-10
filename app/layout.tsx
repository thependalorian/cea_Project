import './globals.css'
import { ThemeProvider } from 'next-themes'
import { Toaster } from "@/components/ui/toaster";
import { ChatProvider } from '@/contexts/ChatContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Climate Economy Assistant | Find Climate Jobs',
  description: 'AI-powered platform connecting job seekers with climate opportunities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="font-sf-pro" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <ChatProvider>
              <main className="min-h-screen flex flex-col items-center">
                {children}
              </main>
            </ChatProvider>
          </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
