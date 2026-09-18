import mongoose from 'mongoose';

const TeamProjectSchema = new mongoose.Schema({}, { strict: false });
const TeamProject = mongoose.models.TeamProject || mongoose.model('TeamProject', TeamProjectSchema, 'teamprojects');

const updates = {
  'FO829F7FABCC4': '2026-08-01',
  'FO3DF35F5941': '2026-08-02',
  'FO629F4F0E4C6': '2026-08-04',
  'FO414FEF98CC2': '2026-08-05',
  'FO3DEE13E841': '2026-08-05',
  'FO51BF8AD0D83': '2026-08-05',
  'FO31BF6489585': '2026-08-06',
  'FO314FCC8C5C3': '2026-08-07',
  'FO314FFA78243': '2026-08-07',
  'FO83767711F08': '2026-08-08',
  'FO16FDCF1401': '2026-08-11',
  'FO62A024C4BC6': '2026-08-14',
  'FO1E01340543': '2026-08-15',
  'FO51C0425C183': '2026-08-15',
  'FO41C004C7784': '2026-08-16',
  'FO314FF6C3343': '2026-08-18',
  'FO51BFE066383': '2026-08-19',
  'FO214F96AA8C4': '2026-08-20',
  'FO422CB0AA806': '2026-08-21',
  'FO723044E9403': '2026-08-22',
  'FO83813AC6308': '2026-08-23',
  'FO22302BFEA88': '2026-08-26', // setting to 26 for duplicate
  'FO3230B333007': '2026-08-26',
  'FO722E0BE6883': '2026-08-27',
  'FO82A121B60C4': '2026-08-28',
  'FO11C05EB8787': '2026-08-29',
  'FO4230273EE06': '2026-08-30',
  'FO3230D4B4F87': '2026-08-31'
};

async function fixDates() {
  await mongoose.connect(process.env.MONGODB_URI);
  let correct = 0;
  for (const [orderNumber, deliveryDate] of Object.entries(updates)) {
    const res = await TeamProject.findOne(
      { orderNumber, teamName: /EleSquad/i }
    ).lean();
    if (res && res.deliveryDate === deliveryDate) correct++;
    else if (res) console.log(`${orderNumber} has ${res.deliveryDate}, expected ${deliveryDate}`);
  }
  console.log(`${correct} orders have the exact delivery date expected.`);
  await mongoose.disconnect();
}
fixDates();
