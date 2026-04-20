import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NutriFit - Your Personal Nutrition & Fitness Companion',
  description: 'Track your nutrition, manage your health, and achieve your fitness goals with NutriFit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}





