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
    // If the file doesn't exist, return a default structure
    return { users: [], passwords: [] };
  }
}

async function writeDb(data: Database) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const db = await readDb();

  const userExists = db.users.find((user) => user.email === email);

  if (userExists) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.users.push({ email, password: hashedPassword });

  await writeDb(db);

  return NextResponse.json({ message: 'User created successfully' });
}