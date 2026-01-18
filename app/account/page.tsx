'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export default function AccountPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [fullName, setFullName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [quota, setQuota] = useState<{ count: number; limit: number } | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadProfile()
      loadQuota()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        console.error('Error loading profile:', fetchError)
        setError('Failed to load profile')
      } else if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
        setDisplayName(data.display_name || '')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadQuota = async () => {
    if (!user) return

    try {
      const supabase = createClient()
      const startOfMonth = new Date()
      startOfMonth.setUTCDate(1)
      startOfMonth.setUTCHours(0, 0, 0, 0)

      const { count } = await supabase
        .from('interviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())

      setQuota({ count: count || 0, limit: 10 })
    } catch (err) {
      console.error('Error loading quota:', err)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: fullName,
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error updating profile:', updateError)
        setError('Failed to update profile')
      } else {
        setSuccess(true)
        await loadProfile()
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your profile and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Email (Read-only) */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">
                Email address cannot be changed
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSave} className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Details</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">Profile updated successfully!</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  placeholder="John"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {profile?.created_at && (
                  <p className="text-sm text-gray-500">
                    Joined {new Date(profile.created_at + 'Z').toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
          </form>

          {/* Monthly Interview Limit */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Interview Limit
            </h2>
            {quota ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Interviews this month:</span>
                  <span className="font-semibold">{quota.count} / {quota.limit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-medical-600 h-2 rounded-full transition-all"
                    style={{ width: `${(quota.count / quota.limit) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Limit resets on the 1st of each month
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Loading...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
