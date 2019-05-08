import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Family = new Schema({
  _userId: { type: Schema.Types.ObjectId, ref: 'accounts' },
  name: String,
  status: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('families', Family);
