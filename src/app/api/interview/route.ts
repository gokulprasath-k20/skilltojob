import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Interview from '@/models/Interview';
import { getUserFromRequest } from '@/lib/auth';
import { generateInterviewQuestions, evaluateInterviewAnswer } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const { action } = body;

    if (action === 'start') {
      const { role, skills } = body;
      if (!role || !skills) {
        return NextResponse.json({ error: 'Role and skills are required.' }, { status: 400 });
      }

      const questions = await generateInterviewQuestions(role, skills);
      
      const interview = await Interview.create({
        userId: user.userId,
        role,
        questions: questions.map(q => ({ question: q, answer: '' }))
      });

      return NextResponse.json({ interview });
    }

    if (action === 'evaluate') {
      const { interviewId, questionIndex, answer } = body;
      
      const interview = await Interview.findOne({ _id: interviewId, userId: user.userId });
      if (!interview) return NextResponse.json({ error: 'Interview not found' }, { status: 404 });

      const q = interview.questions[questionIndex];
      if (!q) return NextResponse.json({ error: 'Question not found' }, { status: 400 });

      const evaluation = await evaluateInterviewAnswer(interview.role, q.question, answer);
      
      interview.questions[questionIndex].answer = answer;
      interview.questions[questionIndex].feedback = evaluation.feedback;
      interview.questions[questionIndex].score = evaluation.score;
      
      // Check if all answered to give overall score
      const answeredCount = interview.questions.filter((q: any) => q.answer).length;
      if (answeredCount === interview.questions.length) {
        const total = interview.questions.reduce((sum: number, q: any) => sum + (q.score || 0), 0);
        interview.overallScore = Math.round(total / interview.questions.length);
        interview.overallFeedback = {
          strengths: evaluation.strengths,
          improvements: evaluation.improvements
        };
      }

      await interview.save();

      return NextResponse.json({ evaluation, interview });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Interview API Error:', err);
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const history = await Interview.find({ userId: user.userId }).sort({ createdAt: -1 });
    
    return NextResponse.json({ history });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
