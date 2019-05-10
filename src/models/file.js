import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const File = new Schema({
  _createdBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  file: String,
  fileName: String,
  fileType: {
    type: String, lowercase: true, trim: true,
    enum: ['picture', 'video']
  },
  friend: { type: Boolean, default: false },
  family: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
  active: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('files', File);
