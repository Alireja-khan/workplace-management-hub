import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import TeamProject from '@/models/TeamProject';
import Project from '@/models/Project';
import { getMonthFromDate } from '@/lib/dateUtils';

function isMemberMatch(assignedMembers, targetName = 'Alireja') {
  if (!Array.isArray(assignedMembers) || assignedMembers.length === 0) return false;
  if (!targetName) return true;

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

async function syncTeamOrderToPersonal(teamOrder, targetMemberName = 'Alireja') {
  try {
    if (!teamOrder) return;
    const members = Array.isArray(teamOrder.assignedMembers) ? teamOrder.assignedMembers : [];
    
    const clientUsername = teamOrder.clientUserId || 'client_user';
    const orderNumber = teamOrder.orderNumber || '';
    const assignDate = teamOrder.assignDate || new Date().toISOString().split('T')[0];

    let existing = null;
    if (orderNumber) {
      existing = await Project.findOne({ orderNumber });
    }
    if (!existing && clientUsername) {
      existing = await Project.findOne({ clientUsername, assignDate });
    }

    const assignedToUser = isMemberMatch(members, targetMemberName);

    if (!assignedToUser) {
      if (existing) {
        await Project.findByIdAndDelete(existing._id);
      }
      return;
    }

    const payload = {
      userEmail: teamOrder.userEmail || 'alirejakhan36@gmail.com',
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
  } catch (err) {
    console.error('syncTeamOrderToPersonal error:', err);
  }
}

// GET /api/team-projects/[id]
export async function GET(request, { params }) {
  try {
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
    await connectToDatabase();
    const body = await request.json();

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
    await syncTeamOrderToPersonal(updated);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE /api/team-projects/[id]
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const deleted = await TeamProject.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Team order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
