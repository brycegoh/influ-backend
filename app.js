const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const passport = require("passport");
require("dotenv").config();
const { corsHandler } = require("./config/auth");
const { users } = require("./models/users");

//config
const port = process.env.PORT || 5000;
const MONGODB_URL = process.env.MONGODB_URL;

//mongodb
mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
const dbConnection = mongoose.connection;
dbConnection.once("open", () => {
  console.log("Connected to db");
});

//------middleware-------
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(corsHandler);
//-------- session store ---------
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
app.use(
  session({
    secret: process.env.SESS_SECRET,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      collection: "sessions",
    }),
    resave: false,
    saveUninitialized: false,
    name: "trkses",
    cookie: {
      maxAge: 1000 * 60 * 10, //10mins
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
    },
  })
);

//---------- passport ----------
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

// app.use((req, res, next) => {
//   console.log(req.session);
//   console.log(req.user);
//   next();
// });
//----------- routes ------
app.use(require("./routes"));

//port
app.listen(port, () => {
  console.log("SERVER RUNNING LO");
});

// error handling middleware
function errorHandler(err, req, res, next) {
  console.log(err);
}

app.use(errorHandler);
