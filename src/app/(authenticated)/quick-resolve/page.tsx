import { QuickResolveFlow } from '@/components/quick-resolve/quick-resolve-flow'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'

export default function QuickResolvePage() {
  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="py-6">
        <QuickResolveFlow />
        <LegalDisclaimer />
      </main>
    </div>
  )
}
