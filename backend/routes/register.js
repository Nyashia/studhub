const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");


// =====================================================
// REGISTER NEW USER
// =====================================================

router.post("/", async (req, res) => {
  try {

    const { name, username, email, password } = req.body;

    // -----------------------------
    // Validate required fields
    // -----------------------------

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: "Name, username, email and password are required"
      });
    }

    // -----------------------------
    // Clean input
    // -----------------------------

    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanUsername || !cleanEmail) {
      return res.status(400).json({
        message: "Name, username and email cannot be empty"
      });
    }

    // -----------------------------
    // Validate username
    // -----------------------------

    if (cleanUsername.length < 3) {
      return res.status(400).json({
        message: "Username must be at least 3 characters"
      });
    }

    // Only allow letters, numbers and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      return res.status(400).json({
        message: "Username can only contain letters, numbers and underscores"
      });
    }

    // -----------------------------
    // Basic password validation
    // -----------------------------

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    // -----------------------------
    // Check if email already exists
    // -----------------------------

    const existingEmail = await User.findOne({
      email: cleanEmail
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    // -----------------------------
    // Check if username already exists
    // -----------------------------

    const existingUsername = await User.findOne({
      username: cleanUsername
    });

    if (existingUsername) {
      return res.status(409).json({
        message: "That username is already taken"
      });
    }

    // -----------------------------
    // Hash password
    // -----------------------------

    const hashedPassword = await bcrypt.hash(password, 10);

    // -----------------------------
    // Create user
    // -----------------------------

    const newUser = await User.create({
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword
    });

    // -----------------------------
    // Send safe response
    // -----------------------------

    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email
    });

  } catch (error) {

    console.error("Registration error:", error);

    // Handle duplicate email/username race condition
    if (error.code === 11000) {

      if (error.keyPattern?.email) {
        return res.status(409).json({
          message: "An account with this email already exists"
        });
      }

      if (error.keyPattern?.username) {
        return res.status(409).json({
          message: "That username is already taken"
        });
      }

      return res.status(409).json({
        message: "An account with these details already exists"
      });
    }

    res.status(500).json({
      message: "Failed to create account"
    });
  }
});


module.exports = router;