import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { suggestProjects } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { requirement } = body;

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement is needed.' }, { status: 400 });
    }

    const projects = await suggestProjects(requirement);
    
    return NextResponse.json({ projects });
  } catch (err: any) {
    console.error('Projects API Error:', err);
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}
