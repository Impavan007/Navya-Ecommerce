import type { Metadata } from 'next'
import './globals.css'
import './globals.css'
import LenderLayoutWrapper from './components/LenderLayoutWrapper'

export const metadata: Metadata = {
  title: 'Navyaa Supplier Dashboard',
  description: 'Manage your textile listings with Navyaa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LenderLayoutWrapper>
      {children}
    </LenderLayoutWrapper>
  )
}