import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import JobCache from '@/models/JobCache';
import { getUserFromRequest } from '@/lib/auth';
import { analyzeResumeForJobs, explainJobMatch, extractTextFromImage } from '@/lib/ai';
import axios from 'axios';
// @ts-ignore
import pdfParse from 'pdf-parse';

interface RawJob {
  job_id?: string;
  id?: string;
  job_title?: string;
  title?: string;
  employer_name?: string;
  company?: string;
  job_city?: string;
  job_country?: string;
  location?: { display_name?: string };
  job_apply_link?: string;
  redirect_url?: string;
  job_description?: string;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
}

async function fetchFromGreenhouse(keyword: string): Promise<RawJob[]> {
  const greenhouseBoards = ['vercel', 'figma', 'discord', 'reddit', 'okta', 'stripe', 'dropbox', 'twilio'];
  const searchTerms = keyword.toLowerCase().split(' ').filter(w => w.length > 2);
  
  try {
    const promises = greenhouseBoards.map(async (board) => {
      try {
        const res = await axios.get(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs`, { timeout: 8000 });
        return (res.data?.jobs || []).map((j: any) => ({
          job_id: j.id.toString(),
          job_title: j.title,
          employer_name: board.charAt(0).toUpperCase() + board.slice(1),
          job_city: j.location?.name || 'Remote',
          job_apply_link: j.absolute_url,
          source: 'greenhouse'
        }));
      } catch {
        return [];
      }
    });
    
    const results = await Promise.all(promises);
    const allJobs = results.flat();
    
    // Filter by keyword match
    return allJobs.filter(j => {
      const title = (j.job_title || '').toLowerCase();
      return searchTerms.length === 0 || searchTerms.some(term => title.includes(term));
    });
  } catch {
    return [];
  }
}

async function fetchFromLever(keyword: string): Promise<RawJob[]> {
  const leverBoards = ['palantir', 'ramp', 'scale', 'atlassian', 'revolut', 'canva'];
  const searchTerms = keyword.toLowerCase().split(' ').filter(w => w.length > 2);
  
  try {
    const promises = leverBoards.map(async (board) => {
      try {
        const res = await axios.get(`https://api.lever.co/v0/postings/${board}`, { timeout: 8000 });
        return (res.data || []).map((j: any) => ({
          job_id: j.id.toString(),
          job_title: j.text,
          employer_name: board.charAt(0).toUpperCase() + board.slice(1),
          job_city: j.categories?.location || 'Remote',
          job_apply_link: j.hostedUrl,
          source: 'lever'
        }));
      } catch {
        return [];
      }
    });

    const results = await Promise.all(promises);
    const allJobs = results.flat();

    // Filter by keyword match
    return allJobs.filter(j => {
      const title = (j.job_title || '').toLowerCase();
      return searchTerms.length === 0 || searchTerms.some(term => title.includes(term));
    });
  } catch {
    return [];
  }
}

// Fallback mock jobs when APIs are not configured
function getMockJobs(keyword: string, skills: string[]) {
  const base = [
    { id: 'mock-1', title: `Senior ${keyword}`, company: 'TechCorp Inc.', location: 'San Francisco, CA', applyLink: 'https://linkedin.com/jobs', description: `Looking for an experienced ${keyword} to join our growing team. You will work on exciting projects using modern technologies.`, salary: '$120,000 - $160,000', source: 'demo' },
    { id: 'mock-2', title: `${keyword} Engineer`, company: 'StartupXYZ', location: 'Remote', applyLink: 'https://indeed.com', description: `Join our startup as a ${keyword} Engineer. We offer competitive salary, equity, and flexible working hours.`, salary: '$90,000 - $130,000', source: 'demo' },
    { id: 'mock-3', title: `Lead ${keyword}`, company: 'Enterprise Solutions Ltd', location: 'New York, NY', applyLink: 'https://glassdoor.com', description: `Enterprise Solutions is hiring a Lead ${keyword} to drive our digital transformation initiatives.`, salary: '$140,000 - $180,000', source: 'demo' },
    { id: 'mock-4', title: `${keyword} Specialist`, company: 'DataDriven Co.', location: 'Austin, TX', applyLink: 'https://dice.com', description: `We are looking for a talented ${keyword} Specialist with expertise in ${skills.slice(0, 2).join(', ')}.`, salary: '$85,000 - $115,000', source: 'demo' },
    { id: 'mock-5', title: `Junior ${keyword}`, company: 'GrowthLab', location: 'Boston, MA', applyLink: 'https://monster.com', description: `Great opportunity for a Junior ${keyword} to grow with our team. ${skills.slice(0, 3).join(', ')} experience preferred.`, salary: '$70,000 - $95,000', source: 'demo' },
  ];
  return base;
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    
    let resumeText = '';

    // Handle both JSON and FormData
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const textParam = formData.get('resumeText') as string;

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        try {
          if (file.type === 'application/pdf') {
            const pdfData = await pdfParse(buffer);
            resumeText = pdfData.text;
          } else if (file.type.startsWith('image/')) {
            const base64 = buffer.toString('base64');
            resumeText = await extractTextFromImage(base64, file.type);
          } else if (file.type === 'text/plain') {
            resumeText = buffer.toString('utf-8');
          } else {
            return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
          }
        } catch (fileErr: any) {
          console.error('File parsing error:', fileErr);
          return NextResponse.json({ error: 'Failed to read file内容', details: fileErr.message }, { status: 422 });
        }
      } else if (textParam) {
        resumeText = textParam;
      }
    } else {
      try {
        const body = await req.json();
        resumeText = body.resumeText;
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }
    }

    if (!resumeText?.trim()) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }

    // Step 1: AI analysis
    const extractedData = await analyzeResumeForJobs(resumeText);
    const keyword = extractedData.searchKeywords[0] || extractedData.roles[0] || 'software developer';

    // Step 2: Fetch jobs from APIs
    const [greenhouseJobs, leverJobs] = await Promise.all([
      fetchFromGreenhouse(keyword),
      fetchFromLever(keyword),
    ]);

    let rawJobs = [...greenhouseJobs, ...leverJobs];

    // Use mock jobs if no real APIs returned anything
    const usingMock = rawJobs.length === 0;
    if (usingMock) {
      const mockJobs = getMockJobs(keyword, extractedData.skills);
      // Add AI match data to mocks
      const enrichedMocks = await Promise.allSettled(
        mockJobs.map(async (job) => {
          const match = await explainJobMatch(extractedData.skills, job.title, job.description);
          return { ...job, ...match };
        })
      );
      const jobs = enrichedMocks.map((r, i) =>
        r.status === 'fulfilled' ? r.value : { ...mockJobs[i], matchReason: 'Good match based on your skills', missingSkills: [], matchScore: 70 }
      );

      const cache = await JobCache.create({ userId: user.userId, resumeText, extractedData, jobs });
      return NextResponse.json({ extractedData, jobs, cacheId: cache._id, usingMock: true });
    }

    // Step 3: Normalize and add AI match explanations
    const normalizedJobs = rawJobs.slice(0, 5).map((j: RawJob & { source?: string }, i: number) => ({
      id: j.job_id || j.id || `job-${i}`,
      title: j.job_title || j.title || 'Software Engineer',
      company: j.employer_name || j.company || 'Tech Company',
      location: [j.job_city, j.job_country].filter(Boolean).join(', ') || j.location?.display_name || 'Remote',
      applyLink: j.job_apply_link || j.redirect_url || '#',
      description: j.job_description || j.description || '',
      salary: j.salary_min ? `$${j.salary_min.toLocaleString()} - $${j.salary_max?.toLocaleString()} ${j.salary_currency || 'USD'}` : 'Competitive',
      source: j.source === 'greenhouse' ? 'Greenhouse' : j.source === 'lever' ? 'Lever' : 'Job Board',
    }));

    const enriched = await Promise.allSettled(
      normalizedJobs.map(async (job) => {
        const match = await explainJobMatch(extractedData.skills, job.title, job.description);
        return { ...job, ...match };
      })
    );

    const jobs = enriched.map((r, i) =>
      r.status === 'fulfilled' ? r.value : { ...normalizedJobs[i], matchReason: 'This role aligns with your profile.', missingSkills: [], matchScore: 70 }
    );

    // Cache results
    const cache = await JobCache.create({ userId: user.userId, resumeText, extractedData, jobs });

    return NextResponse.json({ extractedData, jobs, cacheId: cache._id });
  } catch (err: any) {
    console.error('Jobs API error:', err);
    return NextResponse.json({ 
      error: 'Failed to process resume', 
      details: err?.message || 'Unknown server error' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const cache = await JobCache.findOne({ userId: user.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ cache });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch job cache' }, { status: 500 });
  }
}
