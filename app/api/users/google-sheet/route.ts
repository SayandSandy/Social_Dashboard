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

    const body = await request.json();
    let googleSheetId = body.googleSheetId;

    if (googleSheetId === undefined) {
      return NextResponse.json({ error: 'Missing googleSheetId' }, { status: 400 });
    }

    // Extract ID if it's a URL
    if (googleSheetId && googleSheetId.includes('/spreadsheets/d/')) {
      const match = googleSheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        googleSheetId = match[1];
      }
    }

    // Save token to DB
    await db.update(users).set({ 
      googleSheetId: googleSheetId || null
    }).where(eq(users.id, user.id));

    return NextResponse.json({ success: true, extractedId: googleSheetId });
  } catch (error: any) {
    console.error('Error saving google sheet id:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.update(users).set({ 
      googleSheetId: null
    }).where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error clearing google sheet id:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
