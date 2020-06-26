const express = require("express");
const router = express.Router();

const users = require("./users");
const auth = require("./auth");

router.use("/api/users", isAdmin, users);

router.use("/api/auth", auth);

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.json({
      message: "not ok",
    });
  }
}

function isAdmin(req, res, next) {
  console.log(req.user);
  if (req.user.userType === "admin") {
    next();
  } else {
    return res.status(500).json({
      message: "Not admin",
    });
  }

  next();
}

module.exports = router;
