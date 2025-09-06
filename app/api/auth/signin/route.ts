import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';

interface User {
  id?: string;
  email: string;
  password?: string;
}

interface Password {
  id: string;
  userId: string;
  name: string;
  value: string;
  url: string;
  iv: string;
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

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const db = await readDb();

  const user = db.users.find((user) => user.email === email);

  if (!user || !user.password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // In a real application, you would create a session/token here

  return NextResponse.json({ message: 'Sign in successful' });
}