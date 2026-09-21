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

async function syncTeamOrderToPersonal(teamOrder, targetMemberName = 'Alireja', targetUserEmail = '') {
  try {
    if (!teamOrder) return;
    const userEmail = targetUserEmail.toLowerCase() || teamOrder.userEmail || '';
    if (!userEmail) return;

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
      return;
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
      currentStatus: teamOrder.currentStatus || 'All Sorted',
      issueNote: teamOrder.issueNote || '',
      draftCount: parseInt(teamOrder.draftCount, 10) || 0,
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
  } catch (err) {
    console.error('syncTeamOrderToPersonal error:', err);
  }
}

// GET /api/team-projects/[id]
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const project = await TeamProject.findById(params.id);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Team order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/team-projects/[id]
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = session.user.email.toLowerCase().trim();

    await connectToDatabase();
    const body = await request.json();

    if (session.user.role === 'Member') {
      const existing = await TeamProject.findById(params.id);
      if (existing) {
        const assignedName = session.user.assignedName || session.user.name || '';
        const isAssigned = isMemberMatch(existing.assignedMembers, assignedName);
        if (!isAssigned) {
          return NextResponse.json(
            { success: false, error: 'Members can only change status for orders assigned to them.' },
            { status: 403 }
          );
        }
      }
    }

    if (body.assignDate) {
      body.month = getMonthFromDate(body.assignDate, body.month);
    }

    if (body.currentStatus === 'Solved') {
      body.solvedAt = new Date();
    } else if (body.currentStatus && body.currentStatus !== 'Solved') {
      body.solvedAt = null;
    }

    if (body.amount !== undefined) {
      const amt = parseFloat(body.amount) || 0;
      body.amount = amt;
      body.netAmount = amt * 0.8;
    }

    if (body.percentage !== undefined) {
      body.percentage = parseFloat(body.percentage) || 0;
    }

    if (typeof body.assignedMembers === 'string') {
      body.assignedMembers = body.assignedMembers
        .split(/[,/]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const updated = await TeamProject.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Team order not found' }, { status: 404 });
    }

    // Auto sync updated team order to personal projects
    await syncTeamOrderToPersonal(updated, session.user.assignedName, userEmail);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE /api/team-projects/[id]
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const deleted = await TeamProject.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Team order not found' }, { status: 404 });
    }

    // Also delete from personal workspace
    const query = [];
    if (deleted.orderNumber) {
      query.push({ orderNumber: deleted.orderNumber });
    }
    if (deleted.clientUserId) {
      query.push({ clientUsername: deleted.clientUserId, assignDate: deleted.assignDate });
    }
    if (query.length > 0) {
      await Project.deleteMany({ $or: query });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
