import { sql } from '@/lib/db';
import { createSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT id, name, email, password, role, phone FROM users WHERE email = ${email}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Kredensial tidak valid: Email tidak ditemukan' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Kredensial tidak valid: Password salah' },
        { status: 401 }
      );
    }

    // Set session cookie
    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
    };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    return NextResponse.json(
      {
        success: true,
        message: 'Login berhasil',
        access_token: token,
        token_type: 'bearer',
        expires_in: 2592000,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
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
