import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Resume from '@/models/Resume';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const resume = await Resume.findOne({ _id: id, userId: user.userId });
    if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    return NextResponse.json({ resume });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const { data, templateId } = await req.json();
    const resume = await Resume.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { data, templateId },
      { new: true }
    );
    if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    return NextResponse.json({ resume });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update resume' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { id } = await params;
    await Resume.findOneAndDelete({ _id: id, userId: user.userId });
    return NextResponse.json({ message: 'Resume deleted' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
  }
}
