import fs from "fs";
import net from "net";
import { Request, Response, NextFunction } from "express";

/**
 * Provides some basic checks to make sure we're
 * correctly set up.
 *
 * We normally shouldn't need to modify this file.
 *
 * Current checks:
 * - node_modules exists
 * - warns if visiting port 3001 while running hot reloader
 */

class NodeSetupError extends Error {}
let routeChecked = false;

// poke port 5173 to see if 'npm run dev' was possibly called
async function checkHotLoader(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    var server = net.createServer();

    server.once("error", (err: any) => {
      resolve(err.code === "EADDRINUSE");
    });

    server.once("listening", () => server.close());
    server.once("close", () => resolve(false));
    server.listen(5173);
  });
}

export function checkSetup() {
  if (!fs.existsSync("./node_modules/")) {
    throw new NodeSetupError(
      "node_modules not found! This probably means you forgot to run 'npm install'"
    );
  }
}

export function checkRoutes(req: Request, res: Response, next: NextFunction) {
  if (!routeChecked && req.url === "/") {
    checkHotLoader().then((active) => {
      if (active) {
        console.log(
          "Warning: It looks like 'npm run dev' may be running. Are you sure you don't want\n" +
            "to use the hot reloader? To use it, visit http://localhost:5173 and not port 3001"
        );
      }
    });

    routeChecked = true; // only runs once to avoid spam/overhead
  }
  next();
}
