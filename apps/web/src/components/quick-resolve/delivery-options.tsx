'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Download, Send, Loader2 } from 'lucide-react'

interface DeliveryOptionsProps {
  letterHtml: string
  onSendCertified: () => void
  sending: boolean
}

export function DeliveryOptions({ letterHtml, onSendCertified, sending }: DeliveryOptionsProps) {
  function handleDownloadPdf() {
    const blob = new Blob([letterHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'demand-letter.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleEmail() {
    const subject = encodeURIComponent('Demand Letter')
    const body = encodeURIComponent('Please find the attached demand letter.')
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-warm-text mb-2">
          How would you like to send it?
        </h2>
        <p className="text-warm-muted">
          Certified mail creates a legal record that the letter was received.
        </p>
      </div>

      <div className="space-y-4">
        {/* Certified Mail — primary option */}
        <Card className="bg-white border-2 border-calm-indigo">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-calm-indigo/10 shrink-0">
                <Mail className="h-5 w-5 text-calm-indigo" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-warm-text">Certified Mail</h3>
                  <span className="rounded-full bg-calm-indigo/10 px-2 py-0.5 text-[10px] font-medium text-calm-indigo">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-warm-muted mb-4">
                  We print, mail, and track your letter via USPS Certified Mail. You&apos;ll get a tracking number and delivery confirmation &mdash; proof they received it.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-warm-text">$7.99</span>
                  <Button onClick={onSendCertified} disabled={sending}>
                    {sending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send via Certified Mail
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PDF Download */}
        <Card className="bg-white border-warm-border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warm-bg shrink-0">
                <Download className="h-5 w-5 text-warm-muted" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-warm-text mb-1">Download PDF</h3>
                <p className="text-xs text-warm-muted mb-4">
                  Download the letter to print and mail yourself.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-calm-green">Free</span>
                  <Button variant="outline" onClick={handleDownloadPdf}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card className="bg-white border-warm-border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warm-bg shrink-0">
                <Send className="h-5 w-5 text-warm-muted" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-warm-text mb-1">Send via Email</h3>
                <p className="text-xs text-warm-muted mb-4">
                  Open your email client with the letter ready to send. Note: email doesn&apos;t create proof of delivery.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-calm-green">Free</span>
                  <Button variant="outline" onClick={handleEmail}>
                    <Send className="mr-2 h-4 w-4" />
                    Send via Email
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
