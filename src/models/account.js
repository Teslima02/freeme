import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import passportLocalMongoose from 'passport-local-mongoose';

const Account = new Schema({
  _familyId: { type: Schema.Types.ObjectId, ref: 'families' },
  _myFriendId: { type: Schema.Types.ObjectId, ref: 'accounts' },
  roleId: { type: String, lowercase: true, trim: true,
            enum: ['admin', 'family', 'friend'] },
  firstName: String,
  middleName: String,
  lastName: String,
  username: String,
  password: String,
  email: { type: String, index: { unique: true } },
  phone: String,
  address: String,
  gender: String,
  passport: String,
  country: String,
  state: String,
  lga: String,
  token: String,
  status: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

Account.plugin(passportLocalMongoose);

export default mongoose.model('accounts', Account);
