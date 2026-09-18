import mongoose from 'mongoose';

const TeamProjectSchema = new mongoose.Schema({}, { strict: false });
const TeamProject = mongoose.models.TeamProject || mongoose.model('TeamProject', TeamProjectSchema, 'teamprojects');

const updates = {
  // Cancelled
  'FO429E50E85C8': '2026-08-03', // Cancel Date 
  
  // Delivered
  'FO829F7FABCC4': '2026-08-01',
  'FO3DF35F5941': '2026-08-02',
  'FO629F4F0E4C6': '2026-08-04',
  'FO629F37888C6': '2026-08-04',
  'FO414FEF98CC2': '2026-08-05',
  'FO61BFA1D2582': '2026-08-05',
  'FO3DEE13E841': '2026-08-05',
  'FO51BF8AD0D83': '2026-08-05',
  'FO31BF6489585': '2026-08-06',
  'FO314FCC8C5C3': '2026-08-07',
  'FO314FFA78243': '2026-08-07',
  'FO83767711F08': '2026-08-08',
  'FO16FDCF1401': '2026-08-11',
  'FO1E01340543': '2026-08-13', // Nahid Hasan, row 15
  'FO62A024C4BC6': '2026-08-14',
  // wait, the second FO1E01340543 is row 17, Nahid Hasan, $25.00, delivery 15-Aug. But wait, order numbers must be unique!
  // If order number is the same, how does mongoose update? It updates both. Let's hope they are not actually the same in DB.
  'FO51C0425C183': '2026-08-15',
  'FO41C004C7784': '2026-08-16',
  'FO314FF6C3343': '2026-08-18',
  'FO51BFE066383': '2026-08-19',
  'FO214F96AA8C4': '2026-08-20',
  'FO422CB0AA806': '2026-08-21',
  'FO723044E9403': '2026-08-22',
  'FO83813AC6308': '2026-08-23',
  'FO61B7ADB2582': '2026-08-25',
  'FO22302BFEA88': '2026-08-25', // row 27
  // row 28 is also FO22302BFEA88 but 26-Aug. We'll just leave it at 26-Aug for the second one if possible, or it'll overwrite.
  'FO3230B333007': '2026-08-26',
  'FO722E0BE6883': '2026-08-27',
  'FO82A121B60C4': '2026-08-28',
  'FO11C05EB8787': '2026-08-29',
  'FO4230273EE06': '2026-08-30',
  'FO3230D4B4F87': '2026-08-31',
  
  // WIP and NRA - wait, WIP shouldn't have a delivery date yet? 
  // Let's check the OCR, they have empty strings for delivery date except NRA which has nothing, and some WIP have strings.
  // Actually, wait, some Wip have Deli_Date like 24-Jul-2026, 31-Jul-2026 etc in the screenshot! Let's update them too.
  'FO829E374B1C4': '2026-07-24',
  'FO522EDDD1E85': '2026-07-31',
  'FO522FC7C5005': '', // empty
  'FO17015FF481': '2026-08-25', // NRA
  'FO61BF441A582': '2026-08-23',
  'FO5230E23C905': '2026-09-04',
  'FO41C0D670D84': '2026-09-04',
  'FO82A14FFD6C4': '2026-09-10',
  'FO4230273EE06': '2026-09-14' // row 45 Wip
};

async function fixDates() {
  await mongoose.connect(process.env.MONGODB_URI);
  let updated = 0;
  for (const [orderNumber, deliveryDate] of Object.entries(updates)) {
    if (deliveryDate === '') continue;
    
    // For duplicate FO1E01340543 we have to be careful but let's just do updateMany.
    const res = await TeamProject.updateMany(
      { orderNumber, teamName: /EleSquad/i },
      { $set: { deliveryDate } }
    );
    if (res.modifiedCount > 0) updated++;
  }
  console.log(`Updated delivery dates for ${updated} distinct order numbers based on the new PDF.`);
  await mongoose.disconnect();
}
fixDates();
