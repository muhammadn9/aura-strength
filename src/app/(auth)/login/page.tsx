import Link from 'next/link'
import AuthForm from '@/components/auth/AuthForm'
import { motion } from 'framer-motion'

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="mt-2 text-slate-400">
          Sign in to continue your strength journey
        </p>
      </div>

      <AuthForm mode="login" />

      <p className="text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <Link
          href="/signup"
          className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}

