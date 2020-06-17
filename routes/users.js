const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const passportConfig = require("../config/passport");
const {users} = require('../models/users');
require('dotenv').config();

const signToken = (userId) => {
    return jwt.sign({
        iss : process.env.JWT_ISSUER,
        sub: userId
    },process.env.JWT_SECRET, {expiresIn: "12h"});
}

router.post('/register',(req,res)=>{
    let userData = req.body
    let query = {
        "email": userData.email
    }
    users._findOne({query})
    .then(existingAccount=>{
        if(existingAccount){
            res.status(400).json({
                message:{
                    msgBody:"Email in use",
                    errorFlag: true
                }
            })
        }else{
            let newUser = new users(userData)
            newUser._save()
            .then(userData=>{
                res.status(201).json({
                    message:{
                        msgBody:"Account created successfully",
                        errorFlag: false
                    }
                })
            })
            .catch(e=>{
                res.status(500).json({
                    message:{
                        msgBody:e,
                        errorFlag: true
                    }
                })
            })
        }
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            message:{
                msgBody:err,
                errorFlag: true
            }
        })
    })
})

router.post('/login', passport.authenticate('local',{session:false}) ,(req,res)=>{
    if(req.isAuthenticated()){
        const {
            _id,
            email,
            userType
        } = req.user
        const token = signToken(_id)
        res.cookie('access_token', token, {httpOnly:true, sameSite:true});
        res.status(200).json({isAuthenticated: true, user:{email, userType}});
    }
})

router.get('/logout', passport.authenticate('jwt',{session:false}) ,(req,res)=>{
    res.clearCookie('access_token')
    res.json({user:{
            email:"", 
            userType:""
        },
        successFlag: true
    })
})

module.exports = router