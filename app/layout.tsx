import './globals.css'
import { Inter } from "next/font/google";
import { ThemeProvider } from 'next-themes'
import { Toaster } from "@/components/ui/toaster";
import { ChatProvider } from '@/contexts/ChatContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ["latin"] });

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Climate Economy Assistant',
  description: 'AI-powered career guidance for navigating the transition to a sustainable future in Massachusetts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-midnight-forest antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <ChatProvider>
              {children}
              <Toaster />
            </ChatProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
