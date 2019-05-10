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
  const files = await File.find({ _createdBy: req.user._id });
  res.render('file/manage', { user, files, success: req.flash('success'), error: req.flash('error'), layout: 'layouts/user' });
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

    console.log(fileUpload, 'fileUpload');
    console.log(uploadInfo, 'uploadInfo');
    // return false;

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

export default router;
