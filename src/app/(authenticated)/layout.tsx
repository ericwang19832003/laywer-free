import { TopNav } from '@/components/layout/top-nav'
import { BottomNav } from '@/components/layout/bottom-nav'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <TopNav />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 lg:pb-0">
        {children}
      </div>
      <BottomNav />
    </>
  )
}
