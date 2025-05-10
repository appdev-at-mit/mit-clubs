/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const Club = require("./models/club");
const SavedClub = require("./models/savedClub");
const Event = require("./models/event");
const ClubOfficer = require("./models/clubOfficer");

// import authentication library
const auth = require("./auth");

// mongo connection setup
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = process.env.MONGO_SRV;
const dbName = "Cluster0";
let db;

// function to ensure user is admin
function ensureAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: "Admin privileges required" });
  }
  next();
}

async function connectToMongo() {
  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    // console.log("Connected to MongoDB");
    db = client.db(dbName);
  } catch (error) {
    console.error("Error connecting to MongoDB collections:", error);
  }
}

connectToMongo();

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | Club API  Methods            |
// |------------------------------|

router.get("/clubs", async (req, res) => {
  try {
    const clubs = await Club.find({});
    if (clubs.length === 0) {
      return res.status(404).json({ error: "clubs not found" });
    }
    res.json(clubs);
  } catch (error) {
    console.error("error fetching clubs:", error);
    res.status(500).json({ error: "error fetching clubs" });
  }
});

router.get("/clubs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const club = await Club.findOne({ club_id: id });
    if (!club) {
      return res.status(404).json({ error: "club not found" });
    }
    res.json(club);
  } catch (error) {
    console.error("error fetching club:", error);
    res.status(500).json({ error: "error fetching club" });
  }
});

router.post("/club", async (req, res) => {
  try {
    const newClub = await Club.create(req.body);
    res.status(201).json({
      message: "club added successfully",
      club_id: newClub.club_id,
    });
  } catch (error) {
    console.error("error adding club:", error);
    res.status(500).json({ error: "error adding club" });
  }
});

// middleware to check if user is an admin
const ensureSystemAdmin = async (req, res, next) => {
  try {
    // Make sure user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Check if user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Admin privileges required" });
    }
    
    // User is admin, proceed to next middleware
    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ error: "Error checking admin status" });
  }
};

// middleware to ensure user has owner permissions for a club OR is a system admin
const ensureOwnerOrAdmin = async (req, res, next) => {
  try {
    // Get club ID from params
    const clubId = req.params.id || req.params.clubId || req.body.club_id;
    
    if (!clubId) {
      return res.status(400).json({ error: "Club ID is required" });
    }
    
    // Make sure user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Check if user is an admin using the User model's isAdmin field
    if (req.user.isAdmin) {
      return next();
    }
    
    // If not admin, check if they're an owner of this club
    const club = await Club.findOne({ club_id: clubId });
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }
    
    // Get user email
    const userEmail = req.user.email;
    if (!userEmail) {
      return res.status(401).json({ error: "User email not found" });
    }
    
    // Find the user in the club's member list
    const isMemberWithOwnerPermission = club.members && 
      club.members.some(member => 
        member.email === userEmail && member.permissions === "Owner"
      );
    
    if (!isMemberWithOwnerPermission) {
      return res.status(403).json({ error: "You don't have permission to manage this club" });
    }
    
    // The user is an owner, they're allowed to manage the club
    next();
  } catch (error) {
    console.error("Error in permission check:", error);
    res.status(500).json({ error: "Error checking permissions" });
  }
};

