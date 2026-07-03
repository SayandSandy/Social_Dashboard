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
      const providerToken = session.provider_token;
      
      // Auto-fetch Instagram Business Account ID if we have a Facebook token
      let igBusinessAccountId = null;
      if (providerToken) {
        try {
          const res = await fetch(`https://graph.facebook.com/v22.0/me/accounts?fields=instagram_business_account,name&access_token=${providerToken}`);
          const fbData = await res.json();
          if (fbData && fbData.data) {
            // Find the first page connected to an Instagram Business Account
            const page = fbData.data.find((p: any) => p.instagram_business_account?.id);
            if (page) {
              igBusinessAccountId = page.instagram_business_account.id;
            }
          }
        } catch (e) {
          console.error('Error fetching IG Business Account during OAuth:', e);
        }
      }

      // Upsert the user into our public schema so foreign keys work
      if (session.user) {
        const { db } = await import('../../../db');
        const { users } = await import('../../../db/schema');
        await db.insert(users).values({
          id: session.user.id,
          email: session.user.email,
          igAccessToken: providerToken || null,
          igBusinessAccountId: igBusinessAccountId
        }).onConflictDoUpdate({
          target: users.id,
          set: {
            email: session.user.email,
            igAccessToken: providerToken || null,
            igBusinessAccountId: igBusinessAccountId
          }
        });
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=true`)
}
