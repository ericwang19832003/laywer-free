'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type TimingKey = 'days_7' | 'days_3' | 'days_1' | 'day_of'
type ChannelKey = 'email' | 'in_app'

export type NotificationPreferencesData = {
  timing: Record<TimingKey, boolean>
  channels: Record<ChannelKey, boolean>
}

const DEFAULT_PREFERENCES: NotificationPreferencesData = {
  timing: {
    days_7: true,
    days_3: true,
    days_1: true,
    day_of: true,
  },
  channels: {
    email: true,
    in_app: true,
  },
}

const TIMING_OPTIONS: { key: TimingKey; label: string }[] = [
  { key: 'days_7', label: '7 days before deadline' },
  { key: 'days_3', label: '3 days before deadline' },
  { key: 'days_1', label: '1 day before deadline' },
  { key: 'day_of', label: 'Day of deadline' },
]

const CHANNEL_OPTIONS: { key: ChannelKey; label: string; description: string }[] = [
  { key: 'email', label: 'Email', description: 'Receive reminder emails' },
  { key: 'in_app', label: 'In-app', description: 'See reminders in your notification bell' },
]

interface NotificationPreferencesProps {
  initialPreferences?: Partial<NotificationPreferencesData>
}

export function NotificationPreferences({ initialPreferences }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferencesData>(() => ({
    timing: {
      ...DEFAULT_PREFERENCES.timing,
      ...initialPreferences?.timing,
    },
    channels: {
      ...DEFAULT_PREFERENCES.channels,
      ...initialPreferences?.channels,
    },
  }))
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  function handleTimingChange(key: TimingKey, checked: boolean) {
    setPreferences((prev) => ({
      ...prev,
      timing: { ...prev.timing, [key]: checked },
    }))
    setDirty(true)
  }

  function handleChannelChange(key: ChannelKey, checked: boolean) {
    setPreferences((prev) => ({
      ...prev,
      channels: { ...prev.channels, [key]: checked },
    }))
    setDirty(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: { notification_preferences: preferences },
      })
      if (error) throw error
      toast.success('Notification preferences saved')
      setDirty(false)
    } catch {
      toast.error('Failed to save notification preferences')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-calm-indigo" />
          Reminder Preferences
        </CardTitle>
        <p className="text-sm text-warm-muted">
          Choose when and how you receive deadline reminders.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timing Section */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-warm-text">Remind me</p>
          {TIMING_OPTIONS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.timing[key]}
                onChange={(e) => handleTimingChange(key, e.target.checked)}
                className="h-4 w-4 rounded border-warm-border accent-calm-indigo"
              />
              <span className="text-sm text-warm-text">{label}</span>
            </label>
          ))}
        </div>

        {/* Channels Section */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-warm-text">Receive via</p>
          {CHANNEL_OPTIONS.map(({ key, label, description }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.channels[key]}
                onChange={(e) => handleChannelChange(key, e.target.checked)}
                className="h-4 w-4 rounded border-warm-border accent-calm-indigo"
              />
              <div>
                <span className="text-sm text-warm-text">{label}</span>
                <p className="text-xs text-warm-muted">{description}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving || !dirty}
          size="sm"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  )
}
