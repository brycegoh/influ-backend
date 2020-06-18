const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pathToPrivKey = path.join(__dirname, '../', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToPrivKey, 'utf8');

const signToken = (userId) => {
    return jwt.sign({
        // iss : process.env.JWT_ISSUER,
        sub: userId,
        iat: Date.now(),
        // aud: "www.influ.com"
    },PRIV_KEY, {expiresIn: "12h", algorithm: 'RS256'});
}

module.exports = {
    signToken
}