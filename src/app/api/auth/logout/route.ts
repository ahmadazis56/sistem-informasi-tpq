import { destroySession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json(
      {
        success: true,
        message: 'User successfully signed out',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan saat logout' },
      { status: 500 }
    );
  }
}
