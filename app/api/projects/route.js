import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Project from '@/models/Project';

// GET /api/projects - Retrieve all projects
export async function GET(request) {
  try {
    await connectToDatabase();
    const projects = await Project.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: projects.length, data: projects });
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

    const project = await Project.create(body);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/projects error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
