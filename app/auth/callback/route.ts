import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.session) {
      const session = data.session;
      
      // Upsert the user into our public schema so foreign keys work
      if (session.user) {
        const { db } = await import('../../../db');
        const { users } = await import('../../../db/schema');
        await db.insert(users).values({
          id: session.user.id,
          email: session.user.email,
        }).onConflictDoUpdate({
          target: users.id,
          set: {
            email: session.user.email,
          }
        });
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=true`)
}
