import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { InterviewProvider } from '@/components/providers/InterviewProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PA MMI Mock Interviewer',
  description: 'Practice your Physician Assistant MMI interviews with AI feedback',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <InterviewProvider>
          {children}
        </InterviewProvider>
      </body>
    </html>
  )
}
