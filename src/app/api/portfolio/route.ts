import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Portfolio from '@/models/Portfolio';
import { getUserFromRequest } from '@/lib/auth';
import { improveAboutSection, improveProjectDescription } from '@/lib/ai';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const portfolios = await Portfolio.find({ userId: user.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ portfolios });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();

    const { data, templateId, aiEnhance } = await req.json();
    if (!data?.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    let finalData = { ...data };

    if (aiEnhance) {
      // AI enhance about section
      if (finalData.about) {
        try {
          finalData.about = await improveAboutSection(finalData.about);
        } catch { /* keep original */ }
      }
      // AI enhance project descriptions
      if (finalData.projects?.length) {
        const enhanced = await Promise.allSettled(
          finalData.projects.map(async (proj: { description: string }) =>
            proj.description ? { ...proj, description: await improveProjectDescription(proj.description) } : proj
          )
        );
        finalData.projects = enhanced.map((r, i) =>
          r.status === 'fulfilled' ? r.value : finalData.projects[i]
        );
      }
    }

    // Generate fake live URL
    const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const liveUrl = `https://${slug}-portfolio.vercel.app`;

    const portfolio = await Portfolio.create({
      userId: user.userId,
      templateId: templateId || 'minimal',
      data: finalData,
      liveUrl,
    });

    return NextResponse.json({ portfolio }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 });
  }
}
