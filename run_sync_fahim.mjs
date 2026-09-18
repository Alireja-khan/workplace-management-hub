import mongoose from 'mongoose';
import { syncUserProjects } from './lib/syncUtils.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Running sync for Fahim...');
  const count = await syncUserProjects('Fahim', 'ali2reja@gmail.com');
  console.log(`Synced ${count} projects for Fahim`);
  await mongoose.disconnect();
}
run();
