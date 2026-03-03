import { TopNav } from '@/components/layout/top-nav'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <TopNav />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </>
  )
}
