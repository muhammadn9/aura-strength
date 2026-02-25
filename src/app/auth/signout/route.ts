import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function POST() {
  // CSRF protection: require Origin and Host headers to match
  const headersList = await headers()
  const origin = headersList.get('origin')
  const host = headersList.get('host')

  if (!origin || !host) {
    return new Response('Forbidden', { status: 403 })
  }

  let originHost: string
  try {
    originHost = new URL(origin).host
  } catch {
    return new Response('Forbidden', { status: 403 })
  }

  if (originHost !== host) {
    return new Response('Forbidden', { status: 403 })
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

