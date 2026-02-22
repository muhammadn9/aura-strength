import AuraBackground from '@/components/aura/AuraBackground'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuraBackground />
      <div className="min-h-dvh flex items-center justify-center p-4 py-8">
        {children}
      </div>
    </>
  )
}
