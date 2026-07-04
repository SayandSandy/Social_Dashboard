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

    const { igUsername } = await request.json();

    if (!igUsername) {
      return NextResponse.json({ error: 'Instagram Username is required' }, { status: 400 });
    }

    // Upsert into users table
    await db.insert(users).values({
      id: user.id,
      email: user.email,
      igUsername
    }).onConflictDoUpdate({
      target: users.id,
      set: {
        igUsername
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving Instagram Username:', error);
    return NextResponse.json(
      { error: 'Failed to save settings', details: error.message },
      { status: 500 }
    );
  }
}
