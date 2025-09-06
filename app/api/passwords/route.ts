import { NextRequest, NextResponse } from 'next/server';
import { encrypt, decrypt } from '@/lib/crypto';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

interface Password {
  id: string;
  service: string;
  username: string;
  password?: string;
}

interface User {
  id: string;
  email: string;
  password?: string;
}

interface Database {
  users: User[];
  passwords: Password[];
}

const dbPath = path.resolve(process.cwd(), 'lib/db.json');

async function readDb(): Promise<Database> {
  try {
    const fileContent = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch {
    return { users: [], passwords: [] };
  }
}

async function writeDb(data: Database) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

// Get all passwords or a single password
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const db = await readDb();

  if (id) {
    const passwordEntry = db.passwords.find((p) => p.id === id);
    if (!passwordEntry || !passwordEntry.password) {
      return NextResponse.json({ error: 'Password not found' }, { status: 404 });
    }
    const password = decrypt(passwordEntry.password as string);
    return NextResponse.json({ password });
  } else {
    const passwords = db.passwords.map(({ id, service, username }) => ({ id, service, username }));
    return NextResponse.json(passwords);
  }
}

// Add a new password
export async function POST(request: NextRequest) {
  const { service, username, password } = await request.json();

  if (!service || !username || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const db = await readDb();
  const id = randomUUID();
  const encryptedPassword = encrypt(password);

  db.passwords.push({ id, service, username, password: encryptedPassword });
  await writeDb(db);

  return NextResponse.json({ id, service, username });
}

// Update a password
export async function PUT(request: NextRequest) {
  const { id, service, username, password } = await request.json();

  if (!id || !service || !username) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const db = await readDb();
  const passwordIndex = db.passwords.findIndex((p) => p.id === id);

  if (passwordIndex === -1) {
    return NextResponse.json({ error: 'Password not found' }, { status: 404 });
  }

  db.passwords[passwordIndex].service = service;
  db.passwords[passwordIndex].username = username;

  if (password) {
    db.passwords[passwordIndex].password = encrypt(password);
  }

  await writeDb(db);

  return NextResponse.json({ id, service, username });
}

// Delete a password
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const db = await readDb();
  const initialLength = db.passwords.length;
  db.passwords = db.passwords.filter((p) => p.id !== id);

  if (db.passwords.length === initialLength) {
    return NextResponse.json({ error: 'Password not found' }, { status: 404 });
  }

  await writeDb(db);

  return NextResponse.json({ message: 'Password deleted successfully' });
}