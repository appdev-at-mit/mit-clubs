import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import "./type-patching";
import session from "express-session";
import mongoose from "mongoose";
import assert from "assert";
import path from "path";
import cors from "cors";
import { checkRoutes, checkSetup } from "./validator";
import apiRouter from "./api";
import { clubRouter } from "./api/clubs";
import { userRouter } from "./api/users";
import { adminRouter } from "./api/admin";
import eventRouter from "./api/events";
import { populateCurrentUser } from "./auth/auth";
import cookieParser from "cookie-parser";
import { dormspamSyncService } from "./services/dormspamSync";

// validator runs some basic checks to make sure you've set everything up correctly
checkSetup();

const mongoConnectionURL = process.env["MONGO_SRV"];
if (!mongoConnectionURL) {
  assert.fail("Missing MONGO_SRV environment variable");
}
const databaseName = "Cluster0";

mongoose.set("strictQuery", false);

// connect to mongodb
mongoose
  .connect(mongoConnectionURL, {
    dbName: databaseName,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    // start DormSpam sync service after DB connection
    dormspamSyncService.startSync();
  })
  .catch((err: any) => console.log(`Error connecting to MongoDB: ${err}`));

const app = express();

const corsOptions = {
  origin: process.env["CLIENT_URL"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(checkRoutes);
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: (() => {
      const sessionSecret = process.env["SESSION_SECRET"];
      if (!sessionSecret) {
        assert.fail("Missing SESSION_SECRET environment variable!");
      }
      return sessionSecret;
    })(),
    resave: false,
    saveUninitialized: false,
  })
);
app.use(populateCurrentUser);
app.use("/api", eventRouter);
app.use("/api", apiRouter);
app.use("/api", clubRouter);
app.use("/api", userRouter);
app.use("/api", adminRouter);
// ✅ Removed duplicate: app.use("/api", eventRouter)

// catch-all for unmatched API routes
app.all("/api/*", (_req: Request, res: Response) => {
  res.status(404).send({ msg: "API route not found" });
});

const reactPath = path.resolve(__dirname, "..", "..", "..", "client", "dist");
app.use(express.static(reactPath));

interface EError extends Error {
  status?: number;
}

// any server errors cause this function to run
app.use((err: EError, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  if (status === 500) {
    console.log("The server errored when processing a request!");
    console.log(err);
  }

  res.status(status);
  res.send({
    status: status,
    message: err.message,
  });
});

// for all other routes, render index.html and let react router handle it
app.get("*", (_req: Request, res: Response) => {
  res.sendFile(path.join(reactPath, "index.html"), (err) => {
    if (err) {
      res.status(500).send("Error loading application");
    }
  });
});

const port = process.env["SERVER_PORT"];
if (!port) {
  assert.fail("Missing SERVER_PORT or PORT environment variable!");
}
const server = new http.Server(app);

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

// shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  dormspamSyncService.stopSync();
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close().then(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
