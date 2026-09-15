import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import TeamProject from '@/models/TeamProject';
import { getMonthFromDate } from '@/lib/dateUtils';

// GET /api/team-projects - Retrieve all team projects
export async function GET(request) {
  try {
    await connectToDatabase();
    const projects = await TeamProject.find({}).sort({ createdAt: -1 });
    const normalized = projects.map((p) => {
      const obj = p.toObject ? p.toObject() : p;
      if (obj.assignDate) {
        obj.month = getMonthFromDate(obj.assignDate, obj.month);
      }
      if (!obj.netAmount && obj.amount) {
        obj.netAmount = obj.amount * 0.8;
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
    await connectToDatabase();
    const body = await request.json();

    if (Array.isArray(body)) {
      const prepared = body.map((item) => {
        const amt = parseFloat(item.amount) || 0;
        const assignDate = item.assignDate || new Date().toISOString().split('T')[0];
        return {
          ...item,
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
      const created = await TeamProject.insertMany(prepared);
      return NextResponse.json({ success: true, count: created.length, data: created }, { status: 201 });
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
    body.amount = amt;
    body.netAmount = amt * 0.8;
    body.percentage = parseFloat(body.percentage) || 0;

    // Ensure assignedMembers is an array
    if (typeof body.assignedMembers === 'string') {
      body.assignedMembers = body.assignedMembers
        .split(/[,/]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const project = await TeamProject.create(body);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/team-projects error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
