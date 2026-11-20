import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    let sessionUser = await getSession();

    // Also support Authorization Bearer token header if available
    const authHeader = request.headers.get('Authorization');
    if (!sessionUser && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        if (decoded.id && decoded.email) {
          sessionUser = decoded;
        }
      } catch (e) {}
    }

    if (!sessionUser) {
      // Default fallback for demo/testing if not logged in
      const defaultUser = await sql`SELECT id, name, email, role, phone, avatar_url, created_at FROM users LIMIT 1`;
      if (defaultUser.rows.length > 0) {
        return NextResponse.json(
          {
            success: true,
            user: defaultUser.rows[0],
          },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const result = await sql`
      SELECT id, name, email, role, phone, avatar_url, created_at
      FROM users
      WHERE id = ${sessionUser.id}
    `;

    return NextResponse.json(
      {
        success: true,
        user: result.rows[0] || sessionUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
