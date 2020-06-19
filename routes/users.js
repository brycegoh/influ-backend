const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const {users} = require('../models/users');
const {signToken, signRfToken} = require('../config/auth')
require('dotenv').config();


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
        console.log("user")
        const token = signToken(_id)
        users._findOne({query:{"_id":_id}})
        .then(user=>{
            const tokenRf = signRfToken( user._id, user.password )
            res.cookie('access_token', token, {httpOnly:true, sameSite:true});
            res.cookie('refresh_token', tokenRf, {httpOnly:true, sameSite:true});
            res.set({"userId": user._id })
            res.set({"role": user.userType })
            res.status(200).json({isAuthenticated: true, user:{email, userType}});
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
    }
})

router.get('/logout', passport.authenticate('jwt',{session:false}) ,(req,res)=>{
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    res.json({user:{
            email:"", 
            userType:""
        },
        successFlag: true
    })
})

router.get('/get-projects', passport.authenticate('jwt',{session:false}) ,(req,res)=>{
    if(req.isAuthenticated()){
        res.json({user:{
            email:"", 
            userType:""
        },
        successFlag: true
    })
    }else{
        res.json({user:{
            email:"NOPE"
        },
        successFlag: true
    })
    }
    
})

module.exports = router