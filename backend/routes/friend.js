const express = require('express');
const router = express.Router();
const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const Activity = require('../models/Activity');
const auth = require('../middleware/authMiddleware');

// Send friend request
router.post('/request', auth, async (req, res) => {
  try {
    const { email, username } = req.body;
    const fromUserId = req.user.userId;

    // Find user by email OR username
    let toUser = null;
    
    if (email) {
      toUser = await User.findOne({ email });
    } else if (username) {
      toUser = await User.findOne({ username });
    }

    if (!toUser) {
      return res.status(404).json({ message: 'User not found. Try email or username.' });
    }

    // Can't send request to yourself
    if (toUser._id.toString() === fromUserId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: fromUserId, to: toUser._id },
        { from: toUser._id, to: fromUserId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    const friendRequest = new FriendRequest({
      from: fromUserId,
      to: toUser._id,
      status: 'pending'
    });

    await friendRequest.save();
    res.status(201).json({ message: `Friend request sent to ${toUser.name || toUser.email}`, friendRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept friend request
router.put('/request/:id/accept', auth, async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.userId;

    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      to: userId,
      status: 'pending'
    });

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Create activity for both users
    const fromUser = await User.findById(friendRequest.from);
    const toUser = await User.findById(friendRequest.to);

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

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Decline friend request
router.put('/request/:id/decline', auth, async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.userId;

    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      to: userId,
      status: 'pending'
    });

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    friendRequest.status = 'declined';
    await friendRequest.save();

    res.json({ message: 'Friend request declined' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Get all friends 
router.get('/friends', auth, async (req,res) => {
    try{
        const userId = req.user.userId;

        const acceptedRequests = await FriendRequest.find({
            $or: [
                { from: userId, status: 'accepted' },
                { to: userId, status: 'accepted' }
            ]
        }).populate('from to', 'name email');

        const friends = acceptedRequests.map(req => {
            if(req.from._id.toString() === userId){
                return req.to;
            } else {
                return req.from;
            }
        });

        res.json({ friends });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//get pending friend requests
router.get('/requests/pending', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const pendingRequests = await FriendRequest.find({
      to: userId,
      status: 'pending'
    }).populate('from', 'name email');

    res.json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get friend activites
router.get('/activities', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    //get all friend IDs
    const acceptedRequests = await FriendRequest.find({
      $or: [
        { from: userId, status: 'accepted' },
        { to: userId, status: 'accepted' }
      ]
    });

    const friendIds = acceptedRequests.map(req => {
      if(req.from.toString() === userId){
        return req.to;
      } else {
        return req.from;
      }
    });

    //get activities for all friends
    const activities = await Activity.find({
      user: { $in: friendIds }
    }).populate('user', 'name email');

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//cheer a friend
router.post('/cheer/:friendId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const friendId = req.params.friendId;
    const { message } = req.body;

     const activity = new Activity({
      user: userId,
      friendId,
      type: 'cheered',
      message: message || 'Sent you encouragement!'
    });

    await activity.save();
    res.status(201).json({ message: 'Cheer sent!', activity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;