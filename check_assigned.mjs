import mongoose from 'mongoose';

const TeamProjectSchema = new mongoose.Schema({}, { strict: false });
const TeamProject = mongoose.models.TeamProject || mongoose.model('TeamProject', TeamProjectSchema, 'teamprojects');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const allOrders = await TeamProject.find({ teamName: /EleSquad/i }).lean();
  
  let assignedInAugust = 0;
  
  allOrders.forEach(o => {
    const pMonth = o.month ? o.month.toLowerCase() : '';
    const is2026 = (o.assignDate || '').includes('2026');
    
    if (pMonth === 'august' && is2026) {
      assignedInAugust++;
    }
  });
  
  console.log(`Total ASSIGNED in Aug 2026: ${assignedInAugust}`);
  
  await mongoose.disconnect();
}
check();
