import OpenAI from 'openai';
import Groq from 'groq-sdk';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Generic AI completion using Groq (fast & free) with OpenAI fallback
export async function aiComplete(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 2048,
      temperature: 0.7,
    });

    return res.choices[0]?.message?.content || '';
  } catch {
    // Fallback to OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 2048,
    });
    return res.choices[0]?.message?.content || '';
  }
}

// Improve resume content professionally
export async function improveResumeContent(data: Record<string, unknown>): Promise<string> {
  const systemPrompt = `You are an expert resume writer and career counselor. Improve the provided resume content to be:
- ATS-friendly with strong action verbs
- Professional and concise
- Quantified with metrics where possible
- Clear and impactful
Return a JSON object with the same structure but improved content.`;

  return aiComplete(JSON.stringify(data), systemPrompt);
}

// Rewrite about section professionally
export async function improveAboutSection(about: string): Promise<string> {
  const systemPrompt = `You are a professional copywriter specializing in personal branding. 
Rewrite the about/bio section to be compelling, professional, and engaging. 
Keep it in first person, 3-4 sentences max. Return only the improved text.`;

  return aiComplete(about, systemPrompt);
}

// Improve project descriptions
export async function improveProjectDescription(description: string): Promise<string> {
  const systemPrompt = `Improve this project description to be professional, concise, and highlight technical achievements. 
Include: what it does, technologies used, impact/results. Return only the improved description (2-3 sentences).`;

  return aiComplete(description, systemPrompt);
}

// Analyze resume and suggest job roles
export async function analyzeResumeForJobs(resumeText: string): Promise<{
  skills: string[];
  roles: string[];
  experience: string;
  searchKeywords: string[];
}> {
  const systemPrompt = `You are a career advisor. Analyze the resume text and extract:
1. Key technical and soft skills (array of strings)
2. Suitable job roles (array of 5 specific job titles)
3. Experience level (Entry/Mid/Senior)
4. Search keywords for job APIs (array of 3 concise search terms)

Return ONLY valid JSON in this exact format:
{
  "skills": ["skill1", "skill2"],
  "roles": ["role1", "role2"],
  "experience": "Mid",
  "searchKeywords": ["keyword1", "keyword2", "keyword3"]
}`;

  const result = await aiComplete(resumeText, systemPrompt);
  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { skills: [], roles: [], experience: 'Entry', searchKeywords: ['software developer'] };
  }
}

// Generate job match explanation
export async function explainJobMatch(userSkills: string[], jobTitle: string, jobDescription: string): Promise<{
  matchReason: string;
  missingSkills: string[];
  matchScore: number;
}> {
  const systemPrompt = `You are a career counselor. Explain why a job matches a candidate's profile.
Return ONLY valid JSON:
{
  "matchReason": "Brief explanation (2 sentences) of why this job suits the candidate",
  "missingSkills": ["skill1", "skill2"],
  "matchScore": 85
}`;

  const prompt = `Candidate skills: ${userSkills.join(', ')}
Job: ${jobTitle}
Description: ${jobDescription?.substring(0, 500) || 'Not provided'}`;

  const result = await aiComplete(prompt, systemPrompt);
  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      matchReason: `This ${jobTitle} position aligns with your skill set.`,
      missingSkills: [],
      matchScore: 70,
    };
  }
}

// Calculate resume score
export async function calculateResumeScore(data: Record<string, unknown>): Promise<{
  score: number;
  feedback: string[];
  suggestions: string[];
}> {
  const systemPrompt = `You are an ATS and resume expert. Score a resume out of 100 and provide feedback.
Return ONLY valid JSON:
{
  "score": 85,
  "feedback": ["strength1", "strength2"],
  "suggestions": ["improvement1", "improvement2"]
}`;

  const result = await aiComplete(JSON.stringify(data), systemPrompt);
  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { score: 70, feedback: ['Resume analyzed'], suggestions: ['Add more details'] };
  }
}

// Extract text from image using OpenAI Vision
export async function extractTextFromImage(base64Image: string, mimeType: string): Promise<string> {
  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract all the text from this image exactly as written. If it is a resume, format it cleanly.' },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 2000,
    });
    return res.choices[0]?.message?.content || '';
  } catch (err: any) {
    console.error('OpenAI Vision API Error:', err);
    throw new Error(err?.message?.includes('quota') ? 'OpenAI billing quota exceeded. Please upload a PDF or text instead.' : 'Failed to analyze image. Please try uploading a PDF or pasting text instead.');
  }
}

export { openai, groq };
