const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');
const {users} = require('../models/users')
require('dotenv').config();

const pathToPrivKey = path.join(__dirname, '../', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToPrivKey, 'utf8');

const pathToPrivKeyRf = path.join(__dirname, '../', 'id_rsa_priv_rf.pem');
const PRIV_KEY_Rf = fs.readFileSync(pathToPrivKeyRf, 'utf8');

const pathToPubKey = path.join(__dirname, '../', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToPubKey, 'utf8');

const pathToPubKeyRf = path.join(__dirname, '../', 'id_rsa_pub_rf.pem');
const PUB_KEY_Rf = fs.readFileSync(pathToPubKeyRf, 'utf8');

const signToken = (userId) => {
    return jwt.sign({
        // iss : process.env.JWT_ISSUER,
        sub: userId,
        iat: Date.now(),
        exp: "1s",
        // aud: "www.influ.com"
    },PRIV_KEY, {expiresIn: "1s", algorithm: 'RS256'});
}

const signRfToken = (userId) => {
    return jwt.sign({
        // iss : process.env.JWT_ISSUER,
        sub: userId,
        iat: Date.now(),
        // aud: "www.influ.com"
    },PRIV_KEY_Rf, {expiresIn: "20", algorithm: 'RS256'});
}
const cookieExtractor = req => {
    let accessToken = null
    let refreshToken = null
    if(req && req.cookies){
        accessToken = req.cookies["access_token"]
        refreshToken = req.cookies["refresh_token"]
    }
    return { accessToken,refreshToken }
}

const verifyToken = (req, res, next) => {
    let {
        accessToken,
        refreshToken
    } = cookieExtractor(req)
    if(!accessToken || !refreshToken){
        next();
    }
    const validAccessToken = jwt.verify( accessToken, PUB_KEY )
    const validRefreshToken = jwt.verify( refreshToken, PUB_KEY_Rf )
    console.log(validAccessToken)
    console.log(validRefreshToken)
    if( !validRefreshToken && !validAccessToken ){
        console.log("both expire")
        users._findOne({query:{"_id":id}})
        .then(userData=>{
            userData.refreshTokens = userData.refreshTokens.filter(tk=>tk!==refreshToken)
            userData._save()
            next();
        })
    }
    else if( !validAccessToken && validRefreshToken ){
        console.log("refresh expire")
        users._findOne({query:{"_id":id}})
        .then(userData=>{
            if( userData.refreshTokens.includes(refreshToken) ){
                let newAccessToken = signToken(userData._id)
                res.cookie('access_token', newAccessToken, {httpOnly:true, sameSite:true});
                req.cookie('access_token', newAccessToken, {httpOnly:true, sameSite:true});
                next();
            }else{
                next();
            }
        })
    }
    else if( validAccessToken && validRefreshToken ){
        console.log("both valid")
        next();
    }
}

module.exports = {
    signToken,
    signRfToken,
    verifyToken
}