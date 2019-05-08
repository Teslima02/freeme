import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Family = new Schema({
  name: String,
  status: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('families', Family);
