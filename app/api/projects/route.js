import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import Project from '@/models/Project';
import TeamProject from '@/models/TeamProject';
import { getMonthFromDate } from '@/lib/dateUtils';

function isMemberMatch(assignedMembers, targetName = 'Alireja') {
  if (!Array.isArray(assignedMembers) || assignedMembers.length === 0) return false;
  if (!targetName) return false;

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

async function syncAllExistingTeamProjects(targetMemberName = '', targetUserEmail = '') {
  try {
    const teamProjects = await TeamProject.find({});
    for (const teamOrder of teamProjects) {
      const members = Array.isArray(teamOrder.assignedMembers) ? teamOrder.assignedMembers : [];
      const clientUsername = teamOrder.clientUserId || 'client_user';
      const orderNumber = teamOrder.orderNumber || '';
      const assignDate = teamOrder.assignDate || new Date().toISOString().split('T')[0];

      let existing = null;
      if (orderNumber) {
        existing = await Project.findOne({ orderNumber, userEmail: targetUserEmail.toLowerCase() });
      }
      if (!existing && clientUsername) {
        existing = await Project.findOne({ clientUsername, assignDate, userEmail: targetUserEmail.toLowerCase() });
      }

      const assignedToUser = isMemberMatch(members, targetMemberName);

      if (!assignedToUser) {
        if (existing) {
          await Project.findByIdAndDelete(existing._id);
        }
        continue;
      }

      const payload = {
        userEmail: targetUserEmail.toLowerCase() || teamOrder.userEmail || '',
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

// GET /api/projects - Retrieve user-scoped projects
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase().trim();
    const assignedName = session.user.assignedName || '';

    await connectToDatabase();

    // Sync team projects to personal workspace for this user's assignedName
    // (Removed full sync on GET request for performance. Real-time sync handles this on POST/PUT/DELETE)

    // Auto-reset 'Solved' status back to 'All Sorted' if 2 days (48 hours) have passed without status changes
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    await Project.updateMany(
      { userEmail, currentStatus: 'Solved', solvedAt: { $lte: twoDaysAgo } },
      { $set: { currentStatus: 'All Sorted', solvedAt: null } }
    );

    const projects = await Project.find({ userEmail }).sort({ createdAt: -1 });
    // Normalize projects so month matches assignDate and currentStatus defaults to 'All Sorted'
    const normalized = projects.map((p) => {
      const obj = p.toObject ? p.toObject() : p;
      if (obj.assignDate) {
        obj.month = getMonthFromDate(obj.assignDate, obj.month);
      }
      if (!obj.currentStatus) {
        obj.currentStatus = 'All Sorted';
      }
      return obj;
    });
    return NextResponse.json({ success: true, count: normalized.length, data: normalized });
  } catch (error) {
    console.error('API GET /api/projects error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/projects - Create a new project for logged in user
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase().trim();

    if (session.user.role === 'Member') {
      return NextResponse.json({ success: false, error: 'Members are not permitted to add orders.' }, { status: 403 });
    }

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

    body.userEmail = userEmail;

    // Strict Duplication Check
    if (body.assignDate && body.orderNumber && body.clientUsername) {
      const amt = parseFloat(body.amount) || 0;
      const duplicateQuery = {
        assignDate: body.assignDate,
        orderNumber: body.orderNumber,
        amount: amt,
        clientUsername: body.clientUsername,
        userEmail: userEmail
      };
      
      const existingOrder = await Project.findOne(duplicateQuery);
      if (existingOrder) {
        return NextResponse.json(
          { success: false, error: 'This order already exists. (Exact match on Date, Order ID, Value, and Client)' },
          { status: 400 }
        );
      }
    }

    const project = await Project.create(body);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/projects error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
