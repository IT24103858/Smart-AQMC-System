const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');
const Schedule = require('../models/Schedule');

// GET all rooms with populated staff
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().populate('nurses attendants');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET one room
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('nurses attendants');
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE a predefined room
router.post('/', async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ error: 'Room could not be created. Ensure the name and specialization are unique.' });
  }
});

// ASSIGN staff to a room
// Body: { nurses: [userIds], attendants: [userIds] }
router.patch('/:id/assign-staff', async (req, res) => {
  try {
    const { nurses, attendants } = req.body;
    const roomId = req.params.id;
    
    // Find all sessions scheduled for THIS room
    const thisRoomSchedule = await Schedule.find({ room: roomId });
    
    // List of staff IDs to check for conflicts
    const newStaffIds = [...(nurses || []), ...(attendants || [])];

    for (const staffId of newStaffIds) {
      // Find OTHER rooms where this staff member is currently assigned
      const otherRooms = await Room.find({ 
        _id: { $ne: roomId },
        $or: [
          { nurses: staffId }, 
          { attendants: staffId }
        ]
      });

      if (otherRooms.length > 0) {
        // For each other room, check for schedule overlaps
        for (const otherRoom of otherRooms) {
          const otherRoomSchedule = await Schedule.find({ room: otherRoom._id });
          
          for (const session of thisRoomSchedule) {
            const overlap = otherRoomSchedule.find(s => 
              s.dayOfWeek === session.dayOfWeek && 
              s.timeBlock === session.timeBlock
            );
            
            if (overlap) {
              const staffMember = await User.findById(staffId);
              return res.status(400).json({ 
                error: `Conflict Detected: ${staffMember.name} is already assigned to ${otherRoom.name} during the ${session.timeBlock} session on ${session.dayOfWeek}.`
              });
            }
          }
        }
      }
    }
    
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    if (nurses) room.nurses = nurses;
    if (attendants) room.attendants = attendants;

    await room.save();
    const updatedRoom = await room.populate('nurses attendants');
    res.json(updatedRoom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET rooms by specialization
router.get('/specialization/:spec', async (req, res) => {
  try {
    const rooms = await Room.find({ specialization: req.params.spec }).populate('nurses attendants');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
