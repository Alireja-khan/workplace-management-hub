import connectToDatabase from '@/lib/db';
import TeamProject from '@/models/TeamProject';
import Project from '@/models/Project';
import { getMonthFromDate } from '@/lib/dateUtils';

function isMemberMatch(assignedMembers, targetName) {
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

export async function syncUserProjects(targetMemberName, targetUserEmail) {
  if (!targetMemberName || !targetUserEmail) return;

  await connectToDatabase();
  const teamProjects = await TeamProject.find({});
  let syncedCount = 0;

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
    syncedCount++;
  }

  // Also clean up any projects that belong to this user but no longer match any team project
  // Actually, we don't want to delete manually created personal projects. The above logic handles deleting
  // if they match a team project but are no longer assigned to the user.
  // Wait, if a team project is deleted entirely from the team dashboard, the sync won't delete it from personal
  // because it's not iterating over deleted ones. But deleting from team dashboard already handles that in the DELETE route!
  
  return syncedCount;
}
