const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// ==========================================
// UPLOAD DIRECTORY
// ==========================================

const uploadDirectory = 'uploads';

// Make sure uploads folder exists
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// ==========================================
// MULTER STORAGE
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1E9);

    cb(
      null,
      uniqueName + path.extname(file.originalname).toLowerCase()
    );
  }
});

// ==========================================
// FILE VALIDATION
// ==========================================

const fileFilter = (req, file, cb) => {

  const allowedExtensions = [
    '.jpeg',
    '.jpg',
    '.png',
    '.gif'
  ];

  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const extensionAllowed =
    allowedExtensions.includes(extension);

  const mimeTypeAllowed =
    allowedMimeTypes.includes(file.mimetype);

  if (extensionAllowed && mimeTypeAllowed) {
    return cb(null, true);
  }

  cb(new Error('Only JPG, JPEG, PNG and GIF images are allowed.'));
};

// ==========================================
// MULTER CONFIGURATION
// ==========================================

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// ==========================================
// UPLOAD PROFILE PICTURE
// ==========================================

router.post(
  '/profile-picture',
  auth,
  upload.single('image'),
  async (req, res) => {

    try {

      if (!req.file) {
        return res.status(400).json({
          error: 'No image uploaded'
        });
      }

      const user = await User.findById(req.user.userId);

      if (!user) {

        // Delete uploaded file if user doesn't exist
        fs.unlinkSync(req.file.path);

        return res.status(404).json({
          error: 'User not found'
        });
      }

      // ==========================================
      // DELETE OLD PROFILE PICTURE
      // ==========================================

      if (user.profilePicture) {

        try {

          const oldFilename =
            path.basename(user.profilePicture);

          const oldFilePath =
            path.join(uploadDirectory, oldFilename);

          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }

        } catch (error) {

          console.error(
            'Error deleting old profile picture:',
            error
          );
        }
      }

      // ==========================================
      // CREATE NEW IMAGE URL
      // ==========================================

      const imageUrl =
        `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      user.profilePicture = imageUrl;

      await user.save();

      res.json({
        profilePicture: user.profilePicture
      });

    } catch (error) {

      console.error(
        'Error uploading profile picture:',
        error
      );

      // Remove newly uploaded file if something failed
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        error: 'Failed to upload profile picture'
      });
    }
  }
);

// ==========================================
// DELETE PROFILE PICTURE
// ==========================================

router.delete(
  '/profile-picture',
  auth,
  async (req, res) => {

    try {

      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // ==========================================
      // DELETE IMAGE FILE
      // ==========================================

      if (user.profilePicture) {

        try {

          const filename =
            path.basename(user.profilePicture);

          const filePath =
            path.join(uploadDirectory, filename);

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

        } catch (error) {

          console.error(
            'Error deleting profile picture file:',
            error
          );
        }
      }

      // ==========================================
      // RESET DATABASE VALUE
      // ==========================================

      user.profilePicture = '';

      await user.save();

      res.json({
        profilePicture: ''
      });

    } catch (error) {

      console.error(
        'Error deleting profile picture:',
        error
      );

      res.status(500).json({
        error: 'Failed to delete profile picture'
      });
    }
  }
);

module.exports = router;