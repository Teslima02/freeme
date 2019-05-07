/* Bridge as the name implies is the barrier that users have to cross
 * To be qualified and granted access to a particular route base on
 * Their roles
 */

import Account from '../models/account';

const adminOnly = async (req, res, next) => {
  const user = await Account.findById(req.user._id);
  if (user.roleId === 'admin') {
    next();
  } else {
    res.redirect('back');
  }
};

const familyOnly = async (req, res, next) => {
  const user = await Account.findById(req.user._id);
  if (user.roleId === 'family') {
    next();
  } else {
    res.redirect('back');
  }
};

const friendOnly = async (req, res, next) => {
  const user = await Account.findById(req.user._id);
  if (user.roleId === 'friend') {
    next();
  } else {
    res.redirect('back');
  }
};

const familyOrFriendOnly = async (req, res, next) => {
  const user = await Account.findById(req.user._id);
  if (user.roleId === 'family' || user.roleId === 'friend') {
    next();
  } else {
    res.redirect('back');
  }
};

const adminOrFamilyOrFriendOnly = async (req, res, next) => {
  const user = await Account.findById(req.user._id);
  if (user.roleId === 'admin' || user.roleId === 'friend' || user.roleId === 'family') {
    next();
  } else {
    res.redirect('back');
  }
};

export { adminOnly, familyOnly, friendOnly, 
  familyOrFriendOnly, adminOrFamilyOrFriendOnly };
