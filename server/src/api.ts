import express, { Request, Response } from 'express';
import { login, logout } from './auth/auth';

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/whoami", (req: Request, res: Response): void => {
  if (!req.user) {
    // not logged in
    res.send({});
    return;
  }

  res.send(req.user);
  return;
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

export default router;