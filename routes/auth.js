const express = require("express");
const router = express.Router();
const passport = require("passport");
const { users } = require("../models/users");
const { sessions } = require("../models/sessions");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const { randomBytes } = require("crypto");
require("dotenv").config();

router.post(
  "/register",
  [
    body("username").isEmail().withMessage("Invalid Email").normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("must be at least 8 chars long")
      .trim(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorArray = errors.array().map((x) => {
        return { message: x.msg, param: x.param };
      });
      console.log(errorArray);
      return res.status(422).json({ errorFlag: true, message: errorArray });
    }

    let userData = req.body;
    console.log(userData);
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
              userData.emailVerificationEmail();
              res.status(201).json({
                message: "Account created successfully",
                errorFlag: false,
                // _csrf: req.csrfToken(),
              });
            })
            .catch((e) => {
              console.log(e);
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
  }
);

router.post("/login", passport.authenticate("local"), (req, res) => {
  if (req.isAuthenticated()) {
    const { _id, email, userType } = req.user;
    users
      ._findOne({ query: { _id: _id } })
      .then((user) => {
        res.status(200).json({
          isAuthenticated: true,
          user: { userId: _id, email, userType },
          // _csrf: req.csrfToken(),
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
    // _csrf: req.csrfToken(),
  });
});

router.get("/get-session", (req, res) => {
  if (req.session && req.session.passport && req.user) {
    res.json({ user: req.user, _csrf: req.csrfToken() });
  } else {
    res.clearCookie("ssid").json({
      _csrf: req.csrfToken(),
    });
  }
});

router.post("/resend-email-verification", (req, res) => {
  const { upn, dat } = req.body;
  users
    ._findOne({ query: { verifyEmailToken: upn } })
    .then((user) => {
      if (user && dat === user.verifyEmailExpiry) {
        console.log(user);
        user.emailVerificationEmail();
        res.json({
          errorFlag: false,
          message: "Email has been sent. Please check your inbox.",
          // _csrf: req.csrfToken(),
        });
      } else {
        res.json({
          errorFlag: true,
          message: "Please try again",
        });
      }
    })
    .catch((e) => console.log(e));
});

router.post("/verify-email", (req, res) => {
  const { upn, dat } = req.body;
  const date = Number(dat);
  users._findOne({ query: { verifyEmailToken: upn } }).then((user) => {
    console.log(user);
    if (user && user.verifyEmailExpiry > moment().unix()) {
      user
        .verifyEmail(upn, date)
        .then(() => {
          res.json({
            errorFlag: false,
            message: "Email has been verified",
            // _csrf: req.csrfToken(),
          });
        })
        .catch((e) => {
          console.log(e);
          res.json({
            errorFlag: true,
            message: e.message,
            // _csrf: req.csrfToken(),
          });
        });
    } else {
      res.json({
        errorFlag: true,
        message: "Please try again",
      });
    }
  });
});

router.post("/forget-password-reset", (req, res) => {
  const { email } = req.body;
  users._findOne({ query: { email: email } }).then((user) => {
    if (!user) {
      res.json({
        errorFlag: true,
        message: "Email not found",
      });
    }
    user.sendResetPasswordEmail();
    res.json({
      errorFlag: false,
      message: "Email has been sent. Please check your inbox",
    });
  });
});

router.post("/password-reset", (req, res) => {
  const { upn, dat, newPassword } = req.body;
  const date = Number(dat);
  console.log({ upn, date });
  users
    ._findOne({
      query: {
        $and: [{ resetPasswordToken: upn }, { resetPasswordExpiry: date }],
      },
    })
    .then((userData) => {
      if (userData && userData.resetPasswordExpiry > moment().unix()) {
        userData.password = newPassword;
        userData.resetPasswordToken = null;
        userData.resetPasswordExpiry = null;
        userData
          ._save()
          .then((updatedUser) => {
            console.log(updatedUser);
            return sessions
              ._deleteMany({
                query: { "session.passport.user": updatedUser._id },
              })
              .then(() => {
                updatedUser.sendResetPasswordNotificationEmail();
                res.json({
                  errorFlag: false,
                  message: "Password has been reset",
                });
              });
          })
          .catch((e) => console.log(e));
      } else {
        res.json({
          errorFlag: true,
          message: "Invalid URL",
        });
      }
    })
    .catch((e) => console.log(e));
});

module.exports = router;
