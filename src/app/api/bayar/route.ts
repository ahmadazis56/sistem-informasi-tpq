import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const month = searchParams.get('month') || now.toLocaleString('id-ID', { month: 'long' });
    const year = Number(searchParams.get('year')) || now.getFullYear();

    const result = await sql`
      SELECT p.id, p.student_id, p.month, p.year, p.amount, p.payment_date, p.status, p.payment_type, s.name, s.class
      FROM spp_payments p
      JOIN students s ON p.student_id = s.id
      WHERE p.month = ${month} AND p.year = ${year}
      ORDER BY s.name ASC
    `;

    const summary = await sql`
      SELECT 
        SUM(CASE WHEN status = 'Lunas' THEN amount ELSE 0 END) as paid_total,
        COUNT(CASE WHEN status = 'Lunas' THEN 1 END) as paid_count,
        SUM(CASE WHEN status != 'Lunas' THEN amount ELSE 0 END) as unpaid_total,
        COUNT(CASE WHEN status != 'Lunas' THEN 1 END) as unpaid_count
      FROM spp_payments
      WHERE month = ${month} AND year = ${year}
    `;

    return NextResponse.json(
      {
        success: true,
        month,
        year,
        summary: summary.rows[0] || {},
        count: result.rows.length,
        data: result.rows,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memuat data pembayaran' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, month, year, amount = 25000, status = 'Lunas', payment_type = 'SPP' } = body;

    if (!student_id || !month || !year) {
      return NextResponse.json(
        { success: false, message: 'student_id, month, dan year wajib diisi' },
        { status: 400 }
      );
    }

    const paymentDate = status === 'Lunas' ? new Date().toISOString() : null;

    const existing = await sql`
      SELECT id FROM spp_payments
      WHERE student_id = ${student_id} AND month = ${month} AND year = ${year} AND payment_type = ${payment_type}
    `;

    let paymentRecord;
    if (existing.rows.length > 0) {
      const updated = await sql`
        UPDATE spp_payments
        SET status = ${status}, amount = ${amount}, payment_date = ${paymentDate}
        WHERE id = ${existing.rows[0].id}
        RETURNING *;
      `;
      paymentRecord = updated.rows[0];
    } else {
      const inserted = await sql`
        INSERT INTO spp_payments (student_id, month, year, amount, payment_date, status, payment_type)
        VALUES (${student_id}, ${month}, ${year}, ${amount}, ${paymentDate}, ${status}, ${payment_type})
        RETURNING *;
      `;
      paymentRecord = inserted.rows[0];
    }

    return NextResponse.json(
      {
        success: true,
        message: `Pembayaran ${payment_type} ${month} ${year} berhasil dicatat sebagai ${status}`,
        data: paymentRecord,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mencatat pembayaran' },
      { status: 500 }
    );
  }
}
