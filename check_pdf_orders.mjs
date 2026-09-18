import mongoose from 'mongoose';

const pdfOrders = [
  'FO429E50E85C8',
  'FO829F7FABCC4',
  'FO3DF35F5941',
  'FO629F4F0E4C6',
  'FO629F37888C6', 
  'FO414FEF98CC2',
  'FO61BFA1D2582', 
  'FO3DEE13E841',
  'FO51BF8AD0D83',
  'FO31BF6489585',
  'FO314FCC8C5C3',
  'FO314FFA78243',
  'FO83767711F08',
  'FO16FDCF1401',
  'FO1E01340543',
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
  'FO61B7ADB2582', 
  'FO22302BFEA88',
  'FO22302BFEA88',
  'FO3230B333007',
  'FO722E0BE6883',
  'FO82A121B60C4',
  'FO11C05EB8787',
  'FO4230273EE06',
  'FO3230D4B4F87',
  'FO11498FB3E45',
  'FO829E374B1C4',
  'FO522EDDD1E85',
  'FO522FC7C5005',
  'FO17015FF481',
  'FO61BF441A582',
  'FO5230E23C905',
  'FO41C0D670D84',
  'FO82A14FFD6C4',
  'FO4230273EE06'
];

const TeamProjectSchema = new mongoose.Schema({}, { strict: false });
const TeamProject = mongoose.models.TeamProject || mongoose.model('TeamProject', TeamProjectSchema, 'teamprojects');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const dbOrders = await TeamProject.find({ teamName: /EleSquad/i }).lean();
  
  const missing = [];
  const found = [];
  
  pdfOrders.forEach(po => {
    const match = dbOrders.find(d => d.orderNumber === po);
    if (match) {
      found.push(match);
    } else {
      missing.push(po);
    }
  });
  
  console.log(`Checking ${pdfOrders.length} orders from OCR...`);
  console.log(`Found: ${found.length}, Missing: ${missing.length}`);
  if (missing.length > 0) {
    console.log('Missing Orders:');
    missing.forEach(m => console.log(`- ${m}`));
  }
  
  await mongoose.disconnect();
}
run();
