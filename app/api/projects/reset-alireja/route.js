import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import TeamProject from '@/models/TeamProject';
import Project from '@/models/Project';

export async function POST(request) {
  try {
    await connectToDatabase();

    // Delete all personal projects
    const deletedPersonal = await Project.deleteMany({});

    // Delete team projects assigned to Alireja
    const deletedTeam = await TeamProject.deleteMany({
      assignedMembers: { $elemMatch: { $regex: /alireja/i } },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully cleared all orders for Alireja. Deleted ${deletedPersonal.deletedCount} personal orders and ${deletedTeam.deletedCount} assigned team orders.`,
      deletedPersonalCount: deletedPersonal.deletedCount,
      deletedTeamCount: deletedTeam.deletedCount,
    });
  } catch (error) {
    console.error('reset-alireja error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
