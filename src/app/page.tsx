import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WelcomePanel } from '@/components/auth/welcome-panel'
import { WelcomeAuthCard } from '@/components/auth/welcome-auth-card'

interface HomeProps {
  searchParams: Promise<{ mode?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/cases')
  }

  const params = await searchParams
  const initialMode = params.mode === 'signup' ? 'signup' : 'login'

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-warm-bg">
      {/* Left panel — value proposition */}
      <div
        className="lg:w-[55%] w-full"
        style={{
          background: 'linear-gradient(135deg, #FAFAF8 0%, #F5F5F0 100%)',
        }}
      >
        <WelcomePanel />
      </div>

      {/* Right panel — auth card */}
      <div className="lg:w-[45%] w-full flex items-center justify-center px-4 py-8 lg:py-0">
        <WelcomeAuthCard initialMode={initialMode as 'login' | 'signup'} />
      </div>
    </div>
  )
}
