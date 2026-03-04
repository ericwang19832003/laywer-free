'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

type NotificationPrefs = {
  deadline_approaching: boolean
  task_unlocked: boolean
  escalation_triggered: boolean
}

const DEFAULT_PREFS: NotificationPrefs = {
  deadline_approaching: true,
  task_unlocked: true,
  escalation_triggered: true,
}

export default function SettingsPage() {
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isPhoneUser, setIsPhoneUser] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS)

  // Data export
  const [exporting, setExporting] = useState(false)

  // Delete account
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? '')
        setPhone(data.user.phone ?? '')
        setIsPhoneUser(!data.user.email && !!data.user.phone)
        setDisplayName(data.user.user_metadata?.display_name ?? '')
        const prefs = data.user.user_metadata?.notification_prefs
        if (prefs) {
          setNotificationPrefs({
            deadline_approaching: prefs.deadline_approaching ?? true,
            task_unlocked: prefs.task_unlocked ?? true,
            escalation_triggered: prefs.escalation_triggered ?? true,
          })
        }
      }
    })
  }, [])

  async function handleSaveProfile() {
    setSavingProfile(true)
    const { error } = await getSupabase().auth.updateUser({
      data: { display_name: displayName },
    })
    setSavingProfile(false)
    if (error) {
      toast.error('Failed to update profile')
    } else {
      toast.success('Profile updated')
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setChangingPassword(true)
    const { error } = await getSupabase().auth.updateUser({
      password: newPassword,
    })
    setChangingPassword(false)
    if (error) {
      toast.error('Failed to change password')
    } else {
      toast.success('Password changed')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  async function handleSignOut() {
    await getSupabase().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handleNotificationPrefChange(type: keyof NotificationPrefs, checked: boolean) {
    const updatedPrefs = { ...notificationPrefs, [type]: checked }
    setNotificationPrefs(updatedPrefs)
    const { error } = await getSupabase().auth.updateUser({
      data: { notification_prefs: updatedPrefs },
    })
    if (error) {
      // Revert on failure
      setNotificationPrefs(notificationPrefs)
      toast.error('Failed to update notification preferences')
    } else {
      toast.success('Notification preferences updated')
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/account/export')
      if (!res.ok) {
        throw new Error('Export failed')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lawyer-free-export-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Data exported successfully')
    } catch {
      toast.error('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation !== 'DELETE') return
    setDeleting(true)
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete account')
      }
      toast.success('Account deleted')
      router.push('/login')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
      setDeleteConfirmation('')
    }
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="Settings"
          subtitle="Manage your account and preferences."
        />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPhoneUser ? (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={phone} disabled className="bg-warm-bg" />
                  <p className="text-xs text-warm-muted">Phone number cannot be changed.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} disabled className="bg-warm-bg" />
                  <p className="text-xs text-warm-muted">Email cannot be changed.</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={savingProfile} size="sm">
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

          {!isPhoneUser && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button onClick={handleChangePassword} disabled={changingPassword} size="sm">
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {([
                { key: 'deadline_approaching' as const, label: 'Deadline reminders' },
                { key: 'task_unlocked' as const, label: 'Task unlocked' },
                { key: 'escalation_triggered' as const, label: 'Escalation alerts' },
              ]).map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-warm-text">{label}</span>
                  <input
                    type="checkbox"
                    checked={notificationPrefs[key]}
                    className="h-4 w-4 rounded border-warm-border accent-calm-indigo"
                    onChange={(e) => handleNotificationPrefChange(key, e.target.checked)}
                  />
                </label>
              ))}
              <p className="text-xs text-warm-muted">Controls which in-app notifications you receive.</p>
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-warm-muted mb-3">
                Download all your case data as a JSON file. This includes cases, tasks, deadlines, notes, and activity history.
              </p>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
                {exporting ? 'Preparing...' : 'Export My Data'}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-warm-muted">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your cases, documents, tasks, deadlines, and other data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="deleteConfirmation">
              Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
            </Label>
            <Input
              id="deleteConfirmation"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setDeleteConfirmation('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="border-red-200 bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'DELETE' || deleting}
            >
              {deleting ? 'Deleting...' : 'Permanently Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
