'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()

  // Don't show header on auth page
  if (pathname === '/auth') {
    return null
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-medical-600">
              PA MMI
            </Link>

            {user && (
              <nav className="hidden md:flex space-x-4">
                <Link
                  href="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/'
                      ? 'bg-medical-100 text-medical-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/history"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/history'
                      ? 'bg-medical-100 text-medical-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Completed Interviews
                </Link>
                <Link
                  href="/account"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/account'
                      ? 'bg-medical-100 text-medical-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Account
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : user ? (
              <>
                <span className="text-sm text-gray-700 hidden sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 text-sm font-medium text-white bg-medical-600 hover:bg-medical-700 rounded-md transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
