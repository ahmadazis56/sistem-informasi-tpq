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
        FROM progress_sholat p
        JOIN students s ON p.student_id = s.id
        WHERE p.student_id = ${Number(studentId)}
        ORDER BY p.created_at DESC
      `;
    } else {
      result = await sql`
        SELECT p.*, s.name, s.class
        FROM progress_sholat p
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
      { success: false, message: error.message || 'Gagal memuat capaian sholat' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, category = 'Gerakan Sholat', item_name, status = 'Lancar', notes = '' } = body;

    if (!student_id || !item_name) {
      return NextResponse.json(
        { success: false, message: 'student_id dan item_name wajib diisi' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO progress_sholat (student_id, category, item_name, status, notes)
      VALUES (${Number(student_id)}, ${category}, ${item_name}, ${status}, ${notes})
      RETURNING *;
    `;

    return NextResponse.json(
      {
        success: true,
        message: `Penilaian ${item_name} berhasil disimpan`,
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menyimpan penilaian sholat' },
      { status: 500 }
    );
  }
}
