'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Building,
  Scale,
  Search,
  FileText,
  HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LegalAidResource {
  id: string
  name: string
  description: string
  type: 'legal_aid' | 'attorney' | 'bar_assoc' | 'court_self_help' | 'pro_bono'
  url?: string
  phone?: string
  email?: string
  address?: string
  hours?: string
  fees?: string
  eligibility?: string[]
  services?: string[]
  state?: string
}

interface EscalationReason {
  id: string
  label: string
  description: string
  icon: React.ElementType
  severity: 'low' | 'medium' | 'high' | 'critical'
  resources: LegalAidResource[]
}

const LEGAL_AID_RESOURCES: LegalAidResource[] = [
  {
    id: 'tx-legal-aid',
    name: 'Texas Legal Aid',
    description: 'Free legal services for low-income Texans',
    type: 'legal_aid',
    url: 'https://www.texaslawhelp.org/',
    phone: '1-800-955-5954',
    services: ['Civil matters', 'Housing', 'Family law', 'Consumer protection'],
    state: 'TX',
  },
  {
    id: 'lsc-funded',
    name: 'Legal Services Corporation',
    description: 'Nationwide network of legal aid organizations',
    type: 'legal_aid',
    url: 'https://www.lsc.gov/',
    phone: '1-202-295-1500',
    services: ['Low-income legal help', 'Civil legal aid'],
    state: 'ALL',
  },
  {
    id: 'state-bar-tx',
    name: 'State Bar of Texas',
    description: 'Attorney referral and legal resources',
    type: 'bar_assoc',
    url: 'https://www.texasbar.com/',
    phone: '1-800-252-9691',
    services: ['Attorney referral service', 'Lawyer search', 'Grievance filing'],
    state: 'TX',
  },
  {
    id: 'avvo',
    name: 'Avvo',
    description: 'Find attorneys and get free legal advice',
    type: 'attorney',
    url: 'https://www.avvo.com/',
    services: ['Attorney search', 'Legal Q&A', 'Client reviews'],
    state: 'ALL',
  },
  {
    id: 'lawhelp',
    name: 'LawHelp',
    description: 'Free legal information by state',
    type: 'court_self_help',
    url: 'https://www.lawhelp.org/',
    services: ['Legal information', 'Court forms', 'Find legal aid'],
    state: 'ALL',
  },
  {
    id: 'pro-bono-net',
    name: 'Pro Bono Net',
    description: 'Connecting low-income clients with volunteer attorneys',
    type: 'pro_bono',
    url: 'https://www.probono.net/',
    services: ['Pro bono matching', 'Legal clinics', 'Self-help tools'],
    state: 'ALL',
  },
]

const ESCALATION_REASONS: EscalationReason[] = [
  {
    id: 'complex_case',
    label: 'Complex Legal Issues',
    description: 'Your case involves complex legal matters that require professional judgment',
    icon: FileText,
    severity: 'high',
    resources: [LEGAL_AID_RESOURCES[0], LEGAL_AID_RESOURCES[3]],
  },
  {
    id: 'time_sensitive',
    label: 'Critical Deadlines',
    description: 'You are approaching or have missed important legal deadlines',
    icon: Clock,
    severity: 'critical',
    resources: [LEGAL_AID_RESOURCES[0], LEGAL_AID_RESOURCES[2]],
  },
  {
    id: 'opposing_counsel',
    label: 'Opposing Party Has Attorney',
    description: 'The other side has legal representation',
    icon: Users,
    severity: 'high',
    resources: [LEGAL_AID_RESOURCES[0], LEGAL_AID_RESOURCES[1], LEGAL_AID_RESOURCES[2]],
  },
  {
    id: 'safety_concerns',
    label: 'Safety or Domestic Issues',
    description: 'You have safety concerns or are dealing with domestic violence',
    icon: AlertCircle,
    severity: 'critical',
    resources: [LEGAL_AID_RESOURCES[0]],
  },
  {
    id: 'high_stakes',
    label: 'High-Value Claims',
    description: 'Your case involves significant money or property',
    icon: DollarSign,
    severity: 'medium',
    resources: [LEGAL_AID_RESOURCES[3], LEGAL_AID_RESOURCES[2]],
  },
  {
    id: 'uncertain_rights',
    label: 'Uncertain About Your Rights',
    description: 'You are unsure about your legal rights or options',
    icon: HelpCircle,
    severity: 'low',
    resources: [LEGAL_AID_RESOURCES[1], LEGAL_AID_RESOURCES[4], LEGAL_AID_RESOURCES[5]],
  },
]

interface ResourceCardProps {
  resource: LegalAidResource
}

