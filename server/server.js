/*
|--------------------------------------------------------------------------
| server.js -- The core of your server
|--------------------------------------------------------------------------
|
| This file defines how your server starts up. Think of it as the main() of your server.
| At a high level, this file does the following things:
| - Connect to the database
| - Sets up server middleware (i.e. addons that enable things like json parsing, user login)
| - Hooks up all the backend routes specified in api.js
| - Fowards frontend routes that should be handled by the React router
| - Sets up error handling in case something goes wrong when handling a request
| - Actually starts the webserver
*/

// validator runs some basic checks to make sure you've set everything up correctly
// this is a tool provided by staff, so you don't need to worry about it
const validator = require("./validator");
validator.checkSetup();

//allow us to use process.ENV
require("dotenv").config();

//import libraries needed for the webserver to work!
const http = require("http");
const express = require("express"); // backend framework for our node server.
const session = require("express-session"); // library that stores info about each connected user
const mongoose = require("mongoose"); // library to connect to MongoDB
const path = require("path"); // provide utilities for working with file and directory paths
const cors = require("cors");
const helmet = require("helmet");

const api = require("./api");
const auth = require("./auth");

// socket stuff
const socketManager = require("./server-socket");

// Server configuration below
const mongoConnectionURL = process.env.MONGO_SRV;
const databaseName = process.env.DB_NAME || "Cluster0";
const isProduction = process.env.NODE_ENV === "production";

// mongoose 7 warning
mongoose.set("strictQuery", false);

// connect to mongodb
mongoose
  .connect(mongoConnectionURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: databaseName,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(`Error connecting to MongoDB: ${err}`));

// create a new express server
const app = express();

// Only use route validator in development
if (!isProduction) {
  app.use(validator.checkRoutes);
}

// Security middleware
if (isProduction) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://engage.mit.edu"],
        connectSrc: ["'self'", "https://accounts.google.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'", "https://accounts.google.com"]
      }
    }
  }));
}

// allow us to process POST requests
app.use(express.json());

// set up a session, which will persist login data across requests
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // use secure cookies in production
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

app.use(cors({
  origin: process.env.CLIENT_URL || (isProduction ? process.env.PRODUCTION_URL : "http://localhost:5173"),
  credentials: true
}));

// this checks if the user is logged in, and populates "req.user"
app.use(auth.populateCurrentUser);

// connect user-defined routes
app.use("/api", api);

// Static files setup
const staticDir = path.resolve(__dirname, "..", "client", "dist");
app.use(express.static(staticDir, {
  maxAge: isProduction ? '1y' : 0 // Cache static assets for 1 year in production
}));

// For separate static assets directory if needed
const assetsDir = path.resolve(__dirname, "..", "public");
app.use('/assets', express.static(assetsDir, {
  maxAge: isProduction ? '1y' : 0
}));

// for all other routes, render index.html and let react router handle it
app.get("*", (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"), (err) => {
    if (err) {
      console.log("Error sending index.html:", err.status || 500);
      res.status(err.status || 500).send("Error loading application");
    }
  });
});

// any server errors cause this function to run
app.use((err, req, res, next) => {
  const status = err.status || 500;
  
  // Only log detailed errors in development
  if (!isProduction && status === 500) {
    console.log("The server errored when processing a request!");
    console.log(err);
  }

  // Send a cleaner error message in production
  res.status(status);
  res.send({
    status: status,
    message: isProduction && status === 500 
      ? "An unexpected error occurred" 
      : err.message
  });
});

// use port from environment variables or default to 3000
const port = process.env.PORT || 3000;
const server = http.Server(app);
socketManager.init(server);

server.listen(port, () => {
  console.log(`Server running on port: ${port} in ${isProduction ? 'production' : 'development'} mode`);
});
