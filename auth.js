const {cookieExtractor,checkTokenForChanges,checkRefreshToken,signToken,signRfToken} = require("./lib/utils")
const {users} = require("./models/users")


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
    verifyToken
}