import express from 'express';
import Account from '../models/account';
import Family from '../models/family';
import guard from 'connect-ensure-login';
import { adminOrFamilyOrFriendOnly } from '../helpers/bridge';
const router = express.Router();

// get family
router.get('/', guard.ensureLoggedIn(), adminOrFamilyOrFriendOnly, async (req, res) => {
  const user = await Account.findById(req.user._id);
  const families = await Family.find({ $or: [{ _id: user._familyId }, { _createdBy: req.user._id }] });
  res.render('family/manage', { user, families, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

// post family
router.post('/', guard.ensureLoggedIn(), adminOrFamilyOrFriendOnly, async (req, res) => {

  console.log(req.body);

  const family = await Family.findOne({ _createdBy: req.user._id, name: req.body.name });
  if (family) {
    req.flash('error', 'Family with that name already exist');
    res.redirect('back');

  } else {
    const family = new Family(req.body);
    family._createdBy = req.user._id;
    family.save((err, family) => {
      if (err) {
        throw err;
      } else {
        req.flash('success', `${family.name} created successfully`);
        res.redirect('back');
      }
    });
  }
});

// view family
router.get('/view/:_familyId', guard.ensureLoggedIn(), adminOrFamilyOrFriendOnly, async (req, res) => {
  const user = await Account.findById(req.user._id);
  const users = await Account.find({ roleId: 'family', _familyId: req.params._familyId });
  const family = await Family.findById(req.params._familyId);
  res.render('family/viewFamily', { user, users, family, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.get('/friends', guard.ensureLoggedIn(), adminOrFamilyOrFriendOnly, async (req, res) => {
  const user = await Account.findById(req.user._id);
  const friends = await Account.find({ roleId: 'friend', _myFriendId: req.user._id });
  res.render('family/friends', { user, friends, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.get('/view/friend/:_friendId', guard.ensureLoggedIn(), adminOrFamilyOrFriendOnly, async (req, res) => {
  const user = await Account.findById(req.user._id);
  const friend = await Account.findById(req.params._friendId);
  res.render('family/viewFriend', { user, friend, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});


export default router;
