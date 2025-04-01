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

// import authentication library
const auth = require("./auth");

// mongo connection setup
const { MongoClient, ObjectId } = require("mongodb");
const mongoURI = process.env.MONGO_SRV;
const dbName = "Cluster0";
let db;

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
    const clubs = await db.collection("clubs").find({}).toArray();
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
    const club = await db.collection("clubs").findOne({ club_id: id });
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
    const result = await db.collection("clubs").insertOne(req.body);
    res.status(201).json({ 
      message: "club added successfully", 
      club_id: result.insertedId 
    });
  } catch (error) {
    console.error("error adding club:", error);
    res.status(500).json({ error: "error adding club" });
  }
});

router.put("/club", async (req, res) => {
  const { _id, ...updateData } = req.body;
  try {
    const result = await db.collection("clubs").updateOne(
      { _id: new ObjectId(_id) },
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
  const { id } = req.body;
  try {
    const result = await db.collection("clubs").deleteOne({ _id: new ObjectId(id) });
    
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
    // check if already saved
    const existing = await db.collection("user_saved_clubs").findOne({
      user_id,
      club_id
    });

    if (existing) {
      return res.status(400).json({ error: "club already saved" });
    }

    // save the club
    await db.collection("user_saved_clubs").insertOne({
      user_id,
      club_id
    });

    res.status(201).json({ message: "club saved successfully" });
  } catch (error) {
    console.error("error saving club:", error);
    res.status(500).json({ error: "error saving club" });
  }
});

router.get("/saved-clubs", auth.ensureLoggedIn, async (req, res) => {
  const user_id = req.user?._id; // adjust property name if needed

  try {
    // find all saved club ids for this user
    const savedClubEntries = await db.collection("user_saved_clubs")
      .find({ user_id })
      .toArray();
    
    if (savedClubEntries.length === 0) {
      return res.status(404).json({ error: "no saved clubs found for this user" });
    }
    
    // extract club_ids
    const clubIds = savedClubEntries.map(entry => entry.club_id);
    
    // get the actual club documents
    const clubs = await db.collection("clubs").find({ 
      $or: clubIds.map(id => {
        // handle both string ids and objectid
        try {
          return { _id: new ObjectId(id) };
        } catch {
          return { _id: id };
        }
      })
    }).toArray();

    res.status(200).json(clubs);
  } catch (error) {
    console.error("error fetching saved clubs:", error);
    res.status(500).json({ error: "error fetching saved clubs" });
  }
});

router.delete("/unsave-club/:id", auth.ensureLoggedIn, async (req, res) => {
  const user_id = req.user?._id;
  const { id: club_id } = req.params;

  try {
    // check if the club is saved by the user
    const existing = await db.collection("user_saved_clubs").findOne({
      user_id,
      club_id,
    });

    if (!existing) {
      return res.status(404).json({ error: "club not found in saved list" });
    }

    // remove the saved club
    await db.collection("user_saved_clubs").deleteOne({
      user_id,
      club_id,
    });

    res.status(200).json({ message: "club unsaved successfully" });
  } catch (error) {
    console.error("error unsaving club:", error);
    res.status(500).json({ error: "error unsaving the club" });
  }
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
