import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema, 'users');

async function findEmail() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find().lean();
  console.log(users.map(u => ({ email: u.email, name: u.name, assignedName: u.assignedName })));
  await mongoose.disconnect();
}
findEmail();
