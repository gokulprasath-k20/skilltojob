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

    // 1. Parse raw text to generic Resume JSON
    const systemPrompt = `You are an expert Resume Parser. Given the raw text from a candidate's resume, extract the information and return ONLY a valid JSON object matching the following structure:
{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "summary": "",
  "links": { "linkedin": "", "github": "", "website": "" },
  "skills": ["skill1", "skill2"],
  "experience": [ { "company": "", "role": "", "duration": "", "description": ["bullet 1"] } ],
  "education": [ { "school": "", "degree": "", "field": "", "year": "", "gpa": "" } ],
  "projects": [ { "name": "", "description": "", "tech": ["tech1"], "link": "" } ],
  "certifications": ["cert1"]
}
If any field is missing, leave it blank or empty array.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Parse this resume text:\n\n${extractedText}` },
      ],
    });

    const rsString = completion.choices[0]?.message?.content || '{}';
    const parsedData = extractJSON(rsString);

    // 2. Score it
    const scoreResult = await calculateResumeScore(parsedData);
    
    return NextResponse.json({ 
       score: scoreResult.score,
       feedback: scoreResult.feedback,
       suggestions: scoreResult.suggestions,
       parsedData: parsedData
    });

  } catch (err: any) {
    console.error('Score API Error details:', err);
    return NextResponse.json({ 
      error: 'Failed to parse and score resume.',
      details: err.message
    }, { status: 500 });
  }
}