function ResourceCard({ resource }: ResourceCardProps) {
  const typeColors = {
    legal_aid: 'bg-calm-green/10 text-calm-green border-calm-green/20',
    attorney: 'bg-primary/10 text-primary border-primary/20',
    bar_assoc: 'bg-calm-indigo/10 text-calm-indigo border-calm-indigo/20',
    court_self_help: 'bg-calm-amber/10 text-calm-amber border-calm-amber/20',
    pro_bono: 'bg-purple-50 text-purple-600 border-purple-200',
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium text-warm-text">{resource.name}</h4>
            <p className="text-sm text-warm-muted mt-1">{resource.description}</p>
          </div>
          <Badge className={cn('text-xs', typeColors[resource.type])}>
            {resource.type.replace('_', ' ')}
          </Badge>
        </div>

        {resource.services && (
          <div className="mb-3">
            <p className="text-xs text-warm-muted mb-1">Services:</p>
            <div className="flex flex-wrap gap-1">
              {resource.services.map((service) => (
                <Badge key={service} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 text-sm">
          {resource.phone && (
            <div className="flex items-center gap-2 text-warm-muted">
              <Phone className="h-4 w-4" />
              <a href={`tel:${resource.phone}`} className="hover:text-primary">
                {resource.phone}
              </a>
            </div>
          )}
          {resource.url && (
            <div className="flex items-center gap-2 text-warm-muted">
              <ExternalLink className="h-4 w-4" />
              <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-primary truncate"
              >
                {resource.url}
              </a>
            </div>
          )}
          {resource.hours && (
            <div className="flex items-center gap-2 text-warm-muted">
              <Clock className="h-4 w-4" />
              {resource.hours}
            </div>
          )}
        </div>

        {resource.fees && (
          <p className="text-xs text-calm-green mt-3 bg-calm-green/10 px-2 py-1 rounded">
            {resource.fees}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface EscalationDialogProps {
  trigger?: React.ReactNode
  caseContext?: string
  onReasonSelected?: (reason: EscalationReason) => void
}

export function EscalationDialog({
  trigger,
  caseContext,
  onReasonSelected,
}: EscalationDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState<EscalationReason | null>(null)

  const severityColors = {
    low: 'border-calm-green/30 bg-calm-green/5',
    medium: 'border-calm-amber/30 bg-calm-amber/5',
    high: 'border-orange-300 bg-orange-50',
    critical: 'border-red-300 bg-red-50',
  }

  const severityBadges = {
    low: 'bg-calm-green/10 text-calm-green',
    medium: 'bg-calm-amber/10 text-calm-amber',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  }

  const handleReasonSelect = (reason: EscalationReason) => {
    setSelectedReason(reason)
    onReasonSelected?.(reason)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Need More Help?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Get Professional Legal Help
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-warm-text">
              Lawyer Free provides legal <strong>information</strong>, but we cannot provide 
              <strong> legal advice</strong>. If your situation is complex or time-sensitive, 
              you should consult a licensed attorney.
            </p>
          </div>

          {!selectedReason ? (
            <>
              <div>
                <h3 className="font-medium text-warm-text mb-3">
                  Why do you need help?
                </h3>
                <div className="space-y-3">
                  {ESCALATION_REASONS.map((reason) => {
                    const Icon = reason.icon
                    return (
                      <Card
                        key={reason.id}
                        className={cn(
                          'cursor-pointer hover:shadow-md transition-all hover:border-primary/30',
                          severityColors[reason.severity]
                        )}
                        onClick={() => handleReasonSelect(reason)}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            severityColors[reason.severity].replace('bg-', 'bg-')
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-warm-text">{reason.label}</h4>
                              <Badge className={severityBadges[reason.severity]} variant="secondary">
                                {reason.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-warm-muted mt-1">{reason.description}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-warm-muted" />
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedReason(null)}
                className="mb-2"
              >
                ← Back to reasons
              </Button>

              <div className={cn(
                'p-4 rounded-lg',
                severityColors[selectedReason.severity]
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-warm-text">{selectedReason.label}</h3>
                  <Badge className={severityBadges[selectedReason.severity]} variant="secondary">
                    {selectedReason.severity}
                  </Badge>
                </div>
                <p className="text-sm text-warm-muted">{selectedReason.description}</p>
              </div>

              <div>
                <h4 className="font-medium text-warm-text mb-3 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Recommended Resources
                </h4>
                <div className="space-y-3">
                  {selectedReason.resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </div>

              <div className="bg-calm-indigo/5 border border-calm-indigo/20 rounded-lg p-4">
                <h4 className="font-medium text-warm-text mb-2 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Find More Help
                </h4>
                <p className="text-sm text-warm-muted mb-3">
                  Use these directories to find attorneys and legal aid in your area:
                </p>
                <div className="flex flex-wrap gap-2">
                  {LEGAL_AID_RESOURCES.filter(r => r.type === 'legal_aid' || r.type === 'bar_assoc').map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {resource.name}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="border-t pt-4">
            <p className="text-xs text-warm-muted text-center">
              <strong>Important:</strong> This is informational only. Lawyer Free is not a law firm 
              and does not create attorney-client relationships.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface QuickHelpProps {
  variant?: 'inline' | 'card' | 'banner'
  className?: string
}

export function QuickHelp({ variant = 'inline', className }: QuickHelpProps) {
  const [showResources, setShowResources] = useState(false)

  if (variant === 'banner') {
    return (
      <div className={cn('bg-calm-amber/10 border border-calm-amber/20 rounded-lg p-4', className)}>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-calm-amber flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-warm-text">Need help with your case?</h4>
            <p className="text-sm text-warm-muted mt-1 mb-3">
              If you&apos;re unsure about anything, free legal aid is available.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowResources(true)}>
                Find Legal Aid
              </Button>
              <EscalationDialog 
                trigger={<Button size="sm">Talk to an Attorney</Button>}
              />
            </div>
          </div>
        </div>
        {showResources && (
          <div className="mt-4 pt-4 border-t border-calm-amber/20">
            <h5 className="font-medium text-warm-text mb-2">Quick Resources</h5>
            <div className="grid grid-cols-2 gap-2">
              {LEGAL_AID_RESOURCES.slice(0, 4).map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  {resource.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <Card className={cn('bg-gradient-to-br from-calm-indigo/5 to-transparent', className)}>
        <CardContent className="p-4 text-center">
          <Users className="h-8 w-8 text-calm-indigo mx-auto mb-2" />
          <h4 className="font-medium text-warm-text">Not sure what to do?</h4>
          <p className="text-sm text-warm-muted mt-1 mb-3">
            Get free legal help from professionals.
          </p>
          <EscalationDialog trigger={<Button size="sm">Get Help</Button>} />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-warm-muted">Need more help?</span>
      <EscalationDialog trigger={<Button variant="ghost" size="sm">Find Resources</Button>} />
    </div>
  )
}
