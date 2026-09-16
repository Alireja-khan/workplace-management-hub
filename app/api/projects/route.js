import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Project from '@/models/Project';
import TeamProject from '@/models/TeamProject';
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

async function syncAllExistingTeamProjects(targetMemberName = 'Alireja') {
  try {
    const teamProjects = await TeamProject.find({});
    for (const teamOrder of teamProjects) {
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
        // If not assigned to this user, remove from personal workspace if previously synced
        if (existing) {
          await Project.findByIdAndDelete(existing._id);
        }
        continue;
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
    }
  } catch (err) {
    console.error('syncAllExistingTeamProjects error:', err);
  }
}

// GET /api/projects - Retrieve all projects
export async function GET(request) {
  try {
    await connectToDatabase();

    const projects = await Project.find({}).sort({ createdAt: -1 });
    // Normalize projects so month matches assignDate
    const normalized = projects.map((p) => {
      const obj = p.toObject ? p.toObject() : p;
      if (obj.assignDate) {
        obj.month = getMonthFromDate(obj.assignDate, obj.month);
      }
      return obj;
    });
    return NextResponse.json({ success: true, count: normalized.length, data: normalized });
  } catch (error) {
    console.error('API GET /api/projects error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.clientUsername || !body.profileName) {
      return NextResponse.json(
        { success: false, error: 'Client username and profile name are required' },
        { status: 400 }
      );
    }

    if (body.assignDate) {
      body.month = getMonthFromDate(body.assignDate, body.month);
    }

    const project = await Project.create(body);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/projects error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
