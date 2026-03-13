import type { Metadata } from 'next'
import { Web3Provider } from '@/lib/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'BEAN Agent Marketplace',
  description: 'Discover and invest in automated BEAN mining agents',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}
