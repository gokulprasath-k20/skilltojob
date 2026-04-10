import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromImage, improveResumeContent } from '@/lib/ai';
import { openai } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const textData = formData.get('text') as string;

    let extractedText = '';

    if (textData) {
       extractedText = textData;
    } else if (file) {
       // Check if image
       if (file.type.startsWith('image/')) {
          const buffer = await file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          extractedText = await extractTextFromImage(base64, file.type);
       } else if (file.type === 'application/pdf') {
          // Because typical PDF parsing needs a library which we may not have, 
          // we can send PDF contents if we have pdf2json or similar, but for simplicity let's do a basic read.
          // In a real scenario we'd use pdf-parse. If not available, we throw error.
          return NextResponse.json({ error: 'PDF parsing is advanced. Please upload as Image or Paste Text directly.' }, { status: 400 });
       } else {
          extractedText = await file.text();
       }
    } else {
      return NextResponse.json({ error: 'No file or text provided' }, { status: 400 });
    }

    // Now convert the raw text into our Structured Resume Data
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

    return NextResponse.json({ data: JSON.parse(cleaned) });

  } catch (err: any) {
    console.error('Parse Error:', err);
    return NextResponse.json({ error: 'Failed to parse resume.' }, { status: 500 });
  }
}
