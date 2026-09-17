import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import TeamProject from '@/models/TeamProject';
import Project from '@/models/Project';
import { getMonthFromDate } from '@/lib/dateUtils';

function isMemberMatch(assignedMembers, targetName = 'Alireja') {
  if (!Array.isArray(assignedMembers) || assignedMembers.length === 0) return false;
  if (!targetName || targetName.trim() === '') return false;

  const targetLower = targetName.toLowerCase().trim();
  const targetFirstName = targetLower.split(' ')[0];

  return assignedMembers.some((m) => {
    if (!m) return false;
    const mLower = m.toLowerCase().trim();
    return (
      mLower.includes(targetLower) ||
      targetLower.includes(mLower) ||
      mLower.includes(targetFirstName) ||
      targetFirstName.includes(mLower)
    );
  });
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase().trim();

    await connectToDatabase();
    
    let targetMemberName = session.user.assignedName || '';
    try {
      const body = await request.json();
      if (body.memberName) targetMemberName = body.memberName;
    } catch (e) {}

    const teamProjects = await TeamProject.find({});
    let syncedCount = 0;

    for (const teamOrder of teamProjects) {
      const members = Array.isArray(teamOrder.assignedMembers) ? teamOrder.assignedMembers : [];
      const clientUsername = teamOrder.clientUserId || 'client_user';
      const orderNumber = teamOrder.orderNumber || '';
      const assignDate = teamOrder.assignDate || new Date().toISOString().split('T')[0];

      let existing = null;
      if (orderNumber) {
        existing = await Project.findOne({ orderNumber, userEmail });
      }
      if (!existing && clientUsername) {
        existing = await Project.findOne({ clientUsername, assignDate, userEmail });
      }

      const assignedToUser = isMemberMatch(members, targetMemberName);

      if (!assignedToUser) {
        if (existing) {
          await Project.findByIdAndDelete(existing._id);
        }
        continue;
      }

      const payload = {
        userEmail,
        assignDate,
        month: getMonthFromDate(assignDate, teamOrder.month),
        clientUsername,
        orderNumber,
        salesPerson: teamOrder.salesPerson || '',
        profileName: teamOrder.profileName || 'Team Project',
        amount: parseFloat(teamOrder.amount) || 0,
        orderStatus: teamOrder.orderStatus || 'Wip',
        estimatedDeliveryDate: teamOrder.estimatedDeliveryDate || '',
        deliveryDate: teamOrder.deliveryDate || '',
        instructionSheet: teamOrder.sheetLink || '',
        timeSchedule: teamOrder.timeSchedule || 'Fresh Query',
        percentage: parseFloat(teamOrder.percentage) || 0,
        notes: teamOrder.note || teamOrder.remark || '',
        remark: teamOrder.remark || '',
      };

      if (existing) {
        await Project.findByIdAndUpdate(existing._id, payload);
      } else {
        await Project.create(payload);
      }
      syncedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedCount} assigned team orders to personal workspace`,
      syncedCount,
    });
  } catch (error) {
    console.error('sync-from-team error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
