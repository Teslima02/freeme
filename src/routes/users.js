import express from 'express';
import Account from '../models/account';
import Family from '../models/family';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import guard from 'connect-ensure-login';
import { adminOnly, familyOnly } from '../helpers/bridge';
const router = express.Router();

router.get('/', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  res.render('user/manageUsers', { user, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.get('/all/members', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  const users = await Account.find();
  res.render('user/allMembers', { user, users, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.get('/dashboard', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  res.render('user/dashboard', { user, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.get('/admin/dashboard', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  res.render('user/dashboard', { user, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});


router.get('/assign/user', guard.ensureLoggedIn(), adminOnly, async (req, res) => {
  const user = await Account.findById(req.user._id);
  const users = await Account.find({ _familyId: { $exists: false } });
  res.render('user/assign', { user, users, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.post('/register', async (req, res) => {
  const { phone, email, password } = req.body;

  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('cpassword', 'Passwords do not match').equals(password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('error', 'password do not match');
    return res.redirect('/login');
  }

  const user = await Account.findOne({ email: email });

  if (user) {

    req.flash('error', 'Account with that username or email address already exists.');
    res.redirect('/login');

  } else {

    const member = req.body;
    const password = member.password;
    delete member.password;
    member.phone = `+234${phone}`;

    Account.register(new Account(member), password,
                     async (err, account) => {

                       console.log(account, 'account');

                       // return false;
                       //  const tokenG = await Account.findById(account._id);
                       //  console.log(tokenG);
                       //  tokenG.token = await jwt.sign({ id: account._id }, 'freeme');
                       //  await tokenG.save(function(err) {
                       //    if (err) {
                       //      console.log(err);
                       //    }
                       //    //  console.log(tokenG);
                       //  });

                       if (err) {
                         console.log(err);
                       } else {
                         req.flash('success', `Saved Successfully! Your Username is ${member.username}`);
                         res.redirect('/login');
                       }
                     });

  }
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
