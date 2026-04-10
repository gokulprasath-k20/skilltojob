import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { aiComplete } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { message, context } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Build a rich system prompt with user context
    const { resumeData, skills, jobSuggestions, portfolioStatus, conversationHistory } = context || {};

    const systemPrompt = `You are an AI Career Mentor for Skill2Jobs — a smart career platform. You act like a knowledgeable, friendly career guide, NOT a generic chatbot.

== USER PROFILE ==
Name: ${resumeData?.name || user.name || 'User'}
Skills: ${skills?.length ? skills.join(', ') : 'Not provided yet'}
Experience: ${resumeData?.experience?.length ? `${resumeData.experience.length} job(s): ${resumeData.experience.map((e: any) => `${e.role} at ${e.company}`).join(', ')}` : 'Not provided'}
Projects: ${resumeData?.projects?.length ? resumeData.projects.map((p: any) => p.name).filter(Boolean).join(', ') : 'None added'}
Job Suggestions: ${jobSuggestions?.length ? jobSuggestions.map((j: any) => j.title).join(', ') : 'No jobs analyzed yet'}
Portfolio: ${portfolioStatus || 'Not generated yet'}

== PLATFORM GUIDE ==
The platform has these sections:
1. Resume Builder – Build an ATS-friendly resume step-by-step (Basic Info → Skills → Experience → Education → Projects → Preview)
2. Portfolio Generator – Create a stunning portfolio website with AI content
3. AI Job Match – Upload resume to get AI-matched jobs from Greenhouse & Lever with skill gap analysis
4. AI Career Assistant – This chatbot (you!)

== BEHAVIOR RULES ==
- ALWAYS use the user's actual data in your answers. Never be generic.
- Give SPECIFIC, ACTIONABLE steps based on their profile.
- If skills are missing, reference what they DO have and suggest what to add.
- If no resume/data yet, guide them to build it FIRST.
- Keep answers concise and structured (use bullet points when helpful).
- For "teach me X", give: 1) What it is, 2) Learning roadmap, 3) What to build.

== RESPONSE EXAMPLES ==
❌ BAD: "You should learn React"
✅ GOOD: "Based on your current skills (${skills?.slice(0,2).join(', ') || 'as listed'}), adding React would make you a strong Frontend Developer candidate. Start with the React docs, build a todo app, then build a weather dashboard."

❌ BAD: "Go to the jobs section"
✅ GOOD: "Click 'AI Job Match' in the sidebar, paste your resume text, and our AI will match you to roles at Vercel, Stripe, Figma and more."`;

    // Build conversation messages
    const historyMessages = (conversationHistory || []).slice(-6).map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const promptWithHistory = historyMessages.length > 0
      ? `[Previous conversation]\n${historyMessages.map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}\n\n[Current message]\n${message}`
      : message;

    const reply = await aiComplete(promptWithHistory, systemPrompt);

    return NextResponse.json({ reply: reply || "I'm here to help! Could you rephrase that?" });
  } catch (err: any) {
    console.error('Chat API error:', err);
    return NextResponse.json({ error: 'Failed to get response', details: err?.message }, { status: 500 });
  }
}