// update club details - add owner permission check
router.put("/club", auth.ensureLoggedIn, ensureOwnerOrAdmin, async (req, res) => {
  const { club_id, ...updateData } = req.body;
  
  // validate required fields 
  if (!club_id) {
    return res.status(400).json({ error: "club_id is required" });
  }
  
  // validate update data to ensure it only contains valid fields
  const allowedFields = [
    'name', 'is_active', 'is_accepting', 'recruiting_cycle', 
    'membership_process', 'tags', 'email', 'instagram', 
    'linkedin', 'facebook', 'website', 'mission', 'image_url',
    'questions', 'members'
  ];
  
  // filter out any fields that aren't in the allowed list
  const validUpdateData = Object.keys(updateData)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updateData[key];
      return obj;
    }, {});
  
  // validate character limits
  if (validUpdateData.name && validUpdateData.name.length > 100) {
    return res.status(400).json({ error: "Club name cannot exceed 100 characters" });
  }
  
  if (validUpdateData.mission && validUpdateData.mission.length > 1000) {
    return res.status(400).json({ error: "Mission statement cannot exceed 1000 characters" });
  }
  
  // validate questions
  if (validUpdateData.questions) {
    for (let i = 0; i < validUpdateData.questions.length; i++) {
      const question = validUpdateData.questions[i];
      if (question.answer && question.answer.length > 500) {
        return res.status(400).json({ 
          error: `Answer for question ${i+1} cannot exceed 500 characters` 
        });
      }
    }
  }
  
  // validate specific field formats
  if (updateData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  
  try {
    const result = await Club.updateOne({ club_id }, { $set: validUpdateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "club not found" });
    }

    // return the updated club data
    const updatedClub = await Club.findOne({ club_id });
    res.json({ 
      message: "club updated successfully",
      club: updatedClub
    });
  } catch (error) {
    console.error("error updating club:", error);
    res.status(500).json({ error: "error updating club" });
  }
});

router.delete("/club", async (req, res) => {
  const { club_id } = req.body;
  try {
    const result = await Club.deleteOne({ club_id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "club not found" });
    }

    res.json({ message: "club deleted successfully" });
  } catch (error) {
    console.error("error deleting club:", error);
    res.status(500).json({ error: "error deleting club" });
  }
});

// use ensureLoggedIn from auth.js instead of userAuth
router.post("/save-club", auth.ensureLoggedIn, async (req, res) => {
  const { club_id } = req.body;
  const user_id = req.user?._id; // adjust property name if needed

  if (!user_id) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    // check if already saved in SavedClub collection (for current status)
    const existing = await SavedClub.findOne({ user_id, club_id });
    if (existing) {
      // if already marked as saved for the user, return current club data without changes
      // this prevents errors if frontend allows clicking save again when already saved
      const currentClub = await Club.findOne({ club_id });
      return res.status(200).json(currentClub);
    }

    // check if user has previously contributed to save count
    const club = await Club.findOne({ club_id });
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    let updateOperation = {};
    const userHasSavedBefore = club.savedByUsers.some((id) => id.equals(user_id));

    if (!userHasSavedBefore) {
      // user saving for the first time: increment count and add user to set
      updateOperation = {
        $inc: { saveCount: 1 },
        $addToSet: { savedByUsers: user_id },
      };
    } // else: user has saved before, no changes needed for count/savedByUsers list

    // perform the update (if any) and get the potentially updated club
    const updatedClub = await Club.findOneAndUpdate({ club_id: club_id }, updateOperation, {
      new: true,
    });

    // create entry in SavedClub collection to mark as currently saved
    await SavedClub.create({ user_id, club_id });
    
    // Add to user's savedClubs array as well
    await User.updateOne(
      { _id: user_id },
      { 
        $addToSet: { 
          savedClubs: {
            club_id: club_id,
            saved_date: new Date()
          }
        }
      }
    );

    // return the latest club data (with potentially updated count)
    res.status(201).json(updatedClub);
  } catch (error) {
    console.error("error saving club:", error);
    res.status(500).json({ error: "error saving club" });
  }
});

router.get("/saved-clubs", auth.ensureLoggedIn, async (req, res) => {
  const user_id = req.user?._id; // adjust property name if needed

  if (!user_id) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    // find all saved club ids for this user
    const savedClubEntries = await SavedClub.find({ user_id });

    if (savedClubEntries.length === 0) {
      return res.json([]); // Return empty array instead of 404
    }

    // extract club_ids
    const clubIds = savedClubEntries.map((entry) => entry.club_id);

    // get the actual club documents
    const clubs = await Club.find({ club_id: { $in: clubIds } });

    res.status(200).json(clubs);
  } catch (error) {
    console.error("error fetching saved clubs:", error);
    res.status(500).json({ error: "error fetching saved clubs" });
  }
});

