const express = require("express");
const router = express.Router();

const users = require("./users");
const auth = require("./auth");

router.use("/api/users", isLoggedIn, users);

router.use("/api/auth", auth);

function isLoggedIn(req, res, next) {
  if (!req.user) {
    return res.status(500).json({
      message: "Please login",
    });
  }

  next();
}

module.exports = router;
