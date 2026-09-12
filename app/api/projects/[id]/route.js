import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Project from '@/models/Project';
import { getMonthFromDate } from '@/lib/dateUtils';

// GET single project
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const project = await Project.findById(params.id);
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
    await connectToDatabase();
    const body = await request.json();

    if (body.assignDate) {
      body.month = getMonthFromDate(body.assignDate, body.month);
    }

    const project = await Project.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

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
    await connectToDatabase();
    const deletedProject = await Project.findByIdAndDelete(params.id);

    if (!deletedProject) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
