import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CoverLetter from '@/models/CoverLetter';
import { getUserFromRequest } from '@/lib/auth';
import { generateCoverLetter } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const { action, resumeData, jobTitle, companyName, jobId, content, letterId } = body;

    // Generate New
    if (action === 'generate') {
      if (!resumeData || !jobTitle || !companyName) {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
      }

      const generatedContent = await generateCoverLetter(resumeData, jobTitle, companyName);
      
      const letter = await CoverLetter.create({
        userId: user.userId,
        jobId,
        jobTitle,
        companyName,
        content: generatedContent
      });

      return NextResponse.json({ letter });
    }

    // Save Edit
    if (action === 'save') {
      if (!letterId || !content) return NextResponse.json({ error: 'Missing data to save' }, { status: 400 });
      const letter = await CoverLetter.findOneAndUpdate(
        { _id: letterId, userId: user.userId },
        { content },
        { new: true }
      );
      if (!letter) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ letter });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('CoverLetter API Error:', err);
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const letters = await CoverLetter.find({ userId: user.userId }).sort({ createdAt: -1 });
    
    return NextResponse.json({ letters });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
