// const jwt = require("jsonwebtoken");
// const fs = require("fs");
// const path = require("path");
// const { users } = require("../models/users");
// const crypto = require("crypto");
// require("dotenv").config();

// // const pathToPrivKey = path.join(__dirname, '../', 'id_rsa_priv.pem');
// const PRIV_KEY = process.env.RSA_PRIV;
// //fs.readFileSync(pathToPrivKey, 'utf8');

// // const pathToPrivKeyRf = path.join(__dirname, '../', 'id_rsa_priv_rf.pem');
// const PRIV_KEY_Rf = process.env.RSA_PRIV_RF;
// //fs.readFileSync(pathToPrivKeyRf, 'utf8');

// // const pathToPubKey = path.join(__dirname, '../', 'id_rsa_pub.pem');
// const PUB_KEY = process.env.RSA_PUB;
// //fs.readFileSync(pathToPubKey, 'utf8');

// // const pathToPubKeyRf = path.join(__dirname, '../', 'id_rsa_pub_rf.pem');
// // const PUB_KEY_Rf = fs.readFileSync(pathToPubKeyRf, 'utf8');

const corsHandler = (req, res, next) => {
  const allowedOrigins = ["http://localhost:3000", "http://localhost:3000/"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, csrf-token"
    );
    res.header("Access-Control-Allow-Credentials", true);
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    }
    return next();
  } else {
    return res.json({
      errorFlag: true,
      message: "Unauthorized Origin",
    });
  }
};

// const signToken = (userId) => {
//   return jwt.sign(
//     {
//       // iss : process.env.JWT_ISSUER,
//       sub: userId,
//       // aud: "www.influ.com"
//     },
//     PRIV_KEY,
//     { expiresIn: 60 * 15, algorithm: "RS256" }
//   );
// };

// const signRfToken = (pw, csrfToken) => {
//   return jwt.sign(
//     {
//       cfToken: csrfToken,
//     },
//     `${PRIV_KEY_Rf}${pw}`,
//     { expiresIn: 60 * 60 }
//   );
// };

// const cookieExtractor = (req) => {
//   let accessToken = null;
//   let refreshToken = null;
//   if (req && req.cookies) {
//     accessToken = req.cookies["access_token"];
//     refreshToken = req.cookies["refresh_token"];
//   }
//   let cfToken = req.headers["cf-token"];
//   return { accessToken, refreshToken, cfToken };
// };

// const checkTokenForChanges = (token) => {
//   try {
//     var decoded = jwt.verify(token, PUB_KEY, { ignoreExpiration: true });
//   } catch (err) {
//     return null;
//   }
//   return decoded.sub;
// };

// const checkRefreshAndCfToken = (token, pw, cfToken) => {
//   let decoded = null;
//   try {
//     decoded = jwt.verify(token, `${PRIV_KEY_Rf}${pw}`);
//   } catch (err) {
//     console.log(err);
//     return false;
//   }
//   return decoded.cfToken === cfToken;
// };

// const checkRefreshToken = (token, pw) => {
//   let decoded = null;
//   try {
//     decoded = jwt.verify(token, `${PRIV_KEY_Rf}${pw}`);
//   } catch (err) {
//     console.log(err);
//     return false;
//   }
//   return true;
// };

// const createCsrfToken = () => {
//   return crypto.randomBytes(48).toString("hex");
// };

// const verifyToken = (req, res, next) => {
//   let { accessToken, refreshToken, cfToken } = cookieExtractor(req);

//   if (!accessToken && !refreshToken) {
//     //fresh login
//     //no account
//     console.log("no tokens");
//     return next();
//   }
//   if (accessToken && refreshToken && !cfToken) {
//     if (req.originalUrl === "/api/auth/refresh-tokens") {
//       //create refresh cftoken endpoint
//       return next();
//       //on send to api
//       //api needs to verify expiration of refresh token
//       //not expired then resend a full set of tokens
//     }
//     return res.status(401).json({
//       errorFlag: true,
//       message: "Not authorized",
//     });
//   }
//   // check access token for changes and extract
//   const userId = checkTokenForChanges(accessToken);
//   users
//     ._findOne({ query: { _id: userId } })
//     .then((userData) => {
//       const refreshTokenValid = checkRefreshAndCfToken(
//         refreshToken,
//         userData.password,
//         cfToken
//       );
//       if (refreshTokenValid) {
//         console.log("refresh valid");
//         const newCsrfToken = createCsrfToken();
//         const newAccessToken = signToken(userData._id);
//         const newRefreshToken = signRfToken(userData.password, newCsrfToken);
//         res.cookie("access_token", newAccessToken, {
//           httpOnly: true,
//           sameSite: true,
//         });
//         res.cookie("refresh_token", newRefreshToken, {
//           httpOnly: true,
//           sameSite: true,
//         });
//         res.set({ userId: userData._id });
//         res.set({ role: userData.userType });
//         res.set({ "cf-token": newCsrfToken });
//         req.cookies["access_token"] = newAccessToken;

//         return next();
//       }
//       if (!refreshTokenValid) {
//         console.log("refresh token not valid");
//         return res.status(401).json({
//           errorFlag: true,
//           message: "Not authorized",
//         });
//       }
//     })
//     .catch((err) => console.log(err));
// };

module.exports = {
  corsHandler,
};
