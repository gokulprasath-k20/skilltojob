import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromImage, calculateResumeScore } from '@/lib/ai';
import { openai } from '@/lib/ai';
import { getUserFromRequest } from '@/lib/auth';
import { extractTextFromPDF, extractJSON } from '@/lib/parser';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const textData = formData.get('text') as string;

    let extractedText = '';

    if (textData) {
       extractedText = textData;
    } else if (file) {
       if (file.type.startsWith('image/')) {
          const buffer = await file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          extractedText = await extractTextFromImage(base64, file.type);
       } else if (file.type === 'application/pdf') {
          const buffer = await file.arrayBuffer();
          extractedText = await extractTextFromPDF(Buffer.from(buffer));
       } else {
          extractedText = await file.text();
       }
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json({ error: 'No readable text content found in your resume.' }, { status: 400 });
    }

    // Consolidate Parsing and Scoring into ONE AI call to prevent Vercel 10s timeout
    const systemPrompt = `You are an expert Resume Parser and Career Coach. 
Analyze the provided resume text and return a JSON object with two parts:
1. "parsedData": A structured version of the resume.
2. "scoreResults": An ATS score (0-100) with strengths and improvements.

JSON Structure:
{
  "parsedData": {
    "name": "", "email": "", "phone": "", "location": "", "summary": "",
    "links": { "linkedin": "", "github": "", "website": "" },
    "skills": [],
    "experience": [{ "company": "", "role": "", "duration": "", "description": [] }],
    "education": [{ "school": "", "degree": "", "field": "", "year": "", "gpa": "" }],
    "projects": [{ "name": "", "description": "", "tech": [], "link": "" }],
    "certifications": []
  },
  "scoreResults": {
    "score": 85,
    "feedback": ["Strength 1", "Strength 2"],
    "suggestions": ["Improvement 1", "Improvement 2"]
  }
}
Return ONLY the JSON object.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this resume:\n\n${extractedText}` },
      ],
      response_format: { type: 'json_object' }
    });

    const rsString = completion.choices[0]?.message?.content || '{}';
    const combinedData = JSON.parse(rsString);
    
    return NextResponse.json({ 
       score: combinedData.scoreResults?.score || 70,
       feedback: combinedData.scoreResults?.feedback || [],
       suggestions: combinedData.scoreResults?.suggestions || [],
       parsedData: combinedData.parsedData
    });

  } catch (err: any) {
    console.error('Score API Error details:', err);
    return NextResponse.json({ 
      error: 'Failed to parse and score resume.',
      details: err.message
    }, { status: 500 });
  }
}

