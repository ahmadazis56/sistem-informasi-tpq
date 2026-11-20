import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const classFilter = searchParams.get('class');

    let result;
    if (search && classFilter && classFilter !== 'Semua') {
      const searchTerm = `%${search}%`;
      result = await sql`
        SELECT * FROM students WHERE name ILIKE ${searchTerm} AND class = ${classFilter} ORDER BY name ASC
      `;
    } else if (search) {
      const searchTerm = `%${search}%`;
      result = await sql`
        SELECT * FROM students WHERE name ILIKE ${searchTerm} ORDER BY name ASC
      `;
    } else if (classFilter && classFilter !== 'Semua') {
      result = await sql`
        SELECT * FROM students WHERE class = ${classFilter} ORDER BY name ASC
      `;
    } else {
      result = await sql`SELECT * FROM students ORDER BY name ASC`;
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
      { success: false, message: error.message || 'Gagal memuat data santri' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, class: studentClass, address = '', parent_name = '', phone = '', wali_santri_id = null } = body;

    if (!name || !studentClass) {
      return NextResponse.json(
        { success: false, message: 'Nama santri dan kelas wajib diisi' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO students (name, class, address, parent_name, phone, wali_santri_id)
      VALUES (${name}, ${studentClass}, ${address}, ${parent_name}, ${phone}, ${wali_santri_id})
      RETURNING *;
    `;

    return NextResponse.json(
      {
        success: true,
        message: 'Data santri berhasil ditambahkan',
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menambahkan santri' },
      { status: 500 }
    );
  }
}
