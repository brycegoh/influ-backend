const mongoose = require("mongoose");
const promiseBasedQueries = require("./index");
const q = require("q");
const bcrypt = require("bcrypt");

const SessionSchema = mongoose.Schema({
  session: {
    cookie: {
      originalMaxAge: {
        type: String,
      },
      expires: {
        type: Boolean,
      },
      secure: {
        type: Boolean,
      },
      httpOnly: {
        type: Boolean,
      },
      path: {
        type: String,
      },
      sameSite: {
        type: String,
      },
    },
    csrfSecret: {
      type: String,
    },
    passport: { user: { type: String } },
  },
  expires: {
    type: Date,
  },
});

class Session extends promiseBasedQueries {}

SessionSchema.loadClass(Session);
const sessions = mongoose.model("sessions", SessionSchema);

module.exports = { sessions, SessionSchema };
