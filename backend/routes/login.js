const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// =====================================================
// LOGIN USER
// =====================================================

router.post("/", async (req, res) => {
  try {

    const { email, password } = req.body;

    // -----------------------------
    // Validate required fields
    // -----------------------------

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // -----------------------------
    // Clean input
    // -----------------------------

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({
        message: "Email cannot be empty"
      });
    }

    // -----------------------------
    // Find user
    // -----------------------------

    const user = await User.findOne({
      email: cleanEmail
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // -----------------------------
    // Check password
    // -----------------------------

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // -----------------------------
    // Create JWT
    // -----------------------------

    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    // -----------------------------
    // Send safe response
    // -----------------------------

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {

    console.error("Login error:", error);

    res.status(500).json({
      message: "Failed to log in"
    });
  }
});


module.exports = router;