import express from 'express';
import Account from '../models/account';
import Family from '../models/family';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import guard from 'connect-ensure-login';
import { adminOnly, familyOnly } from '../helpers/bridge';
import { getServers } from 'dns';
const router = express.Router();

router.get('/', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  res.render('user/manageUsers', { user, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.get('/dashboard', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  const users = await Account.find();
  res.render('user/dashboard', { user, users, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.get('/admin/dashboard', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  res.render('user/dashboard', { user, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.get('/all/members', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  // TODO: come back to this
  // const users = await Account.find({ _familyId: { $exists: false } });
  const users = await Account.find();
  res.render('user/allMembers', { user, users, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.get('/view/:_userId', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  const getUser = await Account.findById(req.params._userId);
  const users = await Account.find();
  res.render('user/viewMember', { user, users, getUser, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.get('/get/families', guard.ensureLoggedIn(), async (req, res) => {
  const users = await Family.find({ _createdBy: req.user._id });
  return res.status(200).json(users);
});

router.post('/add/member', guard.ensureLoggedIn(), async (req, res) => {

  const user = await Account.findById(req.body._userId);
  if (user) {
    user.roleId = req.body.roleId;
    if (req.body.roleId === 'friend') {
      user._myFriendId = req.user._id;
    } else if (req.body.roleId === 'family') {
      user._familyId = req.body.familyId;
    }
    user.save((err, user) => {
      if (err) {
        req.flash('error', 'Error occurred');
        res.redirect('/user/all/members');
      } else {
        req.flash('success', `${user.firstName} is now your ${user.roleId}`);
        res.redirect('/user/all/members');
      }
    });
  }
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


export default router;