// Added route to get just the IDs of saved clubs
router.get("/saved-club-ids", auth.ensureLoggedIn, async (req, res) => {
  const user_id = req.user?._id;

  if (!user_id) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    // find all saved club entries for this user, selecting only the club_id field
    const savedClubEntries = await SavedClub.find({ user_id }).select("club_id -_id");

    res.status(200).json(savedClubEntries);
  } catch (error) {
    console.error("error fetching saved club ids:", error);
    res.status(500).json({ error: "error fetching saved club ids" });
  }
});

router.delete("/unsave-club/:id", auth.ensureLoggedIn, async (req, res) => {
  const user_id = req.user?._id;
  const { id: club_id } = req.params;

  if (!user_id) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    // check if the club is saved by the user
    const existing = await SavedClub.findOne({
      user_id,
      club_id,
    });

    if (!existing) {
      return res.status(404).json({ error: "club not found in saved list" });
    }

    // remove the saved club from SavedClub collection
    await SavedClub.deleteOne({
      user_id,
      club_id,
    });
    
    // Also remove from user's savedClubs array
    await User.updateOne(
      { _id: user_id },
      { $pull: { savedClubs: { club_id: club_id } } }
    );

    // Fetch the current club data (saveCount is NOT decremented)
    const currentClub = await Club.findOne({ club_id: club_id });

    res.status(200).json(currentClub); // Return current club data
  } catch (error) {
    console.error("error unsaving club:", error);
    res.status(500).json({ error: "error unsaving the club" });
  }
});

// |------------------------------|
// | Event API  Methods            |
// |------------------------------|

// Get all events (optionally filtered by date range)
router.get("/events", async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = {};

    // Add date range filter if provided
    if (start_date || end_date) {
      query.date = {};
      if (start_date) {
        query.date.$gte = new Date(start_date);
      }
      if (end_date) {
        query.date.$lte = new Date(end_date);
      }
    }

    const events = await Event.find(query).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Error fetching events" });
  }
});

// Get events for a specific club
router.get("/clubs/:id/events", async (req, res) => {
  const { id } = req.params;
  const { start_date, end_date } = req.query;

  try {
    let query = { club_id: id };

    // Add date range filter if provided
    if (start_date || end_date) {
      query.date = {};
      if (start_date) {
        query.date.$gte = new Date(start_date);
      }
      if (end_date) {
        query.date.$lte = new Date(end_date);
      }
    }

    const events = await Event.find(query).sort({ date: 1 });

    res.json({ events });
  } catch (error) {
    console.error("Error fetching club events:", error);
    res.status(500).json({ error: "Error fetching club events" });
  }
});

// Get events for all saved clubs of the logged-in user
router.get("/user/saved-clubs/events", auth.ensureLoggedIn, async (req, res) => {
  const user_id = req.user?._id;
  const { start_date, end_date } = req.query;

  if (!user_id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // First, get all saved club IDs for this user
    const savedClubEntries = await SavedClub.find({ user_id });

    if (savedClubEntries.length === 0) {
      return res.json({ events: [] }); // Return empty array if no saved clubs
    }

    // Extract club IDs
    const clubIds = savedClubEntries.map((entry) => entry.club_id);

    // Query for events from these clubs
    let query = { club_id: { $in: clubIds } };

    // Add date range filter if provided
    if (start_date || end_date) {
      query.date = {};
      if (start_date) {
        query.date.$gte = new Date(start_date);
      }
      if (end_date) {
        query.date.$lte = new Date(end_date);
      }
    }

    // Find events and populate with club details
    const events = await Event.find(query).sort({ date: 1 });

    // Get club details for each event
    const clubsDetails = await Club.find({ club_id: { $in: clubIds } });

    // Map club details to each event
    const eventsWithClubInfo = events.map((event) => {
      const club = clubsDetails.find((c) => c.club_id === event.club_id) || {};
      return {
        ...event.toObject(),
        clubName: club.name || "Unknown Club",
        clubColor: club.color || "#808080", // Default gray if no color specified
      };
    });

    res.json({ events: eventsWithClubInfo });
  } catch (error) {
    console.error("Error fetching saved clubs events:", error);
    res.status(500).json({ error: "Error fetching saved clubs events" });
  }
});

