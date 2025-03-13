const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/profile-pics';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, institution } = req.body;
    console.log('Registration data received:', { username, email, institution }); // Debug log

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with institution
    user = new User({
      username,
      email,
      password: await bcrypt.hash(password, await bcrypt.genSalt(10)),
      institution // Include institution directly
    });

    await user.save();
    console.log('User saved with data:', user); // Debug log

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send back complete user data including institution
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        institution: user.institution, // Make sure institution is included
        bio: user.bio || '',
        profilePicUrl: user.profilePicUrl || ''
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        institution: user.institution,
        bio: user.bio,
        profilePicUrl: user.profilePicUrl
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile route with file upload
router.put('/update-profile', auth, upload.single('profilePic'), async (req, res) => {
  try {
    console.log('Update profile request received');
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    console.log('User ID from token:', req.user.userId);
    
    const { username, institution, bio } = req.body;
    const userId = req.user.userId;

    const updateData = {
      username,
      institution,
      bio
    };

    // If a new profile picture was uploaded
    if (req.file) {
      console.log('Processing new profile picture');
      // Make sure to use the correct URL format for your environment
      const profilePicUrl = `http://localhost:5000/uploads/profile-pics/${req.file.filename}`;
      console.log('New profile pic URL:', profilePicUrl);
      updateData.profilePicUrl = profilePicUrl;

      // Delete old profile picture if it exists
      const oldUser = await User.findById(userId);
      if (oldUser && oldUser.profilePicUrl) {
        console.log('Old profile picture URL:', oldUser.profilePicUrl);
        try {
          const oldFilePath = oldUser.profilePicUrl.split('/uploads/')[1];
          if (oldFilePath) {
            const fullPath = path.join('uploads', oldFilePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
              console.log('Old profile picture deleted:', fullPath);
            }
          }
        } catch (error) {
          console.error('Error deleting old profile picture:', error);
        }
      }
    }

    console.log('Updating user with data:', updateData);
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User updated successfully:', user);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        institution: user.institution,
        bio: user.bio,
        profilePicUrl: user.profilePicUrl
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


