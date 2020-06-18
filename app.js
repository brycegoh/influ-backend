const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const passport = require('passport');
const cors = require("cors");
require('dotenv').config();
const {users} = require("./models/users")

//config
const port = process.env.PORT || 5000;
const MONGODB_URL = process.env.MONGODB_URL;

//middleware
const app = express();

app.use(cookieParser());
app.use(express.json());

require('./config/passport')(passport)
app.use(passport.initialize())

app.use(cors());
// app.use(require('./lib/utils').verifyToken);
app.use(require('./routes'))

//port
app.listen(port, ()=>{
    console.log("SERVER RUNNING LO")
})


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


// error handling middleware
function errorHandler (err , req, res, next){

}

app.use(errorHandler);

