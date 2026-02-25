import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function POST() {
  // CSRF protection: validate that the request origin matches the app host
  const headersList = await headers()
  const origin = headersList.get('origin')
  const host = headersList.get('host')

  if (origin && host) {
    const originHost = new URL(origin).host
    if (originHost !== host) {
      return new Response('Forbidden', { status: 403 })
    }
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

