import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '../../../../db';
import { users } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const fakeEmail = `${username}@dashboard.local`;
    const defaultPassword = 'Password123!Secure';

    // 1. Try to create the user with Auto-Confirm
    let { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
      email: fakeEmail,
      password: defaultPassword,
      email_confirm: true 
    });

    if (error && (error.message.includes('already exists') || error.message.includes('already been registered') || error.status === 422)) {
      // User already exists, let's just make sure their Drizzle record exists
      // We don't actually need the user object here because the client will just login
      
      // Let's get the user id though, just to be sure we update the Drizzle row
      const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
      const existingSupabaseUser = usersList.users.find(u => u.email === fakeEmail);
      
      if (existingSupabaseUser) {
        await db.update(users)
          .set({ igUsername: username })
          .where(eq(users.id, existingSupabaseUser.id));
      }

      return NextResponse.json({ success: true, email: fakeEmail, password: defaultPassword, message: 'Existing user' });
    }

    if (error) {
      throw error;
    }

    if (!user) {
      throw new Error("Failed to create user");
    }

    // 2. Ensure the user exists in our Drizzle DB with the igUsername
    const existingUser = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    
    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: user.id,
        email: fakeEmail,
        igUsername: username,
        createdAt: new Date(),
      });
    } else {
      await db.update(users).set({ igUsername: username }).where(eq(users.id, user.id));
    }

    return NextResponse.json({ success: true, email: fakeEmail, password: defaultPassword, message: 'User provisioned' });

  } catch (error: any) {
    console.error('Provisioning error:', error);
    return NextResponse.json(
      { error: 'Provisioning failed', details: error.message },
      { status: 500 }
    );
  }
}
