import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await sql`SELECT * FROM students WHERE id = ${Number(id)}`;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Santri tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memuat detail santri' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, class: studentClass, address, parent_name, phone } = body;

    const check = await sql`SELECT id FROM students WHERE id = ${Number(id)}`;
    if (check.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Santri tidak ditemukan' },
        { status: 404 }
      );
    }

    const result = await sql`
      UPDATE students
      SET name = COALESCE(${name}, name),
          class = COALESCE(${studentClass}, class),
          address = COALESCE(${address}, address),
          parent_name = COALESCE(${parent_name}, parent_name),
          phone = COALESCE(${phone}, phone)
      WHERE id = ${Number(id)}
      RETURNING *;
    `;

    return NextResponse.json(
      {
        success: true,
        message: 'Data santri berhasil diperbarui',
        data: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui santri' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const check = await sql`SELECT id, name FROM students WHERE id = ${Number(id)}`;
    if (check.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Santri tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cascade deletion of related progress and records
    await sql`DELETE FROM progress_hafalan WHERE student_id = ${Number(id)}`;
    await sql`DELETE FROM progress_iqro_quran WHERE student_id = ${Number(id)}`;
    await sql`DELETE FROM progress_sholat WHERE student_id = ${Number(id)}`;
    await sql`DELETE FROM spp_payments WHERE student_id = ${Number(id)}`;
    await sql`DELETE FROM attendance WHERE student_id = ${Number(id)}`;
    await sql`DELETE FROM students WHERE id = ${Number(id)}`;

    return NextResponse.json(
      {
        success: true,
        message: `Santri ${check.rows[0].name} berhasil dihapus beserta data riwayatnya`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus data santri' },
      { status: 500 }
    );
  }
}
