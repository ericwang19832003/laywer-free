'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Download, Save, Check, Clock, FileText, Users, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateRule26fAgendaText, type Rule26fAgenda } from '@/lib/discovery/rule-26f-agenda'

interface AgendaTopic {
  id: string
  label: string
  description: string
  notes: string
  agreed: boolean | null
}

const DEFAULT_TOPICS: AgendaTopic[] = [
  { id: 'jurisdiction', label: 'Jurisdiction and Service', description: 'Confirm all parties have been properly served and court has jurisdiction.', notes: '', agreed: null },
  { id: 'claims', label: 'Claims and Defenses', description: 'Brief discussion of plaintiff claims and defendant defenses.', notes: '', agreed: null },
  { id: 'disclosures', label: 'Initial Disclosures', description: 'When will initial disclosures under Rule 26(a)(1) be exchanged?', notes: '', agreed: null },
  { id: 'scope', label: 'Discovery Scope', description: 'What subjects of discovery are anticipated? Any limitations needed?', notes: '', agreed: null },
  { id: 'esi', label: 'ESI and Electronically Stored Information', description: 'Format for production, metadata requirements, privilege log procedures.', notes: '', agreed: null },
  { id: 'depositions', label: 'Depositions', description: 'Number of depositions permitted, notice requirements, who may attend.', notes: '', agreed: null },
  { id: 'timeline', label: 'Discovery Timeline', description: 'Proposed dates for discovery opening, closing, and expert disclosures.', notes: '', agreed: null },
  { id: 'pretrial', label: 'Pre-Trial Conference', description: 'Proposed date for pre-trial conference.', notes: '', agreed: null },
  { id: 'trial', label: 'Trial Date', description: 'Requested trial date and estimated trial length.', notes: '', agreed: null },
  { id: 'settlement', label: 'Settlement and ADR', description: 'Whether parties will engage in settlement discussions or ADR.', notes: '', agreed: null },
  { id: 'protective', label: 'Protective Orders', description: 'Need for any protective order regarding confidential information.', notes: '', agreed: null },
  { id: 'other', label: 'Other Matters', description: 'Any other matters the parties wish to raise.', notes: '', agreed: null },
]

interface Rule26fAgendaBuilderProps {
  caseId: string
  caseName: string
  caseNumber?: string
}

