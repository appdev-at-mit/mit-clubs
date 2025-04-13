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
const ClubOfficer = require("./models/clubOfficer");
// const ClubOfficer = require("./models/clubOfficer");
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
      club_id: newClub.club_id,
    });
  } catch (error) {
    console.error("error adding club:", error);
    res.status(500).json({ error: "error adding club" });
  }
});

router.put("/club", async (req, res) => {
  const { club_id, ...updateData } = req.body;
  try {
    const result = await Club.updateOne({ club_id }, { $set: updateData });

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
    const clubIds = savedClubEntries.map((entry) => entry.club_id);

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
// | Admin API  Methods            |
// |------------------------------|

// admin: add an officer to a club
router.post("/admin/club-officer", auth.ensureLoggedIn, ensureAdmin, async (req, res) => {
  const { club_id, user_email, role = "officer" } = req.body;

  try {
    // find user by email
    const user = await User.findOne({ email: user_email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // create officer relationship
    await ClubOfficer.create({ club_id, user_id: user._id, role });

    res.status(201).json({ message: "Officer added successfully" });
  } catch (error) {
    console.error("Error adding officer:", error);
    res.status(500).json({ error: "Error adding officer" });
  }
});

// officer: add another officer (officers can add other officers)
router.post("/club-officer", auth.ensureLoggedIn, async (req, res) => {
  const { club_id, user_email, role = "officer" } = req.body;
  const currentUserId = req.user._id;

  try {
    // check if current user is an officer
    const isOfficer = await ClubOfficer.findOne({ club_id, user_id: currentUserId });

    if (!isOfficer) {
      return res.status(403).json({ error: "Officer privileges required" });
    }

    // find user by email
    const user = await User.findOne({ email: user_email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // create officer relationship
    await ClubOfficer.create({ club_id, user_id: user._id, role });

    res.status(201).json({ message: "Officer added successfully" });
  } catch (error) {
    console.error("Error adding officer:", error);
    res.status(500).json({ error: "Error adding officer" });
  }
});

// remove an officer
router.delete("/club-officer", auth.ensureLoggedIn, async (req, res) => {
  const { club_id, user_id } = req.body;
  const currentUserId = req.user._id;

  try {
    // check if current user is an officer or admin
    const isOfficer = await ClubOfficer.findOne({ club_id, user_id: currentUserId });
    const isAdmin = req.user.isAdmin;

    if (!isOfficer && !isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await ClubOfficer.deleteOne({ club_id, user_id });

    res.status(200).json({ message: "Officer removed successfully" });
  } catch (error) {
    console.error("Error removing officer:", error);
    res.status(500).json({ error: "Error removing officer" });
  }
});

// get all officers for a club
router.get("/club-officers/:club_id", async (req, res) => {
  const { club_id } = req.params;

  try {
    const officers = await ClubOfficer.find({ club_id }).populate("user_id", "name");
    res.json(officers);
  } catch (error) {
    console.error("Error fetching officers:", error);
    res.status(500).json({ error: "Error fetching officers" });
  }
});

// check if current user is an officer
router.get("/is-officer/:club_id", auth.ensureLoggedIn, async (req, res) => {
  const { club_id } = req.params;
  const user_id = req.user._id;

  try {
    const officer = await ClubOfficer.findOne({ club_id, user_id });
    res.json({ isOfficer: !!officer, role: officer?.role });
  } catch (error) {
    console.error("Error checking officer status:", error);
    res.status(500).json({ error: "Error checking officer status" });
  }
});

// modify club update route to check for officer permissions
router.put("/club", auth.ensureLoggedIn, async (req, res) => {
  const { club_id, ...updateData } = req.body;
  const user_id = req.user._id;

  try {
    // check if user is an officer or admin
    const officer = await ClubOfficer.findOne({ club_id, user_id });
    const isAdmin = req.user.isAdmin;

    if (!officer && !isAdmin) {
      return res.status(403).json({ error: "Not authorized to edit this club" });
    }

    const result = await Club.updateOne({ club_id }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Club not found" });
    }

    res.json({ message: "Club updated successfully" });
  } catch (error) {
    console.error("Error updating club:", error);
    res.status(500).json({ error: "Error updating club" });
  }
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
