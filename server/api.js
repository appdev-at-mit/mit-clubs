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
// const ClubOfficer = require("./models/clubOfficer");const Event = require("./models/event");

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
    console.log("Connected to MongoDB");
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
      club_id: newClub.club_id 
    });
  } catch (error) {
    console.error("error adding club:", error);
    res.status(500).json({ error: "error adding club" });
  }
});

router.put("/club", async (req, res) => {
  const { club_id, ...updateData } = req.body;
  try {
    const result = await Club.updateOne(
      { club_id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "club not found" });
    }

    res.json({ message: "club updated successfully" });
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
    // check if club exists
    const club = await Club.findOne({ club_id });
    if (!club) {
      return res.status(404).json({ error: "club not found" });
    }

    // check if already saved
    const existing = await SavedClub.findOne({ user_id, club_id });

    if (existing) {
      return res.status(400).json({ error: "club already saved" });
    }

    // save the club
    await SavedClub.create({ user_id, club_id });

    res.status(201).json({ message: "club saved successfully" });
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
    const clubIds = savedClubEntries.map(entry => entry.club_id);
    
    // get the actual club documents
    const clubs = await Club.find({ club_id: { $in: clubIds } });

    res.status(200).json(clubs);
  } catch (error) {
    console.error("error fetching saved clubs:", error);
    res.status(500).json({ error: "error fetching saved clubs" });
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

    // remove the saved club
    await SavedClub.deleteOne({
      user_id,
      club_id,
    });

    res.status(200).json({ message: "club unsaved successfully" });
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
    const clubIds = savedClubEntries.map(entry => entry.club_id);

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
    const eventsWithClubInfo = events.map(event => {
      const club = clubsDetails.find(c => c.club_id === event.club_id) || {};
      return {
        ...event.toObject(),
        clubName: club.name || "Unknown Club",
        clubColor: club.color || "#808080" // Default gray if no color specified
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
      event_id: newEvent.event_id
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

    const result = await Event.updateOne(
      { event_id: id },
      { $set: updateData }
    );

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


// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
