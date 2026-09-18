import mongoose from 'mongoose';

const TeamProjectSchema = new mongoose.Schema({}, { strict: false });
const TeamProject = mongoose.models.TeamProject || mongoose.model('TeamProject', TeamProjectSchema, 'teamprojects');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const orders = await TeamProject.find({ teamName: /EleSquad/i }).lean();
  
  // Filter for August 2026
  let augOrders = [];
  orders.forEach(o => {
    const m = (o.month || '').toLowerCase();
    const isAug = m === 'august';
    const is2026 = (o.assignDate || '').includes('2026') || (o.month || '').includes('2026'); // maybe month field has year?
    if (isAug && is2026) {
      augOrders.push(o);
    }
  });
  
  console.log(`Found ${augOrders.length} August 2026 orders in DB.`);
  console.log('Order Numbers:');
  augOrders.forEach(o => console.log(`- ${o.orderNumber}`));
  
  await mongoose.disconnect();
}
check();
