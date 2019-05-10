import express from 'express';
import passport from 'passport';
import Store from '../models/store';
import Account from '../models/account';
import Business from '../models/business';
import Subscription from '../models/subscription';
const router = express.Router();


router.get('/dashboard', async (req, res) => {
  const user = await Account.findById(req.user._id);
  if (user) {
    res.redirect('/user/dashboard');
  }
});


router.get('/', async (req, res) => {
  res.render('site/index', { msg: req.flash('info'), layout: 'layouts/site' });
});


router.get('/about', (req, res) => {
  res.render('site/about', { layout: 'layouts/site' });
});


router.get('/register', async (req, res) => {
  const business = await Business.find();
  res.render('site/register', { business, expressFlash: req.flash('info'), layout: 'layouts/site' });
});


router.get('/login', (req, res) => {
  res.render('store/login', {
    success: req.flash('success'), error: req.flash('error'), user: req.user,
    layout: false
  });
});


router.post('/login', passport.authenticate('local',
                                            {
                                              failureRedirect: '/login',
                                              failureFlash: true
                                            }),
            async (req, res, next) => {
              const user = await Account.findById(req.user._id);

              if (user.roleId === 'admin') {
                res.redirect('/user/admin/dashboard');
              } else {
                res.redirect('/user/dashboard');
              }
            });


router.get('/logout', (req, res, next) => {
  req.logout();
  req.session.save((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});


router.get('/ping', (req, res) => {
  res.status(200).send('pong!');
});

export default router;
