import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromImage, calculateResumeScore } from '@/lib/ai';
import { openai } from '@/lib/ai';
import { getUserFromRequest } from '@/lib/auth';

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
          return NextResponse.json({ error: 'PDF parsing is advanced. Please upload as Image or Paste Text directly.' }, { status: 400 });
       } else {
          extractedText = await file.text();
       }
    } else {
      return NextResponse.json({ error: 'No file or text provided' }, { status: 400 });
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
    const cleaned = rsString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsedData = JSON.parse(cleaned);

    // 2. Score it
    const scoreResult = await calculateResumeScore(parsedData);
    
    // Stash the score temporarily in local cache if frontend wants it.
    
    return NextResponse.json({ 
       score: scoreResult.score,
       feedback: scoreResult.feedback,
       suggestions: scoreResult.suggestions,
       parsedData: parsedData
    });

  } catch (err: any) {
    console.error('Score API Error:', err);
    return NextResponse.json({ error: 'Failed to parse and score resume.' }, { status: 500 });
  }
}
