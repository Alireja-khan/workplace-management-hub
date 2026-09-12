import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import TeamProject from '@/models/TeamProject';
import { getMonthFromDate } from '@/lib/dateUtils';

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
