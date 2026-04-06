'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Calendar, MessageSquare, CheckSquare, Download, Plus, ArrowRight, Scale, Gavel } from 'lucide-react'
import Link from 'next/link'

interface MeetingPrepCenterProps {
  caseId: string
  caseName: string
  caseNumber?: string
}

export function MeetingPrepCenter({ caseId, caseName, caseNumber }: MeetingPrepCenterProps) {
  const [activeTab, setActiveTab] = useState('court-conferences')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-calm-indigo" />
          Meeting Preparation Center
        </CardTitle>
        <CardDescription>
          Prepare for conferences with opposing counsel and court hearings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
            <TabsTrigger value="court-conferences" className="gap-1.5 text-xs">
              <Gavel className="h-3.5 w-3.5" />
              <span>Court</span>
            </TabsTrigger>
            <TabsTrigger value="settlement" className="gap-1.5 text-xs">
              <Scale className="h-3.5 w-3.5" />
              <span>Settlement</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="summaries" className="gap-1.5 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Summaries</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="court-conferences" className="space-y-3">
            <h4 className="text-sm font-medium text-warm-text">Court Conferences</h4>
            
            <div className="rounded-lg border bg-warm-bg p-3">
              <h4 className="font-medium text-sm mb-1">Rule 26(f) Conference</h4>
              <p className="text-xs text-warm-muted mb-2">
                Discovery planning with opposing counsel
              </p>
              <Button size="sm" asChild>
                <Link href={`/case/${caseId}/meetings/rule-26f-agenda`}>
                  <Plus className="h-3 w-3 mr-1" />
                  Create Agenda
                </Link>
              </Button>
            </div>

            <div className="rounded-lg border bg-warm-bg p-3">
              <h4 className="font-medium text-sm mb-1">Scheduling Conference</h4>
              <p className="text-xs text-warm-muted mb-2">
                Set case timeline and deadlines with the court
              </p>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/case/${caseId}/step/rule_26f_prep`}>
                  Start Preparation
                </Link>
              </Button>
            </div>

            <div className="rounded-lg border bg-warm-bg p-3">
              <h4 className="font-medium text-sm mb-1">Pre-Trial Conference</h4>
              <p className="text-xs text-warm-muted mb-2">
                Final preparations before trial
              </p>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/case/${caseId}/meetings/pretrial-checklist`}>
                  Start Checklist
                </Link>
              </Button>
            </div>

            <div className="rounded-lg border bg-warm-bg p-3">
              <h4 className="font-medium text-sm mb-1">Status Conference</h4>
              <p className="text-xs text-warm-muted mb-2">
                Check-in on case progress with the court
              </p>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/case/${caseId}/meetings/summary`}>
                  Use Generic Summary
                </Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settlement" className="space-y-3">
            <h4 className="text-sm font-medium text-warm-text">Settlement & Mediation</h4>
            
            <div className="rounded-lg border bg-warm-bg p-3">
              <h4 className="font-medium text-sm mb-1">Mediation Preparation</h4>
              <p className="text-xs text-warm-muted mb-2">
                Prepare for mediation with a neutral third party
              </p>
              <div className="flex gap-2">
                <Button size="sm" asChild>
                  <Link href={`/case/${caseId}/meetings/mediation-agenda`}>
                    <Plus className="h-3 w-3 mr-1" />
                    Create Agenda
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/case/${caseId}/step/pi_mediation`}>
                    Guided Prep
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-lg border bg-warm-bg p-3">
              <h4 className="font-medium text-sm mb-1">Settlement Conference</h4>
              <p className="text-xs text-warm-muted mb-2">
                Negotiate resolution with opposing party
              </p>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/case/${caseId}/meetings/settlement-prep`}>
                  Start Preparation
                </Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-3">
            <h4 className="text-sm font-medium text-warm-text">Documents & Templates</h4>
            
            <div className="rounded-lg border bg-warm-bg p-3">
              <h4 className="font-medium text-sm mb-1">Discovery Plan</h4>
              <p className="text-xs text-warm-muted mb-2">
                Joint discovery plan for Rule 26(f) compliance
              </p>
              <Button size="sm" asChild>
                <Link href={`/case/${caseId}/meetings/discovery-plan`}>
                  <Download className="h-3 w-3 mr-1" />
                  Download Template
                </Link>
              </Button>
            </div>

            <div className="rounded-lg border bg-warm-bg p-3">
              <h4 className="font-medium text-sm mb-1">Meet and Confer Letter</h4>
              <p className="text-xs text-warm-muted mb-2">
                Formal letter before filing discovery motions
              </p>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/case/${caseId}/meetings/meet-confer`}>
                  Generate Letter
                </Link>
              </Button>
            </div>

            <div className="rounded-lg border bg-warm-bg p-3">
              <h4 className="font-medium text-sm mb-1">Good Faith Certification</h4>
              <p className="text-xs text-warm-muted mb-2">
                Required certification for motion filings
              </p>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/case/${caseId}/meetings/certification`}>
                  Create Certification
                </Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="summaries" className="space-y-3">
            <h4 className="text-sm font-medium text-warm-text">Track & Document</h4>
            
            <div className="rounded-lg border bg-warm-bg p-3">
              <h4 className="font-medium text-sm mb-1">Conference Summary</h4>
              <p className="text-xs text-warm-muted mb-2">
                Document what was discussed at any meeting
              </p>
              <Button size="sm" asChild>
                <Link href={`/case/${caseId}/meetings/summary`}>
                  <Plus className="h-3 w-3 mr-1" />
                  Create Summary
                </Link>
              </Button>
            </div>

            <div className="rounded-lg border bg-warm-bg p-3">
              <h4 className="font-medium text-sm mb-1">View All Summaries</h4>
              <p className="text-xs text-warm-muted mb-2">
                Past conference summaries and outcomes
              </p>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/case/${caseId}/meetings/summaries`}>
                  View All
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
