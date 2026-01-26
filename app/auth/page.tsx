'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect /auth to the home page where auth is now handled
export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/')
  }, [router])

  return null
}
