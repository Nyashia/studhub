const express = require('express');
const router = express.Router();

const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const Activity = require('../models/Activity');

const auth = require('../middleware/authMiddleware');


// =====================================================
// SEND FRIEND REQUEST
// =====================================================

router.post('/request', auth, async (req, res) => {
  try {

    const { email, username } = req.body;
    const fromUserId = req.user.userId;

    // -----------------------------
    // Validate search information
    // -----------------------------

    if (!email && !username) {
      return res.status(400).json({
        message: 'Email or username is required'
      });
    }

    // -----------------------------
    // Find recipient
    // -----------------------------

    let toUser = null;

    if (username) {

      const cleanUsername = username
        .trim()
        .toLowerCase();

      toUser = await User.findOne({
        username: cleanUsername
      });

    } else if (email) {

      const cleanEmail = email
        .trim()
        .toLowerCase();

      toUser = await User.findOne({
        email: cleanEmail
      });
    }

    if (!toUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // -----------------------------
    // Can't add yourself
    // -----------------------------

    if (toUser._id.toString() === fromUserId.toString()) {
      return res.status(400).json({
        message: 'Cannot send a friend request to yourself'
      });
    }

    // -----------------------------
    // Check existing request
    // -----------------------------

    const existingRequest = await FriendRequest.findOne({
      $or: [
        {
          from: fromUserId,
          to: toUser._id
        },
        {
          from: toUser._id,
          to: fromUserId
        }
      ]
    });

    if (existingRequest) {

      if (existingRequest.status === 'accepted') {
        return res.status(400).json({
          message: 'You are already friends with this user'
        });
      }

      if (existingRequest.status === 'pending') {
        return res.status(400).json({
          message: 'A friend request already exists'
        });
      }

      // If a previous request was rejected,
      // allow a new request to be created.
      if (existingRequest.status === 'rejected') {
        await FriendRequest.deleteOne({
          _id: existingRequest._id
        });
      }
    }

    // -----------------------------
    // Create friend request
    // -----------------------------

    const friendRequest = new FriendRequest({
      from: fromUserId,
      to: toUser._id,
      status: 'pending'
    });

    await friendRequest.save();

    res.status(201).json({
      message: `Friend request sent to ${toUser.name}`,
      friendRequest
    });

  } catch (error) {

    console.error('Send friend request error:', error);

    // Handle duplicate request race condition
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'A friend request already exists'
      });
    }

    res.status(500).json({
      message: 'Failed to send friend request'
    });
  }
});


// =====================================================
// ACCEPT FRIEND REQUEST
// =====================================================

router.put('/request/:id/accept', auth, async (req, res) => {
  try {

    const requestId = req.params.id;
    const userId = req.user.userId;

    // -----------------------------
    // Find pending request
    // -----------------------------

    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      to: userId,
      status: 'pending'
    });

    if (!friendRequest) {
      return res.status(404).json({
        message: 'Friend request not found'
      });
    }

    // -----------------------------
    // Accept request
    // -----------------------------

    friendRequest.status = 'accepted';

    await friendRequest.save();

    // -----------------------------
    // Get both users
    // -----------------------------

    const fromUser = await User.findById(
      friendRequest.from
    );

    const toUser = await User.findById(
      friendRequest.to
    );

    // -----------------------------
    // Create activities
    // -----------------------------

    await Activity.create([
      {
        user: friendRequest.from,
        friendId: friendRequest.to,
        type: 'joined_studhub',
        message: `You are now friends with ${toUser.name}`
      },
      {
        user: friendRequest.to,
        friendId: friendRequest.from,
        type: 'joined_studhub',
        message: `You are now friends with ${fromUser.name}`
      }
    ]);

    res.json({
      message: 'Friend request accepted'
    });

  } catch (error) {

    console.error('Accept friend request error:', error);

    res.status(500).json({
      message: 'Failed to accept friend request'
    });
  }
});


// =====================================================
// DECLINE FRIEND REQUEST
// =====================================================

