'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Mail, CheckCircle, Truck, AlertCircle, Clock } from 'lucide-react'

interface DeliveryData {
  id: string
  status: string
  recipientName: string
  trackingNumber: string | null
  sentAt: string | null
  deliveredAt: string | null
}

const STATUS_CONFIG: Record<string, { icon: typeof Mail; label: string; color: string }> = {
  created: { icon: Clock, label: 'Processing', color: 'text-warm-muted' },
  mailed: { icon: Mail, label: 'Mailed', color: 'text-calm-indigo' },
  in_transit: { icon: Truck, label: 'In Transit', color: 'text-calm-indigo' },
  delivered: { icon: CheckCircle, label: 'Delivered', color: 'text-calm-green' },
  returned: { icon: AlertCircle, label: 'Returned', color: 'text-calm-amber' },
  failed: { icon: AlertCircle, label: 'Failed', color: 'text-calm-amber' },
}

const STEPS = ['created', 'mailed', 'in_transit', 'delivered'] as const

export function DeliveryTrackingCard({ delivery }: { delivery: DeliveryData }) {
  const config = STATUS_CONFIG[delivery.status] ?? STATUS_CONFIG.created
  const Icon = config.icon
  const currentIdx = STEPS.indexOf(delivery.status as typeof STEPS[number])

  return (
    <Card>
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-4 w-4 text-calm-indigo" />
          <h3 className="text-sm font-semibold text-warm-text">Demand Letter Delivery</h3>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Icon className={`h-5 w-5 ${config.color}`} />
          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
          <span className="text-xs text-warm-muted">— to {delivery.recipientName}</span>
        </div>

        {/* Progress timeline */}
        <div className="flex items-center gap-1 mb-3">
          {STEPS.map((step, i) => (
            <div key={step} className="flex-1 flex items-center">
              <div
                className={`h-2 w-full rounded-full ${
                  i <= currentIdx ? 'bg-calm-green' : 'bg-warm-border'
                }`}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between text-xs text-warm-muted">
          <span>Sent</span>
          <span>Mailed</span>
          <span>In Transit</span>
          <span>Delivered</span>
        </div>

        {delivery.trackingNumber && (
          <p className="text-xs text-warm-muted mt-3">
            Tracking: {delivery.trackingNumber}
          </p>
        )}

        {delivery.sentAt && (
          <p className="text-xs text-warm-muted mt-1">
            Sent {new Date(delivery.sentAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
