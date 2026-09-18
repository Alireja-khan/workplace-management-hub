import mongoose from 'mongoose';

const TeamProjectSchema = new mongoose.Schema({}, { strict: false });
const TeamProject = mongoose.models.TeamProject || mongoose.model('TeamProject', TeamProjectSchema, 'teamprojects');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const allOrders = await TeamProject.find({ teamName: /EleSquad/i }).lean();
  
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
    'FO22302BFEA88',
    'FO3230B333007',
    'FO722E0BE6883',
    'FO82A121B60C4',
    'FO11C05EB8787',
    'FO4230273EE06',
    'FO3230D4B4F87'
  ];

  console.log(`Checking ${sheetOrderNumbers.length} order numbers from the sheet...`);
  
  const missing = [];
  const found = [];
  
  sheetOrderNumbers.forEach(sheetOrderNo => {
    // some sheet orders have duplicates in my list, e.g. FO22302BFEA88
    const match = allOrders.find(o => o.orderNumber === sheetOrderNo);
    if (match) {
      found.push(match);
    } else {
      missing.push(sheetOrderNo);
    }
  });
  
  console.log(`\nFound ${found.length} orders in DB.`);
  console.log(`Missing ${missing.length} orders in DB.`);
  if (missing.length > 0) {
    console.log('Missing Order Numbers:');
    missing.forEach(m => console.log(`- ${m}`));
  }
  
  console.log('\nLet\'s check the Assign Dates of the FOUND orders:');
  let augustAssignCount = 0;
  found.forEach(o => {
    const isAug = o.month && o.month.toLowerCase() === 'august';
    if (isAug) augustAssignCount++;
  });
  console.log(`Out of the ${found.length} sheet orders, ${augustAssignCount} were ASSIGNED in August.`);
  
  await mongoose.disconnect();
}
check();
