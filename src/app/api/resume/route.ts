import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Resume from '@/models/Resume';
import { getUserFromRequest } from '@/lib/auth';
import { improveResumeContent, calculateResumeScore } from '@/lib/ai';

import { extractJSON } from '@/lib/parser';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const resumes = await Resume.find({ userId: user.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ resumes });
  } catch (err) {
    console.error('Resume GET Error:', err);
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();

    const body = await req.json();
    const { data, templateId, aiEnhance } = body;

    if (!data?.name || !data?.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    let finalData = data;

    // AI enhancement
    if (aiEnhance) {
      try {
        const improved = await improveResumeContent(data);
        finalData = extractJSON(improved);
      } catch (err) {
        console.error('AI Enhancement failed, using original data:', err);
        // Use original data if AI fails
      }
    }


    // AI Score
    let score, scoreFeedback, scoreSuggestions;
    try {
      const scoreResult = await calculateResumeScore(finalData);
      score = scoreResult.score;
      scoreFeedback = scoreResult.feedback;
      scoreSuggestions = scoreResult.suggestions;
    } catch {
      score = 70;
    }

    const resume = await Resume.create({
      userId: user.userId,
      templateId: templateId || 'modern',
      data: finalData,
      score,
      scoreFeedback,
      scoreSuggestions,
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create resume' }, { status: 500 });
  }
}