// Get a specific event by ID
router.get("/events/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findOne({ event_id: id });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Error fetching event" });
  }
});

// Create a new event
router.post("/events", auth.ensureLoggedIn, async (req, res) => {
  try {
    // Create event with the provided data
    const newEvent = await Event.create(req.body);

    res.status(201).json({
      message: "Event created successfully",
      event_id: newEvent.event_id,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Error creating event" });
  }
});

// Update an event
router.put("/events/:id", auth.ensureLoggedIn, async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Remove the event_id from update data if it exists
  delete updateData.event_id;

  try {
    // Set the updated_at timestamp
    updateData.updated_at = new Date();

    const result = await Event.updateOne({ event_id: id }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ message: "Event updated successfully" });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Error updating event" });
  }
});

// Delete an event
router.delete("/events/:id", auth.ensureLoggedIn, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Event.deleteOne({ event_id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Error deleting event" });
  }
});

// |------------------------------|
// | User Memberships API Methods |
// |------------------------------|

// Get all user data including memberships and saved clubs in one call
router.get("/users/data", auth.ensureLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user with memberOf and savedClubs arrays
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Get all club IDs the user is associated with (both member and saved)
    const memberClubIds = user.memberOf?.map(membership => membership.club_id) || [];
    const savedClubIds = user.savedClubs?.map(saved => saved.club_id) || [];
    const allClubIds = [...new Set([...memberClubIds, ...savedClubIds])];
    
    if (allClubIds.length === 0) {
      return res.json({
        memberClubs: [],
        savedClubs: []
      });
    }
    
    // Fetch all clubs in one query
    const clubs = await Club.find({ club_id: { $in: allClubIds } });
    
    // Process member clubs
    const memberClubs = memberClubIds.map(clubId => {
      const club = clubs.find(c => c.club_id === clubId);
      if (!club) return null;
      
      const membership = user.memberOf.find(m => m.club_id === clubId);
      return {
        ...club.toObject(),
        role: membership?.role || "Member",
        year_joined: membership?.joined_date ? new Date(membership.joined_date).getFullYear() : "Unknown"
      };
    }).filter(Boolean);
    
    // Process saved clubs
    const savedClubs = savedClubIds.map(clubId => {
      const club = clubs.find(c => c.club_id === clubId);
      if (!club) return null;
      
      const saved = user.savedClubs.find(s => s.club_id === clubId);
      return {
        ...club.toObject(),
        saved_date: saved?.saved_date
      };
    }).filter(Boolean);
    
    res.json({
      memberClubs,
      savedClubs
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Error fetching user data" });
  }
});

// Get clubs a user is a member of
router.get("/users/clubs", auth.ensureLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user with memberOf array
    const user = await User.findById(userId);
    if (!user || !user.memberOf || user.memberOf.length === 0) {
      return res.json([]);
    }
    
    // Get the club_ids from the memberOf array
    const clubIds = user.memberOf.map(membership => membership.club_id);
    
    // Fetch all clubs the user is a member of
    const clubs = await Club.find({ club_id: { $in: clubIds } });
    
    // Add role and joined_date from user.memberOf to each club
    const clubsWithMemberInfo = clubs.map(club => {
      const membership = user.memberOf.find(m => m.club_id === club.club_id);
      return {
        ...club.toObject(),
        role: membership?.role || "Member",
        year_joined: membership?.joined_date ? new Date(membership.joined_date).getFullYear() : "Unknown"
      };
    });
    
    res.json(clubsWithMemberInfo);
  } catch (error) {
    console.error("Error fetching user's clubs:", error);
    res.status(500).json({ error: "Error fetching user's clubs" });
  }
});

