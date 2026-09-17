import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import Project from '@/models/Project';
import { getMonthFromDate } from '@/lib/dateUtils';

// GET single project
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = session.user.email.toLowerCase().trim();

    await connectToDatabase();
    const project = await Project.findOne({ _id: params.id, userEmail });
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }
    const obj = project.toObject ? project.toObject() : project;
    if (obj.assignDate) {
      obj.month = getMonthFromDate(obj.assignDate, obj.month);
    }
    return NextResponse.json({ success: true, data: obj });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// PUT / UPDATE project
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = session.user.email.toLowerCase().trim();

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

    body.userEmail = userEmail;

    const project = await Project.findOneAndUpdate(
      { _id: params.id, userEmail },
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const obj = project.toObject ? project.toObject() : project;
    if (obj.assignDate) {
      obj.month = getMonthFromDate(obj.assignDate, obj.month);
    }

    return NextResponse.json({ success: true, data: obj });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE project
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = session.user.email.toLowerCase().trim();

    await connectToDatabase();
    const deletedProject = await Project.findOneAndDelete({ _id: params.id, userEmail });

    if (!deletedProject) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
