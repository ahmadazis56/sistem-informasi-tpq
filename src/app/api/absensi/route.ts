import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const classFilter = searchParams.get('class');

    let result;
    if (classFilter && classFilter !== 'Semua') {
      result = await sql`
        SELECT a.id, a.student_id, a.date, a.status, s.name, s.class
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.date = ${date} AND s.class = ${classFilter}
        ORDER BY s.name ASC
      `;
    } else {
      result = await sql`
        SELECT a.id, a.student_id, a.date, a.status, s.name, s.class
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.date = ${date}
        ORDER BY s.name ASC
      `;
    }

    return NextResponse.json(
      {
        success: true,
        date: date,
        count: result.rows.length,
        data: result.rows,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memuat absensi' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { records } = body;

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Daftar data presensi (records) harus berupa array' },
        { status: 400 }
      );
    }

    for (const record of records) {
      const { studentId, date, status } = record;
      const existing = await sql`
        SELECT id FROM attendance WHERE student_id = ${studentId} AND date = ${date}
      `;

      if (existing.rows.length > 0) {
        await sql`
          UPDATE attendance SET status = ${status} WHERE id = ${existing.rows[0].id}
        `;
      } else {
        await sql`
          INSERT INTO attendance (student_id, date, status) VALUES (${studentId}, ${date}, ${status})
        `;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Presensi sebanyak ${records.length} santri berhasil dicatat`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menyimpan absensi' },
      { status: 500 }
    );
  }
}