// |------------------------------|
// | Club Members API Methods     |
// |------------------------------|

// get members for a specific club
router.get("/clubs/:id/members", async (req, res) => {
  const { id } = req.params;
  
  try {
    const club = await Club.findOne({ club_id: id });
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }
    
    // return members array or empty array if no members
    res.json({ members: club.members || [] });
  } catch (error) {
    console.error("Error fetching club members:", error);
    res.status(500).json({ error: "Error fetching club members" });
  }
});

// Modified: add a new member to a club - update both Club and User models
router.post("/clubs/:id/members", auth.ensureLoggedIn, ensureOwnerOrAdmin, async (req, res) => {
  const { id } = req.params;
  const memberData = req.body;
  
  try {
    // validate member data
    if (!memberData.name || !memberData.email || !memberData.role) {
      return res.status(400).json({ error: "Name, email, and role are required" });
    }
    
    // validate name length
    if (memberData.name.length > 50) {
      return res.status(400).json({ error: "Member name cannot exceed 50 characters" });
    }
    
    // validate name format (only letters and spaces)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(memberData.name)) {
      return res.status(400).json({ error: "Name can only contain alphabetic characters and spaces" });
    }
    
    // validate email length and format
    if (memberData.email.length > 100) {
      return res.status(400).json({ error: "Email cannot exceed 100 characters" });
    }
    
    // simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(memberData.email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }
    
    // find the club
    const club = await Club.findOne({ club_id: id });
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }
    
    // generate a unique id for the member
    memberData.id = new ObjectId().toString();
    
    // add the member to the club
    if (!club.members) {
      club.members = [];
    }
    
    // check for duplicate email
    const existingMember = club.members.find(member => member.email === memberData.email);
    if (existingMember) {
      return res.status(400).json({ error: "A member with this email already exists" });
    }
    
    club.members.push(memberData);
    await club.save();
    
    try {
      const user = await User.findOne({ email: memberData.email });
      if (user) {
        // check if already a member to avoid duplicate entries
        const alreadyMember = user.memberOf && user.memberOf.some(m => m.club_id === id);
        if (!alreadyMember) {
          // add to user's memberOf array
          user.memberOf = user.memberOf || [];
          user.memberOf.push({
            club_id: id,
            role: memberData.role,
            joined_date: new Date()
          });
          await user.save();
        }
      }
    } catch (userError) {
      console.error("Warning: Couldn't update user's memberships:", userError);
    }
    
    res.status(201).json({ 
      message: "Member added successfully",
      member: memberData
    });
  } catch (error) {
    console.error("Error adding club member:", error);
    res.status(500).json({ error: "Error adding club member" });
  }
});

