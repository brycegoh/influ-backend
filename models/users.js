const mongoose = require('mongoose');
const promiseBasedQueries = require('./index')
const q = require('q')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {signRfToken} = require('../lib/utils')

const UsersSchema = mongoose.Schema({
    email:{
        type: String,
        trim: true,
        required: true
    },
    password:{
        type: String
    },
    refreshTokens:{
        type: Array,
        default: []
    },
    pwSecure:{
        type: Boolean,
        default: false,
        required: true
    },
    userType:{
        type: String,
        enum:["influencer","merchant", "admin"],
        required: true,
    },
    verifiedEmail: { 
        type: Boolean, 
        default: false
    },
    projects: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'projects' }
    ]
},{
    timestamps: true
});


UsersSchema.pre('save',function(next){
    if(!this.isModified('password')){
        return next();
    }

    // const salt = crypto.randomBytes(32).toString('hex')
    // const hash = crypto.pbkdf2Sync(this.password, salt, 10000, 64, 'sha512').toString('hex')
    // need store salt

    bcrypt.hash(this.password,10,(error, hashedPw)=>{
        if(error){
            return next(error)
        }
        this.password = hashedPw
        this.pwSecure = true
        next();
    })
})

class Users extends promiseBasedQueries{

    comparePw(clientPw){
        let promise = q.defer()
        bcrypt.compare( clientPw, this.password, (error, isMatch)=>{
            if(error){
                promise.reject(error)
            }else{
                promise.resolve(isMatch)
            }
        })

        // const hashVerify = crypto.pbkdf2Sync(clientPw, this.salt, 10000, 64, 'sha512').toString('hex')
        // promise.resolve(this.password === hashVerify)

        return promise.promise
    }

    issueRefreshToken(){
        let promise = q.defer()
        const tokenRf = signRfToken(this._id)
        this.refreshTokens = [...this.refreshTokens, tokenRf]
        this._save()
        .then(()=>{
            promise.resolve(tokenRf)
        })
        .catch(e=>{
            promise.reject(e)
        })
        return promise.promise
    }
    
}


UsersSchema.loadClass(Users)
const users = mongoose.model("users", UsersSchema);

module.exports = {users, UsersSchema};