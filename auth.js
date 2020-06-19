const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');
const {users} = require('./models/users');
require('dotenv').config();

const pathToPrivKey = path.join(__dirname, './', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToPrivKey, 'utf8');

const pathToPrivKeyRf = path.join(__dirname, './', 'id_rsa_priv_rf.pem');
const PRIV_KEY_Rf = fs.readFileSync(pathToPrivKeyRf, 'utf8');

const pathToPubKey = path.join(__dirname, './', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToPubKey, 'utf8');

const pathToPubKeyRf = path.join(__dirname, './', 'id_rsa_pub_rf.pem');
const PUB_KEY_Rf = fs.readFileSync(pathToPubKeyRf, 'utf8');

const signToken = (userId) => {
    return jwt.sign({
        // iss : process.env.JWT_ISSUER,
        sub: userId,
        // aud: "www.influ.com"
    },PRIV_KEY, {expiresIn: 5, algorithm: 'RS256'});
}

const signRfToken = (userId, pw) => {
    return jwt.sign({
        // iss : process.env.JWT_ISSUER,
        sub: userId,
        // aud: "www.influ.com"
    },`${PRIV_KEY_Rf}${pw}`, {expiresIn: '1 day'});
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

const checkTokenForChanges = (token) => {
    try {
        var decoded = jwt.verify(token, PUB_KEY, {ignoreExpiration: true});
    } catch(err) {
        return null
    }
    return decoded.sub
}

const checkRefreshToken = (token, pw, id) => {
    console.log(id)
    let decoded = null
    try {
        decoded = jwt.verify(token, `${PRIV_KEY_Rf}${pw}`);
    } catch(err) {
        console.log(err)
        return false
    }
    return decoded.sub === id
}

const verifyToken = (req, res, next) => {
    let {
        accessToken,
        refreshToken
    } = cookieExtractor(req)
    
    if(!accessToken || !refreshToken){
        console.log("no tokens")
        return next();
    }
    // check access token for changes and extract
    const userId = checkTokenForChanges( accessToken )
    users._findOne({query:{"_id":userId}})
    .then(userData=>{
        const refreshTokenValid = checkRefreshToken( refreshToken, userData.password, userData.id )
        if(refreshTokenValid){
            console.log("refresh valid")
            const newAccessToken = signToken(userData._id)
            const newRefreshToken = signRfToken(userData._id, userData.password)
            res.cookie('access_token', newAccessToken, {httpOnly:true, sameSite:true});
            res.cookie('refresh_token', newRefreshToken, {httpOnly:true, sameSite:true});
            req.cookies["access_token"] = newAccessToken
            return next();
        }
        if(!refreshTokenValid){
            console.log("refresh token not valid")
            return next();
        }
    })
    .catch(err=>console.log(err))
}

module.exports = {
    signToken,
    signRfToken,
    verifyToken,
    cookieExtractor,
    checkTokenForChanges,
    checkRefreshToken,
    PUB_KEY,
    PRIV_KEY_Rf
}