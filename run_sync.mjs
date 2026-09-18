import mongoose from 'mongoose';
import { getMonthFromDate } from './lib/dateUtils.js'; // I'll just copy the logic

const MONTH_LIST = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getMonth(dateStr, fallbackMonth = 'September') {
  if (!dateStr || typeof dateStr !== 'string') return fallbackMonth;
  const clean = dateStr.trim();
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length >= 2) {
      const mIdx = parseInt(parts[1], 10) - 1;
      if (mIdx >= 0 && mIdx < 12) {
        return MONTH_LIST[mIdx];
      }
    }
  }
  return fallbackMonth;
}

const TeamProjectSchema = new mongoose.Schema({}, { strict: false });
const TeamProject = mongoose.models.TeamProject || mongoose.model('TeamProject', TeamProjectSchema, 'teamprojects');

const ProjectSchema = new mongoose.Schema({}, { strict: false });
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema, 'projects');

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

async function syncAll(targetMemberName = 'Alireja', targetUserEmail = 'alirejakhan36@gmail.com') {
  await mongoose.connect(process.env.MONGODB_URI);
  let synced = 0;
  
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
        // If not assigned to Alireja but exists in personal, remove it (or leave it if he created it himself? The existing code removes it)
        // I will just leave it if it's already there to be safe, maybe he wants to keep manually created ones.
        // Actually, the original code deletes it.
        // Let's not delete anything for now, only sync additions/updates.
        continue;
      }

      const payload = {
        userEmail: targetUserEmail.toLowerCase() || teamOrder.userEmail || '',
        assignDate,
        month: getMonth(assignDate, teamOrder.month),
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
        synced++;
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
  
  console.log(`Synced ${synced} missing projects for ${targetMemberName}`);
  await mongoose.disconnect();
}
syncAll();
