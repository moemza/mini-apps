import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const user = await redis.hgetall(`user:${email}`);

  if (!user || !user.password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const passwordMatch = await bcrypt.compare(password, user.password as string);

  if (!passwordMatch) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // In a real application, you would create a session/token here

  return NextResponse.json({ message: 'Sign in successful' });
}