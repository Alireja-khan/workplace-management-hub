import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import TeamProject from '@/models/TeamProject';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['Owner', 'Leader', 'Co-Leader', 'admin'].includes(session?.user?.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const projects = await TeamProject.find({}, { assignedMembers: 1 }).lean();
    const membersSet = new Set();
    
    projects.forEach(p => {
      if (Array.isArray(p.assignedMembers)) {
        p.assignedMembers.forEach(m => {
          if (m && typeof m === 'string') {
            membersSet.add(m.trim());
          }
        });
      }
    });
    
    const uniqueMembers = Array.from(membersSet).sort();
    return NextResponse.json({ success: true, data: uniqueMembers });
  } catch (error) {
    console.error('API GET /api/team-projects/members error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
