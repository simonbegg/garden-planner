import './globals.css'
import { Inter } from 'next/font/google'
import Navigation from '../components/Navigation'
import { PlantProvider } from '../context/PlantContext'
import { GardenLayoutProvider } from '../context/GardenLayoutContext'
import { AuthProvider } from '../context/AuthContext'
import { ActivityProvider } from '../context/ActivityContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Garden Management',
  description: 'A comprehensive garden management application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <PlantProvider>
            <GardenLayoutProvider>
              <ActivityProvider>
                <Navigation />
                <div className="min-h-screen bg-gray-50">
                  {children}
                </div>
              </ActivityProvider>
            </GardenLayoutProvider>
          </PlantProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
