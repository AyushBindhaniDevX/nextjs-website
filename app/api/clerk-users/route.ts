
import { NextResponse } from 'next/server';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

export async function GET() {
  if (!CLERK_SECRET_KEY) {
    return NextResponse.json({ error: 'Clerk secret key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.clerk.com/v1/users', {
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Clerk API error: ${response.status}`);
    }

    const users = await response.json();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching Clerk users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
