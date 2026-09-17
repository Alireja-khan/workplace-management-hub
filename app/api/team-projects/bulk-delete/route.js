import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import TeamProject from '@/models/TeamProject';
import Project from '@/models/Project';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['Owner', 'admin'].includes(session?.user?.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Only Owners or Admins can bulk delete team orders.' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No order IDs provided for deletion.' }, { status: 400 });
    }

    await connectToDatabase();

    // Optionally: find the team projects first so we can remove them from personal collections if necessary
    const teamProjects = await TeamProject.find({ _id: { $in: body.ids } });
    
    // We should delete personal projects synced with these as well (based on clientUsername/orderNumber/assignDate)
    const deletePromises = teamProjects.map(tp => {
      const query = [];
      if (tp.orderNumber) {
        query.push({ orderNumber: tp.orderNumber });
      }
      if (tp.clientUserId) {
        query.push({ clientUsername: tp.clientUserId, assignDate: tp.assignDate });
      }
      if (query.length > 0) {
        return Project.deleteMany({ $or: query });
      }
      return Promise.resolve();
    });

    await Promise.all(deletePromises);

    // Now delete the team projects
    const result = await TeamProject.deleteMany({ _id: { $in: body.ids } });

    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('API POST /api/team-projects/bulk-delete error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
