'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle, Copy, Download, FileText, Loader2, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DOCUMENT_TYPES, type DocumentType } from '@/lib/ai/document-generation'

interface DocumentGeneratorProps {
  caseId: string
  caseName: string
  caseNumber?: string
}

export function DocumentGenerator({ caseId, caseName, caseNumber }: DocumentGeneratorProps) {
  const [activeTab, setActiveTab] = useState('create')
  const [generating, setGenerating] = useState(false)
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false)
  const [generateConsentChecked, setGenerateConsentChecked] = useState(false)
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false)

  const [documentType, setDocumentType] = useState<DocumentType>('letter')
  const [recipientName, setRecipientName] = useState('')
  const [recipientTitle, setRecipientTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [facts, setFacts] = useState('')
  const [claims, setClaims] = useState('')
  const [damages, setDamages] = useState('')
  const [settlementAmount, setSettlementAmount] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')

  const handleGenerate = async () => {
    if (!facts.trim()) {
      setError('Please provide some facts for the document')
      return
    }

    setGenerating(true)
    setError(null)
    setGeneratedDocument(null)

    try {
      const response = await fetch('/api/document-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          caseDetails: {
            caseName,
            caseNumber,
            yourName: 'Client',
            opposingParty: recipientName || 'Opposing Party',
            disputeType: 'Civil',
            state: 'TX',
            role: 'plaintiff',
          },
          documentDetails: {
            recipientName,
            recipientTitle,
            subject,
            facts,
            claims,
            damages,
            settlementAmount,
            additionalInfo,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate document')
      }

      setGeneratedDocument(data.document)
      setActiveTab('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate document')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedDocument) return
    await navigator.clipboard.writeText(generatedDocument)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!generatedDocument) return
    const blob = new Blob([generatedDocument], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${documentType}-${caseNumber || 'document'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const selectedDocType = DOCUMENT_TYPES.find((d) => d.value === documentType)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-calm-indigo" />
          AI Document Generator
        </CardTitle>
        <CardDescription>
          Generate professional legal documents using AI. Always review and consult an attorney before using.{' '}
          <span className="text-warm-muted/70">
            Facts you enter are processed by OpenAI to generate the document.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="create">Create Document</TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedDocument}>
              Preview & Download
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Generation Failed</p>
                  <p className="text-xs">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <select
                id="documentType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-warm-muted">{selectedDocType?.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input
                  id="recipientName"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Opposing counsel or party"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientTitle">Recipient Title</Label>
                <Input
                  id="recipientTitle"
                  value={recipientTitle}
                  onChange={(e) => setRecipientTitle(e.target.value)}
                  placeholder="Attorney at Law, etc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line (Optional)</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of the document purpose"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facts">
                Key Facts <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="facts"
                value={facts}
                onChange={(e) => setFacts(e.target.value)}
                placeholder="Describe the relevant facts of your case in chronological order..."
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-warm-muted">
                Include dates, parties involved, and specific events. More detail = better document.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="claims">Legal Claims (Optional)</Label>
              <Textarea
                id="claims"
                value={claims}
                onChange={(e) => setClaims(e.target.value)}
                placeholder="Describe the legal basis for your claims..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="damages">Damages/Relief Sought (Optional)</Label>
              <Textarea
                id="damages"
                value={damages}
                onChange={(e) => setDamages(e.target.value)}
                placeholder="Describe the damages or relief you are seeking..."
                rows={3}
              />
            </div>

            {(documentType === 'settlement_proposal' || documentType === 'mediation_statement') && (
              <div className="space-y-2">
                <Label htmlFor="settlementAmount">Proposed Settlement Amount</Label>
                <Input
                  id="settlementAmount"
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(e.target.value)}
                  placeholder="$50,000"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
              <Textarea
                id="additionalInfo"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Any other relevant information you'd like included..."
                rows={3}
              />
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-calm-amber/10 border border-calm-amber/20">
              <AlertTriangle className="h-5 w-5 text-calm-amber shrink-0 mt-0.5" />
              <p className="text-xs text-warm-text">
                <strong>Important:</strong> AI-generated documents are drafts only. Always review carefully and consult an attorney before use. These documents do not constitute legal advice.
              </p>
            </div>

            <Button
              onClick={() => {
                setGenerateConsentChecked(false)
                setShowGenerateConfirm(true)
              }}
              disabled={generating || !facts.trim()}
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Document
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {generatedDocument && (
              <>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowDownloadConfirm(true)}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>

                <div className="relative">
                  <pre className="whitespace-pre-wrap text-sm bg-warm-bg p-4 rounded-lg border overflow-auto max-h-[500px]">
                    {generatedDocument}
                  </pre>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-calm-amber/10 border border-calm-amber/20">
                  <AlertTriangle className="h-5 w-5 text-calm-amber shrink-0 mt-0.5" />
                  <p className="text-xs text-warm-text">
                    <strong>Review Required:</strong> This is an AI-generated draft. Please review carefully, verify all facts, and consult an attorney before using this document.
                  </p>
                </div>

                <Button variant="outline" onClick={() => setActiveTab('create')}>
                  Create Another Document
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={showGenerateConfirm} onOpenChange={setShowGenerateConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Before You Generate</DialogTitle>
              <DialogDescription>
                AI-generated legal documents have important limitations.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <ul className="text-sm text-warm-text space-y-2 list-disc pl-4">
                <li>This document is a <strong>draft only</strong> — it has not been reviewed by a licensed attorney.</li>
                <li>Do not file this document in any court without independent legal review.</li>
                <li>AI may make errors. Verify every factual statement and legal reference.</li>
                <li>Your case facts will be sent to OpenAI to generate this document.</li>
              </ul>
              <div className="flex items-start gap-2 pt-1">
                <input
                  id="generate-consent"
                  type="checkbox"
                  checked={generateConsentChecked}
                  onChange={(e) => setGenerateConsentChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-warm-border accent-calm-indigo"
                />
                <label htmlFor="generate-consent" className="text-xs text-warm-muted leading-relaxed">
                  I understand this is an unreviewed AI draft and I will not file it without independent review.
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGenerateConfirm(false)}>
                Cancel
              </Button>
              <Button
                disabled={!generateConsentChecked}
                onClick={() => {
                  setShowGenerateConfirm(false)
                  handleGenerate()
                }}
              >
                Generate Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDownloadConfirm} onOpenChange={setShowDownloadConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Download Draft Document</DialogTitle>
              <DialogDescription>
                Before downloading, please confirm you understand the following.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2 text-sm text-warm-text">
              <p>This AI-generated document:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Has <strong>NOT</strong> been reviewed by a licensed attorney</li>
                <li>Should be treated as a starting draft, not a finished document</li>
                <li>May contain errors in law, facts, or formatting</li>
              </ul>
              <p className="pt-1 text-warm-muted text-xs">
                Always have a qualified attorney review before filing or sending.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDownloadConfirm(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowDownloadConfirm(false)
                  handleDownload()
                }}
              >
                Download Anyway
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
