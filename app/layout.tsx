import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import { InterviewProvider } from '@/components/providers/InterviewProvider'
import { DevSettingsProvider } from '@/components/providers/DevSettingsProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import DevSettingsPanel from '@/components/dev/DevSettingsPanel'
import Header from '@/components/layout/Header'

const nunito = Nunito({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PA Mock Interviewer',
  description: 'Practice your Physician Assistant MMI interviews with AI feedback',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={nunito.className}>
        <AuthProvider>
          <DevSettingsProvider>
            <InterviewProvider>
              <Header />
              <DevSettingsPanel />
              {children}
            </InterviewProvider>
          </DevSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