export function Rule26fAgendaBuilder({ caseId, caseName, caseNumber }: Rule26fAgendaBuilderProps) {
  const [activeTab, setActiveTab] = useState('edit')
  const [saving, setSaving] = useState(false)

  const [yourName, setYourName] = useState('')
  const [opposingCounsel, setOpposingCounsel] = useState('')
  const [conferenceDate, setConferenceDate] = useState('')
  const [conferenceTime, setConferenceTime] = useState('')
  const [conferenceLocation, setConferenceLocation] = useState('')
  const [topics, setTopics] = useState<AgendaTopic[]>(DEFAULT_TOPICS)

  const updateTopic = (id: string, updates: Partial<AgendaTopic>) => {
    setTopics(topics.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const agenda: Rule26fAgenda = {
        header: 'RULE 26(f) CONFERENCE AGENDA',
        caseInfo: { caseName, caseNumber: caseNumber || '', conferenceDate, conferenceTime, conferenceLocation },
        participants: { yourName, opposingCounsel },
        agendaItems: topics.map(({ id, label, description, notes, agreed }) => ({
          id, label, description, notes, agreed, contested: agreed === false
        })),
        additionalTopics: [],
        nextSteps: [],
        signatureBlock: { yourSignature: '', opposingSignature: '', date: '' },
      }
      
      const response = await fetch(`/api/cases/${caseId}/meetings/agenda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agenda),
      })

      if (!response.ok) throw new Error('Failed to save')
    } catch (error) {
      console.error('Error saving agenda:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = () => {
    const agenda: Rule26fAgenda = {
      header: 'RULE 26(f) CONFERENCE AGENDA',
      caseInfo: { caseName, caseNumber: caseNumber || '', conferenceDate, conferenceTime, conferenceLocation },
      participants: { yourName, opposingCounsel },
      agendaItems: topics.map(({ id, label, description, notes, agreed }) => ({
        id, label, description, notes, agreed, contested: agreed === false
      })),
      additionalTopics: [],
      nextSteps: [],
      signatureBlock: { yourSignature: '', opposingSignature: '', date: '' },
    }

    const text = generateRule26fAgendaText(agenda)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rule-26f-agenda-${caseNumber || 'case'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const agreedCount = topics.filter(t => t.agreed === true).length
  const disagreedCount = topics.filter(t => t.agreed === false).length
  const pendingCount = topics.filter(t => t.agreed === null).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-calm-indigo" />
          Rule 26(f) Conference Agenda
        </CardTitle>
        <CardDescription>
          Generate a structured agenda for your discovery conference with opposing counsel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="edit">Edit Agenda</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6">
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
              <div className="space-y-2">
                <Label htmlFor="conferenceDate">Conference Date</Label>
                <Input
                  id="conferenceDate"
                  type="date"
                  value={conferenceDate}
                  onChange={(e) => setConferenceDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conferenceTime">Conference Time</Label>
                <Input
                  id="conferenceTime"
                  type="time"
                  value={conferenceTime}
                  onChange={(e) => setConferenceTime(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="conferenceLocation">Location</Label>
                <Input
                  id="conferenceLocation"
                  value={conferenceLocation}
                  onChange={(e) => setConferenceLocation(e.target.value)}
                  placeholder="In person, phone, video conference..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Agenda Topics</Label>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-calm-green">
                    <Check className="h-3 w-3 mr-1" />{agreedCount} Agreed
                  </Badge>
                  <Badge variant="outline" className="text-red-500">
                    <Clock className="h-3 w-3 mr-1" />{pendingCount} Pending
                  </Badge>
                </div>
              </div>

              {topics.map((topic) => (
                <Card key={topic.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{topic.label}</h4>
                        <p className="text-xs text-warm-muted mt-1">{topic.description}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant={topic.agreed === true ? 'default' : 'outline'}
                          className="h-8 px-2"
                          onClick={() => updateTopic(topic.id, { agreed: topic.agreed === true ? null : true })}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={topic.agreed === false ? 'destructive' : 'outline'}
                          className="h-8 px-2"
                          onClick={() => updateTopic(topic.id, { agreed: topic.agreed === false ? null : false })}
                        >
                          <span className="text-lg leading-none">×</span>
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={topic.notes}
                      onChange={(e) => updateTopic(topic.id, { notes: e.target.value })}
                      placeholder="Notes from discussion..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <div className="space-y-4">
              <div className="rounded-lg border bg-warm-bg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-calm-indigo" />
                  <span className="font-medium">Conference Details</span>
                </div>
                <p className="text-sm text-warm-muted">
                  {conferenceDate || '[Date]'} at {conferenceTime || '[Time]'}
                  {conferenceLocation && ` - ${conferenceLocation}`}
                </p>
              </div>

              <div className="rounded-lg border bg-warm-bg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-calm-indigo" />
                  <span className="font-medium">Participants</span>
                </div>
                <p className="text-sm text-warm-muted">
                  {yourName || '[Your Name]'} vs {opposingCounsel || '[Opposing Counsel]'}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Agenda Items</h4>
                {topics.map((topic) => (
                  <div key={topic.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                      topic.agreed === true ? 'bg-calm-green text-white' :
                      topic.agreed === false ? 'bg-red-500 text-white' :
                      'bg-warm-bg text-warm-muted'
                    )}>
                      {topic.agreed === true ? (
                        <Check className="h-4 w-4" />
                      ) : topic.agreed === false ? (
                        <span className="text-sm font-bold">×</span>
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{topic.label}</p>
                      <p className="text-xs text-warm-muted">{topic.description}</p>
                      {topic.notes && (
                        <p className="text-xs text-warm-text mt-1 italic">{topic.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
