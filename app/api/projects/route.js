import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Project from '@/models/Project';
import { getMonthFromDate } from '@/lib/dateUtils';

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
