import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = await verifyAdminRequest(req);

  if (!admin) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user: admin,
  });
}
