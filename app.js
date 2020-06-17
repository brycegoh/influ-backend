const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const passport = require("passport")
const cors = require("cors");
require('dotenv').config();
const {users} = require("./models/users")

//config
const port = process.env.PORT || 5000;
const MONGODB_URL = process.env.MONGODB_URL;

//server
const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(require('./routes'))
app.listen(port, ()=>{
    console.log("SERVER RUNNING LO")
})

//auth
// app.use(passport.initialize());
// app.use(passport.session());

//mongodb
mongoose.connect( MONGODB_URL, 
    { 
        useNewUrlParser: true, 
        useCreateIndex: true,
        useUnifiedTopology: true
    }
)
const dbConnection = mongoose.connection;
dbConnection.once('open',()=>{
    console.log("Connected to db")
})





