import AuraBackground from '@/components/aura/AuraBackground'
import { Dumbbell } from 'lucide-react'

export default function MaintenancePage() {
  return (
    <>
      <AuraBackground />
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <main className="max-w-lg w-full text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
              <Dumbbell className="w-10 h-10 text-purple-400" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Lightstack
            </h1>
            <h2 className="text-2xl font-semibold text-white">
              Down for Maintenance
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              We&apos;re making improvements to give you a better experience.
              Check back soon.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-2">
            <p className="text-slate-300 text-sm font-medium">What to expect</p>
            <p className="text-slate-500 text-sm">
              The app will be back online shortly. Your data is safe and nothing has been lost.
            </p>
          </div>
        </main>
      </div>
    </>
  )
}
