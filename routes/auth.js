const express = require("express");
const router = express.Router();
const passport = require("passport");
const { users } = require("../models/users");
const bcrypt = require("bcrypt");
const { randomBytes } = require("crypto");
require("dotenv").config();

router.post("/register", (req, res) => {
  let userData = req.body;
  let query = {
    email: userData.email,
  };
  users
    ._findOne({ query })
    .then((existingAccount) => {
      if (existingAccount) {
        res.status(400).json({
          message: "Email in use",
          errorFlag: true,
        });
      } else {
        let newUser = new users(userData);
        newUser
          ._save()
          .then((userData) => {
            userData.emailVerification();
            res.status(201).json({
              message: "Account created successfully",
              errorFlag: false,
              _csrf: req.csrfToken(),
            });
          })
          .catch((e) => {
            res.status(500).json({
              message: e,
              errorFlag: true,
            });
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: err,
        errorFlag: true,
      });
    });
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  if (req.isAuthenticated()) {
    console.log("authenticated");

    const { _id, email, userType } = req.user;
    console.log("test");
    users
      ._findOne({ query: { _id: _id } })
      .then((user) => {
        res.status(200).json({
          isAuthenticated: true,
          user: { userId: _id, email, userType },
          _csrf: req.csrfToken(),
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          message: err,
          errorFlag: true,
        });
      });
  }
});

router.post("/logout", (req, res) => {
  req.logOut();
  req.session.destroy();
  res.clearCookie("ssid").json({
    message: "Logged out",
    errorFlag: false,
    _csrf: req.csrfToken(),
  });
});

router.get("/get-session", (req, res) => {
  if (req.session && req.session.passport && req.user) {
    res.json({ user: req.user, _csrf: req.csrfToken() });
  } else {
    res.json({
      _csrf: req.csrfToken(),
    });
  }
});

module.exports = router;
