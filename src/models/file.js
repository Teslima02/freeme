import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const File = new Schema({
  _createdBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  file: String,
  fileName: String,
  friend: { type: Boolean, default: false },
  family: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('files', File);
