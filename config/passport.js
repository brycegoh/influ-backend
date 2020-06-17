const passport = require("passport");
const LocalStratergy = require("passport-local").Strategy;
const JwtStratergy = require("passport-jwt").Strategy;
const {users} = require("../models/users");
require('dotenv').config();
passport.use(new LocalStratergy((username,password,done)=>{
    users._findOne({
        query:{"email":username}
    })
    .then(user=>{
        if(!user){
            return done(null, false)
        }
        user.comparePw(password)
        .then((isMatch)=>{
            if(isMatch){
                return done(null, user)
            }else{
                return done(null, false)
            }
            
        })
    })
    .catch(err=>done(err))
}))

const cookieExtractor = req => {
    let token = null
    if(req && req.cookies){
        token = req.cookies["access_token"]
    }
    return token
}

passport.use(new JwtStratergy({
    jwtFromRequest: cookieExtractor,
    secretOrKey : process.env.JWT_SECRET
},(payload,done)=>{
    users._findOne({
        query:{ "_id": payload.sub }
    })
    .then(userData=>{
        if(!userData){
            return done(null, false)
        }
        return done(null, userData)
    })
    .catch(e=>{
        return done(e, false)
    });
}));