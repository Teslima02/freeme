import express from 'express';
import Account from '../models/account';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import guard from 'connect-ensure-login';
const router = express.Router();

/* GET users listing. */
router.get('/', guard.ensureLoggedIn(), async (req, res) => {
  res.render('user/manageUsers', { success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.post('/', guard.ensureLoggedIn(), async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {

    const user = await Account.findOne({ email: fields.email });

    if (user) {

      req.flash('success', 'E-mail Or Username Already Exist');
      res.redirect('/admin/staff/');

    } else {

      const passport = files.passport;
      const member = fields;
      const password = member.password;
      delete member.password;
      member.status = 1;
      member.phone = `+234${fields.phone}`;
      member.username = `${fields.username}`;
      member.enterProduct = (fields.enterProduct !== '') ? fields.enterProduct : '';
      if (passport && passport.name) {
        const name = `${Math.round(Math.random() * 10000)}.${passport.name.split('.').pop()}`;
        const dest = path.join(__dirname, '..', 'public', 'images', 'member', name);
        const data = fs.readFileSync(passport.path);
        fs.writeFileSync(dest, data);
        fs.unlinkSync(passport.path);
        member.passport = name;
      }

      Account.register(new Account(member), password,
                       async (err, account) => {

                         // return false;
                         const tokenG = await Account.findOne({ _id: account._id, _storeId: account._storeId });
                         //  console.log(tokenG);
                         tokenG.token = await jwt.sign({ id: account._id }, 'freeme');
                         await tokenG.save(function(err) {
                           if (err) {
                             console.log(err);
                           }
                           //  console.log(tokenG);
                         });

                         if (err) {
                           console.log(err);
                         } else if (account.roleId === 'admin') {
                           req.flash('success', `Saved Successfully! Your Username is ${member.username}`);
                           res.redirect('/users');
                         }
                       });

    }
  });
});

export default router;
