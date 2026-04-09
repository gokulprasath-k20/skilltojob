import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Portfolio from '@/models/Portfolio';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const portfolio = await Portfolio.findOne({ _id: id, userId: user.userId });
    if (!portfolio) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    return NextResponse.json({ portfolio });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const { data, templateId } = await req.json();
    const portfolio = await Portfolio.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { data, templateId },
      { new: true }
    );
    if (!portfolio) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    return NextResponse.json({ portfolio });
  } catch {
    return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { id } = await params;
    await Portfolio.findOneAndDelete({ _id: id, userId: user.userId });
    return NextResponse.json({ message: 'Portfolio deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 });
  }
}
