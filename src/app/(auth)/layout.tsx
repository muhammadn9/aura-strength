import AuraBackground from '@/components/aura/AuraBackground'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuraBackground />
      <div className="min-h-screen flex items-center justify-center p-4">
        {children}
      </div>
    </>
  )
}
