import { UserModelType } from "./models/user";

declare global {
  namespace Express {
    interface Request {
      user?: UserModelType;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    user?: UserModelType;
  }
}
