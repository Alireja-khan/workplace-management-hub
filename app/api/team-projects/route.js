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
      solvedAt: teamOrder.solvedAt || null,
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

// GET /api/team-projects - Retrieve team projects
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    await connectToDatabase();

    // Auto-reset 'Solved' status back to 'All Sorted' if 2 days (48 hours) have passed without status changes
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    await TeamProject.updateMany(
      { currentStatus: 'Solved', solvedAt: { $lte: twoDaysAgo } },
      { $set: { currentStatus: 'All Sorted', solvedAt: null } }
    );

    const projects = await TeamProject.find({}).sort({ createdAt: -1 });
    const normalized = projects.map((p) => {
      const obj = p.toObject ? p.toObject() : p;
      if (obj.assignDate) {
        obj.month = getMonthFromDate(obj.assignDate, obj.month);
      }
      if (!obj.netAmount && obj.amount) {
        obj.netAmount = obj.amount * 0.8;
      }
      if (!obj.currentStatus) {
        obj.currentStatus = 'All Sorted';
      }
      return obj;
    });
    return NextResponse.json({ success: true, count: normalized.length, data: normalized });
  } catch (error) {
    console.error('API GET /api/team-projects error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/team-projects - Create a new team project (or bulk array insert)
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

    if (Array.isArray(body)) {
      const prepared = body.map((item) => {
        const amt = parseFloat(item.amount) || 0;
        const assignDate = item.assignDate || new Date().toISOString().split('T')[0];
        return {
          ...item,
          userEmail,
          clientUserId: item.clientUserId || 'client_' + Math.floor(Math.random() * 10000),
          assignDate,
          month: getMonthFromDate(assignDate, item.month),
          amount: amt,
          netAmount: amt * 0.8,
          percentage: parseFloat(item.percentage) || 0,
          assignedMembers: Array.isArray(item.assignedMembers) && item.assignedMembers.length > 0
            ? item.assignedMembers
            : (typeof item.assignedMembers === 'string' && item.assignedMembers.trim()
                ? item.assignedMembers.split(/[,/]/).map((s) => s.trim()).filter(Boolean)
                : ['Alireja']),
        };
      });
      const validToInsert = [];
      let skippedCount = 0;

      for (const item of prepared) {
        if (item.assignDate && item.orderNumber && item.clientUserId) {
          const duplicateQuery = {
            assignDate: item.assignDate,
            orderNumber: item.orderNumber,
            amount: item.amount,
            clientUserId: item.clientUserId,
            assignedMembers: { $size: item.assignedMembers.length, $all: item.assignedMembers }
          };
          const existing = await TeamProject.findOne(duplicateQuery);
          if (existing) {
            skippedCount++;
            continue; // Skip this duplicate
          }
        }
        validToInsert.push(item);
      }

      let created = [];
      if (validToInsert.length > 0) {
        created = await TeamProject.insertMany(validToInsert);
        // Auto sync each to personal projects
        for (const item of created) {
          await syncTeamOrderToPersonal(item, session.user.assignedName, userEmail);
        }
      }

      return NextResponse.json({ 
        success: true, 
        count: created.length, 
        skipped: skippedCount,
        data: created 
      }, { status: 201 });
    }

    if (!body.clientUserId) {
      return NextResponse.json(
        { success: false, error: 'Client User ID is required' },
        { status: 400 }
      );
    }

    if (body.assignDate) {
      body.month = getMonthFromDate(body.assignDate, body.month);
    }

    const amt = parseFloat(body.amount) || 0;
    body.userEmail = userEmail;
    body.amount = amt;
    body.netAmount = amt * 0.8;
    body.percentage = parseFloat(body.percentage) || 0;

    if (typeof body.assignedMembers === 'string') {
      body.assignedMembers = body.assignedMembers
        .split(/[,/]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Strict Duplication Check
    // All 5 fields must match exactly to be considered a duplicate:
    // 1. assignDate
    // 2. orderNumber
    // 3. amount
    // 4. clientUserId
    // 5. assignedMembers (arrays must contain same elements, or just do an exact match check)
    if (body.assignDate && body.orderNumber && body.clientUserId) {
      const duplicateQuery = {
        assignDate: body.assignDate,
        orderNumber: body.orderNumber,
        amount: amt,
        clientUserId: body.clientUserId,
        assignedMembers: { $size: body.assignedMembers.length, $all: body.assignedMembers }
      };
      
      const existingOrder = await TeamProject.findOne(duplicateQuery);
      if (existingOrder) {
        return NextResponse.json(
          { success: false, error: 'This order already exists. (Exact match on Date, Order ID, Value, Client, and Assigned Members)' },
          { status: 400 }
        );
      }
    }

    const project = await TeamProject.create(body);

    // Auto sync to personal projects
    await syncTeamOrderToPersonal(project, session.user.assignedName, userEmail);

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/team-projects error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
