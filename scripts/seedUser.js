const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

async function seedUserAndAssignProjects() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const usersCollection = mongoose.connection.collection('users');
  const projectsCollection = mongoose.connection.collection('projects');

  const targetEmail = 'alirejakhan36@gmail.com';
  const targetName = 'Alireja Khan';
  const targetPass = '1216631830@li';

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(targetPass, salt);

  const existing = await usersCollection.findOne({ email: targetEmail });
  if (existing) {
    console.log(`User ${targetEmail} exists, updating password and name...`);
    await usersCollection.updateOne(
      { _id: existing._id },
      { $set: { name: targetName, password: hashedPassword } }
    );
  } else {
    console.log(`Creating user ${targetEmail}...`);
    await usersCollection.insertOne({
      name: targetName,
      email: targetEmail,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Assign all projects to this user
  const result = await projectsCollection.updateMany(
    {},
    { $set: { userEmail: targetEmail } }
  );
  console.log(`Assigned ${result.modifiedCount || result.matchedCount} projects to ${targetEmail}`);

  console.log('Seed completed successfully!');
  await mongoose.disconnect();
}

seedUserAndAssignProjects().catch(console.error);
