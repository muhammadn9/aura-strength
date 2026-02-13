import Link from 'next/link'
import AuthForm from '@/components/auth/AuthForm'

export default function SignupPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Start Your Journey
        </h1>
        <p className="mt-2 text-slate-400">
          Create your account and unlock your potential
        </p>
      </div>

      <AuthForm mode="signup" />

      <p className="text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

