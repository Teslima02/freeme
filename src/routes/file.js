import express from 'express';
import Account from '../models/account';
import File from '../models/file';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import guard from 'connect-ensure-login';
const router = express.Router();

router.get('/', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  const files = await File.find({ _createdBy: req.user._id, fileType: 'picture', status: true, active: false });
  res.render('file/managePicture', { user, files, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.get('/video', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  const files = await File.find({ _createdBy: req.user._id, fileType: 'video', status: true, active: false });
  res.render('file/manageVideo', { user, files, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.get('/dashboard', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  res.render('user/dashboard', { user, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.post('/upload', async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {

    const fileUpload = files.file;
    const uploadInfo = fields;

    if (fileUpload.file === null) {
      req.flash('error', 'Please Fill All The Required Forms');
      res.redirect('back');
    }

    if (fileUpload && fileUpload.name) {
      const name = `${Math.round(Math.random() * 10000)}.${fileUpload.name.split('.').pop()}`;
      const dest = path.join(__dirname, '..', 'public', 'files', name);
      const data = fs.readFileSync(fileUpload.path);
      fs.writeFileSync(dest, data);
      fs.unlinkSync(fileUpload.path);
      uploadInfo.file = name;
      // uploadInfo.fileSize = fileUpload.size;
      // uploadInfo.fileType = fileUpload.type;
    }

    const newFile = new File();
    newFile._createdBy = req.user._id;
    newFile.file = uploadInfo.file;
    newFile.fileName = uploadInfo.fileName;
    newFile.fileType = uploadInfo.fileType;
    newFile.friend = uploadInfo.friend;
    newFile.family = uploadInfo.family;
    newFile.save((err) => {
      if (err) {
        console.log(err);
      } else {
        req.flash('success', 'File Upload Successfully');
        res.redirect('back');
      }
    });
  });
});


router.get('/view/:_fileId', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  const file = await File.findOne({ _createdBy: req.user._id, _id: req.params._fileId });
  res.render('file/viewFile', { user, file, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.get('/view/video/:_fileId', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  const file = await File.findOne({ _createdBy: req.user._id, _id: req.params._fileId });
  res.render('file/viewVideo', { user, file, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.get('/archive', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  const files = await File.find({ _createdBy: req.user._id, active: true, status: false });
  res.render('file/viewArchive', { user, files, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});


router.post('/archive', guard.ensureLoggedIn(), async (req, res) => {

  const id = req.body.id;
  const file = await File.findById(id);
  if (file) {
    file.status = false;
    file.active = true;
    file.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.send('success');
      };
    });
  }
});


// staff trash
router.get('/trash', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  const files = await File.find({ _createdBy: req.user._id, status: false });
  res.render('file/trash', { user, files, layout: 'layouts/user' });
});

router.post('/restore', guard.ensureLoggedIn(), async (req, res) => {

  const id = req.body.id;
  const file = await File.findById(id);

  if (file.status === false) {
    file.status = 1;
    file.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.send('success');
      };
    });
  }
});


// delete user permanetly
router.post('/delete', guard.ensureLoggedIn(), async (req, res) => {
  const id = req.body.id;
  await File.findById(id).remove();
  res.send('success');
});

router.get('/can/see/by/family/:_familyId', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  const getUser = await Account.findOne({ _familyId: req.params._familyId });
  let pictures = 0;
  let videos = 0;
  if (getUser) {
    pictures = await File.find({ family: true, fileType: 'picture' });
    videos = await File.find({ family: true, fileType: 'video' });
  }
  // const pictures = await File.find({ _createdBy: req.user._id, family: true, fileType: 'picture' });
  // const videos = await File.find({ _createdBy: req.user._id, family: true, fileType: 'video' });
  res.render('file/generalFile', { user, pictures, videos, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

router.get('/can/see/by/friend/:_friendId', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id);
  const upLineFriend = await Account.findById(req.params._friendId);
  // const getUser = await Account.findOne({ _myFriendId: user._myFriendId, _id: req.params._friendId, roleId: 'friend' });
  const getUser = await Account.findOne({ _id: req.params._friendId, roleId: 'friend' });
  console.log(getUser);
  let pictures = 0;
  let videos = 0;
  if (getUser) {
    pictures = await File.find({ _createdBy: upLineFriend._id, friend: true, fileType: 'picture' });
    videos = await File.find({ _createdBy: upLineFriend._id, friend: true, fileType: 'video' });
  }
  // const pictures = await File.find({ _createdBy: req.user._id, family: true, fileType: 'picture' });
  // const videos = await File.find({ _createdBy: req.user._id, family: true, fileType: 'video' });
  res.render('file/generalFile', { user, pictures, videos, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
});

export default router;
