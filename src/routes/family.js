import express from 'express';
import Account from '../models/account';
import Family from '../models/family';
import guard from 'connect-ensure-login';
import { adminOrFamilyOrFriendOnly } from '../helpers/bridge';
const router = express.Router();

// get family
router.get('/', guard.ensureLoggedIn(), adminOrFamilyOrFriendOnly, async (req, res) => {
  const user = await Account.findById(req.user._id);
  const families = await Family.find({ _userId: req.user._id });
  res.render('family/manage', { user, families, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

// post family
router.post('/', guard.ensureLoggedIn(), adminOrFamilyOrFriendOnly, async (req, res) => {

  console.log(req.body);

  const family = await Family.findOne({ name: req.body.name });
  if (family) {
    req.flash('error', 'Family with that name already exist');
    res.redirect('back');

  } else {
    const family = new Family(req.body);
    family._userId = req.user._id;
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

export default router;
