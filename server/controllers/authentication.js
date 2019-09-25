const express = require("express");
const User = require("../models/user");
const router = express.Router();
const authMiddleware = require("../services/passport");

router.post("/signup", async (req, res, next) => {
  if (!req.body.email || !req.body.password)
    return res
      .status(422)
      .send({ error: "You must provide email and password" });
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) return res.status(422).send({ error: "Email already exists!" });
  } catch (err) {
    return next(err);
  }

  const newUser = new User({
    email: req.body.email,
    password: req.body.password
  });
  try {
    await newUser.save();
    res.status(200).send({ token: newUser.generateAuthToken() });
  } catch (err) {
    return next(err);
  }
});

router.post("/signin", authMiddleware.requireSignIn, (req, res, next) => {
  res.send({ token: req.user.generateAuthToken() });
});
router.get("/", authMiddleware.requireAuth, (req, res, next) => {
  res.send({ hello: "world!" });
});

module.exports = router;
