
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

const protectedRoutes = ['/api/passwords'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((prefix) => path.startsWith(prefix));

  if (isProtectedRoute) {
    const sessionCookie = req.cookies.get('session');
    if (!sessionCookie) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required: No session cookie' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const session = await decrypt(sessionCookie.value);

    if (!session) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required: Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return NextResponse.next();
}