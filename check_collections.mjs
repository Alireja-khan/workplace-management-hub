import mongoose from 'mongoose';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Collections:');
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(collections.map(c => c.name));
  
  // also dump first document in "orders" if it exists, or "Order", "Project" etc.
  for (const c of collections) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`${c.name}: ${count} documents`);
  }
  
  await mongoose.disconnect();
}
check();
