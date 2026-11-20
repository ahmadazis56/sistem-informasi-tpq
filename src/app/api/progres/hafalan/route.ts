import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');

    let result;
    if (studentId) {
      result = await sql`
        SELECT p.*, s.name, s.class
        FROM progress_hafalan p
        JOIN students s ON p.student_id = s.id
        WHERE p.student_id = ${Number(studentId)}
        ORDER BY p.created_at DESC
      `;
    } else {
      result = await sql`
        SELECT p.*, s.name, s.class
        FROM progress_hafalan p
        JOIN students s ON p.student_id = s.id
        ORDER BY p.created_at DESC
        LIMIT 50
      `;
    }

    return NextResponse.json(
      {
        success: true,
        count: result.rows.length,
        data: result.rows,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memuat riwayat hafalan' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, surah_name, status = 'Lulus', notes = '' } = body;

    if (!student_id || !surah_name) {
      return NextResponse.json(
        { success: false, message: 'student_id dan surah_name wajib diisi' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO progress_hafalan (student_id, surah_name, status, notes)
      VALUES (${Number(student_id)}, ${surah_name}, ${status}, ${notes})
      RETURNING *;
    `;

    return NextResponse.json(
      {
        success: true,
        message: `Kelulusan hafalan ${surah_name} berhasil dicatat`,
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menyimpan kelulusan hafalan' },
      { status: 500 }
    );
  }
}
