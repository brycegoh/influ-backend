const express = require("express");
const router = express.Router();
const passport = require("passport");
const { users } = require("../models/users");
const {
  signToken,
  signRfToken,
  createCsrfToken,
  checkTokenForChanges,
  checkRefreshToken,
} = require("../config/auth");
require("dotenv").config();

router.get("/refresh-tokens", (req, res) => {
  const accessToken = req.cookies["access_token"];
  const refreshToken = req.cookies["refresh_token"];
  const userId = checkTokenForChanges(accessToken);
  console.log("reached");
  if (!accessToken && !refreshToken) {
    res.status(200).json({
      errorflag: false,
      message: "No account",
    });
  }
  if (accessToken && refreshToken) {
    users
      ._findOne({ query: { _id: userId } })
      .then((userData) => {
        const refreshTokenValid = checkRefreshToken(
          refreshToken,
          userData.password
        );
        if (refreshTokenValid) {
          console.log("refresh valid");
          const newCsrfToken = createCsrfToken();
          const newAccessToken = signToken(userData._id);
          const newRefreshToken = signRfToken(userData.password, newCsrfToken);
          res.cookie("access_token", newAccessToken, {
            httpOnly: true,
            sameSite: true,
          });
          res.cookie("refresh_token", newRefreshToken, {
            httpOnly: true,
            sameSite: true,
          });
          // res.set({ userId: userData._id });
          // res.set({ role: userData.userType });
          res.set({ "cf-token": newCsrfToken });
          req.cookies["access_token"] = newAccessToken;

          res.json({
            errorFlag: false,
            message: "Token Refreshed",
            userId: userData._id,
            userType: userData.userType,
            email: userData.email,
          });
        }
        if (!refreshTokenValid) {
          console.log("refresh token not valid");
          return res.status(401).json({
            errorFlag: true,
            message: "Not authorized",
          });
        }
      })
      .catch((err) => console.log(err));
  }
});

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    if (req.isAuthenticated()) {
      console.log("authenticated");
      const { _id, email, userType } = req.user;
      const csrfToken = createCsrfToken();
      const token = signToken(_id);

      users
        ._findOne({ query: { _id: _id } })
        .then((user) => {
          const tokenRf = signRfToken(user.password, csrfToken);
          res.cookie("access_token", token, { httpOnly: true, sameSite: true });
          res.cookie("refresh_token", tokenRf, {
            httpOnly: true,
            sameSite: true,
          });
          res.set({ "cf-token": csrfToken });
          res.status(200).json({
            isAuthenticated: true,
            user: { userId: _id, email, userType },
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
  }
);

router.get(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.json({
      message: "Logged out",
      user: {
        email: "",
        userType: "",
      },
      errorFlag: false,
    });
  }
);

module.exports = router;
