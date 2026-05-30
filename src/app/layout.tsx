import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { AudioProvider } from '@/components/audio/AudioController'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Math Stars — Practice Makes Perfect',
  description:
    'A fun, distraction-free math practice app for students and teachers.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full`}>
      <body className="min-h-full bg-[#f0f4ff] text-[#1e3a5f] antialiased">
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  )
}