// update a member in a club - update both Club and User models
router.put("/clubs/:clubId/members/:memberId", auth.ensureLoggedIn, ensureOwnerOrAdmin, async (req, res) => {
  const { clubId, memberId } = req.params;
  const updateData = req.body;
  
  try {
    // validate update data
    if (!updateData.name || !updateData.email || !updateData.role) {
      return res.status(400).json({ error: "Name, email, and role are required" });
    }
    
    // validate name length
    if (updateData.name.length > 50) {
      return res.status(400).json({ error: "Member name cannot exceed 50 characters" });
    }
    
    // validate name format (only letters and spaces)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(updateData.name)) {
      return res.status(400).json({ error: "Name can only contain alphabetic characters and spaces" });
    }
    
    // validate email length and format
    if (updateData.email.length > 100) {
      return res.status(400).json({ error: "Email cannot exceed 100 characters" });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updateData.email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }
    
    // find the club
    const club = await Club.findOne({ club_id: clubId });
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }
    
    // check if members array exists
    if (!club.members || club.members.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }
    
    // find the member index
    const memberIndex = club.members.findIndex(member => member.id === memberId);
    if (memberIndex === -1) {
      return res.status(404).json({ error: "Member not found" });
    }
    
    // get the current and new email for the member
    const currentEmail = club.members[memberIndex].email;
    const newEmail = updateData.email;
    const newRole = updateData.role;
    
    // check for duplicate email if changing email
    if (newEmail !== currentEmail) {
      const existingMember = club.members.find(member => 
        member.email === newEmail && member.id !== memberId
      );
      if (existingMember) {
        return res.status(400).json({ error: "A member with this email already exists" });
      }
    }
    
    // update the member in the club
    club.members[memberIndex] = {
      ...club.members[memberIndex],
      ...updateData,
      id: memberId // ensure id doesn't change
    };
    
    await club.save();
    
    try {
      // if email changed, remove from old user's memberOf
      if (newEmail !== currentEmail) {
        const oldUser = await User.findOne({ email: currentEmail });
        if (oldUser && oldUser.memberOf) {
          oldUser.memberOf = oldUser.memberOf.filter(m => m.club_id !== clubId);
          await oldUser.save();
        }
      }
      
      // add or update on the new user record
      const user = await User.findOne({ email: newEmail });
      if (user) {
        const membershipIndex = user.memberOf ? user.memberOf.findIndex(m => m.club_id === clubId) : -1;
        
        if (membershipIndex >= 0) {
          // update existing membership
          user.memberOf[membershipIndex].role = newRole;
        } else {
          // add new membership
          user.memberOf = user.memberOf || [];
          user.memberOf.push({
            club_id: clubId,
            role: newRole,
            joined_date: new Date()
          });
        }
        
        await user.save();
      }
    } catch (userError) {
      console.error("Warning: Couldn't update user's memberships:", userError);
      // Continue with response, don't fail the whole request
    }
    
    res.json({ 
      message: "Member updated successfully",
      member: club.members[memberIndex]
    });
  } catch (error) {
    console.error("Error updating club member:", error);
    res.status(500).json({ error: "Error updating club member" });
  }
});

// Modified: remove a member from a club - update both Club and User models
router.delete("/clubs/:clubId/members/:memberId", auth.ensureLoggedIn, ensureOwnerOrAdmin, async (req, res) => {
  const { clubId, memberId } = req.params;
  
  try {
    // find the club
    const club = await Club.findOne({ club_id: clubId });
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }
    
    // check if members array exists
    if (!club.members || club.members.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }
    
    // find the member index
    const memberIndex = club.members.findIndex(member => member.id === memberId);
    if (memberIndex === -1) {
      return res.status(404).json({ error: "Member not found" });
    }
    
    // store the email before removing the member
    const memberEmail = club.members[memberIndex].email;
    
    // remove the member from the club
    club.members.splice(memberIndex, 1);
    await club.save();
    
    try {
      // remove the club from the user's memberOf array
      const user = await User.findOne({ email: memberEmail });
      if (user && user.memberOf) {
        user.memberOf = user.memberOf.filter(m => m.club_id !== clubId);
        await user.save();
      }
    } catch (userError) {
      console.error("Warning: Couldn't update user's memberships:", userError);
    }
    
    res.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing club member:", error);
    res.status(500).json({ error: "Error removing club member" });
  }
});

// |------------------------------|
// | Admin API Methods            |
// |------------------------------|

// check if current user is an admin
router.get("/admin/check", auth.ensureLoggedIn, async (req, res) => {
  try {
    // console.log("Admin check requested by:", req.user);
    
    if (!req.user) {
      // console.log("No user found in request");
      return res.json({ isAdmin: false });
    }
    
    // console.log("User admin status:", req.user.isAdmin);
    res.json({ isAdmin: !!req.user.isAdmin });
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ error: "Error checking admin status" });
  }
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  // console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
