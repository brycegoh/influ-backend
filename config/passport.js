const passport = require("passport");
const LocalStratergy = require("passport-local").Strategy;
const { users } = require("../models/users");
require("dotenv").config();

const localStrat = new LocalStratergy((username, password, done) => {
  users
    ._findOne({
      query: { email: username },
    })
    .then((user) => {
      if (!user) {
        return done(null, false);
      }
      user.comparePw(password).then((isMatch) => {
        //check email verfied or not
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    })
    .catch((err) => done(err));
});

module.exports = (passport) => {
  passport.use(localStrat);
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((userId, done) => {
    users
      ._findOne({ query: { _id: userId } })
      .then((user) => {
        let container = {
          email: user.email,
          userId: user.id,
          userType: user.userType,
        };
        done(null, container);
      })
      .catch((err) => done(err));
  });
};
