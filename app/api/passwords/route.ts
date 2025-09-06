import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { encrypt, decrypt } from '@/lib/crypto';
import { randomUUID } from 'crypto';

// Get all passwords or a single password
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const passwordEntry = await redis.hGetAll(`password:${id}`);
    if (!passwordEntry || !passwordEntry.password) {
      return NextResponse.json({ error: 'Password not found' }, { status: 404 });
    }
    const password = decrypt(passwordEntry.password as string);
    return NextResponse.json({ password });
  } else {
    const passwordIds = await redis.sMembers('passwords');
    if (!passwordIds) {
        return NextResponse.json([]);
    }
    const passwords = [];
    for (const passwordId of passwordIds) {
      const password = await redis.hGetAll(`password:${passwordId}`);
      if (password && password.service && password.username) {
        passwords.push({ id: passwordId, service: password.service, username: password.username });
      }
    }
    return NextResponse.json(passwords);
  }
}

// Add a new password
export async function POST(request: NextRequest) {
  const { service, username, password } = await request.json();

  if (!service || !username || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const id = randomUUID();
  const encryptedPassword = encrypt(password);

  await redis.hSet(`password:${id}`, { id, service, username, password: encryptedPassword });
  await redis.sAdd('passwords', id);

  return NextResponse.json({ id, service, username });
}

// Update a password
export async function PUT(request: NextRequest) {
  const { id, service, username, password } = await request.json();

  if (!id || !service || !username) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const passwordExists = await redis.exists(`password:${id}`);

  if (!passwordExists) {
    return NextResponse.json({ error: 'Password not found' }, { status: 404 });
  }

  const updatedFields: { service: string; username: string; password?: string } = { service, username };

  if (password) {
    updatedFields.password = encrypt(password);
  }

  await redis.hSet(`password:${id}`, updatedFields);

  return NextResponse.json({ id, service, username });
}

// Delete a password
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const result = await redis.del(`password:${id}`);
  await redis.sRem('passwords', id);

  if (result === 0) {
    return NextResponse.json({ error: 'Password not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Password deleted successfully' });
}