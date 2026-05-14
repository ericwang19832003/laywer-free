'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type TimingKey = 'days_7' | 'days_3' | 'days_1' | 'day_of'
type ChannelKey = 'email' | 'in_app' | 'sms'

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
    sms: false,
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
  { key: 'sms' as const, label: 'SMS text alerts', description: 'Get texts 3 days, 1 day, and day-of deadline' },
]

interface NotificationPreferencesProps {
  initialPreferences?: Partial<NotificationPreferencesData>
  initialPhone?: string
  initialSmsOptIn?: boolean
}

export function NotificationPreferences({ initialPreferences, initialPhone, initialSmsOptIn: _initialSmsOptIn }: NotificationPreferencesProps) {
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
  const [phone, setPhone] = useState(initialPhone ?? '')
  const [phoneError, setPhoneError] = useState('')

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
    // Validate SMS phone before making any API calls
    const e164 = /^\+[1-9]\d{1,14}$/
    if (preferences.channels.sms) {
      if (!e164.test(phone)) {
        setPhoneError('Enter a valid number: +1XXXXXXXXXX')
        return
      }
    }

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: { notification_preferences: preferences },
      })
      if (error) throw error

      // Save SMS preferences
      if (preferences.channels.sms) {
        await fetch('/api/user-preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone_number: phone, sms_opt_in: true }),
        })
      } else {
        await fetch('/api/user-preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sms_opt_in: false }),
        })
      }

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
          {preferences.channels.sms && (
            <div className="mt-3 space-y-1">
              <Label htmlFor="sms-phone">Mobile number for SMS alerts</Label>
              <Input
                id="sms-phone"
                type="tel"
                placeholder="+1 555 000 0000"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setPhoneError('') }}
              />
              {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
              <p className="text-xs text-muted-foreground">Format: +1XXXXXXXXXX</p>
            </div>
          )}
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
