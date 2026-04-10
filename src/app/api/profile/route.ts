import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findById(authUser.userId).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error('Profile GET fetch error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();
    
    // Whitelist updateable fields
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.avatar !== undefined) updates.avatar = body.avatar;
    if (body.degree !== undefined) updates.degree = body.degree;
    if (body.bio !== undefined) updates.bio = body.bio;
    if (body.skills !== undefined) updates.skills = body.skills;
    if (body.links !== undefined) updates.links = body.links;

    const user = await User.findByIdAndUpdate(authUser.userId, { $set: updates }, { new: true }).select('-password');

    return NextResponse.json({ user });
  } catch (err) {
    console.error('Profile PUT update error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
