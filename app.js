const express = require("express");
const helmet = require("helmet");
const csurf = require("csurf");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const passport = require("passport");
require("dotenv").config();
const { corsHandler } = require("./config/auth");

//------------config-----------------
const port =
  process.env.NODE_ENV === "production"
    ? process.env.PORT
    : process.env.DEV_PORT;
const MONGODB_URL = process.env.MONGODB_URL;

//--------------mongodb---------------
mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
const dbConnection = mongoose.connection;
dbConnection.once("open", () => {
  console.log("Connected to db");
});

//------middleware etc-------
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(corsHandler);
app.use(helmet());
//-------- session store ---------
const expressSession = require("express-session");
const MongoStore = require("connect-mongo")(expressSession);
// const MongoStore = require("connect-mongodb-session")(expressSession);
app.use(
  expressSession({
    secret: process.env.SESS_SECRET,
    store: new MongoStore({
      // uri: process.env.MONGODB_URL,
      mongooseConnection: mongoose.connection,
      collection: "sessions",
      stringify: false,
    }),
    resave: false,
    saveUninitialized: false,
    name: "ssid",
    cookie: {
      // maxAge: 1000 * 10, //10mins
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

//------- csrf --------
app.use(
  csurf({
    cookie: true,
    signed: true,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })
);
//----------- routes ------
app.use(require("./routes"));

//--------port log------------
app.listen(port, () => {
  console.log("SERVER RUNNING LO");
});

//--------error handling middleware--------
function errorHandler(err, req, res, next) {
  console.log(err);
}

app.use(errorHandler);
