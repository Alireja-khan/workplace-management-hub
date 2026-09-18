import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { syncUserProjects } from '@/lib/syncUtils';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!['Owner', 'Leader', 'Co-Leader'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden. You do not have permission to view users.' }, { status: 403 });
    }

    await connectToDatabase();
    
    // Don't send passwords to frontend
    const users = await User.find({}, '-password').sort({ createdAt: -1 });

    return NextResponse.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('API GET /api/users error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!['Owner', 'Leader', 'Co-Leader'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden. You do not have permission to update users.' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { userId, role, assignedName } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (assignedName !== undefined) updateData.assignedName = assignedName;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (assignedName !== undefined) {
      // Background sync, no need to await if we don't want to block, but awaiting ensures consistency
      await syncUserProjects(assignedName, updatedUser.email);
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('API PUT /api/users error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
