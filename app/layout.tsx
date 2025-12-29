import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { InterviewProvider } from '@/components/providers/InterviewProvider'
import { DevSettingsProvider } from '@/components/providers/DevSettingsProvider'
import DevSettingsPanel from '@/components/dev/DevSettingsPanel'

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
        <DevSettingsProvider>
          <InterviewProvider>
            <DevSettingsPanel />
            {children}
          </InterviewProvider>
        </DevSettingsProvider>
      </body>
    </html>
  )
}
