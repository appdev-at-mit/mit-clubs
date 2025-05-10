const { OAuth2Client } = require("google-auth-library");
const User = require("./models/user");
const socketManager = require("./server-socket");

// create a new OAuth client used to verify google sign-in
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// accepts a login token from the frontend, and verifies that it's legit
function verify(token) {
  return client
    .verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    })
    .then((ticket) => ticket.getPayload());
}

// gets user from DB, or makes a new account if it doesn't exist yet
function getOrCreateUser(user) {
  // the "sub" field means "subject", which is a unique identifier for each user
  return User.findOne({ googleid: user.sub }).then((existingUser) => {
    if (existingUser) {
      let updated = false;
      // update email if it changed
      if (existingUser.email !== user.email) {
        existingUser.email = user.email;
        updated = true;
      }
      // update name if it changed (optional, but good practice)
      if (existingUser.name !== user.name) {
        existingUser.name = user.name;
        updated = true;
      }
      // Only save if something actually changed
      const savePromise = updated ? existingUser.save() : Promise.resolve(existingUser);
      return savePromise.then(savedUser => {
        // console.log(`Existing user found/updated: ${savedUser.email}, isNewUser: false`);
        return { user: savedUser, isNewUser: false };
      });
    }

    // User doesn't exist, create new one
    const newUser = new User({
      name: user.name,
      googleid: user.sub,
      email: user.email,
    });

    return newUser.save().then(savedUser => {
      // console.log(`New user created: ${savedUser.email}, isNewUser: true`);
      return { user: savedUser, isNewUser: true };
    });
  });
}

function login(req, res) {
  verify(req.body.token)
    .then((googleUser) => getOrCreateUser(googleUser)) // googleUser is the raw payload
    .then((result) => { // result is { user: UserDocument, isNewUser: boolean }
      // persist user document in the session
      req.session.user = result.user;
      // Send back the user document AND the isNewUser flag
      res.send({ user: result.user, isNewUser: result.isNewUser });
    })
    .catch((err) => {
      // console.log(`Failed to log in: ${err}`);
      res.status(401).send({ err });
    });
}

function logout(req, res) {
  req.session.user = null;
  res.send({});
}

function populateCurrentUser(req, res, next) {
  // simply populate "req.user" for convenience
  req.user = req.session.user;
  next();
}

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return res.status(401).send({ err: "not logged in" });
  }

  next();
}

module.exports = {
  login,
  logout,
  populateCurrentUser,
  ensureLoggedIn,
};
