const express = require("express");
const router = express.Router();
const passport = require("passport");
const { users } = require("../models/users");
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
            res.status(201).json({
              message: {
                message: "Account created successfully",
                errorFlag: false,
              },
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

router.get(
  "/get-projects",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (req.isAuthenticated()) {
      res.json({
        user: {
          email: "",
          userType: "",
        },
        errorFlag: false,
      });
    } else {
      res.json({
        user: {
          email: "NOPE",
        },
        errorFlag: false,
      });
    }
  }
);

module.exports = router;
