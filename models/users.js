const mongoose = require('mongoose');
const promiseBasedQueries = require('./index')
const q = require('q')
const bcrypt = require('bcrypt')

const UsersSchema = mongoose.Schema({
    email:{
        type: String,
        trim: true,
        required: true
    },
    password:{
        type: String
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
        return promise.promise
    }
    
}


UsersSchema.loadClass(Users)
const users = mongoose.model("users", UsersSchema);

module.exports = {users, UsersSchema};