import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'super-admin'], default: 'admin' }
});

// Hash password before save
AdminSchema.pre('save', async function(next: mongoose.CallbackWithoutResultAndOptionalError) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export const Admin = mongoose.model('Admin', AdminSchema);