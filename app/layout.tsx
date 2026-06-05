import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sports Predictions',
  description: 'Professional football match predictions with 1X2 odds and correct score analysis',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
