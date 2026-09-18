import mongoose from 'mongoose';

const TeamProjectSchema = new mongoose.Schema({}, { strict: false });
const TeamProject = mongoose.models.TeamProject || mongoose.model('TeamProject', TeamProjectSchema, 'teamprojects');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const allOrders = await TeamProject.find({ teamName: /EleSquad/i }).lean();
  
  let deliveredInAugust = 0;
  let cancelledInAugust = 0;
  
  const sheetOrderNumbers = [
    'FO429E50E85C8',
    'FO829F7FABCC4',
    'FO3DF35F5941',
    'FO629F4F0E4C6',
    'FO629F37808C6',
    'FO414FEF98CC2',
    'FO51BFA1D2582',
    'FO3DEE13E841',
    'FO51BF8AD0D83',
    'FO31BF6489585',
    'FO314FCC8C5C3',
    'FO314FFA78243',
    'FO83767711F08',
    'FO16FDCF1401',
    'FO1F01340543',
    'FO62A024C4BC6',
    'FO1E01340543',
    'FO51C0425C183',
    'FO41C004C7784',
    'FO314FF6C3343',
    'FO51BFE066383',
    'FO214F96AA8C4',
    'FO422CB0AA806',
    'FO723044E9403',
    'FO83813AC6308',
    'FO51B7AD82582',
    'FO22302BFEA88',
    'FO22302BFEA88', // Duplicate in my manual array above? Wait, row 28 and 29: FO22302BFEA88
    'FO3230B333007',
    'FO722E0BE6883',
    'FO82A121B60C4',
    'FO11C05EB8787',
    'FO4230273EE06',
    'FO3230D4B4F87'
  ];

  allOrders.forEach(o => {
    const st = (o.orderStatus || '').toLowerCase();
    const isDeliveredOrDone = st === 'delivered' || st === 'done' || st === 'issue';
    const isCancel = st === 'cancel';
    const delMonth = o.deliveryDate ? o.deliveryDate.split('-')[1] : null;
    const delYear = o.deliveryDate ? o.deliveryDate.split('-')[0] : null;
    
    if (delMonth === '08' && delYear === '2026') {
      if (isDeliveredOrDone) deliveredInAugust++;
      if (isCancel) cancelledInAugust++;
    } else if (!delMonth && (o.month || '').toLowerCase() === 'august' && (o.assignDate || '').includes('2026')) {
      // Fallback logic
      if (isDeliveredOrDone) deliveredInAugust++;
      if (isCancel) cancelledInAugust++;
    }
  });
  
  console.log(`Total Delivered in Aug 2026: ${deliveredInAugust}`);
  console.log(`Total Cancelled in Aug 2026: ${cancelledInAugust}`);
  console.log(`Total Completed/Cancelled in Aug 2026: ${deliveredInAugust + cancelledInAugust}`);
  
  // The user says: "shob gula order er delivery date fix kore dau sheet onujayi.."
  // This means the delivery dates in the DB are PROBABLY wrong or missing.
  // I should write a script to fix the delivery dates for these 34 orders based on the screenshots.
  
  await mongoose.disconnect();
}
check();
