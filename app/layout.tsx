import type { Metadata } from 'next'
import { Inter, Amiri } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const amiri = Amiri({
  weight: ['400', '700'],
  subsets: ['latin', 'arabic'],
  variable: '--font-amiri'
})

export const metadata: Metadata = {
  title: 'Dar-Ul-Kutub - Islamic Book Marketplace',
  description: 'Find authentic Islamic books from trusted vendors across the United States',
  keywords: ['Islamic books', 'Quran', 'Hadith', 'Fiqh', 'Islamic education', 'Muslim bookstore'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${amiri.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
