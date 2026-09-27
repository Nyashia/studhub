const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

// =====================================================
// GET CURRENT USER PROFILE
// =====================================================

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Failed to get user profile"
    });
  }
});

// =====================================================
// UPDATE CURRENT USER
// =====================================================

router.put("/me", protect, async (req, res) => {
  try {
    const { name, username, email } = req.body;
    const userId = req.user.userId;

    // Find current user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // =================================================
    // VALIDATE NAME
    // =================================================

    if (name !== undefined) {
      const cleanName = name.trim();

      if (!cleanName) {
        return res.status(400).json({
          message: "Name cannot be empty"
        });
      }

      user.name = cleanName;
    }

    // =================================================
    // VALIDATE USERNAME
    // =================================================

    if (username !== undefined) {
      const cleanUsername = username.trim().toLowerCase();

      if (!cleanUsername) {
        return res.status(400).json({
          message: "Username cannot be empty"
        });
      }

      if (cleanUsername.length < 3) {
        return res.status(400).json({
          message: "Username must be at least 3 characters"
        });
      }

      if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
        return res.status(400).json({
          message:
            "Username can only contain letters, numbers and underscores"
        });
      }

      const existingUsername = await User.findOne({
        username: cleanUsername,
        _id: { $ne: userId }
      });

      if (existingUsername) {
        return res.status(409).json({
          message: "That username is already taken"
        });
      }

      user.username = cleanUsername;
    }

    // =================================================
    // VALIDATE EMAIL
    // =================================================

    if (email !== undefined) {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail) {
        return res.status(400).json({
          message: "Email cannot be empty"
        });
      }

      const existingEmail = await User.findOne({
        email: cleanEmail,
        _id: { $ne: userId }
      });

      if (existingEmail) {
        return res.status(409).json({
          message: "Email already in use"
        });
      }

      user.email = cleanEmail;
    }

    // =================================================
    // SAVE CHANGES
    // =================================================

    await user.save();

    // Return safe user data
    res.json({
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error("Update user error:", error);

    // Handle duplicate username/email errors
    if (error.code === 11000) {
      if (error.keyPattern?.username) {
        return res.status(409).json({
          message: "That username is already taken"
        });
      }

      if (error.keyPattern?.email) {
        return res.status(409).json({
          message: "Email already in use"
        });
      }
    }

    res.status(400).json({
      message: "Failed to update profile"
    });
  }
});

// =====================================================
// DELETE CURRENT USER
// =====================================================

router.delete("/me", protect, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.userId);

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      message: "Failed to delete account"
    });
  }
});

// =====================================================
// CHANGE PASSWORD
// =====================================================

router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // =================================================
    // VALIDATE REQUIRED FIELDS
    // =================================================

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required"
      });
    }

    // =================================================
    // VALIDATE NEW PASSWORD
    // =================================================

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters"
      });
    }

    // =================================================
    // FIND USER
    // =================================================

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // =================================================
    // CHECK CURRENT PASSWORD
    // =================================================

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect"
      });
    }

    // =================================================
    // HASH NEW PASSWORD
    // =================================================

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    // =================================================
    // SUCCESS
    // =================================================

    res.json({
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);

    res.status(500).json({
      message: "Failed to update password"
    });
  }
});

module.exports = router;