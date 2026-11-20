import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role = 'guru', phone = '' } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Nama, email, dan password wajib diisi' },
        { status: 400 }
      );
    }

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar dalam sistem' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO users (name, email, password, role, phone)
      VALUES (${name}, ${email}, ${password}, ${role}, ${phone})
      RETURNING id, name, email, role, phone, created_at;
    `;

    const newUser = result.rows[0];

    return NextResponse.json(
      {
        success: true,
        message: 'Registrasi pengguna baru berhasil',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
