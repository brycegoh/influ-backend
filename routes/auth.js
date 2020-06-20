const express = require('express');
const router = express.Router();
const passport = require("passport");
const {users} = require('../models/users');
const {signToken, signRfToken, createCsrfToken, checkTokenForChanges, checkRefreshToken} = require('../config/auth')
require('dotenv').config();


router.get('/refresh-tokens',(req,res)=>{
    
    const accessToken = req.cookies["access_token"]
    const refreshToken = req.cookies["refresh_token"]
    const userId = checkTokenForChanges( accessToken )

    users._findOne({query:{"_id":userId}})
    .then(userData=>{
        const refreshTokenValid = checkRefreshToken( refreshToken, userData.password )
        if(refreshTokenValid){
            console.log("refresh valid")
            const newCsrfToken = createCsrfToken()
            const newAccessToken = signToken(userData._id)
            const newRefreshToken = signRfToken(userData.password, newCsrfToken)
            res.cookie('access_token', newAccessToken, {httpOnly:true, sameSite:true});
            res.cookie('refresh_token', newRefreshToken, {httpOnly:true, sameSite:true});
            res.set({"userId": userData._id })
            res.set({"role": userData.userType })
            res.set({"cf-token": newCsrfToken})
            req.cookies["access_token"] = newAccessToken

            res.json({
                errorFlag: false,
                message: "Token Refreshed"
            })
        }
        if(!refreshTokenValid){
            console.log("refresh token not valid")
            return res.status(401).json({
                errorFlag: true,
                message: "Not authorized"
            })
        }
    })
    .catch(err=>console.log(err))

})


module.exports = router