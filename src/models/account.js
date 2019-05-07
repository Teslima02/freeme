import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import passportLocalMongoose from 'passport-local-mongoose';

const Account = new Schema({
  roleId: { type: String, lowercase: true, trim: true,
            enum: ['admin', 'family', 'friend'] },
  firstname: String,
  middlename: String,
  lastname: String,
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
  rightToDeleteAdmin: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
  enterProduct: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

Account.plugin(passportLocalMongoose);

export default mongoose.model('accounts', Account);
