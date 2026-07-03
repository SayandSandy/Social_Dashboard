import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { db } from '../../../../db';
import { users } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { aiProvider, aiApiKey } = await request.json();

    if (!aiProvider || !aiApiKey) {
      return NextResponse.json({ error: 'Provider and API key are required' }, { status: 400 });
    }

    // Upsert into users table
    await db.insert(users).values({
      id: user.id,
      email: user.email,
      aiProvider,
      aiApiKey
    }).onConflictDoUpdate({
      target: users.id,
      set: {
        aiProvider,
        aiApiKey
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving AI settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings', details: error.message },
      { status: 500 }
    );
  }
}
