const express = require("express");
const router = express.Router();
const passport = require("passport");
const { users } = require("../models/users");
require("dotenv").config();

router.get("/protected-route", (req, res) => {
  res.json({
    message: "ok",
  });
});

module.exports = router;
