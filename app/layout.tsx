import { Geist } from 'next/font/google'
import { ThemeProvider } from '@/hooks/use-theme'
import { CurrencyProvider } from '@/hooks/use-currency'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans`}>
        <ThemeProvider>
          <CurrencyProvider>
            <main>{children}</main>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
