const mongoose = require('mongoose');
const dns = require('dns');
const fs = require('fs');
const path = require('path');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

// Read MONGODB_URI from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
let MONGODB_URI = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('MONGODB_URI=')) {
    MONGODB_URI = line.replace('MONGODB_URI=', '').trim();
    if (MONGODB_URI.startsWith('"') && MONGODB_URI.endsWith('"')) {
      MONGODB_URI = MONGODB_URI.slice(1, -1);
    }
  }
}

const MONTH_LIST = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getMonthFromDate(dateStr, fallbackMonth = 'September') {
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

async function syncAll() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
  const collection = mongoose.connection.collection('projects');
  const docs = await collection.find({}).toArray();
  console.log(`Found ${docs.length} projects`);
  for (const doc of docs) {
    if (doc.assignDate) {
      const correctMonth = getMonthFromDate(doc.assignDate, doc.month);
      if (doc.month !== correctMonth) {
        console.log(`Updating ${doc.clientUsername} (${doc.assignDate}): ${doc.month} -> ${correctMonth}`);
        await collection.updateOne({ _id: doc._id }, { $set: { month: correctMonth } });
      }
    }
  }
  console.log('Sync complete!');
  await mongoose.disconnect();
}

syncAll().catch(console.error);