router.put('/request/:id/decline', auth, async (req, res) => {
  try {

    const requestId = req.params.id;
    const userId = req.user.userId;

    // -----------------------------
    // Find pending request
    // -----------------------------

    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      to: userId,
      status: 'pending'
    });

    if (!friendRequest) {
      return res.status(404).json({
        message: 'Friend request not found'
      });
    }

    // -----------------------------
    // Reject request
    // -----------------------------

    friendRequest.status = 'rejected';

    await friendRequest.save();

    res.json({
      message: 'Friend request declined'
    });

  } catch (error) {

    console.error('Decline friend request error:', error);

    res.status(500).json({
      message: 'Failed to decline friend request'
    });
  }
});


// =====================================================
// GET ALL FRIENDS
// =====================================================

router.get('/friends', auth, async (req, res) => {
  try {

    const userId = req.user.userId;

    const acceptedRequests = await FriendRequest.find({
      $or: [
        {
          from: userId,
          status: 'accepted'
        },
        {
          to: userId,
          status: 'accepted'
        }
      ]
    })
      .populate(
        'from',
        'name username email profilePicture'
      )
      .populate(
        'to',
        'name username email profilePicture'
      );

    // -----------------------------
    // Extract friend from request
    // -----------------------------

    const friends = acceptedRequests.map(request => {

      if (request.from._id.toString() === userId.toString()) {
        return request.to;
      }

      return request.from;
    });

    res.json({
      friends
    });

  } catch (error) {

    console.error('Get friends error:', error);

    res.status(500).json({
      message: 'Failed to get friends'
    });
  }
});


// =====================================================
// GET PENDING FRIEND REQUESTS
// =====================================================

router.get('/requests/pending', auth, async (req, res) => {
  try {

    const userId = req.user.userId;

    const pendingRequests = await FriendRequest.find({
      to: userId,
      status: 'pending'
    })
      .populate(
        'from',
        'name username email profilePicture'
      );

    res.json(pendingRequests);

  } catch (error) {

    console.error('Get pending requests error:', error);

    res.status(500).json({
      message: 'Failed to get friend requests'
    });
  }
});


// =====================================================
// GET FRIEND ACTIVITIES
// =====================================================

router.get('/activities', auth, async (req, res) => {
  try {

    const userId = req.user.userId;

    // -----------------------------
    // Get accepted friendships
    // -----------------------------

    const acceptedRequests = await FriendRequest.find({
      $or: [
        {
          from: userId,
          status: 'accepted'
        },
        {
          to: userId,
          status: 'accepted'
        }
      ]
    });

    // -----------------------------
    // Get friend IDs
    // -----------------------------

    const friendIds = acceptedRequests.map(request => {

      if (
        request.from.toString() === userId.toString()
      ) {
        return request.to;
      }

      return request.from;
    });

    // -----------------------------
    // Get friend activities
    // -----------------------------

    const activities = await Activity.find({
      user: {
        $in: friendIds
      }
    })
      .populate(
        'user',
        'name username email profilePicture'
      )
      .sort({
        createdAt: -1
      });

    res.json(activities);

  } catch (error) {

    console.error('Get friend activities error:', error);

    res.status(500).json({
      message: 'Failed to get friend activities'
    });
  }
});


// =====================================================
// CHEER A FRIEND
// =====================================================

router.post('/cheer/:friendId', auth, async (req, res) => {
  try {

    const userId = req.user.userId;
    const friendId = req.params.friendId;

    const { message } = req.body;

    // -----------------------------
    // Create cheer activity
    // -----------------------------

    const activity = new Activity({
      user: userId,
      friendId,
      type: 'cheered',
      message: message || 'Sent you encouragement!'
    });

    await activity.save();

    res.status(201).json({
      message: 'Cheer sent!',
      activity
    });

  } catch (error) {

    console.error('Cheer friend error:', error);

    res.status(500).json({
      message: 'Failed to send cheer'
    });
  }
});


module.exports = router;