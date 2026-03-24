'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Save, Download, Check, X, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Attendee {
  name: string
  role: string
  present: boolean
}

interface TopicDiscussed {
  topic: string
  yourPosition: string
  opposingPosition: string
  outcome: 'agreed' | 'disagreed' | 'deferred' | 'pending'
  notes: string
}

interface FollowUpItem {
  action: string
  responsibleParty: 'plaintiff' | 'defendant' | 'both'
  deadline: string | null
  completed: boolean
}

interface ConferenceSummaryFormProps {
  caseId: string
  caseName: string
  caseNumber?: string
  existingSummary?: {
    id: string
    conference_type: string
    conference_date: string
    topics_discussed: TopicDiscussed[]
    agreements: string[]
    disagreements: string[]
    follow_up_items: FollowUpItem[]
  }
}

const CONFERENCE_TYPES = [
  { value: 'rule_26f', label: 'Rule 26(f) Conference' },
  { value: 'scheduling', label: 'Scheduling Conference' },
  { value: 'pretrial', label: 'Pre-Trial Conference' },
  { value: 'settlement', label: 'Settlement Conference' },
  { value: 'status', label: 'Status Conference' },
  { value: 'other', label: 'Other' },
]

export function ConferenceSummaryForm({
  caseId,
  caseName,
  caseNumber,
  existingSummary,
}: ConferenceSummaryFormProps) {
  const [activeTab, setActiveTab] = useState(existingSummary ? 'edit' : 'new')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [conferenceType, setConferenceType] = useState(
    existingSummary?.conference_type || 'rule_26f'
  )
  const [conferenceDate, setConferenceDate] = useState(
    existingSummary?.conference_date || ''
  )
  const [conferenceTime, setConferenceTime] = useState('')
  const [conferenceLocation, setConferenceLocation] = useState('')
  const [yourName, setYourName] = useState('')
  const [opposingCounsel, setOpposingCounsel] = useState('')
  const [attendees, setAttendees] = useState<Attendee[]>([
    { name: '', role: '', present: true },
  ])
  const [topics, setTopics] = useState<TopicDiscussed[]>(
    existingSummary?.topics_discussed || []
  )
  const [agreements, setAgreements] = useState<string[]>(
    existingSummary?.agreements || []
  )
  const [disagreements, setDisagreements] = useState<string[]>(
    existingSummary?.disagreements || []
  )
  const [followUpItems, setFollowUpItems] = useState<FollowUpItem[]>(
    existingSummary?.follow_up_items || []
  )
  const [nextConferenceDate, setNextConferenceDate] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  const addAttendee = () => {
    setAttendees([...attendees, { name: '', role: '', present: true }])
  }

  const removeAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index))
  }

  const addTopic = () => {
    setTopics([
      ...topics,
      { topic: '', yourPosition: '', opposingPosition: '', outcome: 'pending', notes: '' },
    ])
  }

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index))
  }

  const addAgreement = () => {
    setAgreements([...agreements, ''])
  }

  const removeAgreement = (index: number) => {
    setAgreements(agreements.filter((_, i) => i !== index))
  }

  const addDisagreement = () => {
    setDisagreements([...disagreements, ''])
  }

  const removeDisagreement = (index: number) => {
    setDisagreements(disagreements.filter((_, i) => i !== index))
  }

  const addFollowUpItem = () => {
    setFollowUpItems([
      ...followUpItems,
      { action: '', responsibleParty: 'both', deadline: null, completed: false },
    ])
  }

  const removeFollowUpItem = (index: number) => {
    setFollowUpItems(followUpItems.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/conference-summaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conferenceType,
          conferenceDate,
          conferenceTime,
          conferenceLocation,
          yourName,
          opposingCounsel,
          attendees,
          topicsDiscussed: topics,
          agreements,
          disagreements,
          followUpItems,
          nextConference: { date: nextConferenceDate },
          additionalNotes,
        }),
      })

      if (!response.ok) throw new Error('Failed to save')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving summary:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-calm-indigo" />
          Conference Summary
        </CardTitle>
        <CardDescription>
          Document what was discussed and agreed upon at conferences with opposing counsel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="new">New Summary</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conferenceType">Conference Type</Label>
                <select
                  id="conferenceType"
                  value={conferenceType}
                  onChange={(e) => setConferenceType(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {CONFERENCE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conferenceDate">Date</Label>
                <Input
                  id="conferenceDate"
                  type="date"
                  value={conferenceDate}
                  onChange={(e) => setConferenceDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conferenceTime">Time</Label>
                <Input
                  id="conferenceTime"
                  type="time"
                  value={conferenceTime}
                  onChange={(e) => setConferenceTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conferenceLocation">Location</Label>
                <Input
                  id="conferenceLocation"
                  value={conferenceLocation}
                  onChange={(e) => setConferenceLocation(e.target.value)}
                  placeholder="In person, phone, video..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yourName">Your Name</Label>
                <Input
                  id="yourName"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opposingCounsel">Opposing Counsel</Label>
                <Input
                  id="opposingCounsel"
                  value={opposingCounsel}
                  onChange={(e) => setOpposingCounsel(e.target.value)}
                  placeholder="Opposing counsel name"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Topics Discussed</Label>
                <Button type="button" variant="outline" size="sm" onClick={addTopic}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Topic
                </Button>
              </div>
              {topics.map((topic, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Input
                        placeholder="Topic (e.g., Discovery timeline)"
                        value={topic.topic}
                        onChange={(e) => {
                          const newTopics = [...topics]
                          newTopics[index].topic = e.target.value
                          setTopics(newTopics)
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTopic(index)}
                      >
                        <Trash2 className="h-4 w-4 text-warm-muted" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Your position/argument"
                      value={topic.yourPosition}
                      onChange={(e) => {
                        const newTopics = [...topics]
                        newTopics[index].yourPosition = e.target.value
                        setTopics(newTopics)
                      }}
                    />
                    <Input
                      placeholder="Opposing position"
                      value={topic.opposingPosition}
                      onChange={(e) => {
                        const newTopics = [...topics]
                        newTopics[index].opposingPosition = e.target.value
                        setTopics(newTopics)
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={topic.outcome}
                        onChange={(e) => {
                          const newTopics = [...topics]
                          newTopics[index].outcome = e.target.value as TopicDiscussed['outcome']
                          setTopics(newTopics)
                        }}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="agreed">Agreed</option>
                        <option value="disagreed">Disagreed</option>
                        <option value="deferred">Deferred</option>
                      </select>
                      <Badge
                        variant={topic.outcome === 'agreed' ? 'default' : topic.outcome === 'disagreed' ? 'destructive' : 'secondary'}
                        className="capitalize"
                      >
                        {topic.outcome}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Agreements Reached</Label>
                <Button type="button" variant="outline" size="sm" onClick={addAgreement}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {agreements.map((agreement, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-calm-green mt-2" />
                  <Input
                    value={agreement}
                    onChange={(e) => {
                      const newAgreements = [...agreements]
                      newAgreements[index] = e.target.value
                      setAgreements(newAgreements)
                    }}
                    placeholder="What was agreed upon..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAgreement(index)}
                  >
                    <X className="h-4 w-4 text-warm-muted" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Disagreements / Open Issues</Label>
                <Button type="button" variant="outline" size="sm" onClick={addDisagreement}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {disagreements.map((disagreement, index) => (
                <div key={index} className="flex items-start gap-2">
                  <X className="h-5 w-5 text-red-500 mt-2" />
                  <Input
                    value={disagreement}
                    onChange={(e) => {
                      const newDisagreements = [...disagreements]
                      newDisagreements[index] = e.target.value
                      setDisagreements(newDisagreements)
                    }}
                    placeholder="What remains unresolved..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDisagreement(index)}
                  >
                    <X className="h-4 w-4 text-warm-muted" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Follow-Up Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFollowUpItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {followUpItems.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Input
                        value={item.action}
                        onChange={(e) => {
                          const newItems = [...followUpItems]
                          newItems[index].action = e.target.value
                          setFollowUpItems(newItems)
                        }}
                        placeholder="Action item..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFollowUpItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-warm-muted" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={item.responsibleParty}
                        onChange={(e) => {
                          const newItems = [...followUpItems]
                          newItems[index].responsibleParty = e.target.value as FollowUpItem['responsibleParty']
                          setFollowUpItems(newItems)
                        }}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="both">Both Parties</option>
                        <option value="plaintiff">You (Plaintiff)</option>
                        <option value="defendant">Opposing (Defendant)</option>
                      </select>
                      <Input
                        type="date"
                        value={item.deadline || ''}
                        onChange={(e) => {
                          const newItems = [...followUpItems]
                          newItems[index].deadline = e.target.value || null
                          setFollowUpItems(newItems)
                        }}
                        placeholder="Deadline"
                        className="w-auto"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any other observations or notes from the conference..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  'Saving...'
                ) : saved ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save Summary
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <div className="space-y-4">
              <div className="rounded-lg border bg-warm-bg p-4">
                <h4 className="font-medium mb-2">Conference Details</h4>
                <p className="text-sm text-warm-muted">
                  {CONFERENCE_TYPES.find((t) => t.value === conferenceType)?.label} - {conferenceDate}
                  {conferenceTime && ` at ${conferenceTime}`}
                  {conferenceLocation && ` @ ${conferenceLocation}`}
                </p>
              </div>

              {agreements.length > 0 && (
                <div className="rounded-lg border border-calm-green/20 bg-calm-green/5 p-4">
                  <h4 className="font-medium text-calm-green mb-2 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Agreements ({agreements.length})
                  </h4>
                  <ul className="text-sm space-y-1">
                    {agreements.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {disagreements.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Open Issues ({disagreements.length})
                  </h4>
                  <ul className="text-sm space-y-1">
                    {disagreements.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {followUpItems.length > 0 && (
                <div className="rounded-lg border bg-warm-bg p-4">
                  <h4 className="font-medium mb-2">Follow-Up Items ({followUpItems.length})</h4>
                  <ul className="text-sm space-y-2">
                    {followUpItems.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className={cn('w-2 h-2 rounded-full', item.completed ? 'bg-calm-green' : 'bg-calm-amber')} />
                        <span className={item.completed ? 'line-through text-warm-muted' : ''}>{item.action}</span>
                        {item.deadline && (
                          <Badge variant="outline" className="text-xs">{item.deadline}</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
